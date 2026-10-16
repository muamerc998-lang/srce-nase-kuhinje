import { formatQuantity } from '../quantities/scale'
import { isoDuration } from '../recipes/time'
import type { IngredientGroupView, StepGroupView } from '../recipes/types'

export interface RecipeSchemaInput {
  url: string
  title: string
  summary: string
  images: string[]
  authors: Array<{ name: string; isTeam: boolean }>
  organizationName: string
  publishedAt?: string | null
  updatedAt?: string | null
  times: { prepMinutes?: number | null; cookMinutes?: number | null; totalMinutes?: number | null }
  yieldText: string | null
  category?: string | null
  ingredientGroups: IngredientGroupView[]
  stepGroups: StepGroupView[]
  keywords: string[]
  rating: { average: number; count: number } | null
}

/** Tekst sastojka za schemu — isti kao vidljivi red pri izvornoj količini. */
export function ingredientText(l: IngredientGroupView['items'][number]): string {
  if (l.originalText) return l.originalText
  const qty = formatQuantity(l)
  const isText = l.unit === 'po-ukusu' || l.unit === 'po-potrebi'
  const base = isText ? `${l.label} ${qty}` : `${qty} ${l.label}`
  return [base.trim(), l.note].filter(Boolean).join(', ')
}

/**
 * Jedan Recipe entitet po receptu. Vremena, prinos, sastojci i koraci dolaze iz
 * istih podataka kao vidljiva receptna kartica. AggregateRating samo uz stvarne
 * objavljene ocjene; nutrition i video se ne izmišljaju.
 */
export function recipeJsonLd(r: RecipeSchemaInput) {
  // Naslovljene grupe postaju HowToSection; nenaslovljeni koraci ostaju HowToStep.
  const flatSteps: unknown[] = r.stepGroups.flatMap((g): unknown[] => {
    const items = g.steps.map((s) => ({ '@type': 'HowToStep', text: s.title ? `${s.title}: ${s.text}` : s.text }))
    return g.title ? [{ '@type': 'HowToSection', name: g.title, itemListElement: items }] : items
  })
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    '@id': `${r.url}#recept`,
    name: r.title,
    description: r.summary,
    url: r.url,
    image: r.images.length ? r.images : undefined,
    author: r.authors.length
      ? r.authors.map((a) => (a.isTeam ? { '@type': 'Organization', name: a.name } : { '@type': 'Person', name: a.name }))
      : { '@type': 'Organization', name: r.organizationName },
    datePublished: r.publishedAt ?? undefined,
    dateModified: r.updatedAt ?? undefined,
    prepTime: isoDuration(r.times.prepMinutes),
    cookTime: isoDuration(r.times.cookMinutes),
    totalTime: isoDuration(r.times.totalMinutes),
    recipeYield: r.yieldText ?? undefined,
    recipeCategory: r.category ?? undefined,
    recipeCuisine: undefined,
    keywords: r.keywords.length ? r.keywords.join(', ') : undefined,
    recipeIngredient: r.ingredientGroups.flatMap((g) => g.items.map(ingredientText)),
    recipeInstructions: flatSteps,
  }
  if (r.rating && r.rating.count > 0) {
    data.aggregateRating = { '@type': 'AggregateRating', ratingValue: r.rating.average, ratingCount: r.rating.count, bestRating: 5, worstRating: 1 }
  }
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>
}
