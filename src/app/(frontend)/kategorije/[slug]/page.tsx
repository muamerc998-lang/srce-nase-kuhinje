import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { parseSearchState, serializeSearchState, hasActiveFilters } from '@/lib/search/params'
import { searchRecipes } from '@/data/search'
import { getCategories } from '@/data/site'
import { getRedirect } from '@/data/content'
import { ArchiveView, buildFilterOptions, archiveIsIndexable } from '@/components/archive/ArchiveView'
import { Breadcrumbs, type Crumb } from '@/components/ui/Navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageMeta, absolute } from '@/lib/seo/meta'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

async function findCategory(slug: string) {
  const cats = await getCategories()
  const cat = cats.find((c) => c.slug === slug)
  // Prazna kategorija se javno ne prikazuje.
  if (!cat || cat.count === 0) return null
  const parent = cat.parentId ? cats.find((c) => c.id === cat.parentId) : null
  const children = cats.filter((c) => c.parentId === cat.id && c.count > 0)
  return { cat, parent, children }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await findCategory(slug)
  if (!found) return { title: 'Kategorija nije pronađena', robots: { index: false } }
  const state = parseSearchState(await searchParams)
  const { cat } = found
  return pageMeta({
    title: `${cat.seo.title || cat.name}${state.stranica > 1 ? ` — stranica ${state.stranica}` : ''}`,
    description: cat.seo.description || cat.intro || `Recepti iz kategorije ${cat.name}.`,
    path: `/kategorije/${cat.slug}/${state.stranica > 1 && archiveIsIndexable(state) ? serializeSearchState({ stranica: state.stranica }) : ''}`,
    image: cat.image,
    noindex: !archiveIsIndexable(state) || !!cat.seo.noindex,
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const found = await findCategory(slug)
  if (!found) {
    const r = await getRedirect(`/kategorije/${slug}/`)
    if (r?.type === '301') permanentRedirect(r.to)
    notFound()
  }
  const { cat, parent, children } = found
  const state = parseSearchState(await searchParams)
  const [result, options] = await Promise.all([
    searchRecipes(state, { categoryId: cat.id }),
    buildFilterOptions(['kategorija', 'obrok', 'meso', 'vrijeme', 'glavna', 'sastojci', 'bez', 'metoda', 'tijesto', 'tezina', 'ishrana'], { withinCategoryId: cat.id }),
  ])
  const crumbs: Crumb[] = [{ name: 'Recepti', href: '/recepti/' }]
  if (parent) crumbs.push({ name: parent.name, href: `/kategorije/${parent.slug}/` })
  crumbs.push({ name: cat.name, href: `/kategorije/${cat.slug}/` })
  const basePath = `/kategorije/${cat.slug}/`

  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">{cat.name}</h1>
        {cat.intro && <p className="mt-2 text-lg text-muted">{cat.intro}</p>}
      </header>
      {children.length > 0 && (
        <nav aria-label={`Podkategorije: ${cat.name}`} className="mt-5">
          <ul className="flex flex-wrap gap-2">
            {children.map((c) => (
              <li key={c.slug}>
                <a href={`/kategorije/${c.slug}/`} className="chip">
                  {c.name} <span className="text-muted">{c.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="mt-8">
        <ArchiveView state={state} result={result} basePath={basePath} options={options} scope={`opseg=${cat.slug}`} />
      </div>
      {cat.body.length > 0 && !hasActiveFilters(state) && state.stranica === 1 && (
        <section aria-labelledby="o-kategoriji" className="card-stripes mt-14 max-w-3xl rounded-2xl border border-line bg-white p-6 pt-8 sm:p-8 sm:pt-10">
          <h2 id="o-kategoriji" className="text-[1.5rem] font-semibold">
            {cat.name}: šta ćete ovdje naći
          </h2>
          {cat.body.map((p, i) => (
            <p key={i} className="mt-3">
              {p}
            </p>
          ))}
        </section>
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: cat.name,
          description: cat.intro || undefined,
          url: absolute(basePath),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: result.cards.map((c, i) => ({
              '@type': 'ListItem',
              position: (result.page - 1) * 12 + i + 1,
              url: absolute(`/recepti/${c.slug}/`),
            })),
          },
        }}
      />
    </div>
  )
}
