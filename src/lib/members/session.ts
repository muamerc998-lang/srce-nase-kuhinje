import { cookies } from 'next/headers'
import { payloadClient } from '@/data/payload'
import type { Member } from '@/payload-types'

/** Kolačić prijave člana — odvojen od kolačića administracije (payload-token). */
export const MEMBER_COOKIE = 'snk-clan'

export async function getMember(): Promise<Member | null> {
  const token = (await cookies()).get(MEMBER_COOKIE)?.value
  if (!token) return null
  try {
    const payload = await payloadClient()
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    if (!user || user.collection !== 'members' || (user as Member).blocked) return null
    return user as Member
  } catch {
    return null
  }
}

export async function setMemberCookie(token: string) {
  ;(await cookies()).set(MEMBER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.SITE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearMemberCookie() {
  ;(await cookies()).delete(MEMBER_COOKIE)
}
