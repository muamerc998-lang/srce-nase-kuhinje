import { NextResponse, type NextRequest } from 'next/server'
import { countRecipes } from '@/data/search'
import { parseSearchState } from '@/lib/search/params'
import { getCategories } from '@/data/site'
import { hashClient, rateLimit } from '@/lib/forms/protect'

/** Broj rezultata za dugme "Primijeni" u mobilnom panelu filtera. */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'nepoznato'
  if (!rateLimit(`count:${hashClient(ip)}`, 120, 60_000)) return NextResponse.json({ count: null }, { status: 429 })
  const raw: Record<string, string> = {}
  req.nextUrl.searchParams.forEach((v, k) => (raw[k] = v))
  const state = parseSearchState(raw)
  const scopeSlug = req.nextUrl.searchParams.get('opseg')
  let categoryId: number | undefined
  if (scopeSlug) categoryId = (await getCategories()).find((c) => c.slug === scopeSlug)?.id
  const meal = req.nextUrl.searchParams.get('obrok-opseg')
  const count = await countRecipes(state, { categoryId, meal: meal && ['dorucak', 'rucak', 'vecera'].includes(meal) ? meal : undefined })
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'public, max-age=30' } })
}
