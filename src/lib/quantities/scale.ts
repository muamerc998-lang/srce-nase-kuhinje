import { getUnit, unitForm, type UnitFamily } from './units'

export interface Quantity {
  /** null = nema brojčane količine (npr. "po ukusu") */
  amount: number | null
  /** gornja granica raspona, npr. 2–3 */
  amountMax?: number | null
  /** kôd jedinice; '' / 'bez' / null = bez jedinice */
  unit?: string | null
}

export interface ScaledQuantity extends Quantity {
  /** količina je pomnožena faktorom */
  scaled: boolean
  /** količina se ne množi (tekstualna ili bez broja) */
  fixed: boolean
  /** zaokružena brojiva količina: izvorna izračunata vrijednost */
  roundedFrom?: { amount: number; amountMax?: number | null }
}

export function unitFamily(unit: string | null | undefined): UnitFamily {
  if (!unit || unit === 'bez') return 'count'
  return getUnit(unit)?.family ?? 'measure'
}

function roundMetric(value: number, unit: string): number {
  if (unit === 'kg' || unit === 'l') return Math.round(value * 100) / 100
  if (unit === 'dl') return Math.round(value * 10) / 10
  // g, ml
  if (value < 10) return Math.round(value * 2) / 2
  if (value < 100) return Math.round(value)
  return Math.round(value / 5) * 5
}

/** Kuhinjske mjere zaokružujemo na četvrtine (¼ kašike je smislena najmanja mjera). */
function roundMeasure(value: number): number {
  const r = Math.round(value * 4) / 4
  return r === 0 ? 0.25 : r
}

/**
 * Brojive stvari (jaja, češnjevi, glavice…) ne mogu biti 1,37.
 * Zaokružujemo na cijeli broj (najmanje 1) i pamtimo izračunatu vrijednost
 * kako bi interfejs mogao objasniti zaokruživanje.
 */
function roundCount(value: number): number {
  return Math.max(1, Math.round(value))
}

export function scaleQuantity(q: Quantity, factor: number): ScaledQuantity {
  const unit = q.unit && q.unit !== 'bez' ? q.unit : ''
  const family = unitFamily(unit)
  if (q.amount == null || family === 'text' || !Number.isFinite(factor) || factor <= 0) {
    return { ...q, unit, scaled: false, fixed: true }
  }
  if (factor === 1) {
    return { ...q, unit, scaled: false, fixed: false }
  }

  const rawMin = q.amount * factor
  const rawMax = q.amountMax != null ? q.amountMax * factor : null

  let min: number
  let max: number | null
  let roundedFrom: ScaledQuantity['roundedFrom']

  if (family === 'mass' || family === 'volume') {
    min = roundMetric(rawMin, unit)
    max = rawMax != null ? roundMetric(rawMax, unit) : null
  } else if (family === 'count') {
    // jaja i slično: polovine nemaju smisla bez napomene → cijeli broj
    min = roundCount(rawMin)
    max = rawMax != null ? roundCount(rawMax) : null
    const exactMin = Math.round(rawMin * 100) / 100
    const exactMax = rawMax != null ? Math.round(rawMax * 100) / 100 : null
    if (exactMin !== min || (exactMax != null && exactMax !== max)) {
      roundedFrom = { amount: exactMin, amountMax: exactMax }
    }
  } else {
    min = roundMeasure(rawMin)
    max = rawMax != null ? roundMeasure(rawMax) : null
  }

  if (max != null && max <= min) max = null

  return { amount: min, amountMax: max, unit, scaled: true, fixed: false, roundedFrom }
}

const FRACTIONS: Array<[number, string]> = [
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
]

/** Broj u bosanskom zapisu: decimalni zarez; razlomci za kuhinjske mjere. */
export function formatNumber(value: number, useFractions = false): string {
  if (useFractions) {
    const whole = Math.floor(value + 1e-9)
    const frac = value - whole
    if (frac < 0.04) return String(whole)
    for (const [f, glyph] of FRACTIONS) {
      if (Math.abs(frac - f) < 0.04) return whole > 0 ? `${whole}${glyph}` : glyph
    }
  }
  const rounded = Math.round(value * 100) / 100
  return String(rounded).replace('.', ',')
}

export function formatAmount(q: Quantity): string {
  if (q.amount == null) return ''
  const def = getUnit(q.unit)
  const useFractions = !!def?.fractions || !q.unit || q.unit === 'bez'
  const min = formatNumber(q.amount, useFractions)
  if (q.amountMax != null && q.amountMax > q.amount) {
    return `${min}–${formatNumber(q.amountMax, useFractions)}`
  }
  return min
}

export function formatUnit(q: Quantity): string {
  const def = getUnit(q.unit)
  if (!def) return ''
  return unitForm(def, q.amountMax ?? q.amount)
}

/** "2–3 kašike", "250 g", "po ukusu", "3" (bez jedinice). */
export function formatQuantity(q: Quantity): string {
  const def = getUnit(q.unit)
  if (def?.family === 'text') return def.forms[0]
  const amount = formatAmount(q)
  const unit = formatUnit(q)
  return [amount, unit].filter(Boolean).join(' ')
}

export function scaleFactor(baseServings: number | null | undefined, target: number): number {
  if (!baseServings || baseServings <= 0 || !Number.isFinite(target) || target <= 0) return 1
  return target / baseServings
}
