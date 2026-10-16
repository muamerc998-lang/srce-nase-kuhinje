/**
 * "Šta imam u kuhinji": podudaranje vrsta namirnica (ne količina).
 *
 * Profil recepta:
 * - required: lista obaveznih zahtjeva; svaki zahtjev je skup dozvoljenih
 *   alternativa (npr. ["maslac", "margarin"]) — pokriven je ako korisnik ima bar jednu.
 * - optional: opcionalne namirnice (dekoracija i sl.) — ne broje se kao nedostatak.
 *
 * Šira namirnica: ako recept traži "brašno" a korisnik ima "glatko brašno"
 * (čiji je širi pojam "brašno"), zahtjev je pokriven. Obrnuto ne važi.
 */

export interface MatchProfile {
  required: string[][]
  optional: string[]
}

export interface PantryQuery {
  have: string[]
  exclude: string[]
  /** osnovne namirnice koje korisnik izričito potvrđuje (so, voda, ulje…) */
  basics: string[]
  useBasics: boolean
  maxMissing?: number
}

export interface PantryResult<T> {
  recipe: T
  missing: string[][]
  /** obavezni zahtjevi pokriveni korisnikovim izborom (ne osnovnim namirnicama) */
  usedFromSelection: number
  /** opcionalne isključene namirnice koje treba izostaviti */
  omitOptional: string[]
}

/** parentOf: id → id šire namirnice */
export function expandWithBroader(ids: Iterable<string>, parentOf: Map<string, string | null>): Set<string> {
  const out = new Set<string>()
  for (const id of ids) {
    let cur: string | null | undefined = id
    let guard = 0
    while (cur && !out.has(cur) && guard++ < 10) {
      out.add(cur)
      cur = parentOf.get(cur) ?? null
    }
    out.add(id)
  }
  return out
}

export function matchRecipe<T>(
  recipe: T,
  profile: MatchProfile,
  query: PantryQuery,
  parentOf: Map<string, string | null>,
): PantryResult<T> | null {
  const selected = expandWithBroader(query.have, parentOf)
  const basics = query.useBasics ? expandWithBroader(query.basics, parentOf) : new Set<string>()
  const excluded = new Set(query.exclude)

  const missing: string[][] = []
  let usedFromSelection = 0

  for (const alternatives of profile.required) {
    const allowed = alternatives.filter((id) => !excluded.has(id))
    // Ako su sve alternative isključene, recept nije prihvatljiv.
    if (allowed.length === 0) return null
    if (allowed.some((id) => selected.has(id))) {
      usedFromSelection++
      continue
    }
    if (allowed.some((id) => basics.has(id))) continue
    missing.push(allowed)
  }

  const omitOptional = profile.optional.filter((id) => excluded.has(id))
  const maxMissing = query.maxMissing ?? 2
  if (missing.length > maxMissing) return null
  // Bez ijedne iskorištene odabrane namirnice rezultat nema smisla.
  if (query.have.length > 0 && usedFromSelection === 0) return null

  return { recipe, missing, usedFromSelection, omitOptional }
}

export function rankPantryResults<T extends { totalMinutes?: number | null }>(
  results: PantryResult<T>[],
): PantryResult<T>[] {
  return [...results].sort((a, b) => {
    if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length
    if (a.usedFromSelection !== b.usedFromSelection) return b.usedFromSelection - a.usedFromSelection
    return (a.recipe.totalMinutes ?? 9999) - (b.recipe.totalMinutes ?? 9999)
  })
}

/** Izgradnja profila iz linija recepta (koristi se u CMS hooku i testovima). */
export function buildMatchProfile(
  lines: Array<{ ingredientId: string; optional?: boolean | null; altGroup?: string | null }>,
): MatchProfile {
  const groups = new Map<string, Set<string>>()
  const required: string[][] = []
  const optional = new Set<string>()
  for (const l of lines) {
    if (!l.ingredientId) continue
    if (l.optional) {
      optional.add(l.ingredientId)
      continue
    }
    const alt = l.altGroup?.trim()
    if (alt) {
      if (!groups.has(alt)) groups.set(alt, new Set())
      groups.get(alt)!.add(l.ingredientId)
    } else {
      required.push([l.ingredientId])
    }
  }
  for (const set of groups.values()) required.push([...set])
  // isti sastojak u više grupa (npr. jaja u tijestu i kremi) je jedan zahtjev
  const seen = new Set<string>()
  const dedup = required.filter((alts) => {
    const k = [...alts].sort().join(',')
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  return { required: dedup, optional: [...optional].filter((id) => !dedup.some((a) => a.includes(id))) }
}
