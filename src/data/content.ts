import { unstable_cache } from './cache'
import { toArticleView } from './article'
import type { Guide, RecipeCollection, Page, Ingredient } from '@/payload-types'
import { payloadClient, publicWhere } from './payload'
import { toImage, authorNames } from './mappers'
import { getCardsByIds } from './recipes'
import { getSiteSettings } from './site'

const HOUR = 3600
const idOf = (x: unknown) => (typeof x === 'object' && x ? (x as { id: number }).id : (x as number))

// ---------- Vodiči ----------
function toGuideView(g: Guide) {
  return {
    id: g.id,
    slug: g.slug ?? '',
    title: g.title,
    answer: g.answer,
    body: g.body ?? null,
    image: toImage(g.heroImage, 'wide'),
    cardImage: toImage(g.heroImage, 'card'),
    shareImage: toImage(g.heroImage, 'og'),
    authors: authorNames(g.authors),
    publishedAt: g.publishedAt ?? g.createdAt,
    contentUpdatedAt: g.contentUpdatedAt ?? g.publishedAt ?? g.updatedAt,
    relatedRecipeIds: (g.relatedRecipes ?? []).map(idOf),
    relatedIngredients: (g.relatedIngredients ?? [])
      .map((i) => (typeof i === 'object' ? (i as Ingredient) : null))
      .filter(Boolean)
      .map((i) => ({ name: i!.name, slug: i!.slug ?? '', publicPage: !!i!.publicPage })),
    seo: g.seo ?? {},
    isDemo: !!g.isDemo,
  }
}
export type GuideView = ReturnType<typeof toGuideView>

async function fetchGuide(slug: string, draft: boolean) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'guides',
    where: draft ? { slug: { equals: slug } } : publicWhere({ slug: { equals: slug } }),
    draft,
    overrideAccess: draft,
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ? toGuideView(res.docs[0]) : null
}

export const getGuide = unstable_cache((slug: string) => fetchGuide(slug, false), ['guide'], { tags: ['guides'], revalidate: HOUR })
export const getGuideDraft = (slug: string) => fetchGuide(slug, true)

export const getGuides = unstable_cache(
  async (limit = 100) => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'guides', where: publicWhere(), limit, depth: 1, sort: '-publishedAt' })
    return res.docs.map(toGuideView)
  },
  ['guides'],
  { tags: ['guides'], revalidate: HOUR },
)

// ---------- Kolekcije ----------
function toCollectionView(c: RecipeCollection) {
  return {
    id: c.id,
    slug: c.slug ?? '',
    title: c.title,
    intro: c.intro,
    image: toImage(c.image, 'wide'),
    cardImage: toImage(c.image, 'card'),
    shareImage: toImage(c.image, 'og'),
    recipeIds: (c.recipes ?? []).map(idOf),
    subfilters: c.subfilters ?? [],
    indexable: !!c.indexable,
    seo: c.seo ?? {},
    contentUpdatedAt: c.contentUpdatedAt ?? c.updatedAt,
    isDemo: !!c.isDemo,
    article: toArticleView(c, c.contentUpdatedAt ?? c.updatedAt),
  }
}
export type CollectionView = ReturnType<typeof toCollectionView>

/** Broj OBJAVLJENIH recepata u kolekciji (kolekcija se javno prikazuje tek iznad praga). */
async function publishedCount(ids: number[]) {
  if (!ids.length) return 0
  const payload = await payloadClient()
  return (await payload.count({ collection: 'recipes', where: publicWhere({ id: { in: ids } }) })).totalDocs
}

async function fetchCollection(slug: string, draft: boolean) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'recipe-collections',
    where: draft ? { slug: { equals: slug } } : publicWhere({ slug: { equals: slug } }),
    draft,
    overrideAccess: draft,
    limit: 1,
    depth: 1,
    populate: { recipes: { slug: true } },
  })
  if (!res.docs[0]) return null
  const view = toCollectionView(res.docs[0])
  if (draft) return view
  const min = (await getSiteSettings()).features.minCollectionRecipes
  return (await publishedCount(view.recipeIds)) >= min ? view : null
}
export const getCollection = unstable_cache((slug: string) => fetchCollection(slug, false), ['collection-v2'], {
  tags: ['recipe-collections', 'recipes', 'site-settings'],
  revalidate: HOUR,
})
export const getCollectionDraft = (slug: string) => fetchCollection(slug, true)

