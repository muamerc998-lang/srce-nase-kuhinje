import { describe, expect, it } from 'vitest'
import { buildMatchProfile, matchRecipe, rankPantryResults, expandWithBroader } from '@/lib/pantry/match'

// Registar: glatko-brasno → brasno (širi pojam)
const parentOf = new Map<string, string | null>([
  ['glatko-brasno', 'brasno'],
  ['brasno', null],
])

const palacinke = buildMatchProfile([
  { ingredientId: 'brasno' },
  { ingredientId: 'jaja' },
  { ingredientId: 'mlijeko' },
  { ingredientId: 'so' },
  { ingredientId: 'pekmez', optional: true },
])
const pire = buildMatchProfile([
  { ingredientId: 'krompir' },
  { ingredientId: 'mlijeko' },
  { ingredientId: 'maslac', altGroup: 'mast' },
  { ingredientId: 'margarin', altGroup: 'mast' },
])

const q = (have: string[], extra: Partial<Parameters<typeof matchRecipe>[2]> = {}) => ({
  have,
  exclude: [],
  basics: ['so', 'voda', 'ulje'],
  useBasics: false,
  ...extra,
})

describe('šta imam u kuhinji', () => {
  it('pravi profil: alternative su jedan zahtjev, opcionalno se ne broji', () => {
    expect(pire.required).toContainEqual(['maslac', 'margarin'])
    expect(pire.required).toHaveLength(3)
    expect(palacinke.optional).toEqual(['pekmez'])
  })

  it('razlikuje sve sastojke / jedan / dva nedostatka', () => {
    const all = matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko', 'so']), parentOf)
    expect(all?.missing).toEqual([])
    const one = matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko']), parentOf)
    expect(one?.missing).toEqual([['so']])
    const two = matchRecipe('p', palacinke, q(['brasno', 'jaja']), parentOf)
    expect(two?.missing).toHaveLength(2)
    const three = matchRecipe('p', palacinke, q(['brasno']), parentOf)
    expect(three).toBeNull()
  })

  it('osnovne namirnice se računaju samo uz izričitu opciju', () => {
    expect(matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko']), parentOf)?.missing).toEqual([['so']])
    expect(matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko'], { useBasics: true }), parentOf)?.missing).toEqual([])
  })

  it('opcionalna dekoracija nije nedostatak', () => {
    expect(matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko', 'so']), parentOf)?.missing).toEqual([])
  })

  it('alternativna grupa je pokrivena jednom dozvoljenom alternativom', () => {
    expect(matchRecipe('x', pire, q(['krompir', 'mlijeko', 'margarin']), parentOf)?.missing).toEqual([])
  })

  it('uža namirnica pokriva širu (glatko brašno → brašno), obrnuto ne', () => {
    expect(matchRecipe('p', palacinke, q(['glatko-brasno', 'jaja', 'mlijeko', 'so']), parentOf)?.missing).toEqual([])
    const narrow = buildMatchProfile([{ ingredientId: 'glatko-brasno' }])
    expect(matchRecipe('n', narrow, q(['brasno']), parentOf)).toBeNull()
    expect(expandWithBroader(['glatko-brasno'], parentOf)).toEqual(new Set(['glatko-brasno', 'brasno']))
  })

  it('isključeni sastojak isključuje recept, osim ako postoji dozvoljena alternativa', () => {
    expect(matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko', 'so'], { exclude: ['jaja'] }), parentOf)).toBeNull()
    const r = matchRecipe('x', pire, q(['krompir', 'mlijeko', 'margarin'], { exclude: ['maslac'] }), parentOf)
    expect(r?.missing).toEqual([])
    // isključena opcionalna namirnica: recept ostaje, uz napomenu
    const p = matchRecipe('p', palacinke, q(['brasno', 'jaja', 'mlijeko', 'so'], { exclude: ['pekmez'] }), parentOf)
    expect(p?.omitOptional).toEqual(['pekmez'])
  })

  it('rangira: manje nedostataka prvo, zatim više iskorištenih namirnica, pa kraće vrijeme', () => {
    const a = { recipe: { totalMinutes: 60 }, missing: [['x']], usedFromSelection: 3, omitOptional: [] }
    const b = { recipe: { totalMinutes: 90 }, missing: [], usedFromSelection: 1, omitOptional: [] }
    const c = { recipe: { totalMinutes: 20 }, missing: [], usedFromSelection: 1, omitOptional: [] }
    expect(rankPantryResults([a, b, c]).map((r) => r.recipe.totalMinutes)).toEqual([20, 90, 60])
  })
})
