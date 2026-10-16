import { NextResponse, type NextRequest } from 'next/server'
import { getRecipesByUids } from '@/data/recipes'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Javni podaci recepata za lokalnu kuharicu, plan i listu (po stabilnom uid-u).
 * Nepostojeći ili neobjavljeni recepti se vraćaju u "missing" — interfejs ih
 * prikazuje kao nedostupne, bez rušenja liste.
 */
export async function GET(req: NextRequest) {
  const uids = (req.nextUrl.searchParams.get('uids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => UUID.test(s))
    .slice(0, 60)
  const withIngredients = req.nextUrl.searchParams.get('sastojci') === '1'
  if (!uids.length) return NextResponse.json({ recipes: [], missing: [] })
  const found = await getRecipesByUids(uids, withIngredients)
  const foundUids = new Set(found.map((f) => f.card.uid))
  return NextResponse.json(
    { recipes: found, missing: uids.filter((u) => !foundUids.has(u)) },
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  )
}
