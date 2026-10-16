import { getPayload } from 'payload'
import config from '@payload-config'

export const payloadClient = () => getPayload({ config })

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const isProduction = () => process.env.SITE_ENV === 'production'

export const indexingAllowed = () => isProduction() && process.env.SITE_ALLOW_INDEXING === 'true'

/** Javni filter: objavljeno + (u produkciji) bez demo sadržaja. */
export function publicWhere<T extends Record<string, unknown>>(extra?: T, hasStatus = true) {
  const and: Record<string, unknown>[] = []
  if (hasStatus) and.push({ _status: { equals: 'published' } })
  if (isProduction()) and.push({ isDemo: { not_equals: true } })
  if (extra && Object.keys(extra).length) and.push(extra)
  return { and } as never
}
