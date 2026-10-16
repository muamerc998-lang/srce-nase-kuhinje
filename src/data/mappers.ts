import type { Media, Recipe, Category, Ingredient, Tag, Author } from '@/payload-types'
import type { ImageView, IngredientGroupView, StepGroupView, Difficulty } from '@/lib/recipes/types'
import { cardTimeLabel, effectiveTotal } from '@/lib/recipes/time'
import { siteUrl } from './payload'

type MaybeMedia = number | Media | null | undefined

function relativeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const origin = siteUrl()
  // Payload uz trailingSlash dodaje '/' i na URL datoteke; datoteke se poslužuju bez njega.
  const clean = /\.[a-z0-9]{2,5}\/$/i.test(url) ? url.slice(0, -1) : url
  return clean.startsWith(origin) ? clean.slice(origin.length) || '/' : clean
}

export function toImage(m: MaybeMedia, size?: 'card' | 'wide' | 'og' | 'thumb'): ImageView | null {
  if (!m || typeof m !== 'object') return null
  const s = size ? m.sizes?.[size] : undefined
  const url = relativeUrl(s?.url || m.url)
  const width = (s?.url ? s.width : m.width) ?? 0
  const height = (s?.url ? s.height : m.height) ?? 0
  if (!url || !width || !height) return null
  return { url, alt: m.alt ?? '', width, height, focalX: m.focalX, focalY: m.focalY }
}

export interface RecipeCard {
  id: number
  uid: string
  slug: string
  title: string
  image: ImageView | null
  category: { name: string; slug: string } | null
  tag: string | null
  timeLabel: string
  totalMinutes: number | null
  difficulty: Difficulty
  isDemo: boolean
}

const asObj = <T,>(v: unknown): T | null => (v && typeof v === 'object' ? (v as T) : null)

export type CardSource = Partial<Recipe> & Pick<Recipe, 'id' | 'title'>

export function toCard(r: CardSource): RecipeCard {
  const cat = asObj<Category>(r.primaryCategory)
  const firstTag = (r.tags ?? []).map((t) => asObj<Tag>(t)).find((t) => t?.public)
  return {
    id: r.id,
    uid: r.uid ?? String(r.id),
    slug: r.slug ?? '',
    title: r.title,
    image: toImage(r.heroImage, 'card'),
    category: cat ? { name: cat.name, slug: cat.slug ?? '' } : null,
    tag: firstTag?.name ?? null,
    timeLabel: cardTimeLabel(r.times ?? {}),
    totalMinutes: r.index?.totalMinutes ?? effectiveTotal(r.times ?? {}),
    difficulty: (r.difficulty ?? 'lako') as Difficulty,
    isDemo: !!r.isDemo,
  }
}

/** Polja potrebna za karticu (Payload select). */
export const cardSelect = {
  title: true,
  slug: true,
  uid: true,
  heroImage: true,
  primaryCategory: true,
  tags: true,
  times: true,
  difficulty: true,
  index: { totalMinutes: true },
  publishedAt: true,
  isDemo: true,
} as const

export const cardPopulate = {
  categories: { name: true, slug: true },
  tags: { name: true, public: true },
  media: { url: true, alt: true, width: true, height: true, sizes: true, focalX: true, focalY: true },
} as const

export function toIngredientGroups(r: Pick<Recipe, 'ingredientGroups'>): IngredientGroupView[] {
  return (r.ingredientGroups ?? []).map((g, gi) => ({
    id: g.id ?? `g${gi}`,
    title: g.title ?? undefined,
    items: (g.items ?? []).map((it, ii) => {
      const ing = asObj<Ingredient>(it.ingredient)
      return {
        id: it.id ?? `g${gi}i${ii}`,
        ingredientId: String(ing?.id ?? it.ingredient),
        ingredientSlug: ing?.slug ?? undefined,
        name: ing?.name ?? '',
        label: it.label || ing?.name || '',
        amount: it.amount ?? null,
        amountMax: it.amountMax ?? null,
        unit: it.unit ?? 'bez',
        note: it.note ?? undefined,
        optional: !!it.optional,
        altGroup: it.altGroup ?? undefined,
        roundingHint: ing?.roundingHint ?? undefined,
        originalText: it.originalText ?? undefined,
        publicPage: !!ing?.publicPage,
      }
    }),
  }))
}

export function toStepGroups(r: Pick<Recipe, 'stepGroups'>): StepGroupView[] {
  return (r.stepGroups ?? []).map((g, gi) => ({
    id: g.id ?? `s${gi}`,
    title: g.title ?? undefined,
    steps: (g.steps ?? []).map((s, si) => ({
      id: s.id ?? `s${gi}-${si}`,
      title: s.title ?? undefined,
      text: s.text,
      timerMinutes: s.timerMinutes ?? null,
      timerLabel: s.timerLabel ?? undefined,
      image: toImage(s.image, 'wide'),
    })),
  }))
}

export function authorNames(authors: Recipe['authors']): Array<{ name: string; slug: string; isTeam: boolean; isDemo: boolean }> {
  return (authors ?? [])
    .map((a) => asObj<Author>(a))
    .filter(Boolean)
    .map((a) => ({ name: a!.name, slug: a!.slug ?? '', isTeam: !!a!.isTeam, isDemo: !!a!.isDemo }))
}
