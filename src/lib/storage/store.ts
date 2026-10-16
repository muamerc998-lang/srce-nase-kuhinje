/**
 * Mali, sigurni omotač oko localStorage-a:
 * - svaki ključ ima verziju formata i validator
 * - oštećeni ili nepodržani podaci se ne čitaju (vraća se početno stanje, original se čuva kao rezervna kopija)
 * - blokirano skladište (privatni način, politika preglednika) ne ruši aplikaciju — stanje radi u memoriji
 * - promjene u drugom tabu se sinhronizuju preko "storage" događaja
 */

export type Validator<T> = (value: unknown) => T | null

export interface Store<T> {
  get(): T
  getServer(): T
  set(updater: T | ((prev: T) => T)): void
  subscribe(cb: () => void): () => void
  /** false = skladište nije dostupno; promjene važe samo do zatvaranja stranice */
  persistent(): boolean
  /** posljednja greška pri čitanju/pisanju (za prikaz korisniku) */
  lastError(): string | null
}

let storageOk: boolean | null = null

export function storageAvailable(): boolean {
  if (storageOk !== null) return storageOk
  try {
    const k = '__snk_test__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    storageOk = true
  } catch {
    storageOk = false
  }
  return storageOk
}

export function createStore<T>(key: string, version: number, initial: T, validate: Validator<T>): Store<T> {
  const fullKey = `snk:${key}`
  let state: T | undefined
  let error: string | null = null
  const listeners = new Set<() => void>()

  const read = (): T => {
    if (typeof window === 'undefined' || !storageAvailable()) return initial
    try {
      const raw = window.localStorage.getItem(fullKey)
      if (!raw) return initial
      const parsed = JSON.parse(raw) as { v?: number; data?: unknown }
      if (parsed?.v !== version) throw new Error('nepodržana verzija')
      const valid = validate(parsed.data)
      if (!valid) throw new Error('neispravan format')
      return valid
    } catch (e) {
      error = `Lokalni podaci (${key}) nisu mogli biti pročitani: ${(e as Error).message}.`
      try {
        const raw = window.localStorage.getItem(fullKey)
        if (raw) window.localStorage.setItem(`${fullKey}:rezerva`, raw)
      } catch {
        /* ignore */
      }
      return initial
    }
  }

  const write = (value: T) => {
    if (typeof window === 'undefined' || !storageAvailable()) return
    try {
      window.localStorage.setItem(fullKey, JSON.stringify({ v: version, data: value }))
      error = null
    } catch (e) {
      error = `Promjena nije sačuvana u pregledniku (${(e as Error).name}).`
    }
  }

  const emit = () => listeners.forEach((l) => l())

  return {
    get() {
      if (state === undefined) state = read()
      return state
    },
    getServer() {
      return initial
    },
    set(updater) {
      const prev = this.get()
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
      state = next
      write(next)
      emit()
    },
    subscribe(cb) {
      listeners.add(cb)
      const onStorage = (e: StorageEvent) => {
        if (e.key === fullKey) {
          state = read()
          emit()
        }
      }
      if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(cb)
        if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
      }
    },
    persistent() {
      return typeof window !== 'undefined' && storageAvailable()
    },
    lastError() {
      return error
    },
  }
}

// ---------- pomoćni validatori ----------
export const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
export const str = (v: unknown, max = 500): string | null => (typeof v === 'string' && v.length <= max ? v : null)
export const num = (v: unknown, min = -Infinity, max = Infinity): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null

export function arrayOf<T>(v: unknown, item: (x: unknown) => T | null, maxLen = 1000): T[] | null {
  if (!Array.isArray(v) || v.length > maxLen) return null
  const out: T[] = []
  for (const x of v) {
    const r = item(x)
    if (r === null) return null
    out.push(r)
  }
  return out
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
