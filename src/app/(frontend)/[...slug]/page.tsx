import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPage, getPageDraft, getRedirect } from '@/data/content'
import { payloadClient, isProduction } from '@/data/payload'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { RichText } from '@/components/content/RichText'
import { pageMeta, formatDate } from '@/lib/seo/meta'

/**
 * Informativne stranice (/o-nama/, /privatnost/ …) i sve nepoznate putanje.
 * Nepostojeće putanje prvo provjeravaju tabelu preusmjerenja, inače 404.
 */
export const revalidate = 3600
export async function generateStaticParams() {
  return [] // generiše se pri prvom posjetu (ISR)
}
type Props = { params: Promise<{ slug: string[] }> }

async function load(segments: string[]) {
  if (segments.length !== 1) return null
  const slug = segments[0]
  if ((await draftMode()).isEnabled) {
    const { user } = await (await payloadClient()).auth({ headers: await headers() })
    if (user?.collection === 'users') return getPageDraft(slug)
  }
  return getPage(slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await load(slug)
  if (!page) return { title: 'Stranica nije pronađena', robots: { index: false } }
  return pageMeta({
    title: page.seo.title || page.title,
    description: page.seo.description,
    path: `/${page.slug}/`,
    noindex: page.needsEditorInput || !!page.seo.noindex,
  })
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params
  const page = await load(slug)
  if (!page) {
    const r = await getRedirect(`/${slug.join('/')}/`)
    if (r?.type === '301') permanentRedirect(r.to)
    notFound()
  }
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: page.title, href: `/${page.slug}/` }]} />
      <article className="mx-auto mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">{page.title}</h1>
        {page.needsEditorInput && !isProduction() && (
          <p className="mt-4 rounded-lg border border-[#e9d48a] bg-warning-bg px-4 py-3 text-warning-ink">
            <strong>Potrebna urednička dopuna.</strong> Tekst nije konačan i ne smije se objaviti u produkciji dok se ne dopune stvarni podaci.
          </p>
        )}
        <div className="mt-4 text-[1.0625rem] leading-relaxed">
          <RichText data={page.body} />
        </div>
        <p className="mt-8 text-sm text-muted">Posljednja izmjena: {formatDate(page.updatedAt)}</p>
      </article>
    </div>
  )
}
