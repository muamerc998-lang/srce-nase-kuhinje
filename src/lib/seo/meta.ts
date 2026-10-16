import type { Metadata } from 'next'
import { siteUrl, indexingAllowed } from '@/data/payload'
import type { ImageView } from '../recipes/types'

export function absolute(path: string) {
  return path.startsWith('http') ? path : `${siteUrl()}${path}`
}

/** Zajednički metapodaci: canonical, OG/Twitter i robots. */
export function pageMeta(opts: {
  title: string
  description?: string | null
  path: string
  image?: ImageView | null
  type?: 'website' | 'article'
  noindex?: boolean
  publishedTime?: string | null
  modifiedTime?: string | null
}): Metadata {
  const url = absolute(opts.path)
  const index = indexingAllowed() && !opts.noindex
  return {
    title: opts.title,
    description: opts.description ?? undefined,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description ?? undefined,
      url,
      type: opts.type ?? 'website',
      locale: 'bs_BA',
      images: opts.image ? [{ url: absolute(opts.image.url), width: opts.image.width, height: opts.image.height, alt: opts.image.alt }] : undefined,
      ...(opts.type === 'article' ? { publishedTime: opts.publishedTime ?? undefined, modifiedTime: opts.modifiedTime ?? undefined } : {}),
    },
    twitter: {
      card: opts.image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description: opts.description ?? undefined,
      images: opts.image ? [absolute(opts.image.url)] : undefined,
    },
  }
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('bs-BA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Sarajevo' }).format(new Date(iso))
}