export const getCollections = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'recipe-collections',
      where: publicWhere(),
      pagination: false,
      depth: 1,
      populate: { recipes: { slug: true } },
    })
    const min = (await getSiteSettings()).features.minCollectionRecipes
    const views = res.docs.map(toCollectionView)
    const counts = await Promise.all(views.map((v) => publishedCount(v.recipeIds)))
    return views.map((v, i) => ({ ...v, count: counts[i] })).filter((v) => v.count >= min)
  },
  ['collections-v2'],
  { tags: ['recipe-collections', 'recipes', 'site-settings'], revalidate: HOUR },
)

// ---------- Namirnice (javne stranice) ----------
export const getPublicIngredient = unstable_cache(
  async (slug: string) => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'ingredients',
      where: publicWhere({ and: [{ slug: { equals: slug } }, { publicPage: { equals: true } }] }, false),
      limit: 1,
      depth: 1,
    })
    const i = res.docs[0]
    if (!i) return null
    // recepti koji koriste namirnicu (ili užu namirnicu)
    const recipes = await payload.find({
      collection: 'recipes',
      where: publicWhere({ 'index.facetKeys': { contains: `|i:${i.id}|` } }),
      limit: 12,
      depth: 0,
      sort: '-publishedAt',
      select: { slug: true },
    })
    const guides = await payload.find({
      collection: 'guides',
      where: publicWhere({ relatedIngredients: { in: [i.id] } }),
      limit: 6,
      depth: 0,
      select: { title: true, slug: true, answer: true },
    })
    return {
      id: i.id,
      name: i.name,
      slug: i.slug ?? '',
      synonyms: (i.synonyms ?? []).map((s) => s.term),
      description: i.description ?? null,
      selection: i.selection ?? null,
      storage: i.storage ?? null,
      substitutes: i.substitutes ?? null,
      image: toImage(i.image, 'wide'),
      shareImage: toImage(i.image, 'og'),
      seo: i.seo ?? {},
      recipes: await getCardsByIds(recipes.docs.map((r) => r.id)),
      guides: [
        ...guides.docs.map((g) => ({ title: g.title, slug: g.slug ?? '', answer: g.answer })),
        ...((i.relatedGuides ?? []) as unknown[])
          .map((g) => (typeof g === 'object' ? (g as Guide) : null))
          .filter((g) => g && g._status === 'published')
          .map((g) => ({ title: g!.title, slug: g!.slug ?? '', answer: g!.answer })),
      ].filter((g, idx, arr) => arr.findIndex((x) => x.slug === g.slug) === idx),
      updatedAt: i.updatedAt,
      isDemo: !!i.isDemo,
    }
  },
  ['public-ingredient'],
  { tags: ['ingredients', 'recipes', 'guides'], revalidate: HOUR },
)

// ---------- Informativne stranice ----------
function toPageView(p: Page) {
  return {
    title: p.title,
    slug: p.slug ?? '',
    body: p.body ?? null,
    needsEditorInput: !!p.needsEditorInput,
    seo: p.seo ?? {},
    updatedAt: p.contentUpdatedAt ?? p.updatedAt,
  }
}
export const getPage = unstable_cache(
  async (slug: string) => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'pages', where: publicWhere({ slug: { equals: slug } }), limit: 1, depth: 1 })
    return res.docs[0] ? toPageView(res.docs[0]) : null
  },
  ['page'],
  { tags: ['pages'], revalidate: HOUR },
)
export async function getPageDraft(slug: string) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, draft: true, overrideAccess: true, limit: 1 })
  return res.docs[0] ? toPageView(res.docs[0]) : null
}

// ---------- Autori ----------
export const getAuthors = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'authors', where: publicWhere(undefined, false), pagination: false, depth: 1 })
    return res.docs.map((a) => ({
      name: a.name,
      slug: a.slug ?? '',
      role: a.role ?? null,
      bio: a.bio ?? null,
      isTeam: !!a.isTeam,
      image: toImage(a.image, 'thumb'),
      isDemo: !!a.isDemo,
    }))
  },
  ['authors'],
  { tags: ['authors'], revalidate: HOUR },
)

// ---------- Preusmjerenja ----------
export const getRedirect = unstable_cache(
  async (path: string) => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'redirects', where: { from: { equals: path } }, limit: 1, depth: 0 })
    const r = res.docs[0]
    return r ? { to: r.to, type: r.type ?? '301' } : null
  },
  ['redirect'],
  { tags: ['redirects'], revalidate: HOUR },
)
