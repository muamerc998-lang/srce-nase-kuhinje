import { getUnit } from '@/lib/quantities/units'
import { NUTRITION, MEASURE_ML, NUTRITION_EXCLUDED, type NutritionPer100 } from './data'

export interface NutritionLine {
  ingredientSlug?: string
  label?: string
  note?: string
  amount: number | null
  amountMax?: number | null
  unit: string
  optional: boolean
  altGroup?: string
}

export interface NutritionEstimate {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

/** Masa reda u gramima, ili null ako se ne može pouzdano izračunati. */
export function lineGrams(line: NutritionLine, data: NutritionPer100): number | null {
  if (line.amount == null) return null
  const amount = line.amountMax ? (line.amount + line.amountMax) / 2 : line.amount
  const unit = !line.unit || line.unit === 'bez' ? 'bez' : line.unit
  const def = getUnit(unit)
  let grams: number | null = null
  if (def?.family === 'mass') grams = amount * (def.toBase ?? 1)
  else if (def?.family === 'volume') grams = data.density ? amount * (def.toBase ?? 1) * data.density : null
  else if (def?.family === 'measure') grams = data.density && MEASURE_ML[unit] ? amount * MEASURE_ML[unit] * data.density : null
  else grams = data.pieces?.[unit] != null ? amount * data.pieces[unit] : null
  if (grams == null) return null
  // količina s kostima: računa se samo jestivi dio
  const withBones = /kost/i.test(`${line.label ?? ''} ${line.note ?? ''}`)
  return grams * (data.edible ?? (withBones ? 0.7 : 1))
}

/**
 * Procjena kalorija i makronutrijenata za jednu porciju.
 * Ne računa sastojke „po ukusu/po potrebi“, opcionalne sastojke ni alternative (uzima se prva).
 * Vraća null ako recept nije pogodan ili neka namirnica nema podatke — bolje ništa nego pogrešan broj.
 */
export function estimateNutrition(slug: string, lines: NutritionLine[], servings: number | null): NutritionEstimate | null {
  if (!servings || servings <= 0 || NUTRITION_EXCLUDED.has(slug)) return null
  const total: NutritionEstimate = { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  const seenAlt = new Set<string>()
  let counted = 0
  for (const line of lines) {
    if (line.optional) continue
    if (getUnit(line.unit)?.family === 'text') continue
    if (line.altGroup) {
      if (seenAlt.has(line.altGroup)) continue
      seenAlt.add(line.altGroup)
    }
    const data = line.ingredientSlug ? NUTRITION[line.ingredientSlug] : undefined
    if (!data) return null
    if (data.negligible) continue
    const grams = lineGrams(line, data)
    if (grams == null) return null
    total.kcal += (grams * data.kcal) / 100
    total.protein += (grams * data.protein) / 100
    total.carbs += (grams * data.carbs) / 100
    total.fat += (grams * data.fat) / 100
    counted++
  }
  if (!counted) return null
  return {
    kcal: Math.round(total.kcal / servings),
    protein: Math.round(total.protein / servings),
    carbs: Math.round(total.carbs / servings),
    fat: Math.round(total.fat / servings),
  }
}
