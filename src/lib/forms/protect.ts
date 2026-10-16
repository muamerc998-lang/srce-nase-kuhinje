import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Zaštita javnih formi (bez vanjskih servisa):
 * - honeypot polje koje ljudi ne vide
 * - potpisan vremenski žeton: forma poslana prebrzo (<3 s) ili prestara (>1 dan) se odbija
 * - ograničenje učestalosti po hash-u IP adrese (u memoriji procesa)
 * - sanitizacija: kontrolni znakovi, višak razmaka, dužina, broj linkova
 *
 * Ograničenje: rate limit u memoriji važi po instanci servera. Za više instanci
 * koristiti zajedničko spremište (vidi docs/architecture.md).
 */

const secret = () => process.env.PAYLOAD_SECRET || 'dev-only'

export function formToken(now = Date.now()): string {
  const sig = createHmac('sha256', secret()).update(`form:${now}`).digest('base64url').slice(0, 22)
  return `${now}.${sig}`
}

export function checkFormToken(token: unknown, now = Date.now(), minMs = 3000, maxMs = 86_400_000): boolean {
  if (typeof token !== 'string') return false
  const [ts, sig] = token.split('.')
  const t = Number(ts)
  if (!Number.isFinite(t) || !sig) return false
  const expected = createHmac('sha256', secret()).update(`form:${t}`).digest('base64url').slice(0, 22)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  const age = now - t
  return age >= minMs && age <= maxMs
}

export function hashClient(ip: string): string {
  return createHmac('sha256', secret()).update(`ip:${ip}`).digest('hex').slice(0, 32)
}

const buckets = new Map<string, number[]>()

/** Najviše `limit` zahtjeva u prozoru `windowMs` po ključu. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (arr.length >= limit) {
    buckets.set(key, arr)
    return false
  }
  arr.push(now)
  buckets.set(key, arr)
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k)
  }
  return true
}

export function resetRateLimits() {
  buckets.clear()
}

export function sanitizeText(input: unknown, max: number): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max)
}

export function tooManyLinks(text: string, max = 1): boolean {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length > max
}
