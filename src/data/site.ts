import { unstable_cache } from './cache'
import type { Category } from '@/payload-types'
import { payloadClient, publicWhere, isProduction } from './payload'
import { toImage } from './mappers'
import { normalizeText } from '@/lib/text/normalize'
import type { ImageView } from '@/lib/recipes/types'
import { toArticleView, paragraphs } from './article'

const HOUR = 3600

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const s = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
    return {
      siteName: s.siteName || 'Srce naše kuhinje',
      tagline: s.tagline ?? '',
      description: s.description ?? '',
      facebookUrl: s.facebookUrl || null,
      facebookName: s.facebookName || 'Srce naše kuhinje – najbolji recepti',
      facebookGroupUrl: s.facebookGroupUrl || null,
      organizationName: s.organizationName || null,
      features: {
        comments: s.features?.comments ?? true,
        ratings: s.features?.ratings ?? true,
        pantryPromo: s.features?.pantryPromo ?? false,
        corrections: s.features?.corrections ?? true,
        minCollectionRecipes: s.features?.minCollectionRecipes ?? 3,
      },
      ads: { enabled: !!s.ads?.enabled, slots: (s.ads?.slots ?? []) as string[] },
    }
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: HOUR },
)

export type SiteSettingsView = Awaited<ReturnType<typeof getSiteSettings>>

/**
 * Brojevi objavljenih recepata po ključu fasete (kategorije s podkategorijama,
 * namirnice…). Koristi se da se prazne kategorije ne prikazuju i za filtere.
 */
export const getFacetStats = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'recipes',
      where: publicWhere(),
      pagination: false,
      depth: 0,
      select: { index: { facetKeys: true } },
    })
    const counts: Record<string, number> = {}
    for (const r of res.docs) {
      for (const key of (r.index?.facetKeys ?? '').split('|')) {
        if (key) counts[key] = (counts[key] ?? 0) + 1
      }
    }
    return { total: res.docs.length, counts }
  },
  ['facet-stats'],
  { tags: ['recipes'], revalidate: HOUR },
)

export interface CategoryView {
  id: number
  name: string
  slug: string
  intro: string
  body: string[]
  parentId: number | null
  order: number
  showInMenu: boolean
  image: ImageView | null
  count: number
  seo: { title?: string | null; description?: string | null; noindex?: boolean | null }
}

export const getCategories = unstable_cache(
  async (): Promise<CategoryView[]> => {
    const payload = await payloadClient()
    const [res, stats] = await Promise.all([
      payload.find({
        collection: 'categories',
        where: publicWhere(undefined, false),
        pagination: false,
        depth: 1,
        sort: 'order',
      }),
      getFacetStats(),
    ])
    return res.docs.map((c: Category) => ({
      id: c.id,
      name: c.name,
      slug: c.slug ?? '',
      intro: c.intro ?? '',
      body: paragraphs(c.body),
      parentId: c.parent ? (typeof c.parent === 'object' ? c.parent.id : c.parent) : null,
      order: c.order ?? 100,
      showInMenu: c.showInMenu ?? true,
      image: toImage(c.image, 'card'),
      count: stats.counts[`c:${c.id}`] ?? 0,
      seo: c.seo ?? {},
    }))
  },
  ['categories-v2'],
  { tags: ['categories', 'recipes'], revalidate: HOUR },
)

export const getNavigation = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const [nav, cats] = await Promise.all([payload.findGlobal({ slug: 'navigation', depth: 1 }), getCategories()])
    const visible = (ids: unknown[] | null | undefined, fallback: CategoryView[]) => {
      const picked = (ids ?? [])
        .map((c) => (typeof c === 'object' && c ? (c as Category).id : c))
        .map((id) => cats.find((c) => c.id === id))
        .filter((c): c is CategoryView => !!c)
      return (picked.length ? picked : fallback).filter((c) => c.count > 0)
    }
    const topLevel = cats.filter((c) => !c.parentId && c.showInMenu)
    const guides = (nav.footerGuides ?? [])
      .map((g) => (typeof g === 'object' ? g : null))
      .filter((g) => g && g._status === 'published' && (!isProduction() || !g.isDemo))
      .map((g) => ({ title: g!.title, slug: g!.slug ?? '' }))
    return {
      recipeMenu: visible(nav.recipeMenu, topLevel).map((c) => ({
        name: c.name,
        slug: c.slug,
        children: cats.filter((s) => s.parentId === c.id && s.count > 0).map((s) => ({ name: s.name, slug: s.slug })),
      })),
      footerCategories: visible(nav.footerCategories, topLevel).map((c) => ({ name: c.name, slug: c.slug })),
      footerGuides: guides,
    }
  },
  ['navigation'],
  { tags: ['navigation', 'categories', 'recipes', 'guides'], revalidate: HOUR },
)

