import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const indexingAllowed = process.env.SITE_ENV === 'production' && process.env.SITE_ALLOW_INDEXING === 'true'

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    // Slike se služe direktno: Payload već pravi WebP veličine (320, 800, 1200, 1600 px),
    // a Vercelova optimizacija slika na besplatnom planu ima mjesečni limit (iznad njega vraća 402).
    unoptimized: true,
    localPatterns: [{ pathname: '/media/**' }, { pathname: '/api/media/file/**' }, { pathname: '/brand/**' }, { pathname: '/api/submission-images/file/**' }],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [96, 160, 240, 320],
    formats: ['image/avif', 'image/webp'],
    // Za S3 spremište dodati remotePatterns s javnom domenom spremišta (vidi docs/architecture.md).
  },
  async redirects() {
    return [{ source: '/kolekcije/:slug/', destination: '/ideje/:slug/', permanent: true }]
  },
  async headers() {
    const base = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), screen-wake-lock=(self)' },
    ]
    return [
      {
        source: '/:path*',
        headers: indexingAllowed ? base : [...base, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      // Administracija i API nikad u indeksu, nikad javno keširani
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

const config = withPayload(nextConfig, { devBundleServerPackages: false })

// Payload dodaje Accept-CH/Critical-CH (tema administracije) na SVE putanje.
// Critical-CH tjera preglednik da ponovi zahtjev za svaku javnu stranicu (~0,6 s na mobilnoj mreži),
// pa ta zaglavlja ograničavamo na /admin.
const payloadHeaders = config.headers
config.headers = async () =>
  ((await payloadHeaders?.()) ?? []).map((rule) =>
    rule.source === '/:path*' && rule.headers.some((h) => h.key === 'Critical-CH') ? { ...rule, source: '/admin/:path*' } : rule,
  )

export default config
