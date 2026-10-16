import type { Metadata } from 'next'
import Image from 'next/image'
import { draftMode, headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { parseSearchState, hasActiveFilters } from '@/lib/search/params'
import { searchRecipes, PAGE_SIZE } from '@/data/search'
import { getCollection, getCollectionDraft, getRedirect, type CollectionView } from '@/data/content'
import { getCardsByIds } from '@/data/recipes'
import { payloadClient } from '@/data/payload'
import { ArchiveView, buildFilterOptions, archiveIsIndexable } from '@/components/archive/ArchiveView'
import { Breadcrumbs, DemoNotice } from '@/components/ui/Navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageMeta, absolute, formatDate } from '@/lib/seo/meta'
import Link from 'next/link'
import { IdeaArticle, resolveSections, itemListLd } from '@/components/content/IdeaArticle'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

async function load(slug: string): Promise<CollectionView | null> {
  if ((await draftMode()).isEnabled) {
    const { user } = await (await payloadClient()).auth({ headers: await headers() })
    if (user?.collection === 'users') return getCollectionDraft(slug)
  }
  return getCollection(slug)
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = await load(slug)
  if (!c) return { title: 'Kolekcija nije pronađena', robots: { index: false } }
  const state = parseSearchState(await searchParams)
  return pageMeta({
    title: c.seo.title || c.article.headline || c.title,
    description: c.seo.description || c.intro,
    path: `/ideje/${c.slug}/`,
    image: c.shareImage,
    type: c.article.sections.length ? 'article' : undefined,
    modifiedTime: c.article.updatedAt,
    // Kolekcije nisu automatski indeksabilne: urednik to izričito uključuje.
    noindex: !c.indexable || !!c.seo.noindex || c.isDemo || !archiveIsIndexable(state) || state.stranica > 1,
  })
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params
  const c = await load(slug)
  if (!c) {
    const r = await getRedirect(`/ideje/${slug}/`)
    if (r?.type === '301') permanentRedirect(r.to)
    notFound()
  }
  const state = parseSearchState(await searchParams)
  const basePath = `/ideje/${c.slug}/`
  const groups = (c.subfilters as Array<'kategorija' | 'vrijeme' | 'tezina'>) ?? []

  // Bez filtera: urednički redoslijed. S filterima: pretraga unutar izbora.
  let result
  if (!hasActiveFilters(state) && state.sort === 'najnovije') {
    const all = await getCardsByIds(c.recipeIds)
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
    const page = Math.min(state.stranica, totalPages)
    result = { cards: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: all.length, page, totalPages, unknown: [] }
  } else {
    result = await searchRecipes(state, { recipeIds: c.recipeIds })
  }
  const filtering = hasActiveFilters(state) || state.stranica > 1 || state.sort !== 'najnovije'
  const [options, articleCards, relatedRaw] = await Promise.all([
    buildFilterOptions(groups),
    getCardsByIds(c.article.sections.flatMap((s) => s.items.map((i) => i.recipeId))),
    Promise.all(c.article.relatedCollectionSlugs.map((s) => getCollection(s))),
  ])
  const sections = resolveSections(c.article, articleCards)
  const related = relatedRaw.filter((r): r is NonNullable<typeof r> => !!r)
  const hasArticle = sections.length > 0
  const a = c.article

  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Ideje', href: '/ideje/' }, { name: c.title, href: basePath }]} />
      {c.isDemo && (
        <div className="mt-4">
          <DemoNotice what="Ova kolekcija" />
        </div>
      )}
      <header className="mt-4 grid items-center gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <p className="eyebrow eyebrow-line">Ideje</p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] sm:text-[2.6rem]">{a.headline || c.title}</h1>
          {hasArticle && (
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
          )}
          {!hasArticle && <p className="mt-3 text-lg text-muted">{c.intro}</p>}
        </div>
        {c.image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={c.image.url} alt={c.image.alt} fill priority sizes="(min-width: 768px) 460px, 100vw" className="object-cover" />
          </div>
        )}
      </header>
      {hasArticle && !filtering && (
        <div className="-mx-4 sm:-mx-6">
          <IdeaArticle article={a} sections={sections} recipesAnchor={{ id: 'recepti-kolekcije', label: 'Svi recepti iz ovog izbora' }} related={related} />
        </div>
      )}
      <section id="recepti-kolekcije" className="mt-8 scroll-mt-24">
        {hasArticle && <h2 className="mb-6 text-[1.75rem] font-semibold">Svi recepti iz ovog izbora</h2>}
        {groups.length > 0 ? (
          <ArchiveView state={state} result={result} basePath={basePath} options={options} />
        ) : (
          <ArchiveView state={state} result={result} basePath={basePath} options={{ ...options, groups: [] }} />
        )}
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': hasArticle ? 'Article' : 'CollectionPage',
          ...(hasArticle
            ? { headline: a.headline || c.title, dateModified: a.updatedAt ?? undefined, author: a.author ? { '@type': 'Person', name: a.author.name } : undefined }
            : { name: c.title }),
          description: c.intro,
          url: absolute(basePath),
          mainEntity: hasArticle
            ? itemListLd(sections)
            : { '@type': 'ItemList', itemListElement: result.cards.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/recepti/${r.slug}/`) })) },
        }}
      />
    </div>
  )
}