export const getInfoPages = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'pages',
      where: publicWhere(),
      pagination: false,
      depth: 0,
      select: { title: true, slug: true, footerGroup: true },
    })
    return res.docs.map((p) => ({ title: p.title, slug: p.slug ?? '', group: p.footerGroup ?? null }))
  },
  ['info-pages'],
  { tags: ['pages'], revalidate: HOUR },
)

export interface IngredientOption {
  id: number
  name: string
  slug: string
  synonyms: string[]
  broaderId: number | null
  publicPage: boolean
  search: string
}

/** Cijeli registar namirnica (koristi se za filtere, autocomplete i podudaranje). */
export const getIngredientRegistry = unstable_cache(
  async (): Promise<IngredientOption[]> => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'ingredients',
      where: publicWhere(undefined, false),
      pagination: false,
      depth: 0,
      sort: 'name',
      select: { name: true, slug: true, synonyms: true, broader: true, publicPage: true, searchName: true },
    })
    return res.docs.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug ?? '',
      synonyms: (i.synonyms ?? []).map((s) => s.term),
      broaderId: (i.broader as number | null) ?? null,
      publicPage: !!i.publicPage,
      search: i.searchName || normalizeText(i.name),
    }))
  },
  ['ingredient-registry'],
  { tags: ['ingredients'], revalidate: HOUR },
)

export interface TagOption {
  id: number
  name: string
  slug: string
  group: 'namirnica' | 'tijesto' | 'ostalo'
  synonyms: string[]
}

/** Javne kanonske oznake (bez spojenih sinonima). */
export const getTagRegistry = unstable_cache(
  async (): Promise<TagOption[]> => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'tags',
      where: publicWhere({ and: [{ public: { equals: true } }, { mergedInto: { exists: false } }] }, false),
      pagination: false,
      depth: 0,
      sort: 'name',
      select: { name: true, slug: true, group: true, synonyms: true },
    })
    return res.docs.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug ?? '',
      group: (t.group ?? 'ostalo') as TagOption['group'],
      synonyms: (t.synonyms ?? '').split(';').map((x) => x.trim()).filter(Boolean),
    }))
  },
  ['tag-registry'],
  { tags: ['tags'], revalidate: HOUR },
)

export const getSynonymGroups = unstable_cache(
  async (): Promise<string[][]> => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'search-synonyms',
      where: publicWhere(undefined, false),
      pagination: false,
      depth: 0,
      select: { normalized: true },
    })
    const groups = res.docs.map((d) => (d.normalized ?? '').split('|').filter(Boolean))
    // sinonimi namirnica su također grupe
    const ingredients = await getIngredientRegistry()
    for (const i of ingredients) {
      if (i.synonyms.length) groups.push([i.name, ...i.synonyms].map(normalizeText))
    }
    for (const t of await getTagRegistry()) {
      if (t.synonyms.length) groups.push([t.name, ...t.synonyms].map(normalizeText))
    }
    return groups
  },
  ['synonym-groups'],
  { tags: ['search-synonyms', 'ingredients', 'tags'], revalidate: HOUR },
)

export const getPantryBasics = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const g = await payload.findGlobal({ slug: 'pantry-basics', depth: 1 })
    return {
      items: (g.items ?? [])
        .map((i) => (typeof i === 'object' ? i : null))
        .filter(Boolean)
        .map((i) => ({ id: i!.id, name: i!.name, slug: i!.slug ?? '' })),
      publicApproved: !!g.publicApproved,
    }
  },
  ['pantry-basics'],
  { tags: ['pantry-basics', 'ingredients'], revalidate: HOUR },
)

export const getMealPages = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const g = await payload.findGlobal({ slug: 'meal-pages', depth: 1 })
    const one = (m: typeof g.dorucak, fallback: string) => ({
      title: m?.title || fallback,
      intro: m?.intro ?? '',
      image: toImage(m?.image, 'card'),
      wideImage: toImage(m?.image, 'wide'),
      collectionSlugs: (m?.collections ?? []).map((c) => (typeof c === 'object' && c ? (c.slug ?? '') : '')).filter(Boolean),
      seoDescription: m?.seoDescription ?? null,
      article: toArticleView(m, g.updatedAt ?? null),
    })
    return { dorucak: one(g.dorucak, 'Doručak'), rucak: one(g.rucak, 'Ručak'), vecera: one(g.vecera, 'Večera') }
  },
  ['meal-pages-v2'],
  { tags: ['meal-pages', 'recipe-collections'], revalidate: HOUR },
)
