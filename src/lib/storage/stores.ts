import { createStore, isObj, str, num, arrayOf, newId } from './store'
import type { IngredientLine } from '../recipes/types'
import type { ShoppingSource } from '../shopping/merge'

// ================= Moja kuharica =================
export interface SavedRecipe {
  uid: string
  slug: string
  title: string
  image: string | null
  savedAt: string
  lists: string[]
}
export interface CookbookList {
  id: string
  name: string
}
export interface Cookbook {
  items: SavedRecipe[]
  lists: CookbookList[]
}

export const DEFAULT_LISTS: CookbookList[] = [
  { id: 'zelim-probati', name: 'Želim probati' },
  { id: 'omiljeno', name: 'Omiljeno' },
]

const savedRecipe = (v: unknown): SavedRecipe | null => {
  if (!isObj(v)) return null
  const uid = str(v.uid, 64)
  const slug = str(v.slug, 120)
  const title = str(v.title, 200)
  const savedAt = str(v.savedAt, 40)
  const lists = arrayOf(v.lists ?? [], (x) => str(x, 64), 50)
  if (!uid || !slug || !title || !savedAt || !lists) return null
  const image = v.image == null ? null : str(v.image, 500)
  return { uid, slug, title, image, savedAt, lists }
}
const cookbookList = (v: unknown): CookbookList | null => {
  if (!isObj(v)) return null
  const id = str(v.id, 64)
  const name = str(v.name, 60)
  return id && name ? { id, name } : null
}
export const validateCookbook = (v: unknown): Cookbook | null => {
  if (!isObj(v)) return null
  const items = arrayOf(v.items, savedRecipe, 2000)
  const lists = arrayOf(v.lists, cookbookList, 50)
  if (!items || !lists) return null
  // jedinstveni uid
  const seen = new Set<string>()
  return { items: items.filter((i) => (seen.has(i.uid) ? false : (seen.add(i.uid), true))), lists }
}

export const cookbookStore = createStore<Cookbook>('kuharica', 1, { items: [], lists: DEFAULT_LISTS }, validateCookbook)

export const COOKBOOK_EXPORT_FORMAT = 'srce-nase-kuhinje/kuharica'

export function exportCookbook(c: Cookbook) {
  return JSON.stringify({ format: COOKBOOK_EXPORT_FORMAT, version: 1, exportedAt: new Date().toISOString(), data: c }, null, 2)
}

export type ImportResult = { ok: true; cookbook: Cookbook; added: number } | { ok: false; error: string }

/** Uvoz spaja sačuvane recepte s postojećim (ništa se ne briše). */
export function importCookbook(text: string, current: Cookbook): ImportResult {
  let parsed: unknown
  try {
    if (text.length > 2_000_000) return { ok: false, error: 'Datoteka je prevelika.' }
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Datoteka nije ispravan JSON.' }
  }
  if (!isObj(parsed) || parsed.format !== COOKBOOK_EXPORT_FORMAT) {
    return { ok: false, error: 'Ovo nije izvoz kuharice sa Srca naše kuhinje.' }
  }
  if (parsed.version !== 1) return { ok: false, error: 'Nepodržana verzija izvoza.' }
  const data = validateCookbook(parsed.data)
  if (!data) return { ok: false, error: 'Sadržaj izvoza je oštećen ili nepotpun.' }
  const lists = [...current.lists]
  for (const l of data.lists) if (!lists.some((x) => x.id === l.id)) lists.push(l)
  const items = [...current.items]
  let added = 0
  for (const it of data.items) {
    const existing = items.find((x) => x.uid === it.uid)
    if (existing) {
      existing.lists = [...new Set([...existing.lists, ...it.lists])]
    } else {
      items.push(it)
      added++
    }
  }
  return { ok: true, cookbook: { items, lists }, added }
}

// ================= Označeni sastojci =================
export type Checks = Record<string, string[]>
export const checksStore = createStore<Checks>('oznake', 1, {}, (v) => {
  if (!isObj(v)) return null
  const out: Checks = {}
  for (const [k, val] of Object.entries(v)) {
    const arr = arrayOf(val, (x) => str(x, 64), 300)
    if (!arr) return null
    out[k] = arr
  }
  return out
})

