import { unstable_cache } from './cache'
import type { Recipe, Category, Guide } from '@/payload-types'
import { payloadClient, publicWhere } from './payload'
import { toCard, cardSelect, cardPopulate, toImage, toIngredientGroups, toStepGroups, authorNames, type RecipeCard } from './mappers'
import { effectiveTotal } from '@/lib/recipes/time'
import type { IngredientLine } from '@/lib/recipes/types'
import { parseTextBlocks } from '@/lib/content/article-text'
import { headingId } from '@/lib/content/lexical'

const HOUR = 3600

async function fetchRecipe(slug: string, draft: boolean) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'recipes',
    where: draft ? { slug: { equals: slug } } : publicWhere({ slug: { equals: slug } }),
    draft,
    overrideAccess: draft, // draft pregled je dozvoljen samo nakon provjere prijave (vidi page.tsx)
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
}

export function toRecipeView(r: Recipe) {
  const cat = r.primaryCategory && typeof r.primaryCategory === 'object' ? (r.primaryCategory as Category) : null
  const parent = cat?.parent && typeof cat.parent === 'object' ? (cat.parent as Category) : null
  return {
    id: r.id,
    uid: r.uid ?? String(r.id),
    slug: r.slug ?? '',
    status: r._status ?? 'draft',
    title: r.title,
    summary: r.summary,
    beforeYouStart: r.beforeYouStart ?? null,
    image: toImage(r.heroImage, 'wide'),
    shareImage: toImage(r.shareImage ?? r.heroImage, 'og'),
    category: cat ? { name: cat.name, slug: cat.slug ?? '' } : null,
    parentCategory: parent ? { name: parent.name, slug: parent.slug ?? '' } : null,
    authors: authorNames(r.authors),
    tags: (r.tags ?? [])
      .map((t) => (typeof t === 'object' ? t : null))
      .filter((t) => t?.public)
      .slice(0, 3)
      .map((t) => t!.name),
    difficulty: r.difficulty,
    methods: r.methods ?? [],
    diets: r.diets ?? [],
    yield: {
      servings: r.yield?.servings ?? null,
      unit: r.yield?.unit || 'porcija',
      scalable: (r.yield?.scalable ?? true) && !!r.yield?.servings,
    },
    times: { ...(r.times ?? {}), totalMinutes: effectiveTotal(r.times ?? {}) },
    equipment: r.equipment ?? {},
    ingredientGroups: toIngredientGroups(r),
    stepGroups: toStepGroups(r),
    article: (r.article ?? []).map((sec, i) => ({
      level: (sec.level === 'h3' ? 'h3' : 'h2') as 'h2' | 'h3',
      title: sec.title ?? null,
      id: sec.title ? headingId(sec.title) : `odjeljak-${i + 1}`,
      blocks: parseTextBlocks(sec.body),
    })),
    tips: (r.tips ?? []).map((t) => t.text),
    substitutions: (r.substitutions ?? []).map((t) => t.text),
    storage: r.storage ?? null,
    faq: (r.faq ?? []).map((f) => ({ question: f.question, answer: f.answer })),
    relatedRecipeIds: (r.relatedRecipes ?? []).map((x) => (typeof x === 'object' ? x.id : x)),
    servedWithIds: (r.servedWith ?? []).map((x) => (typeof x === 'object' ? x.id : x)),
    leftovers: {
      text: r.leftovers?.text ?? null,
      recipe: r.leftovers?.recipe && typeof r.leftovers.recipe === 'object' && r.leftovers.recipe._status === 'published' ? { title: r.leftovers.recipe.title, slug: r.leftovers.recipe.slug ?? '' } : null,
      guide: r.leftovers?.guide && typeof r.leftovers.guide === 'object' && r.leftovers.guide._status === 'published' ? { title: r.leftovers.guide.title, slug: r.leftovers.guide.slug ?? '' } : null,
    },
    meals: (r.meals ?? []) as string[],
    guestAuthor: r.guestAuthor && typeof r.guestAuthor === 'object' ? { name: r.guestAuthor.displayName, bio: r.guestAuthor.bio ?? null } : null,
    relatedGuides: (r.relatedGuides ?? [])
      .map((g) => (typeof g === 'object' ? (g as Guide) : null))
      .filter((g) => g && g._status === 'published')
      .map((g) => ({ title: g!.title, slug: g!.slug ?? '', answer: g!.answer })),
    publishedAt: r.publishedAt ?? r.createdAt,
    contentUpdatedAt: r.contentUpdatedAt ?? r.publishedAt ?? r.updatedAt,
    facebook: r.facebook ?? {},
    seo: r.seo ?? {},
    isDemo: !!r.isDemo,
    primaryCategoryId: cat?.id ?? null,
    facetKeys: r.index?.facetKeys ?? '',
  }
}

export type RecipeView = ReturnType<typeof toRecipeView>

export const getRecipe = unstable_cache(
  async (slug: string) => {
    const r = await fetchRecipe(slug, false)
    return r ? toRecipeView(r) : null
  },
  ['recipe'],
  { tags: ['recipes'], revalidate: HOUR },
)

