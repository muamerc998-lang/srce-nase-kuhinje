import type { Metadata } from 'next'
import Link from 'next/link'
import { getIngredientRegistry, getFacetStats } from '@/data/site'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { IngredientIndexFilter } from '@/components/content/IngredientIndexFilter'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return pageMeta({
    title: 'Namirnice',
    description: 'Namirnice od A do Ž: kako ih odabrati, čuvati i zamijeniti, uz recepte u kojima se koriste.',
    path: '/namirnice/',
  })
}

export default async function IngredientsIndex() {
  const [all, stats] = await Promise.all([getIngredientRegistry(), getFacetStats()])
  // Prikazuju se namirnice koje se koriste u objavljenim receptima ili imaju javnu stranicu.
  const items = all
    .map((i) => ({ ...i, count: stats.counts[`i:${i.id}`] ?? 0 }))
    .filter((i) => i.count > 0 || i.publicPage)
    .sort((a, b) => a.name.localeCompare(b.name, 'bs'))
  const letters = [...new Set(items.map((i) => i.name[0].toLocaleUpperCase('bs')))]
  const featured = items.filter((i) => i.publicPage)

  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Namirnice', href: '/namirnice/' }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">Namirnice</h1>
        <p className="mt-2 text-lg text-muted">Pronađite namirnicu i pogledajte recepte u kojima se koristi.</p>
      </header>

      {featured.length > 0 && (
        <section aria-labelledby="vodici-namirnice" className="mt-8">
          <h2 id="vodici-namirnice" className="text-xl font-semibold">
            Vodiči kroz namirnice
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {featured.map((i) => (
              <li key={i.slug}>
                <Link href={`/namirnice/${i.slug}/`} className="chip bg-soft font-semibold">
                  {i.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <IngredientIndexFilter />

      <nav aria-label="Slova abecede" className="mt-6">
        <ul className="flex flex-wrap gap-1">
          {letters.map((l) => (
            <li key={l}>
              <a href={`#slovo-${l}`} className="btn btn-ghost min-w-11 px-2">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 columns-1 gap-8 sm:columns-2 lg:columns-3" id="popis-namirnica">
        {letters.map((l) => (
          <section key={l} aria-labelledby={`slovo-${l}`} className="mb-6 break-inside-avoid">
            <h2 id={`slovo-${l}`} className="scroll-mt-24 border-b border-line pb-1 text-xl font-semibold text-bordo">
              {l}
            </h2>
            <ul className="mt-2">
              {items
                .filter((i) => i.name[0].toLocaleUpperCase('bs') === l)
                .map((i) => (
                  <li key={i.slug} data-namirnica={`${i.name} ${i.synonyms.join(' ')}`.toLowerCase()}>
                    <Link
                      href={i.publicPage ? `/namirnice/${i.slug}/` : `/recepti/?sastojci=${i.slug}`}
                      className="flex min-h-10 items-center justify-between gap-2 rounded-md px-1 hover:bg-soft hover:text-bordo"
                    >
                      <span>
                        {i.name}
                        {i.synonyms.length > 0 && <span className="text-sm text-muted"> ({i.synonyms.slice(0, 2).join(', ')})</span>}
                      </span>
                      <span className="text-sm text-muted">{i.count > 0 ? `${i.count} rec.` : ''}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