// ================= Napredak u načinu kuhanja =================
export type CookingProgress = Record<string, { step: number; updatedAt: string }>
export const cookingStore = createStore<CookingProgress>('kuhanje', 1, {}, (v) => {
  if (!isObj(v)) return null
  const out: CookingProgress = {}
  for (const [k, val] of Object.entries(v)) {
    if (!isObj(val)) return null
    const step = num(val.step, 0, 500)
    const updatedAt = str(val.updatedAt, 40)
    if (step === null || !updatedAt) return null
    out[k] = { step, updatedAt }
  }
  return out
})

// ================= Tajmeri =================
export interface TimerState {
  id: string
  recipeUid: string
  recipeTitle: string
  recipeSlug: string
  stepId: string
  stepNumber: number
  label: string
  durationMs: number
  /** epoch ms kraja dok tajmer radi; null kad je pauziran */
  endsAt: number | null
  /** preostalo vrijeme kad je pauziran */
  remainingMs: number
}
const timer = (v: unknown): TimerState | null => {
  if (!isObj(v)) return null
  const t = {
    id: str(v.id, 64),
    recipeUid: str(v.recipeUid, 64),
    recipeTitle: str(v.recipeTitle, 200),
    recipeSlug: str(v.recipeSlug, 120),
    stepId: str(v.stepId, 64),
    stepNumber: num(v.stepNumber, 1, 500),
    label: str(v.label, 120),
    durationMs: num(v.durationMs, 1000, 24 * 3600 * 1000 * 2),
    endsAt: v.endsAt === null ? null : num(v.endsAt, 0),
    remainingMs: num(v.remainingMs, 0, 24 * 3600 * 1000 * 2),
  }
  if (Object.entries(t).some(([k, x]) => x === null && k !== 'endsAt')) return null
  if (v.endsAt !== null && t.endsAt === null) return null
  return t as TimerState
}
export const timersStore = createStore<TimerState[]>('tajmeri', 1, [], (v) => arrayOf(v, timer, 20))

/** Preostalo vrijeme računa se iz završnog trenutka — tačno i nakon povratka iz pozadine. */
export function timerRemaining(t: TimerState, now = Date.now()): number {
  if (t.endsAt === null) return t.remainingMs
  return Math.max(0, t.endsAt - now)
}
export function startTimer(t: Omit<TimerState, 'id' | 'endsAt' | 'remainingMs'>, now = Date.now()): TimerState {
  return { ...t, id: newId(), endsAt: now + t.durationMs, remainingMs: t.durationMs }
}
export function pauseTimer(t: TimerState, now = Date.now()): TimerState {
  return t.endsAt === null ? t : { ...t, endsAt: null, remainingMs: timerRemaining(t, now) }
}
export function resumeTimer(t: TimerState, now = Date.now()): TimerState {
  return t.endsAt !== null ? t : { ...t, endsAt: now + t.remainingMs }
}

// ================= Plan (do 7 recepata) =================
export const PLAN_LIMIT = 7
export const DAYS = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'] as const

export interface PlanEntry {
  id: string
  uid: string
  slug: string
  title: string
  servings: number
  baseServings: number | null
  yieldUnit: string
  day: (typeof DAYS)[number] | null
}
const planEntry = (v: unknown): PlanEntry | null => {
  if (!isObj(v)) return null
  const e = {
    id: str(v.id, 64),
    uid: str(v.uid, 64),
    slug: str(v.slug, 120),
    title: str(v.title, 200),
    servings: num(v.servings, 0.5, 200),
    baseServings: v.baseServings === null ? null : num(v.baseServings, 1, 200),
    yieldUnit: str(v.yieldUnit ?? 'porcija', 40),
    day: v.day === null || v.day === undefined ? null : (DAYS as readonly string[]).includes(String(v.day)) ? (v.day as PlanEntry['day']) : undefined,
  }
  if (!e.id || !e.uid || !e.slug || !e.title || e.servings === null || e.yieldUnit === null || e.day === undefined) return null
  if (v.baseServings !== null && e.baseServings === null) return null
  return e as PlanEntry
}
export const planStore = createStore<PlanEntry[]>('plan', 1, [], (v) => arrayOf(v, planEntry, PLAN_LIMIT))

