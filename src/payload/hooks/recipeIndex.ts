import type { CollectionBeforeChangeHook, PayloadRequest } from 'payload'
import { normalizeText } from '../../lib/text/normalize'
import { buildMatchProfile } from '../../lib/pantry/match'
import { effectiveTotal } from '../../lib/recipes/time'

type Rel = number | string | { id: number | string } | null | undefined
const relId = (r: Rel): string | null => (r == null ? null : typeof r === 'object' ? String(r.id) : String(r))

/** Lanac širih namirnica: [id, roditelj, djed…] */
async function ancestorsMap(req: PayloadRequest, ids: string[]) {
  const parent = new Map<string, string | null>()
  const info = new Map<string, { name: string; synonyms: string[]; foodGroup: string | null }>()
  let frontier = [...new Set(ids)]
  let guard = 0
  while (frontier.length && guard++ < 6) {
    const res = await req.payload.find({
      collection: 'ingredients',
      where: { id: { in: frontier } },
      limit: frontier.length,
      depth: 0,
      pagination: false,
      req,
      select: { name: true, synonyms: true, broader: true, foodGroup: true },
    })
    const next: string[] = []
    for (const d of res.docs) {
      const id = String(d.id)
      const p = relId(d.broader as Rel)
      parent.set(id, p)
      info.set(id, { name: d.name, synonyms: (d.synonyms ?? []).map((s) => s.term), foodGroup: d.foodGroup ?? null })
      if (p && !parent.has(p)) next.push(p)
    }
    frontier = next
  }
  const chain = (id: string) => {
    const out: string[] = []
    let cur: string | null | undefined = id
    let g = 0
    while (cur && !out.includes(cur) && g++ < 8) {
      out.push(cur)
      cur = parent.get(cur)
    }
    return out
  }
  return { chain, info }
}

async function categoryChain(req: PayloadRequest, ids: string[]) {
  const all = new Set<string>()
  const names: string[] = []
  let frontier = [...new Set(ids)]
  let guard = 0
  while (frontier.length && guard++ < 4) {
    const res = await req.payload.find({
      collection: 'categories',
      where: { id: { in: frontier } },
      depth: 0,
      pagination: false,
      req,
      select: { name: true, parent: true },
    })
    frontier = []
    for (const c of res.docs) {
      const id = String(c.id)
      if (all.has(id)) continue
      all.add(id)
      names.push(c.name)
      const p = relId(c.parent as Rel)
      if (p && !all.has(p)) frontier.push(p)
    }
  }
  return { ids: [...all], names }
}

/**
 * Računa izvedena polja za pretragu, filtere i alat "Šta imam u kuhinji":
 * - searchTitle / searchText: normalizovan tekst bez dijakritike (GIN trigram indeks u bazi)
 * - facetKeys: "|c:ID|i:ID|r:ID|m:metoda|d:svojstvo|t:ID|" za filtere
 * - totalMinutes: efektivno ukupno vrijeme za sortiranje i filter
 * - matchProfile: obavezne grupe alternativa i opcionalne namirnice
 */
export const computeRecipeIndex: CollectionBeforeChangeHook = async ({ data, req, originalDoc }) => {
  if (!data) return data
  const merged = { ...originalDoc, ...data }

  // Urednička validacija pri objavi
  if (data._status === 'published') {
    const missing: string[] = []
    if (!merged.summary) missing.push('kratak opis')
    if (!merged.ingredientGroups?.length) missing.push('sastojci')
    if (!merged.stepGroups?.length) missing.push('koraci')
    if (!merged.heroImage && process.env.SITE_ENV === 'production') missing.push('glavna fotografija')
    if (missing.length) throw new Error(`Recept se ne može objaviti. Nedostaje: ${missing.join(', ')}.`)
    if (!merged.publishedAt) data.publishedAt = new Date().toISOString()
    if (!merged.contentUpdatedAt) data.contentUpdatedAt = data.publishedAt ?? merged.publishedAt
  }

  const lines: Array<{ ingredientId: string; optional: boolean; altGroup: string | null }> = []
  for (const g of merged.ingredientGroups ?? []) {
    for (const it of g.items ?? []) {
      const id = relId(it.ingredient)
      if (id) lines.push({ ingredientId: id, optional: !!it.optional, altGroup: it.altGroup || null })
    }
  }

  const { chain, info } = await ancestorsMap(
    req,
    lines.map((l) => l.ingredientId),
  )
  const catIds = [relId(merged.primaryCategory), ...(merged.secondaryCategories ?? []).map(relId)].filter(
    Boolean,
  ) as string[]
  const cats = await categoryChain(req, catIds)

  let tagIds = (merged.tags ?? []).map(relId).filter(Boolean) as string[]
  const tagNames: string[] = []
  if (tagIds.length) {
    const tags = await req.payload.find({
      collection: 'tags',
      where: { id: { in: tagIds } },
      depth: 1,
      pagination: false,
      req,
      select: { name: true, mergedInto: true, synonyms: true },
    })
    // Spojene oznake (sinonimi) zamjenjuju se glavnom oznakom.
    const canonical = new Map<string, { id: string; name: string }>()
    for (const t of tags.docs) {
      const target = t.mergedInto && typeof t.mergedInto === 'object' ? t.mergedInto : null
      canonical.set(String(t.id), target ? { id: String(target.id), name: target.name } : { id: String(t.id), name: t.name })
    }
    const seen = new Set<string>()
    tagIds = tagIds
      .map((id) => canonical.get(id)?.id ?? id)
      .filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
    if (data.tags || merged.tags) data.tags = tagIds.map(Number)
    tagNames.push(...tagIds.map((id) => [...canonical.values()].find((c) => c.id === id)?.name ?? ''))
    for (const t of tags.docs) if (tagIds.includes(String(t.id)) && t.synonyms) tagNames.push(...String(t.synonyms).split(';'))
  }

  const keys = new Set<string>()
  cats.ids.forEach((id) => keys.add(`c:${id}`))
  tagIds.forEach((id) => keys.add(`t:${id}`))
  for (const m of merged.methods ?? []) keys.add(`m:${m}`)
  for (const d of merged.diets ?? []) keys.add(`d:${d}`)
  for (const o of merged.meals ?? []) keys.add(`o:${o}`)
  for (const l of lines) {
    for (const id of chain(l.ingredientId)) {
      keys.add(`i:${id}`)
      // "r:" = namirnica bez koje recept ne ide (nije opcionalna ni zamjenjiva) → filter "bez"
      if (!l.optional && !l.altGroup) keys.add(`r:${id}`)
      // S mesom: meso je obavezni sastojak (ne samo opcionalni dodatak)
      if (!l.optional && info.get(id)?.foodGroup === 'meso') keys.add('x:meso')
    }
  }

  const ingredientWords: string[] = []
  for (const l of lines) {
    for (const id of chain(l.ingredientId)) {
      const i = info.get(id)
      if (i) ingredientWords.push(i.name, ...i.synonyms)
    }
  }

  const titles = [merged.title, ...(merged.alternativeNames ?? []).map((a: { name: string }) => a.name)]
  data.index = {
    searchTitle: titles.map(normalizeText).filter(Boolean).join(' | '),
    searchText: normalizeText(
      [...titles, ...ingredientWords, ...cats.names, ...tagNames].filter(Boolean).join(' '),
    ),
    facetKeys: `|${[...keys].join('|')}|`,
    totalMinutes: effectiveTotal(merged.times ?? {}),
    matchProfile: buildMatchProfile(lines),
  }
  return data
}
