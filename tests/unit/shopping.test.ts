import { describe, expect, it } from 'vitest'
import { mergeShoppingSources, formatMergedItem, type ShoppingSource } from '@/lib/shopping/merge'
import type { IngredientLine } from '@/lib/recipes/types'

const line = (p: Partial<IngredientLine> & { id: string; ingredientId: string; name: string }): IngredientLine => ({
  label: p.name,
  amount: null,
  unit: 'g',
  optional: false,
  ...p,
})

const src = (id: string, lines: IngredientLine[], servings = 4, base: number | null = 4, origin: 'plan' | 'recipe' = 'plan'): ShoppingSource => ({
  id,
  recipeId: id,
  title: `Recept ${id}`,
  slug: id,
  servings,
  baseServings: base,
  origin,
  lines,
})

describe('spajanje liste za kupovinu', () => {
  it('zbraja g i kg iste namirnice i prikazuje kg kad prijeđe 1000 g', () => {
    const items = mergeShoppingSources([
      src('a', [line({ id: '1', ingredientId: 'brasno', name: 'brašno', amount: 750, unit: 'g' })]),
      src('b', [line({ id: '1', ingredientId: 'brasno', name: 'brašno', amount: 0.5, unit: 'kg' })]),
    ])
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toEqual({ amount: 1.25, unit: 'kg' })
    expect(items[0].sources.map((s) => s.title)).toEqual(['Recept a', 'Recept b'])
  })

  it('zbraja ml i l', () => {
    const items = mergeShoppingSources([
      src('a', [line({ id: '1', ingredientId: 'mlijeko', name: 'mlijeko', amount: 300, unit: 'ml' })]),
      src('b', [line({ id: '1', ingredientId: 'mlijeko', name: 'mlijeko', amount: 0.5, unit: 'l' })]),
    ])
    expect(items[0].quantity).toEqual({ amount: 800, unit: 'ml' })
  })

  it('ne zbraja nespojive jedinice (kašike i grami ostaju odvojeni)', () => {
    const items = mergeShoppingSources([
      src('a', [line({ id: '1', ingredientId: 'secer', name: 'šećer', amount: 100, unit: 'g' })]),
      src('b', [line({ id: '1', ingredientId: 'secer', name: 'šećer', amount: 2, unit: 'kasika' })]),
    ])
    expect(items).toHaveLength(2)
    expect(items.map(formatMergedItem).sort()).toEqual(['100 g šećer', '2 kašike šećer'])
  })

  it('razdvaja različite pripremne napomene', () => {
    const items = mergeShoppingSources([
      src('a', [line({ id: '1', ingredientId: 'luk', name: 'crni luk', amount: 1, unit: 'glavica', note: 'sitno sjeckan' })]),
      src('b', [line({ id: '1', ingredientId: 'luk', name: 'crni luk', amount: 2, unit: 'glavica' })]),
    ])
    expect(items).toHaveLength(2)
  })

  it('ne spaja različite namirnice (mlijeko ≠ kondenzovano mlijeko)', () => {
    const items = mergeShoppingSources([
      src('a', [
        line({ id: '1', ingredientId: 'mlijeko', name: 'mlijeko', amount: 200, unit: 'ml' }),
        line({ id: '2', ingredientId: 'kondenzovano', name: 'kondenzovano mlijeko', amount: 200, unit: 'ml' }),
      ]),
    ])
    expect(items).toHaveLength(2)
  })

  it('primjenjuje porcije izvora', () => {
    const items = mergeShoppingSources([src('a', [line({ id: '1', ingredientId: 'krompir', name: 'krompir', amount: 1, unit: 'kg' })], 8, 4)])
    expect(items[0].quantity).toEqual({ amount: 2, unit: 'kg' })
  })

  it('isti recept dva puta u planu (različite porcije) se zbraja', () => {
    const l = [line({ id: '1', ingredientId: 'jaja', name: 'jaja', amount: 2, unit: 'bez' })]
    const items = mergeShoppingSources([src('p1', l, 4, 4), { ...src('p2', l, 8, 4), recipeId: 'p1' }])
    expect(items[0].quantity?.amount).toBe(6)
  })

  it('tekstualne količine se ne zbrajaju', () => {
    const items = mergeShoppingSources([
      src('a', [line({ id: '1', ingredientId: 'so', name: 'so', amount: null, unit: 'po-ukusu' })]),
      src('b', [line({ id: '1', ingredientId: 'so', name: 'so', amount: null, unit: 'po-ukusu' })]),
    ])
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBeNull()
    expect(items[0].textParts).toEqual(['po ukusu'])
    expect(items[0].sources).toHaveLength(2)
  })

  it('preskače već označene sastojke izvora', () => {
    const items = mergeShoppingSources(
      [
        src('a', [
          line({ id: '1', ingredientId: 'brasno', name: 'brašno', amount: 200, unit: 'g' }),
          line({ id: '2', ingredientId: 'jaja', name: 'jaja', amount: 2, unit: 'bez' }),
        ]),
      ],
      { skipLineIds: { a: ['2'] } },
    )
    expect(items.map((i) => i.ingredientId)).toEqual(['brasno'])
  })

  it('zbraja raspone', () => {
    const items = mergeShoppingSources([
      src('a', [line({ id: '1', ingredientId: 'mlijeko', name: 'mlijeko', amount: 150, amountMax: 200, unit: 'ml' })]),
      src('b', [line({ id: '1', ingredientId: 'mlijeko', name: 'mlijeko', amount: 100, unit: 'ml' })]),
    ])
    expect(items[0].quantity).toEqual({ amount: 250, amountMax: 300, unit: 'ml' })
  })
})
