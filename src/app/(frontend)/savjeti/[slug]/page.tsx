import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { draftMode, headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { getGuide, getGuideDraft, getRedirect, type GuideView } from '@/data/content'
import { getCardsByIds } from '@/data/recipes'
import { getSiteSettings } from '@/data/site'
import { payloadClient } from '@/data/payload'
import { Breadcrumbs, DemoNotice } from '@/components/ui/Navigation'
import { RichText } from '@/components/content/RichText'
import { RecipeCard, CardGrid } from '@/components/recipe/RecipeCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { extractHeadings } from '@/lib/content/lexical'
import { pageMeta, absolute, formatDate } from '@/lib/seo/meta'

export const revalidate = 3600
export async function generateStaticParams() {
  return [] // generiše se pri prvom posjetu (ISR)
}
type Props = { params: Promise<{ slug: string }> }

async function load(slug: string): Promise<GuideView | null> {
  if ((await draftMode()).isEnabled) {
    const { user } = await (await payloadClient()).auth({ headers: await headers() })
    if (user?.collection === 'users') return getGuideDraft(slug)
  }
  return getGuide(slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = await load(slug)
  if (!g) return { title: 'Vodič nije pronađen', robots: { index: false } }
  return pageMeta({
    title: g.seo.title || g.title,
    description: g.seo.description || g.answer,
    path: `/savjeti/${g.slug}/`,
    image: g.shareImage,
    type: 'article',
    noindex: !!g.seo.noindex || g.isDemo,
    publishedTime: g.publishedAt,
    modifiedTime: g.contentUpdatedAt,
  })
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const g = await load(slug)
  if (!g) {
    const r = await getRedirect(`/savjeti/${slug}/`)
    if (r?.type === '301') permanentRedirect(r.to)
    notFound()
  }
  const [recipes, settings] = await Promise.all([getCardsByIds(g.relatedRecipeIds), getSiteSettings()])
  const headings = extractHeadings(g.body)
  const url = absolute(`/savjeti/${g.slug}/`)

  return (
    <article className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Savjeti iz kuhinje', href: '/savjeti/' }, { name: g.title, href: `/savjeti/${g.slug}/` }]} />
      {g.isDemo && (
        <div className="mt-4">
          <DemoNotice what="Ovaj vodič" />
        </div>
      )}
      <div className="mx-auto mt-5 max-w-3xl">
        <h1 className="text-[2rem] font-semibold leading-tight sm:text-[2.5rem]">{g.title}</h1>
        <p className="mt-3 text-[0.95rem] text-muted">
          {g.authors.map((a) => a.name).join(', ')} · Ažurirano: <time dateTime={g.contentUpdatedAt ?? undefined}>{formatDate(g.contentUpdatedAt)}</time>
        </p>
        <div className="mt-6 rounded-xl border-l-4 border-brand bg-soft px-5 py-4 text-lg">
          <p>
            <strong>Ukratko: </strong>
            {g.answer}
          </p>
        </div>
        {g.image && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={g.image.url} alt={g.image.alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        {headings.length >= 3 && (
          <nav aria-labelledby="sadrzaj-clanka" className="mt-8 rounded-xl border border-line p-5">
            <h2 id="sadrzaj-clanka" className="font-sans text-base font-bold">
              Sadržaj
            </h2>
            <ol className="mt-2 space-y-1">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                  <a href={`#${h.id}`} className="link">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="mt-6 text-[1.0625rem] leading-relaxed sm:text-lg">
          <RichText data={g.body} />
        </div>
        {g.relatedIngredients.length > 0 && (
          <section aria-labelledby="namirnice" className="mt-10">
            <h2 id="namirnice" className="text-2xl font-semibold">
              Povezane namirnice
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.relatedIngredients.map((i) => (
                <li key={i.slug}>
                  {i.publicPage ? (
                    <Link href={`/namirnice/${i.slug}/`} className="chip">
                      {i.name}
                    </Link>
                  ) : (
                    <Link href={`/recepti/?sastojci=${i.slug}`} className="chip">
                      Recepti s namirnicom: {i.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {recipes.length > 0 && (
        <section aria-labelledby="recepti" className="mt-12">
          <h2 id="recepti" className="text-2xl font-semibold">
            Recepti uz ovaj vodič
          </h2>
          <div className="mt-5">
            <CardGrid cols={3}>
              {recipes.map((r) => (
                <li key={r.id}>
                  <RecipeCard recipe={r} />
                </li>
              ))}
            </CardGrid>
          </div>
        </section>
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: g.title,
          description: g.answer,
          url,
          image: g.shareImage ? [absolute(g.shareImage.url)] : undefined,
          datePublished: g.publishedAt,
          dateModified: g.contentUpdatedAt,
          author: g.authors.map((a) => ({ '@type': a.isTeam ? 'Organization' : 'Person', name: a.name })),
          publisher: { '@type': 'Organization', name: settings.organizationName || settings.siteName },
        }}
      />
    </article>
  )
}
