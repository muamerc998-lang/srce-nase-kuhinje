import { describe, expect, it } from 'vitest'
import { normalizeText, slugify, stem } from '@/lib/text/normalize'
import { expandQuery, relevanceScore } from '@/lib/search/query'
import { parseSearchState, serializeSearchState, hasActiveFilters } from '@/lib/search/params'

describe('normalizacija teksta', () => {
  it('ignoriše velika/mala slova i dijakritiku', () => {
    expect(normalizeText('Čokoladna TORTA')).toBe('cokoladna torta')
    expect(normalizeText('Đuveč')).toBe(normalizeText('djuvec'))
    expect(normalizeText('Šopska salata!')).toBe('sopska salata')
  })
  it('pravi čitljive slugove', () => {
    expect(slugify('Pileća prsa u sosu od pavlake')).toBe('pileca-prsa-u-sosu-od-pavlake')
    expect(slugify('Đuveč')).toBe('djuvec')
  })
  it('blago skraćuje padežne nastavke', () => {
    expect(stem('krompira')).toBe('krompir')
    expect(stem('pite')).toBe('pit')
    expect(stem('so')).toBe('so')
  })
})

describe('pretraga', () => {
  const synonyms = [
    ['krompir', 'krumpir'],
    ['bijeli luk', 'cesnjak'],
    ['palacinke', 'pacinke', 'palacinci'],
  ]
  it('proširuje upit sinonimima', () => {
    const e = expandQuery('krumpir', synonyms)
    expect(e).toHaveLength(1)
    expect(e[0]).toContain('krompir')
  })
  it('podržava upit bez dijakritike', () => {
    expect(expandQuery('cesnjak', synonyms)[0]).toContain('bijeli luk')
    expect(expandQuery('češnjak', synonyms)[0]).toContain('bijeli luk')
  })
  it('tačan naslov ima najviši prioritet', () => {
    const q = 'palacinke'
    const e = expandQuery(q, synonyms)
    const exact = relevanceScore('palacinke | pacinke', q, e)
    const partial = relevanceScore('palacinke s nutelom', q, e)
    const ingredientOnly = relevanceScore('vanilice', q, e)
    expect(exact).toBeGreaterThan(partial)
    expect(partial).toBeGreaterThan(ingredientOnly)
  })
})

describe('stanje filtera u URL-u', () => {
  it('parsira i serijalizuje stabilno (povratak vraća iste filtere)', () => {
    const s = parseSearchState({ q: 'pita', kategorija: 'slatki-recepti', vrijeme: '30', stranica: '2', sastojci: 'jaja,mlijeko', nacin: 'bilo' })
    expect(s.kategorija).toEqual(['slatki-recepti'])
    expect(s.vrijeme).toBe(30)
    expect(s.stranica).toBe(2)
    expect(s.sort).toBe('relevantnost')
    const qs = serializeSearchState(s)
    expect(parseSearchState(Object.fromEntries(new URLSearchParams(qs.slice(1))))).toEqual(s)
  })
  it('odbacuje nevažeće vrijednosti', () => {
    const s = parseSearchState({ vrijeme: '999', metoda: 'nesto,pecenje', stranica: '-3', kategorija: '<script>' })
    expect(s.vrijeme).toBeNull()
    expect(s.metoda).toEqual(['pecenje'])
    expect(s.stranica).toBe(1)
    expect(s.kategorija).toEqual([])
  })
  it('bez upita nema sortiranja po relevantnosti', () => {
    expect(parseSearchState({ sort: 'relevantnost' }).sort).toBe('najnovije')
  })
  it('prepoznaje aktivne filtere (noindex)', () => {
    expect(hasActiveFilters(parseSearchState({}))).toBe(false)
    expect(hasActiveFilters(parseSearchState({ stranica: '3' }))).toBe(false)
    expect(hasActiveFilters(parseSearchState({ ishrana: 'posno' }))).toBe(true)
  })
})

describe('oznake i sastav iz plana', () => {
  it('oznaka se čita, serijalizuje i računa kao filter', () => {
    const s = parseSearchState({ oznaka: 'prhko-tijesto,jabuke' })
    expect(s.oznaka).toEqual(['prhko-tijesto', 'jabuke'])
    expect(serializeSearchState(s)).toBe('?oznaka=prhko-tijesto,jabuke')
    expect(hasActiveFilters(s)).toBe(true)
  })
  it('stara vrijednost bez-laktoze se odbacuje, bez-mlijeka vrijedi', () => {
    expect(parseSearchState({ ishrana: 'bez-laktoze,bez-mlijeka' }).ishrana).toEqual(['bez-mlijeka'])
  })
  it('slug oznake je naziv bez kvačica', () => {
    expect(slugify('Džem i pekmez')).toBe('dzem-i-pekmez')
    expect(slugify('Čokoladni namaz')).toBe('cokoladni-namaz')
  })
})
