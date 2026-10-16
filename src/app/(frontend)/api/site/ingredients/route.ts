import { NextResponse, type NextRequest } from 'next/server'
import { getIngredientRegistry, getFacetStats } from '@/data/site'
import { normalizeText } from '@/lib/text/normalize'

/** Autocomplete namirnica (kanonski naziv + sinonimi, bez dijakritike). Najviše 10 rezultata. */
export async function GET(req: NextRequest) {
  const q = normalizeText((req.nextUrl.searchParams.get('q') ?? '').slice(0, 60))
  if (q.length < 1) return NextResponse.json({ items: [] })
  const [all, stats] = await Promise.all([getIngredientRegistry(), getFacetStats()])
  const items = all
    .map((i) => {
      const words = i.search.split(' ')
      const starts = normalizeText(i.name).startsWith(q) ? 3 : words.some((w) => w.startsWith(q)) ? 2 : i.search.includes(q) ? 1 : 0
      return { i, starts, used: stats.counts[`i:${i.id}`] ?? 0 }
    })
    .filter((x) => x.starts > 0)
    .sort((a, b) => b.starts - a.starts || b.used - a.used || a.i.name.localeCompare(b.i.name, 'bs'))
    .slice(0, 10)
    .map(({ i, used }) => {
      const syn = i.synonyms.find((s) => normalizeText(s).includes(q) && !normalizeText(i.name).includes(q))
      return { slug: i.slug, name: i.name, matched: syn ?? null, recipes: used }
    })
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
