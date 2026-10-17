import { describe, it, expect } from 'vitest'
import { estimateNutrition, lineGrams, type NutritionLine } from '@/lib/nutrition/estimate'
import { NUTRITION } from '@/lib/nutrition/data'

const line = (p: Partial<NutritionLine>): NutritionLine => ({ amount: null, unit: 'g', optional: false, ...p })

describe('procjena nutritivnih vrijednosti', () => {
  it('pretvara mase, zapremine, kuhinjske mjere i komade u grame', () => {
    expect(lineGrams(line({ ingredientSlug: 'secer', amount: 1, unit: 'kg' }), NUTRITION.secer)).toBe(1000)
    expect(lineGrams(line({ ingredientSlug: 'ulje', amount: 100, unit: 'ml' }), NUTRITION.ulje)).toBeCloseTo(92)
    expect(lineGrams(line({ ingredientSlug: 'maslac', amount: 2, unit: 'kasika' }), NUTRITION.maslac)).toBeCloseTo(28.5)
    expect(lineGrams(line({ ingredientSlug: 'jaja', amount: 4, unit: 'bez' }), NUTRITION.jaja)).toBe(200)
    expect(lineGrams(line({ ingredientSlug: 'mrkva', amount: 2, amountMax: 4, unit: 'bez' }), NUTRITION.mrkva)).toBe(210)
  })

  it('kod mesa s kostima računa samo jestivi dio', () => {
    expect(lineGrams(line({ amount: 1, unit: 'kg', note: 's kosti i kožom' }), NUTRITION.piletina)).toBeCloseTo(700)
  })

  it('računa po porciji i preskače začine po ukusu, opcionalne sastojke i drugu alternativu', () => {
    const r = estimateNutrition(
      'test',
      [
        line({ ingredientSlug: 'secer', amount: 100 }),
        line({ ingredientSlug: 'so', amount: null, unit: 'po-ukusu' }),
        line({ ingredientSlug: 'maslac', amount: 50, optional: true }),
        line({ ingredientSlug: 'med', amount: 2, unit: 'kasika', altGroup: 'sladilo' }),
        line({ ingredientSlug: 'secer', amount: 1, unit: 'kasika', altGroup: 'sladilo' }),
      ],
      2,
    )
    // 100 g šećera (387) + 2 kašike meda (42,6 g × 3,04) = 516,5 kcal → 258 po porciji
    expect(r?.kcal).toBe(258)
    expect(r?.fat).toBe(0)
  })

  it('ne prikazuje ništa ako namirnica nema podatke ili se komad ne može pretvoriti', () => {
    expect(estimateNutrition('test', [line({ ingredientSlug: 'nepoznato', amount: 100 })], 2)).toBeNull()
    expect(estimateNutrition('test', [line({ ingredientSlug: 'feta', amount: 1, unit: 'paket' })], 2)).toBeNull()
  })

  it('ne prikazuje procjenu za isključene recepte i recepte bez broja porcija', () => {
    expect(estimateNutrition('pileca-supa', [line({ ingredientSlug: 'secer', amount: 100 })], 4)).toBeNull()
    expect(estimateNutrition('test', [line({ ingredientSlug: 'secer', amount: 100 })], null)).toBeNull()
  })
})
