import { describe, expect, it } from 'vitest'
import {
  exportCookbook,
  importCookbook,
  validateCookbook,
  validateShopping,
  timerRemaining,
  startTimer,
  pauseTimer,
  resumeTimer,
  DEFAULT_LISTS,
} from '@/lib/storage/stores'
import { createStore } from '@/lib/storage/store'
import { isoDuration, cardTimeLabel, effectiveTotal } from '@/lib/recipes/time'

const item = (uid: string, title = 'Recept') => ({ uid, slug: 's', title, image: null, savedAt: '2026-10-15T10:00:00Z', lists: [] as string[] })

describe('kuharica: izvoz i uvoz', () => {
  it('izvezeno se može ponovo uvesti', () => {
    const cb = { items: [item('a'), item('b')], lists: DEFAULT_LISTS }
    const r = importCookbook(exportCookbook(cb), { items: [], lists: DEFAULT_LISTS })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.added).toBe(2)
      expect(r.cookbook.items.map((i) => i.uid)).toEqual(['a', 'b'])
    }
  })
  it('uvoz spaja bez dupliranja i bez brisanja', () => {
    const exported = exportCookbook({ items: [{ ...item('a'), lists: ['omiljeno'] }, item('c')], lists: DEFAULT_LISTS })
    const r = importCookbook(exported, { items: [item('a'), item('b')], lists: DEFAULT_LISTS })
    expect(r.ok && r.cookbook.items.map((i) => i.uid)).toEqual(['a', 'b', 'c'])
    expect(r.ok && r.cookbook.items[0].lists).toEqual(['omiljeno'])
  })
  it('oštećen ili nepodržan unos vraća razumljivu grešku (bez rušenja)', () => {
    expect(importCookbook('{nije json', { items: [], lists: [] })).toEqual({ ok: false, error: 'Datoteka nije ispravan JSON.' })
    expect(importCookbook('{"format":"drugo"}', { items: [], lists: [] }).ok).toBe(false)
    expect(importCookbook(JSON.stringify({ format: 'srce-nase-kuhinje/kuharica', version: 2, data: {} }), { items: [], lists: [] }).ok).toBe(false)
    expect(importCookbook(JSON.stringify({ format: 'srce-nase-kuhinje/kuharica', version: 1, data: { items: [{ uid: 1 }], lists: [] } }), { items: [], lists: [] }).ok).toBe(false)
  })
  it('validator uklanja duplikate i odbija pogrešne tipove', () => {
    expect(validateCookbook({ items: [item('a'), item('a')], lists: [] })?.items).toHaveLength(1)
    expect(validateCookbook({ items: 'x', lists: [] })).toBeNull()
    expect(validateShopping({ sources: [], manual: [], checked: [], planSig: null })).not.toBeNull()
    expect(validateShopping({ sources: [{ id: 1 }], manual: [], checked: [], planSig: null })).toBeNull()
  })
})

describe('lokalno spremište bez localStorage-a', () => {
  it('radi u memoriji i ne ruši se', () => {
    const s = createStore('test', 1, { n: 0 }, (v) => (v && typeof v === 'object' ? (v as { n: number }) : null))
    s.set((p) => ({ n: p.n + 1 }))
    expect(s.get().n).toBe(1)
    expect(s.persistent()).toBe(false)
  })
})

describe('tajmer računa prema završnom trenutku', () => {
  const base = { recipeUid: 'r', recipeTitle: 'R', recipeSlug: 'r', stepId: 's', stepNumber: 1, label: 'Pečenje', durationMs: 10 * 60_000 }
  it('tačno stanje nakon "povratka iz pozadine" (bez brojanja intervala)', () => {
    const t = startTimer(base, 1_000_000)
    expect(timerRemaining(t, 1_000_000 + 7 * 60_000)).toBe(3 * 60_000)
    expect(timerRemaining(t, 1_000_000 + 60 * 60_000)).toBe(0)
  })
  it('pauza i nastavak', () => {
    let t = startTimer(base, 0)
    t = pauseTimer(t, 4 * 60_000)
    expect(timerRemaining(t, 99 * 60_000)).toBe(6 * 60_000)
    t = resumeTimer(t, 100 * 60_000)
    expect(timerRemaining(t, 101 * 60_000)).toBe(5 * 60_000)
  })
})

describe('vremena recepta', () => {
  it('ukupno vrijeme poštuje uredničku vrijednost (paralelne radnje)', () => {
    expect(effectiveTotal({ prepMinutes: 30, cookMinutes: 60, restMinutes: 15, totalMinutes: 100 })).toBe(100)
    expect(effectiveTotal({ prepMinutes: 30, cookMinutes: 60 })).toBe(90)
  })
  it('kartica kod dugog čekanja razdvaja rad i čekanje', () => {
    expect(cardTimeLabel({ prepMinutes: 20, restMinutes: 240, restLabel: 'hlađenja' })).toBe('20 min pripreme + 4 h hlađenja')
    expect(cardTimeLabel({ prepMinutes: 10, cookMinutes: 15, totalMinutes: 25 })).toBe('25 min')
  })
  it('ISO 8601 trajanja za schemu', () => {
    expect(isoDuration(90)).toBe('PT1H30M')
    expect(isoDuration(45)).toBe('PT45M')
    expect(isoDuration(120)).toBe('PT2H')
    expect(isoDuration(0)).toBeUndefined()
  })
})
