import type { RecipeTimes } from './types'

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return ''
  if (minutes < 60) return `${minutes} min`
  if (minutes >= 48 * 60 && minutes % (24 * 60) === 0) return `${minutes / (24 * 60)} dana`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/**
 * Ukupno vrijeme je ono koje urednik unese (uzima u obzir paralelne radnje).
 * Ako nije uneseno, koristi se zbir kao gornja procjena.
 */
export function effectiveTotal(t: RecipeTimes): number | null {
  if (t.totalMinutes && t.totalMinutes > 0) return t.totalMinutes
  const sum = (t.prepMinutes ?? 0) + (t.cookMinutes ?? 0) + (t.restMinutes ?? 0)
  return sum > 0 ? sum : null
}

/** Kratka oznaka za karticu: kod dugog čekanja razdvaja aktivno vrijeme i čekanje. */
export function cardTimeLabel(t: RecipeTimes): string {
  const active = (t.prepMinutes ?? 0) + (t.cookMinutes ?? 0)
  const rest = t.restMinutes ?? 0
  if (rest >= 60 && rest > active && active > 0) {
    const restLabel = t.restLabel?.trim() || 'čekanja'
    const activeLabel = t.cookMinutes ? 'rada' : 'pripreme'
    return `${formatDuration(active)} ${activeLabel} + ${formatDuration(rest)} ${restLabel}`
  }
  const total = effectiveTotal(t)
  return total ? formatDuration(total) : ''
}

/** ISO 8601 trajanje za schema.org (PT1H30M). */
export function isoDuration(minutes: number | null | undefined): string | undefined {
  if (!minutes || minutes <= 0) return undefined
  const d = Math.floor(minutes / (24 * 60))
  const h = Math.floor((minutes % (24 * 60)) / 60)
  const m = minutes % 60
  return `P${d ? `${d}D` : ''}T${h ? `${h}H` : ''}${m || (!h && !d) ? `${m}M` : ''}`.replace(/T$/, '')
}

export const difficultyLabels: Record<string, string> = {
  lako: 'Lako',
  srednje: 'Srednje',
  zahtjevno: 'Zahtjevno',
}
