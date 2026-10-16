import type { MetadataRoute } from 'next'
import { getRecipeSlugs } from '@/data/recipes'
import { getCategories } from '@/data/site'
import { getGuides, getCollections } from '@/data/content'
import { payloadClient, publicWhere, siteUrl, indexingAllowed, isProduction } from '@/data/payload'

export const revalidate = 3600

/**
 * Samo objavljeni, indeksabilni canonical URL-ovi sa stvarnim datumima izmjene.
 * Filteri, pretraga, lokalni alati i nedovršene stranice nisu uključeni.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingAllowed()) return []
  const base = siteUrl()
  const [recipes, cats, guides, collections] = await Promise.all([
    getRecipeSlugs(),
    getCategories(),
    getGuides(),
    getCollections(),
  ])
  const payload = await payloadClient()
  const [ingredientPages, pages] = await Promise.all([
    payload.find({
      collection: 'ingredients',
      where: publicWhere({ publicPage: { equals: true } }, false),
      pagination: false,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'pages',
      where: publicWhere({ needsEditorInput: { not_equals: true } }),
      pagination: false,
      depth: 0,
      select: { slug: true, updatedAt: true, contentUpdatedAt: true },
    }),
  ])
  const prodFilter = <T extends { isDemo?: boolean }>(x: T) => !isProduction() || !x.isDemo
  return [
    { url: `${base}/` },
    { url: `${base}/recepti/` },
    { url: `${base}/savjeti/` },
    { url: `${base}/ideje/` },
    { url: `${base}/namirnice/` },
    ...recipes.map((r) => ({ url: `${base}/recepti/${r.slug}/`, lastModified: r.updatedAt })),
    ...cats.filter((c) => c.count > 0 && !c.seo.noindex).map((c) => ({ url: `${base}/kategorije/${c.slug}/` })),
    ...guides.filter(prodFilter).filter((g) => !g.seo.noindex).map((g) => ({ url: `${base}/savjeti/${g.slug}/`, lastModified: g.contentUpdatedAt ?? undefined })),
    ...collections.filter((c) => c.indexable && !c.seo.noindex).map((c) => ({ url: `${base}/ideje/${c.slug}/`, lastModified: c.contentUpdatedAt })),
    ...ingredientPages.docs.map((i) => ({ url: `${base}/namirnice/${i.slug}/`, lastModified: i.updatedAt })),
    ...pages.docs.map((p) => ({ url: `${base}/${p.slug}/`, lastModified: p.contentUpdatedAt ?? p.updatedAt })),
  ]
}
