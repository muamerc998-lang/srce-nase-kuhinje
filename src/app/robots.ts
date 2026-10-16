import type { MetadataRoute } from 'next'
import { siteUrl, indexingAllowed } from '@/data/payload'

/**
 * Robots ne blokira javne stranice s noindex oznakom (pretraživač mora moći
 * pročitati noindex). Blokira se samo administracija i API. Na razvoju i
 * previewu indeksiranje je isključeno i zaglavljem X-Robots-Tag — ali to NIJE
 * zaštita privatnih podataka (za preview koristiti zaštitu pristupa).
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed()) {
    return { rules: [{ userAgent: '*', disallow: '/admin/' }] }
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
