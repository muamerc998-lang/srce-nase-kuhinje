import { unstable_cache } from './cache'
import type { Where } from 'payload'
import type { SearchState } from '@/lib/search/params'
import { expandQuery, relevanceScore } from '@/lib/search/query'
import { payloadClient, publicWhere } from './payload'
import { toCard, cardSelect, cardPopulate, type RecipeCard } from './mappers'
import { getCategories, getIngredientRegistry, getSynonymGroups, getTagRegistry } from './site'

export const PAGE_SIZE = 12
/** Najviše kandidata za rangiranje po relevantnosti (pretraga je uvijek ograničena). */
const RELEVANCE_CAP = 500

export interface SearchScope {
  /** ograniči na obrok (doručak/ručak/večera) */
  meal?: string
  /** ograniči na kategoriju (uključujući podkategorije) */
  categoryId?: number
  /** ograniči na skup recepata (npr. kolekcija) */
  recipeIds?: number[]
}

export interface SearchResult {
  cards: RecipeCard[]
  total: number
  page: number
  totalPages: number
  /** slugovi iz URL-a koji ne postoje (ignorisani) */
  unknown: string[]
}

const facet = (key: string): Where => ({ 'index.facetKeys': { contains: `|${key}|` } })

async function buildWhere(state: SearchState, scope: SearchScope) {
  const [cats, ingredients, synonyms, tags] = await Promise.all([getCategories(), getIngredientRegistry(), getSynonymGroups(), getTagRegistry()])
  const unknown: string[] = []
  const and: Where[] = []

  if (scope.categoryId) and.push(facet(`c:${scope.categoryId}`))
  if (scope.meal) and.push(facet(`o:${scope.meal}`))
  if (scope.recipeIds) and.push({ id: { in: scope.recipeIds.length ? scope.recipeIds : [-1] } })

  const expanded = state.q ? expandQuery(state.q, synonyms) : []
  for (const alts of expanded) {
    and.push({ or: alts.map((a) => ({ 'index.searchText': { contains: a } })) })
  }

  const catIds = state.kategorija
    .map((s) => cats.find((c) => c.slug === s)?.id ?? (unknown.push(s), null))
    .filter((x): x is number => x != null)
  if (catIds.length) and.push({ or: catIds.map((id) => facet(`c:${id}`)) })

  const ingId = (s: string) => ingredients.find((i) => i.slug === s)?.id ?? (unknown.push(s), null)
  const incl = state.sastojci.map(ingId).filter((x): x is number => x != null)
  if (incl.length) {
    const parts = incl.map((id) => facet(`i:${id}`))
    and.push(state.sastojciNacin === 'bilo' ? { or: parts } : { and: parts })
  }
  for (const id of state.bez.map(ingId).filter((x): x is number => x != null)) {
    // not_like ne dodaje zamjenske znakove sam
    and.push({ 'index.facetKeys': { not_like: `%|r:${id}|%` } })
  }
  if (state.vrijeme) and.push({ 'index.totalMinutes': { less_than_equal: state.vrijeme } })
  if (state.metoda.length) and.push({ or: state.metoda.map((m) => facet(`m:${m}`)) })
  if (state.tezina.length) and.push({ difficulty: { in: state.tezina } })
  for (const d of state.ishrana) and.push(facet(`d:${d}`))
  for (const s of state.oznaka) {
    const t = tags.find((x) => x.slug === s)
    if (t) and.push(facet(`t:${t.id}`))
    else unknown.push(s)
  }
  if (state.obrok.length) and.push({ or: state.obrok.map((o) => facet(`o:${o}`)) })
  if (state.meso === 'da') and.push(facet('x:meso'))
  if (state.meso === 'ne') and.push({ 'index.facetKeys': { not_like: '%|x:meso|%' } })

  return { where: publicWhere(and.length ? { and } : undefined) as Where, expanded, unknown }
}

async function cardsByIds(ids: number[]): Promise<RecipeCard[]> {
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
  const byId = new Map(res.docs.map((d) => [d.id, toCard(d)]))
  return ids.map((id) => byId.get(id)).filter((c): c is RecipeCard => !!c)
}

async function runSearch(state: SearchState, scope: SearchScope): Promise<SearchResult> {
  const payload = await payloadClient()
  const { where, expanded, unknown } = await buildWhere(state, scope)
  const page = state.stranica

  if (state.sort === 'relevantnost' && state.q) {
    const res = await payload.find({
      collection: 'recipes',
      where,
      limit: RELEVANCE_CAP,
      depth: 0,
      sort: '-publishedAt',
      select: { index: { searchTitle: true }, publishedAt: true },
    })
    const ranked = res.docs
      .map((d, i) => ({ id: d.id, score: relevanceScore(d.index?.searchTitle ?? '', state.q, expanded), i }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
    const total = ranked.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const slice = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => r.id)
    return { cards: await cardsByIds(slice), total, page, totalPages, unknown }
  }

  const res = await payload.find({
    collection: 'recipes',
    where,
    page,
    limit: PAGE_SIZE,
    depth: 1,
    sort: state.sort === 'najbrze' ? ['index.totalMinutes', '-publishedAt'] : ['-publishedAt', 'id'],
    select: cardSelect,
    populate: cardPopulate,
  })
  return {
    cards: res.docs.map(toCard),
    total: res.totalDocs,
    page: res.page ?? page,
    totalPages: Math.max(1, res.totalPages),
    unknown,
  }
}

/** Keširano po normalizovanom stanju; poništava se objavom recepta. */
export const searchRecipes = unstable_cache(runSearch, ['search-recipes'], { tags: ['recipes'], revalidate: 600 })

export async function countRecipes(state: SearchState, scope: SearchScope = {}): Promise<number> {
  const payload = await payloadClient()
  const { where } = await buildWhere(state, scope)
  return (await payload.count({ collection: 'recipes', where })).totalDocs
}

/** Prijedlozi pri tipkanju: najviše 6 naslova. */
export async function suggestRecipes(q: string) {
  const synonyms = await getSynonymGroups()
  const expanded = expandQuery(q, synonyms)
  if (!expanded.length) return []
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'recipes',
    where: publicWhere({ and: expanded.map((alts) => ({ or: alts.map((a) => ({ 'index.searchText': { contains: a } })) })) }),
    limit: 40,
    depth: 0,
    select: { title: true, slug: true, index: { searchTitle: true } },
  })
  return res.docs
    .map((d) => ({ title: d.title, slug: d.slug ?? '', score: relevanceScore(d.index?.searchTitle ?? '', q, expanded) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ title, slug }) => ({ title, slug }))
}
