/**
 * Stanje pretrage i filtera kroz URL. Svi parametri su čitljivi slugovi kako bi
 * povratak s recepta (Back) vratio iste filtere i stranicu.
 *
 * Kombinovanje: grupe se spajaju s AND; unutar kategorije, metode i težine je OR;
 * prehrambena svojstva su AND (recept mora imati sva odabrana); obavezne
 * namirnice imaju izričit izbor "sve" ili "bilo koja".
 */

export type SortKey = 'relevantnost' | 'najnovije' | 'najbrze'

export interface SearchState {
  q: string
  kategorija: string[]
  sastojci: string[]
  sastojciNacin: 'sve' | 'bilo'
  bez: string[]
  vrijeme: number | null
  metoda: string[]
  tezina: string[]
  ishrana: string[]
  /** kontrolisane oznake (glavna namirnica, vrsta tijesta) — AND */
  oznaka: string[]
  /** doručak / ručak / večera (OR) */
  obrok: string[]
  /** s mesom (da) ili bez mesa (ne) */
  meso: 'da' | 'ne' | null
  sort: SortKey
  stranica: number
}

export const TIME_OPTIONS = [15, 30, 45, 60, 120] as const

export const METHOD_OPTIONS = [
  { value: 'pecenje', label: 'Iz rerne' },
  { value: 'przenje', label: 'Iz tave' },
  { value: 'kuhanje', label: 'Kuhanje' },
  { value: 'pirjanje', label: 'Pirjanje' },
  { value: 'rostilj', label: 'Roštilj' },
  { value: 'bez-pecenja', label: 'Bez pečenja' },
  { value: 'friteza', label: 'Friteza na vrući zrak' },
  { value: 'bez-kuhanja', label: 'Bez kuhanja' },
  { value: 'zimnica', label: 'Ukuhavanje' },
] as const

export const MEAL_OPTIONS = [
  { value: 'dorucak', label: 'Doručak' },
  { value: 'rucak', label: 'Ručak' },
  { value: 'vecera', label: 'Večera' },
] as const

export const DIET_OPTIONS = [
  { value: 'posno', label: 'Posno' },
  { value: 'vegetarijansko', label: 'Vegetarijansko' },
  { value: 'vegansko', label: 'Vegansko' },
  { value: 'bez-jaja', label: 'Bez jaja' },
  { value: 'bez-mlijeka', label: 'Bez mlijeka' },
  { value: 'bez-glutena', label: 'Bez glutena' },
  { value: 'bez-brasna', label: 'Bez brašna' },
  { value: 'bez-kvasca', label: 'Bez kvasca' },
] as const

export const DIFFICULTY_OPTIONS = [
  { value: 'lako', label: 'Lako' },
  { value: 'srednje', label: 'Srednje' },
  { value: 'zahtjevno', label: 'Zahtjevno' },
] as const

const SLUG_RE = /^[a-z0-9-]{1,96}$/
const MAX_LIST = 12

type Raw = Record<string, string | string[] | undefined>

function list(raw: Raw, key: string, allowed?: readonly string[]): string[] {
  const v = raw[key]
  const values = (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(','))
  const out: string[] = []
  for (const s of values) {
    const t = s.trim().toLowerCase()
    if (!SLUG_RE.test(t)) continue
    if (allowed && !allowed.includes(t)) continue
    if (!out.includes(t)) out.push(t)
    if (out.length >= MAX_LIST) break
  }
  return out
}

function single(raw: Raw, key: string): string {
  const v = raw[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

export function parseSearchState(raw: Raw): SearchState {
  const q = single(raw, 'q').slice(0, 100).trim()
  const vrijemeRaw = Number(single(raw, 'vrijeme'))
  const vrijeme = (TIME_OPTIONS as readonly number[]).includes(vrijemeRaw) ? vrijemeRaw : null
  const sortRaw = single(raw, 'sort')
  const sort: SortKey =
    sortRaw === 'najnovije' || sortRaw === 'najbrze' || sortRaw === 'relevantnost'
      ? sortRaw
      : q
        ? 'relevantnost'
        : 'najnovije'
  const page = Math.floor(Number(single(raw, 'stranica')))
  return {
    q,
    kategorija: list(raw, 'kategorija'),
    sastojci: list(raw, 'sastojci'),
    sastojciNacin: single(raw, 'nacin') === 'bilo' ? 'bilo' : 'sve',
    bez: list(raw, 'bez'),
    vrijeme,
    metoda: list(raw, 'metoda', METHOD_OPTIONS.map((m) => m.value)),
    tezina: list(raw, 'tezina', DIFFICULTY_OPTIONS.map((m) => m.value)),
    ishrana: list(raw, 'ishrana', DIET_OPTIONS.map((m) => m.value)),
    oznaka: list(raw, 'oznaka'),
    obrok: list(raw, 'obrok', MEAL_OPTIONS.map((m) => m.value)),
    meso: single(raw, 'meso') === 'da' ? 'da' : single(raw, 'meso') === 'ne' ? 'ne' : null,
    sort: sort === 'relevantnost' && !q ? 'najnovije' : sort,
    stranica: Number.isFinite(page) && page > 1 && page < 1000 ? page : 1,
  }
}

/** Serijalizacija u query string (stabilan redoslijed → stabilni URL-ovi). */
export function serializeSearchState(s: Partial<SearchState>, base: Partial<SearchState> = {}): string {
  const p = new URLSearchParams()
  const st = { ...base, ...s }
  if (st.q) p.set('q', st.q)
  if (st.kategorija?.length) p.set('kategorija', st.kategorija.join(','))
  if (st.sastojci?.length) p.set('sastojci', st.sastojci.join(','))
  if (st.sastojci && st.sastojci.length > 1 && st.sastojciNacin === 'bilo') p.set('nacin', 'bilo')
  if (st.bez?.length) p.set('bez', st.bez.join(','))
  if (st.vrijeme) p.set('vrijeme', String(st.vrijeme))
  if (st.metoda?.length) p.set('metoda', st.metoda.join(','))
  if (st.tezina?.length) p.set('tezina', st.tezina.join(','))
  if (st.ishrana?.length) p.set('ishrana', st.ishrana.join(','))
  if (st.oznaka?.length) p.set('oznaka', st.oznaka.join(','))
  if (st.obrok?.length) p.set('obrok', st.obrok.join(','))
  if (st.meso) p.set('meso', st.meso)
  const defaultSort = st.q ? 'relevantnost' : 'najnovije'
  if (st.sort && st.sort !== defaultSort) p.set('sort', st.sort)
  if (st.stranica && st.stranica > 1) p.set('stranica', String(st.stranica))
  const qs = p.toString().replace(/%2C/g, ',')
  return qs ? `?${qs}` : ''
}

/** Ima li aktivnih filtera (osim stranice i sortiranja)? Takve stranice su noindex. */
export function hasActiveFilters(s: SearchState): boolean {
  return !!(
    s.q ||
    s.kategorija.length ||
    s.sastojci.length ||
    s.bez.length ||
    s.vrijeme ||
    s.metoda.length ||
    s.tezina.length ||
    s.ishrana.length ||
    s.oznaka.length ||
    s.obrok.length ||
    s.meso
  )
}

export function emptyState(): SearchState {
  return parseSearchState({})
}
