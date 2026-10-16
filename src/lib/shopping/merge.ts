import { getUnit } from '../quantities/units'
import { scaleQuantity, unitFamily, formatQuantity, type Quantity } from '../quantities/scale'
import type { IngredientLine } from '../recipes/types'

/** Recept (ili stavka plana) iz kojeg se izvode stavke liste. */
export interface ShoppingSource {
  id: string
  recipeId: string
  title: string
  slug: string
  servings: number
  baseServings: number | null
  /** 'plan' = dolazi iz plana; 'recipe' = dodano direktno s recepta */
  origin: 'plan' | 'recipe'
  lines: IngredientLine[]
}

export interface MergedItem {
  /** stabilan ključ: namirnica + porodica jedinice + napomena */
  key: string
  ingredientId: string
  name: string
  note?: string
  /** zbrojena količina; null ako je samo tekstualna ("po ukusu") */
  quantity: Quantity | null
  /** dodatni tekstualni zahtjevi koji se ne zbrajaju */
  textParts: string[]
  sources: Array<{ sourceId: string; title: string; slug: string }>
}

function normalizeNote(note?: string): string {
  return (note ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Ključ grupisanja. Masa i zapremina se svode na osnovnu jedinicu (g / ml)
 * i mogu se zbrajati; ostale jedinice se zbrajaju samo s istom jedinicom.
 * Kašike se nikad ne pretvaraju u grame.
 */
function groupKey(line: IngredientLine): { key: string; family: string } {
  const unit = line.unit && line.unit !== 'bez' ? line.unit : ''
  const family = unitFamily(unit)
  const unitKey = family === 'mass' || family === 'volume' ? family : `u:${unit || 'bez'}`
  return { key: `${line.ingredientId}|${unitKey}|${normalizeNote(line.note)}`, family }
}

function toBase(amount: number, unit: string): number {
  return amount * (getUnit(unit)?.toBase ?? 1)
}

function fromBase(amountBase: number, family: string): Quantity {
  if (family === 'mass') {
    return amountBase >= 1000
      ? { amount: Math.round((amountBase / 1000) * 100) / 100, unit: 'kg' }
      : { amount: Math.round(amountBase), unit: 'g' }
  }
  return amountBase >= 1000
    ? { amount: Math.round((amountBase / 1000) * 100) / 100, unit: 'l' }
    : { amount: Math.round(amountBase), unit: 'ml' }
}

export interface MergeOptions {
  /** ID-jevi linija koje treba preskočiti (npr. već označene na receptu), po izvoru */
  skipLineIds?: Record<string, string[]>
}

export function mergeShoppingSources(sources: ShoppingSource[], opts: MergeOptions = {}): MergedItem[] {
  type Acc = {
    item: MergedItem
    family: string
    unit: string
    min: number
    max: number
    hasRange: boolean
    hasAmount: boolean
  }
  const acc = new Map<string, Acc>()

  for (const src of sources) {
    const factor =
      src.baseServings && src.baseServings > 0 && src.servings > 0 ? src.servings / src.baseServings : 1
    const skip = new Set(opts.skipLineIds?.[src.id] ?? [])
    for (const line of src.lines) {
      if (skip.has(line.id)) continue
      const { key, family } = groupKey(line)
      const scaled = scaleQuantity(line, factor)
      let entry = acc.get(key)
      if (!entry) {
        entry = {
          item: {
            key,
            ingredientId: line.ingredientId,
            name: line.name,
            note: line.note?.trim() || undefined,
            quantity: null,
            textParts: [],
            sources: [],
          },
          family,
          unit: scaled.unit ?? '',
          min: 0,
          max: 0,
          hasRange: false,
          hasAmount: false,
        }
        acc.set(key, entry)
      }
      if (!entry.item.sources.some((s) => s.sourceId === src.id)) {
        entry.item.sources.push({ sourceId: src.id, title: src.title, slug: src.slug })
      }
      if (scaled.amount == null || scaled.fixed) {
        const text = formatQuantity(scaled) || 'po potrebi'
        if (!entry.item.textParts.includes(text)) entry.item.textParts.push(text)
        continue
      }
      const unit = scaled.unit ?? ''
      const min = family === 'mass' || family === 'volume' ? toBase(scaled.amount, unit) : scaled.amount
      const maxRaw = scaled.amountMax ?? scaled.amount
      const max = family === 'mass' || family === 'volume' ? toBase(maxRaw, unit) : maxRaw
      entry.min += min
      entry.max += max
      entry.hasAmount = true
      if (scaled.amountMax != null) entry.hasRange = true
    }
  }

  const out: MergedItem[] = []
  for (const e of acc.values()) {
    if (e.hasAmount) {
      if (e.family === 'mass' || e.family === 'volume') {
        const q = fromBase(e.min, e.family)
        if (e.hasRange && e.max > e.min) {
          // raspon izražen u istoj jedinici kao donja granica
          const factor = getUnit(q.unit)?.toBase ?? 1
          q.amountMax = Math.round((e.max / factor) * 100) / 100
        }
        e.item.quantity = q
      } else {
        const round = (n: number) => Math.round(n * 100) / 100
        e.item.quantity = {
          amount: round(e.min),
          amountMax: e.hasRange && e.max > e.min ? round(e.max) : null,
          unit: e.unit,
        }
      }
    }
    out.push(e.item)
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'bs'))
}

export function formatMergedItem(item: MergedItem): string {
  const parts: string[] = []
  if (item.quantity) parts.push(formatQuantity(item.quantity))
  const head = [parts.join(''), item.name].filter(Boolean).join(' ')
  const extras = [item.note, ...item.textParts.filter((t) => !item.quantity || t !== 'po potrebi')]
    .filter(Boolean)
    .join(', ')
  return extras ? `${head} (${extras})` : head
}
