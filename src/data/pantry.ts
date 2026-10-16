import type { Where } from 'payload'
import { payloadClient, publicWhere } from './payload'
import { getCategories, getIngredientRegistry, getPantryBasics } from './site'
import { getCardsByIds } from './recipes'
import { matchRecipe, rankPantryResults, type MatchProfile } from '@/lib/pantry/match'
import type { RecipeCard } from './mappers'

export interface PantryInput {
  imam: string[]
  bez: string[]
  osnovne: boolean
  kategorija: string | null
  vrijeme: number | null
}

export interface PantryHit {
  card: RecipeCard
  missing: string[]
  omitOptional: string[]
}

const SLUG = /^[a-z0-9-]{1,96}$/
const list = (v: string | string[] | undefined) =>
  [...new Set((Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(',')).map((s) => s.trim()).filter((s) => SLUG.test(s)))].slice(0, 20)

export function parsePantry(raw: Record<string, string | string[] | undefined>): PantryInput {
  const single = (k: string) => (Array.isArray(raw[k]) ? raw[k]![0] : (raw[k] as string | undefined)) ?? ''
  const v = Number(single('vrijeme'))
  const kat = single('kategorija')
  return {
    imam: list(raw.imam),
    bez: list(raw.bez),
    osnovne: single('osnovne') === '1',
    kategorija: SLUG.test(kat) ? kat : null,
    vrijeme: [15, 30, 45, 60, 120].includes(v) ? v : null,
  }
}

/**
 * Podudaranje se radi nad kandidatima koji sadrže bar jednu odabranu namirnicu
 * (indeksiran upit), a zatim se u aplikaciji računa šta nedostaje.
 * Količine se NE provjeravaju — samo vrste namirnica.
 */
export async function findPantryMatches(input: PantryInput) {
  const [registry, basics, cats] = await Promise.all([getIngredientRegistry(), getPantryBasics(), getCategories()])
  const bySlug = new Map(registry.map((i) => [i.slug, i]))
  const byId = new Map(registry.map((i) => [String(i.id), i]))
  const parentOf = new Map(registry.map((i) => [String(i.id), i.broaderId ? String(i.broaderId) : null]))
  const have = input.imam.map((s) => bySlug.get(s)).filter(Boolean).map((i) => String(i!.id))
  const exclude = input.bez.map((s) => bySlug.get(s)).filter(Boolean).map((i) => String(i!.id))
  if (!have.length) return { hits: [] as PantryHit[], basics: basics.items, selected: [], excluded: [] }

  const and: Where[] = [{ or: have.map((id) => ({ 'index.facetKeys': { contains: `|i:${id}|` } })) }]
  const cat = input.kategorija ? cats.find((c) => c.slug === input.kategorija) : null
  if (cat) and.push({ 'index.facetKeys': { contains: `|c:${cat.id}|` } })
  if (input.vrijeme) and.push({ 'index.totalMinutes': { less_than_equal: input.vrijeme } })

  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'recipes',
    where: publicWhere({ and }),
    limit: 400,
    depth: 0,
    select: { index: { matchProfile: true, totalMinutes: true } },
  })

  const results = res.docs
    .map((d) =>
      matchRecipe(
        { id: d.id, totalMinutes: d.index?.totalMinutes ?? null },
        (d.index?.matchProfile as unknown as MatchProfile) ?? { required: [], optional: [] },
        { have, exclude, basics: basics.items.map((b) => String(b.id)), useBasics: input.osnovne, maxMissing: 2 },
        parentOf,
      ),
    )
    .filter((r): r is NonNullable<typeof r> => !!r)
  const ranked = rankPantryResults(results).slice(0, 36)
  const cards = await getCardsByIds(ranked.map((r) => r.recipe.id))
  const cardById = new Map(cards.map((c) => [c.id, c]))
  const name = (id: string) => byId.get(id)?.name ?? '?'

  const hits: PantryHit[] = ranked
    .filter((r) => cardById.has(r.recipe.id))
    .map((r) => ({
      card: cardById.get(r.recipe.id)!,
      missing: r.missing.map((alts) => alts.map(name).join(' ili ')),
      omitOptional: r.omitOptional.map(name),
    }))
  return {
    hits,
    basics: basics.items,
    selected: input.imam.map((s) => bySlug.get(s)).filter(Boolean).map((i) => ({ slug: i!.slug, name: i!.name })),
    excluded: input.bez.map((s) => bySlug.get(s)).filter(Boolean).map((i) => ({ slug: i!.slug, name: i!.name })),
  }
}
