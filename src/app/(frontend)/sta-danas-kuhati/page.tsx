import type { Metadata } from 'next'
import Link from 'next/link'
import { parsePantry, findPantryMatches } from '@/data/pantry'
import { getCategories, getIngredientRegistry, getFacetStats } from '@/data/site'
import { getCollections } from '@/data/content'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { RecipeCard } from '@/components/recipe/RecipeCard'
import { IngredientPicker } from '@/components/pantry/IngredientPicker'
import { pageMeta } from '@/lib/seo/meta'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = parsePantry(await searchParams)
  return pageMeta({
    title: 'Šta danas kuhati?',
    description: 'Odaberite namirnice koje imate i pogledajte recepte koje možete pripremiti — s jasnim prikazom onoga što nedostaje.',
    path: '/sta-danas-kuhati/',
    noindex: p.imam.length > 0 || p.bez.length > 0,
  })
}

export default async function PantryPage({ searchParams }: Props) {
  const input = parsePantry(await searchParams)
  const [result, cats, registry, stats, collections] = await Promise.all([
    findPantryMatches(input),
    getCategories(),
    getIngredientRegistry(),
    getFacetStats(),
    getCollections(),
  ])
  const topLevel = cats.filter((c) => !c.parentId && c.count > 0)
  const popular = registry
    .map((i) => ({ slug: i.slug, name: i.name, n: stats.counts[`i:${i.id}`] ?? 0 }))
    .filter((i) => i.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 40)
    .sort((a, b) => a.name.localeCompare(b.name, 'bs'))
  const groups = [0, 1, 2].map((m) => result.hits.filter((h) => h.missing.length === m))

  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Šta danas kuhati?', href: '/sta-danas-kuhati/' }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">Šta danas kuhati?</h1>
        <p className="mt-2 text-lg text-muted">
          Upišite namirnice koje imate u kuhinji. Pokazat ćemo recepte za koje imate sve obavezne sastojke, a zatim one kojima nedostaje
          jedan ili dva.
        </p>
      </header>

      {collections.length > 0 && (
        <nav aria-label="Izbor prema prilici" className="mt-5">
          <ul className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/ideje/${c.slug}/`} className="chip font-semibold">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <form action="/sta-danas-kuhati/" method="get" className="mt-8 grid gap-6 rounded-2xl border border-line bg-cream p-5 sm:p-6 lg:grid-cols-2">
        <div className="space-y-5">
          <IngredientPicker name="imam" label="Imam ove namirnice" initial={result.selected} />
          <IngredientPicker name="bez" label="Ne želim ove sastojke" initial={result.excluded} hint="Recepti u kojima su ove namirnice neophodne neće biti prikazani." />
          <noscript>
            <fieldset>
              <legend className="label">Odaberite namirnice (bez JavaScripta)</legend>
              <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto">
                {popular.map((i) => (
                  <label key={i.slug} className="flex items-center gap-2">
                    <input type="checkbox" name="imam" value={i.slug} defaultChecked={input.imam.includes(i.slug)} />
                    {i.name}
                  </label>
                ))}
              </div>
            </fieldset>
          </noscript>
        </div>
        <div className="space-y-5">
          <fieldset>
            <legend className="label">Osnovne namirnice</legend>
            <label className="flex min-h-11 items-start gap-2.5">
              <input type="checkbox" name="osnovne" value="1" defaultChecked={input.osnovne} className="mt-1 h-5 w-5 accent-[var(--color-brand)]" />
              <span>
                Imam osnovne namirnice
                {result.basics.length > 0 && <span className="block text-sm text-muted">{result.basics.map((b) => b.name).join(', ')}</span>}
              </span>
            </label>
            <p className="text-sm text-muted">Bez ove opcije ništa se ne pretpostavlja — ni voda ni so.</p>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vrsta-jela" className="label">
                Vrsta jela
              </label>
              <select id="vrsta-jela" name="kategorija" defaultValue={input.kategorija ?? ''} className="field">
                <option value="">Sve</option>
                {topLevel.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="vrijeme" className="label">
                Ukupno vrijeme
              </label>
              <select id="vrijeme" name="vrijeme" defaultValue={input.vrijeme ? String(input.vrijeme) : ''} className="field">
                <option value="">Bilo koje</option>
                {[15, 30, 45, 60, 120].map((t) => (
                  <option key={t} value={t}>
                    do {t < 60 ? `${t} min` : `${t / 60} h`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Prikaži recepte
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-muted">
        Napomena: provjeravamo samo vrste namirnica, ne i da li imate dovoljnu količinu. Opcionalni ukrasi se ne računaju kao nedostatak, a
        kod zamjenjivih sastojaka (npr. maslac ili margarin) dovoljan je jedan.
      </p>

      <section aria-live="polite" className="mt-10">
        {input.imam.length === 0 ? (
          <p className="text-muted">Odaberite bar jednu namirnicu da biste vidjeli prijedloge.</p>
        ) : result.hits.length === 0 ? (
          <div className="rounded-xl border border-line bg-cream p-6">
            <h2 className="text-xl font-semibold">Nema recepata za ovaj izbor</h2>
            <p className="mt-2 text-muted">Pokušajte proširiti uslove:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              {!input.osnovne && <li>uključite opciju „Imam osnovne namirnice“,</li>}
              {(input.kategorija || input.vrijeme) && <li>uklonite ograničenje vrste jela ili vremena,</li>}
              {input.bez.length > 0 && <li>smanjite broj isključenih sastojaka,</li>}
              <li>dodajte još namirnica koje imate.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-12">
            {[
              ['Imate sve obavezne sastojke', groups[0]],
              ['Nedostaje jedan sastojak', groups[1]],
              ['Nedostaju dva sastojka', groups[2]],
            ].map(([title, hits]) =>
              (hits as typeof result.hits).length ? (
                <div key={title as string}>
                  <h2 className="text-2xl font-semibold">
                    {title as string} <span className="text-lg font-normal text-muted">({(hits as typeof result.hits).length})</span>
                  </h2>
                  <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {(hits as typeof result.hits).map((h) => (
                      <li key={h.card.id} className="flex flex-col gap-2">
                        <RecipeCard recipe={h.card} headingLevel={3} />
                        {h.missing.length > 0 && (
                          <p className="rounded-lg bg-soft px-3 py-2 text-[0.95rem]">
                            <strong>Nedostaje:</strong> {h.missing.join(', ')}
                          </p>
                        )}
                        {h.omitOptional.length > 0 && <p className="text-sm text-muted">Izostavite (opcionalno): {h.omitOptional.join(', ')}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        )}
      </section>
    </div>
  )
}
