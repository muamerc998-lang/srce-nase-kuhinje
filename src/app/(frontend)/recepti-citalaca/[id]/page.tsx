import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getApprovedSubmission } from '@/data/community'
import { getSiteSettings } from '@/data/site'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { ShareLinks } from '@/components/community/ShareLinks'
import { formatDuration } from '@/lib/recipes/time'
import { absolute, formatDate, pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export async function generateStaticParams() {
  return []
}
type Props = { params: Promise<{ id: string }> }

async function load(id: string) {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? getApprovedSubmission(n) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await load((await params).id)
  if (!s) return { title: 'Recept nije pronađen', robots: { index: false } }
  // Recepti čitalaca nisu u indeksu dok ih uredništvo ne preradi u redovan recept.
  return pageMeta({ title: s.title, description: s.story?.slice(0, 160) ?? `Recept čitaoca: ${s.title}`, path: `/recepti-citalaca/${s.id}/`, image: s.image, noindex: true })
}

export default async function ReaderRecipePage({ params }: Props) {
  const s = await load((await params).id)
  if (!s) notFound()
  const settings = await getSiteSettings()
  const url = absolute(`/recepti-citalaca/${s.id}/`)
  return (
    <article className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Recepti čitalaca', href: '/recepti-citalaca/' }, { name: s.title, href: `/recepti-citalaca/${s.id}/` }]} />
      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:items-center">
        <header>
          <p className="eyebrow">Recept čitaoca</p>
          <h1 className="mt-2 text-[2.1rem] font-semibold leading-tight sm:text-[2.6rem]">{s.title}</h1>
          <p className="mt-3 text-muted">
            Poslao/la: <strong className="text-ink">{s.author?.name}</strong> · {formatDate(s.createdAt)}
            {s.totalMinutes ? ` · ${formatDuration(s.totalMinutes)}` : ''}
            {s.servings ? ` · ${s.servings} porc.` : ''}
          </p>
          {s.featuredOnFacebook && (
            <p className="mt-3 inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white">Izdvojeno na stranici Srce naše kuhinje</p>
          )}
          <div className="mt-5">
            <ShareLinks url={url} title={s.title} />
          </div>
        </header>
        {s.image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={s.image.url} alt={s.image.alt} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        )}
      </div>
      {s.story && <p className="mt-8 max-w-3xl whitespace-pre-line text-lg">{s.story}</p>}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="sastojci" className="rounded-3xl border border-line bg-cream p-6">
          <h2 id="sastojci" className="text-2xl font-semibold">
            Sastojci
          </h2>
          <ul className="mt-4 space-y-2">
            {s.ingredients.map((x, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {x}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="priprema">
          <h2 id="priprema" className="text-2xl font-semibold">
            Priprema
          </h2>
          <ol className="mt-4 space-y-4">
            {s.steps.map((x, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-serif font-semibold text-white">
                  {i + 1}
                </span>
                <p className="pt-1">{x}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      {s.author?.bio && (
        <aside className="mt-10 max-w-3xl rounded-2xl border border-line p-5">
          <p className="eyebrow">Gostujući autor</p>
          <p className="mt-1 font-semibold">{s.author.name}</p>
          <p className="mt-1 text-muted">{s.author.bio}</p>
        </aside>
      )}
      <div className="mt-10 rounded-2xl bg-sand p-5">
        <p className="font-semibold">I vi imate recept koji vrijedi podijeliti?</p>
        <p className="mt-1 text-muted">
          <Link href="/moji-recepti/" className="link">
            Pošaljite ga uredništvu
          </Link>
          {settings.facebookGroupUrl && (
            <>
              {' '}ili ga podijelite u našoj{' '}
              <a href={settings.facebookGroupUrl} className="link" rel="noopener">
                Facebook grupi
              </a>
            </>
          )}
          .
        </p>
      </div>
    </article>
  )
}