export function planSignature(entries: PlanEntry[]): string {
  return entries.map((e) => `${e.uid}:${e.servings}`).sort().join('|')
}

// ================= Lista za kupovinu =================
export interface ManualItem {
  id: string
  text: string
}
export interface ShoppingState {
  sources: ShoppingSource[]
  manual: ManualItem[]
  /** ključevi označenih (kupljenih) stavki: izvedene po ključu spajanja, ručne po id-ju */
  checked: string[]
  /** potpis plana iz kojeg su izvedene stavke plana */
  planSig: string | null
  /** ID-jevi linija koje treba preskočiti po izvoru (npr. već označeno na receptu) */
  skip: Record<string, string[]>
}

const line = (v: unknown): IngredientLine | null => {
  if (!isObj(v)) return null
  const l = {
    id: str(v.id, 64),
    ingredientId: str(String(v.ingredientId ?? ''), 64),
    name: str(v.name, 120),
    label: str(v.label, 160),
    amount: v.amount === null ? null : num(v.amount, 0, 1e6),
    amountMax: v.amountMax == null ? null : num(v.amountMax, 0, 1e6),
    unit: str(v.unit ?? '', 30),
    note: v.note == null ? undefined : str(v.note, 160) ?? undefined,
    optional: v.optional === true,
    altGroup: v.altGroup == null ? undefined : str(v.altGroup, 40) ?? undefined,
  }
  if (!l.id || !l.ingredientId || !l.name || l.label === null || l.unit === null) return null
  if (v.amount !== null && l.amount === null) return null
  return l as IngredientLine
}
const source = (v: unknown): ShoppingSource | null => {
  if (!isObj(v)) return null
  const lines = arrayOf(v.lines, line, 200)
  const id = str(v.id, 64)
  const recipeId = str(v.recipeId, 64)
  const title = str(v.title, 200)
  const slug = str(v.slug, 120)
  const servings = num(v.servings, 0.5, 200)
  const baseServings = v.baseServings === null ? null : num(v.baseServings, 1, 200)
  const origin = v.origin === 'plan' || v.origin === 'recipe' ? v.origin : null
  if (!id || !recipeId || !title || !slug || servings === null || !origin || !lines) return null
  if (v.baseServings !== null && baseServings === null) return null
  return { id, recipeId, title, slug, servings, baseServings, origin, lines }
}
export const validateShopping = (v: unknown): ShoppingState | null => {
  if (!isObj(v)) return null
  const sources = arrayOf(v.sources, source, 30)
  const manual = arrayOf(v.manual, (m) => (isObj(m) && str(m.id, 64) && str(m.text, 200) ? { id: m.id as string, text: m.text as string } : null), 200)
  const checked = arrayOf(v.checked, (x) => str(x, 300), 1000)
  const planSig = v.planSig === null ? null : str(v.planSig, 2000)
  const skip: Record<string, string[]> = {}
  if (isObj(v.skip)) {
    for (const [k, val] of Object.entries(v.skip)) {
      const arr = arrayOf(val, (x) => str(x, 64), 300)
      if (arr) skip[k] = arr
    }
  }
  if (!sources || !manual || !checked || (v.planSig !== null && planSig === null)) return null
  return { sources, manual, checked, planSig, skip }
}
export const shoppingStore = createStore<ShoppingState>(
  'kupovina',
  1,
  { sources: [], manual: [], checked: [], planSig: null, skip: {} },
  validateShopping,
)

// ================= Nedavno pregledano =================
export interface RecentItem {
  uid: string
  slug: string
  title: string
  image: string | null
  viewedAt: string
}
export const RECENT_LIMIT = 8
export const recentStore = createStore<RecentItem[]>('nedavno', 1, [], (v) =>
  arrayOf(
    v,
    (x) => {
      if (!isObj(x)) return null
      const uid = str(x.uid, 64)
      const slug = str(x.slug, 120)
      const title = str(x.title, 200)
      const viewedAt = str(x.viewedAt, 40)
      if (!uid || !slug || !title || !viewedAt) return null
      return { uid, slug, title, viewedAt, image: x.image == null ? null : str(x.image, 500) }
    },
    50,
  ),
)
