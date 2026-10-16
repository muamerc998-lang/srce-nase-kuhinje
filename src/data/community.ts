import { unstable_cache } from 'next/cache'
import type { Submission, Member, SubmissionImage, Category } from '@/payload-types'
import { payloadClient } from './payload'
import type { ImageView } from '@/lib/recipes/types'

function img(i: unknown, size?: 'card'): ImageView | null {
  const m = i && typeof i === 'object' ? (i as SubmissionImage) : null
  if (!m) return null
  const s = size ? m.sizes?.[size] : null
  const url = (s?.url || m.url || '').replace(/^https?:\/\/[^/]+/, '').replace(/(\.[a-z0-9]{2,5})\/$/i, '$1')
  const width = (s?.url ? s.width : m.width) ?? 0
  const height = (s?.url ? s.height : m.height) ?? 0
  return url && width && height ? { url, alt: m.alt, width, height } : null
}

export function toSubmissionView(s: Submission) {
  const m = s.member && typeof s.member === 'object' ? (s.member as Member) : null
  const c = s.category && typeof s.category === 'object' ? (s.category as Category) : null
  const lines = (t: string | null | undefined) =>
    (t ?? '')
      .split('\n')
      .map((x) => x.replace(/^\s*[-•*\d.)]+\s*/, '').trim())
      .filter(Boolean)
  return {
    id: s.id,
    title: s.title,
    story: s.story ?? null,
    ingredients: lines(s.ingredients),
    steps: lines(s.steps),
    servings: s.servings ?? null,
    totalMinutes: s.totalMinutes ?? null,
    category: c ? { name: c.name, slug: c.slug ?? '' } : null,
    image: img(s.image),
    cardImage: img(s.image, 'card'),
    status: s.status,
    featuredOnFacebook: !!s.featuredOnFacebook,
    editorNote: s.editorNote ?? null,
    author: m ? { name: m.displayName, bio: m.bio ?? null } : null,
    createdAt: s.createdAt,
  }
}
export type SubmissionView = ReturnType<typeof toSubmissionView>

export const getApprovedSubmissions = unstable_cache(
  async (limit = 48) => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'submissions', where: { status: { equals: 'odobreno' } }, sort: '-createdAt', limit, depth: 1, overrideAccess: true })
    return res.docs.map(toSubmissionView)
  },
  ['approved-submissions'],
  { tags: ['submissions'], revalidate: 3600 },
)

export const getApprovedSubmission = unstable_cache(
  async (id: number) => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection: 'submissions',
      where: { and: [{ id: { equals: id } }, { status: { equals: 'odobreno' } }] },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    return res.docs[0] ? toSubmissionView(res.docs[0]) : null
  },
  ['approved-submission'],
  { tags: ['submissions'], revalidate: 3600 },
)

/** Recepti prijavljenog člana (bez keširanja — privatni podaci). */
export async function getOwnSubmissions(memberId: number) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'submissions', where: { member: { equals: memberId } }, sort: '-createdAt', limit: 50, depth: 1, overrideAccess: true })
  return res.docs.map(toSubmissionView)
}