/** Draft pregled — nikad keširano. */
export async function getRecipeDraft(slug: string) {
  const r = await fetchRecipe(slug, true)
  return r ? toRecipeView(r) : null
}

export const getRecipeSlugs = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'recipes',
      where: publicWhere(),
      pagination: false,
      depth: 0,
      select: { slug: true, contentUpdatedAt: true, updatedAt: true },
    })
    return res.docs.map((d) => ({ slug: d.slug ?? '', updatedAt: d.contentUpdatedAt ?? d.updatedAt }))
  },
  ['recipe-slugs'],
  { tags: ['recipes'], revalidate: HOUR },
)

export const getCardsByIds = unstable_cache(
  async (ids: number[]): Promise<RecipeCard[]> => {
    if (!ids.length) return []
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'recipes',
      where: publicWhere({ id: { in: ids } }),
      pagination: false,
      depth: 1,
      select: cardSelect,
      populate: cardPopulate,
    })
    const map = new Map(res.docs.map((d) => [d.id, toCard(d)]))
    return ids.map((id) => map.get(id)).filter((c): c is RecipeCard => !!c)
  },
  ['cards-by-ids'],
  { tags: ['recipes'], revalidate: HOUR },
)

export const getLatestCards = unstable_cache(
  async (limit: number, extra: Record<string, unknown> = {}, sort = '-publishedAt'): Promise<RecipeCard[]> => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'recipes',
      where: publicWhere(extra),
      limit,
      depth: 1,
      sort,
      select: cardSelect,
      populate: cardPopulate,
    })
    return res.docs.map(toCard)
  },
  ['latest-cards'],
  { tags: ['recipes'], revalidate: HOUR },
)

/** "Sa naše Facebook stranice": recepti s datumom Facebook objave, najnoviji prvi. */
export const getFacebookCards = (limit: number) =>
  getLatestCards(limit, { 'facebook.postedAt': { exists: true } }, '-facebook.postedAt')

/**
 * Povezani recepti: ručni izbor urednika ima prednost; inače ista kategorija
 * i što više zajedničkih obaveznih namirnica. Isti recept je uvijek isključen.
 */
export const getRelatedCards = unstable_cache(
  async (recipeId: number, manualIds: number[], categoryId: number | null, facetKeys: string, limit = 4) => {
    if (manualIds.length) {
      return (await getCardsByIds(manualIds.filter((id) => id !== recipeId))).slice(0, limit)
    }
    if (!categoryId) return []
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'recipes',
      where: publicWhere({ and: [{ id: { not_equals: recipeId } }, { 'index.facetKeys': { contains: `|c:${categoryId}|` } }] }),
      limit: 40,
      depth: 0,
      select: { index: { facetKeys: true } },
    })
    const mine = new Set(facetKeys.split('|').filter((k) => k.startsWith('r:')))
    const scored = res.docs
      .map((d) => ({ id: d.id, score: (d.index?.facetKeys ?? '').split('|').filter((k) => mine.has(k)).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    return getCardsByIds(scored.map((s) => s.id))
  },
  ['related-cards'],
  { tags: ['recipes'], revalidate: HOUR },
)

/** Podaci za kuharicu/plan/listu: po stabilnim ID-jevima (uid). Nepostojeći se vraćaju kao nedostupni. */
export async function getRecipesByUids(uids: string[], withIngredients: boolean) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'recipes',
    where: publicWhere({ uid: { in: uids } }),
    pagination: false,
    depth: withIngredients ? 1 : 1,
    select: withIngredients ? { ...cardSelect, yield: true, ingredientGroups: true } : cardSelect,
    populate: {
      ...cardPopulate,
      ingredients: { name: true, slug: true, roundingHint: true, publicPage: true },
    },
  })
  return (res.docs as unknown as Recipe[]).map((d) => ({
    card: toCard(d),
    baseServings: d.yield?.servings ?? null,
    yieldUnit: d.yield?.unit ?? 'porcija',
    scalable: (d.yield?.scalable ?? true) && !!d.yield?.servings,
    lines: withIngredients ? toIngredientGroups(d).flatMap((g) => g.items) : ([] as IngredientLine[]),
  }))
}

export const getApprovedComments = unstable_cache(
  async (recipeId: number) => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'comments',
      where: { and: [{ recipe: { equals: recipeId } }, { status: { equals: 'odobreno' } }] },
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      overrideAccess: false,
      select: { name: true, text: true, rating: true, kind: true, reply: true, createdAt: true },
    })
    const ratings = res.docs.map((c) => c.rating).filter((r): r is number => typeof r === 'number')
    return {
      comments: res.docs.map((c) => ({
        id: c.id,
        name: c.name,
        text: c.text,
        rating: c.rating ?? null,
        kind: c.kind,
        reply: c.reply ?? null,
        createdAt: c.createdAt,
      })),
      rating: ratings.length
        ? { average: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10, count: ratings.length }
        : null,
    }
  },
  ['approved-comments'],
  { tags: ['recipes'], revalidate: HOUR },
)
