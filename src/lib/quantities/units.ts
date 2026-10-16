/**
 * Kontrolisani registar jedinica. Kôd jedinice se čuva u CMS-u; prikaz se pravi ovdje.
 *
 * family:
 * - mass / volume: tačne metričke konverzije (g↔kg, ml↔dl↔l) su dozvoljene
 * - count: komadi i slične brojive jedinice (zaokružuju se uz napomenu)
 * - measure: kuhinjske mjere (kašika, šolja…) — NE pretvaraju se u grame
 * - text: "po ukusu", "po potrebi" — nikad se ne množe
 */
export type UnitFamily = 'mass' | 'volume' | 'count' | 'measure' | 'text'

export interface UnitDef {
  code: string
  family: UnitFamily
  /** [jednina, 2–4 i decimalni, 5+] */
  forms: [string, string, string]
  /** faktor do osnovne jedinice porodice (g ili ml) */
  toBase?: number
  /** prikaz razlomcima (½, ¼…) */
  fractions?: boolean
}

const defs: UnitDef[] = [
  { code: 'g', family: 'mass', forms: ['g', 'g', 'g'], toBase: 1 },
  { code: 'kg', family: 'mass', forms: ['kg', 'kg', 'kg'], toBase: 1000 },
  { code: 'ml', family: 'volume', forms: ['ml', 'ml', 'ml'], toBase: 1 },
  { code: 'dl', family: 'volume', forms: ['dl', 'dl', 'dl'], toBase: 100 },
  { code: 'l', family: 'volume', forms: ['l', 'l', 'l'], toBase: 1000 },
  { code: 'kom', family: 'count', forms: ['kom', 'kom', 'kom'], fractions: true },
  { code: 'cesanj', family: 'count', forms: ['češanj', 'češnja', 'češnjeva'], fractions: true },
  { code: 'glavica', family: 'count', forms: ['glavica', 'glavice', 'glavica'], fractions: true },
  { code: 'list', family: 'count', forms: ['list', 'lista', 'listova'] },
  { code: 'kriska', family: 'count', forms: ['kriška', 'kriške', 'kriški'] },
  { code: 'struk', family: 'count', forms: ['struk', 'struka', 'struka'] },
  { code: 'vezica', family: 'count', forms: ['vezica', 'vezice', 'vezica'], fractions: true },
  { code: 'kesica', family: 'count', forms: ['kesica', 'kesice', 'kesica'], fractions: true },
  { code: 'paket', family: 'count', forms: ['paket', 'paketa', 'paketa'], fractions: true },
  { code: 'konzerva', family: 'count', forms: ['konzerva', 'konzerve', 'konzervi'], fractions: true },
  { code: 'tegla', family: 'count', forms: ['tegla', 'tegle', 'tegli'], fractions: true },
  { code: 'kasika', family: 'measure', forms: ['kašika', 'kašike', 'kašika'], fractions: true },
  { code: 'kasicica', family: 'measure', forms: ['kašičica', 'kašičice', 'kašičica'], fractions: true },
  { code: 'solja', family: 'measure', forms: ['šolja', 'šolje', 'šolja'], fractions: true },
  { code: 'casa', family: 'measure', forms: ['čaša', 'čaše', 'čaša'], fractions: true },
  { code: 'prstohvat', family: 'measure', forms: ['prstohvat', 'prstohvata', 'prstohvata'] },
  { code: 'po-ukusu', family: 'text', forms: ['po ukusu', 'po ukusu', 'po ukusu'] },
  { code: 'po-potrebi', family: 'text', forms: ['po potrebi', 'po potrebi', 'po potrebi'] },
]

export const UNITS: Record<string, UnitDef> = Object.fromEntries(defs.map((d) => [d.code, d]))

/** Prazan kôd = bez jedinice (npr. "3 jaja" gdje naziv nosi jedinicu). */
export const NO_UNIT = ''

export function getUnit(code: string | null | undefined): UnitDef | undefined {
  if (!code) return undefined
  return UNITS[code]
}

export const unitOptions = [
  { label: '— bez jedinice —', value: 'bez' },
  ...defs.map((d) => ({ label: d.forms[0], value: d.code })),
]

/** Odabir gramatičkog oblika za količinu (bosanski: 1 / 2–4 / 5+; decimalno → drugi oblik). */
export function unitForm(def: UnitDef, amount: number | null | undefined): string {
  if (amount == null) return def.forms[0]
  if (!Number.isInteger(amount)) return def.forms[1]
  const mod10 = amount % 10
  const mod100 = amount % 100
  if (mod10 === 1 && mod100 !== 11) return def.forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return def.forms[1]
  return def.forms[2]
}
