import { NextResponse, type NextRequest } from 'next/server'
import { suggestRecipes } from '@/data/search'
import { hashClient, rateLimit } from '@/lib/forms/protect'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 100).trim()
  if (q.length < 2) return NextResponse.json({ items: [] })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'nepoznato'
  if (!rateLimit(`suggest:${hashClient(ip)}`, 60, 60_000)) {
    return NextResponse.json({ items: [], error: 'Previše zahtjeva' }, { status: 429 })
  }
  const items = await suggestRecipes(q)
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } })
}
