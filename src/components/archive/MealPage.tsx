import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { IdeaArticle, resolveSections, itemListLd } from '../content/IdeaArticle'
import { parseSearchState, serializeSearchState, MEAL_OPTIONS } from '@/lib/search/params'
import { searchRecipes } from '@/data/search'
import { getMealPages } from '@/data/site'
import { getCollection } from '@/data/content'
import { getCardsByIds } from '@/data/recipes'
import { ArchiveView, buildFilterOptions, archiveIsIndexable } from './ArchiveView'
import { Breadcrumbs } from '../ui/Navigation'
import { quickIcon } from '../ui/Section'
import { JsonLd } from '../seo/JsonLd'
import { pageMeta, absolute, formatDate } from '@/lib/seo/meta'

export type MealKey = 'dorucak' | 'rucak' | 'vecera'
type SP = Record<string, string | string[] | undefined>

export async function mealMetadata(meal: MealKey, sp: SP): Promise<Metadata> {
  const p = (await getMealPages())[meal]
  const state = parseSearchState(sp)
  return pageMeta({
    title: `${p.article.headline || `${p.title}: ideje i recepti`}${state.stranica > 1 ? ` — stranica ${state.stranica}` : ''}`,
    description: p.seoDescription || p.intro || `Ideje i recepti za ${p.title.toLowerCase()}.`,
    path: `/${meal}/${state.stranica > 1 && archiveIsIndexable(state) ? serializeSearchState({ stranica: state.stranica }) : ''}`,
    image: p.wideImage,
    type: 'article',
    modifiedTime: p.article.updatedAt,
    noindex: !archiveIsIndexable(state),
  })
}

/** Stranica obroka kao članak (ideje po temama) + svi recepti tog obroka s filterima. */
export async function MealPage({ meal, searchParams }: { meal: MealKey; searchParams: SP }) {
  const p = (await getMealPages())[meal]
  const a = p.article
  const state = parseSearchState(searchParams)
  const basePath = `/${meal}/`
  const filtering = state.stranica > 1 || Object.keys(searchParams).length > 0
  const allIds = a.sections.flatMap((s) => s.items.map((i) => i.recipeId))
  const [result, options, collections, cards] = await Promise.all([
    searchRecipes(state, { meal }),
    buildFilterOptions(['kategorija', 'meso', 'vrijeme', 'glavna', 'sastojci', 'bez', 'metoda', 'tijesto', 'tezina', 'ishrana']),
    Promise.all([...new Set([...p.collectionSlugs, ...a.relatedCollectionSlugs])].map((s) => getCollection(s))),
    getCardsByIds(allIds),
  ])
  const sections = resolveSections(a, cards)
  const found = collections.filter((c): c is NonNullable<typeof c> => !!c)
  const visibleCollections = found.filter((c) => p.collectionSlugs.includes(c.slug))
  const related = found.filter((c) => a.relatedCollectionSlugs.includes(c.slug))
  const others = MEAL_OPTIONS.filter((m) => m.value !== meal)
  const hasArticle = sections.length > 0

  return (
    <div>
      <section className="border-b border-line bg-cream">
        <div className="container-page grid items-center gap-8 py-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:py-12">
          <div>
            <Breadcrumbs items={[{ name: 'Recepti', href: '/recepti/' }, { name: p.title, href: basePath }]} />
            <p className="eyebrow eyebrow-line mt-5">Ideje za {p.title.toLowerCase()}</p>
            <h1 className="mt-3 text-[2.1rem] font-semibold leading-[1.1] sm:text-[2.8rem]">{a.headline || p.title}</h1>
            <p className="mt-4 text-[0.95rem] text-muted">
              {a.author && (
                <>
                  Piše:{' '}
                  <Link href={`/autori/#${a.author.slug}`} className="font-semibold text-ink hover:text-brand">
                    {a.author.name}
                  </Link>
                  {a.author.role ? `, ${a.author.role.toLowerCase()}` : ''}
                  {' · '}
                </>
              )}
              Ažurirano: <time dateTime={a.updatedAt ?? undefined}>{formatDate(a.updatedAt)}</time>
            </p>
            {!hasArticle && p.intro && <p className="mt-3 max-w-xl text-lg text-muted">{p.intro}</p>}
            <p className="mt-5 flex flex-wrap gap-2 text-[0.95rem]">
              {others.map((o) => (
                <Link key={o.value} href={`/${o.value}/`} className="chip ring-logo font-semibold text-bordo">
                  {o.label}
                </Link>
              ))}
              <a href="#svi-recepti" className="chip">
                Svi recepti za {p.title.toLowerCase()}
              </a>
            </p>
          </div>
          {p.wideImage && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
              <Image src={p.wideImage.url} alt={p.wideImage.alt} fill priority sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      {hasArticle && !filtering && (
        <IdeaArticle article={a} sections={sections} recipesAnchor={{ id: 'svi-recepti', label: `Svi recepti za ${p.title.toLowerCase()}` }} related={related} />
      )}

      {visibleCollections.length > 0 && !filtering && (
        <nav aria-label={`Izdvojene kolekcije: ${p.title}`} className="container-page pb-4">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleCollections.map((c) => {
              const Icon = quickIcon(c.title)
              return (
                <li key={c.slug}>
                  <Link href={`/ideje/${c.slug}/`} className="ring-logo group flex h-full items-start gap-3 rounded-2xl bg-white p-4">
                    <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <span className="flex-1">
                      <span className="block font-semibold group-hover:text-bordo">{c.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{c.intro}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted group-hover:text-brand" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      <section id="svi-recepti" aria-labelledby="svi-recepti-naslov" className="container-page scroll-mt-24 pt-8">
        <p className="eyebrow">Pretraga i filteri</p>
        <h2 id="svi-recepti-naslov" className="mt-2 text-[1.75rem] font-semibold sm:text-[2.1rem]">
          Svi recepti za {p.title.toLowerCase()}
        </h2>
        <div className="mt-6">
          <ArchiveView state={state} result={result} basePath={basePath} options={options} scope={`obrok-opseg=${meal}`} />
        </div>
      </section>

      {hasArticle && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: a.headline || p.title,
            description: p.seoDescription || a.intro[0] || undefined,
            url: absolute(basePath),
            image: p.wideImage ? [absolute(p.wideImage.url)] : undefined,
            dateModified: a.updatedAt ?? undefined,
            author: a.author ? { '@type': 'Person', name: a.author.name } : undefined,
            mainEntity: itemListLd(sections),
          }}
        />
      )}
    </div>
  )
}
