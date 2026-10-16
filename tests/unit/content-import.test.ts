import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { importFileSchema } from '@/lib/content/schema'
import { recipeJsonLd, ingredientText } from '@/lib/seo/jsonld'
import { checkFormToken, formToken, rateLimit, resetRateLimits, sanitizeText, tooManyLinks } from '@/lib/forms/protect'

describe('format uvoza', () => {
  it('demo podaci i primjer prolaze validaciju', () => {
    for (const f of ['content/demo/ingredients.json', 'content/demo/recipes.json', 'content/examples/primjer-uvoza.json']) {
      const r = importFileSchema.safeParse(JSON.parse(fs.readFileSync(f, 'utf8')))
      expect(r.success, `${f}: ${r.success ? '' : JSON.stringify(r.error.issues.slice(0, 3))}`).toBe(true)
    }
  })
  it('odbija neispravne podatke s jasnom putanjom greške', () => {
    const r = importFileSchema.safeParse({
      format: 'srce-nase-kuhinje/v1',
      recipes: [
        {
          slug: 'Loš Slug',
          title: 'x',
          summary: 's',
          primaryCategory: 'a',
          authors: ['a'],
          difficulty: 'lako',
          ingredientGroups: [{ items: [{ ingredient: 'so', unit: 'po-ukusu', amount: 3 }] }],
          stepGroups: [{ steps: [{ text: 'korak' }] }],
        },
      ],
    })
    expect(r.success).toBe(false)
    const paths = r.success ? [] : r.error.issues.map((i) => i.path.join('.'))
    expect(paths).toContain('recipes.0.slug')
    expect(paths.some((p) => p.includes('amount'))).toBe(true)
  })
})

describe('Recipe schema', () => {
  const groups = [
    {
      id: 'g',
      items: [
        { id: '1', ingredientId: '1', name: 'brašno', label: 'brašna', amount: 250, unit: 'g', optional: false },
        { id: '2', ingredientId: '2', name: 'so', label: 'so', amount: null, unit: 'po-ukusu', optional: false },
      ],
    },
  ]
  const base = {
    url: 'https://primjer.test/recepti/x/',
    title: 'X',
    summary: 'Opis',
    images: [],
    authors: [],
    organizationName: 'Org',
    times: { prepMinutes: 10, cookMinutes: 20, totalMinutes: 25 },
    yieldText: '4 porcije',
    ingredientGroups: groups,
    stepGroups: [{ id: 's', steps: [{ id: '1', text: 'Umijesiti.' }] }],
    keywords: [],
  }
  it('sastojci i vremena odgovaraju vidljivom receptu', () => {
    const d = recipeJsonLd({ ...base, rating: null })
    expect(d.recipeIngredient).toEqual(['250 g brašna', 'so po ukusu'])
    expect(d.totalTime).toBe('PT25M')
    expect(d.recipeInstructions).toEqual([{ '@type': 'HowToStep', text: 'Umijesiti.' }])
    expect(ingredientText(groups[0].items[0])).toBe('250 g brašna')
  })
  it('nema AggregateRating ni nutrition bez stvarnih podataka', () => {
    const d = recipeJsonLd({ ...base, rating: null })
    expect(d.aggregateRating).toBeUndefined()
    expect(d.nutrition).toBeUndefined()
    const withRating = recipeJsonLd({ ...base, rating: { average: 4.5, count: 2 } })
    expect(withRating.aggregateRating).toMatchObject({ ratingValue: 4.5, ratingCount: 2 })
  })
  it('naslovljene grupe koraka postaju HowToSection', () => {
    const d = recipeJsonLd({ ...base, stepGroups: [{ id: 's', title: 'Krema', steps: [{ id: '1', text: 'Mutiti.' }] }], rating: null })
    expect(d.recipeInstructions).toEqual([{ '@type': 'HowToSection', name: 'Krema', itemListElement: [{ '@type': 'HowToStep', text: 'Mutiti.' }] }])
  })
})

describe('zaštita formi', () => {
  it('vremenski žeton: prebrzo, ispravno, krivotvoreno', () => {
    const t = formToken(1_000_000)
    expect(checkFormToken(t, 1_000_500)).toBe(false) // prebrzo
    expect(checkFormToken(t, 1_010_000)).toBe(true)
    expect(checkFormToken(t.replace(/.$/, 'x'), 1_010_000)).toBe(false)
    expect(checkFormToken('123.abc', 1_010_000)).toBe(false)
  })
  it('ograničava učestalost po ključu', () => {
    resetRateLimits()
    expect([1, 2, 3].map(() => rateLimit('k', 2, 1000, 0))).toEqual([true, true, false])
    expect(rateLimit('k', 2, 1000, 2000)).toBe(true)
  })
  it('sanitizuje tekst i prepoznaje spam linkove', () => {
    expect(sanitizeText('  zdravo\u0000  svijete \n\n\n\nkraj ', 100)).toBe('zdravo svijete\n\nkraj')
    expect(sanitizeText('x'.repeat(50), 10)).toHaveLength(10)
    expect(tooManyLinks('http://a.test i www.b.test')).toBe(true)
    expect(tooManyLinks('vidi https://a.test')).toBe(false)
  })
})
