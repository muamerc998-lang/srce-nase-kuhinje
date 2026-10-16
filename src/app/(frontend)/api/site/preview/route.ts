import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { payloadClient } from '@/data/payload'

const PATHS: Record<string, string> = {
  recipes: '/recepti/',
  guides: '/savjeti/',
  'recipe-collections': '/ideje/',
  pages: '/',
}

/**
 * Pregled prije objave: radi samo za prijavljenog korisnika CMS-a.
 * Uključuje Next.js draft mode i preusmjerava na stranicu sadržaja.
 */
export async function GET(req: NextRequest) {
  const collection = req.nextUrl.searchParams.get('collection') ?? ''
  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  const base = PATHS[collection]
  if (!base || !/^[a-z0-9-]{1,120}$/.test(slug)) return new Response('Neispravan zahtjev', { status: 400 })
  const payload = await payloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (user?.collection !== 'users') return new Response('Pregled je dostupan samo prijavljenim urednicima.', { status: 401 })
  ;(await draftMode()).enable()
  redirect(`${base}${slug}/`)
}
