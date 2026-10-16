import type { Access, FieldAccess, Where } from 'payload'

export type Role = 'admin' | 'editor'

type MaybeUser = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, role: Role) => !!user?.roles?.includes(role)

/** Prijavljeni urednici i administratori. */
export const isStaff: Access = ({ req }) => !!req.user && req.user.collection === 'users'
export const isAdmin: Access = ({ req }) => hasRole(req.user as MaybeUser, 'admin')
export const staffField: FieldAccess = ({ req }) => !!req.user && req.user.collection === 'users'
export const adminField: FieldAccess = ({ req }) => hasRole(req.user as MaybeUser, 'admin')

/** U produkciji javnost nikad ne vidi demonstracijski sadržaj. */
export const isProductionSite = () => process.env.SITE_ENV === 'production'

export function publicFilter(extra?: Where): Where {
  const parts: Where[] = []
  if (extra) parts.push(extra)
  if (isProductionSite()) parts.push({ isDemo: { not_equals: true } })
  return parts.length === 1 ? parts[0] : { and: parts }
}

/** Kolekcije s draftovima: javnost čita samo objavljeno. */
export const publishedOrStaff: Access = ({ req }) => {
  if (req.user?.collection === 'users') return true
  return publicFilter({ _status: { equals: 'published' } })
}

/** Kolekcije bez draftova (registri): javno čitljive, osim demo zapisa u produkciji. */
export const publicOrStaff: Access = ({ req }) => {
  if (req.user?.collection === 'users') return true
  return isProductionSite() ? publicFilter() : true
}
