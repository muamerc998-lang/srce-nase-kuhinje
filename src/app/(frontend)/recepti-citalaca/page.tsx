import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getApprovedSubmissions } from '@/data/community'
import { getSiteSettings } from '@/data/site'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { formatDuration } from '@/lib/recipes/time'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const metadata: Metadata = pageMeta({
  title: 'Recepti čitalaca',
  description: 'Recepti koje su poslali čitaoci Srca naše kuhinje, odobreni od uredništva.',
  path: '/recepti-citalaca/',
  noindex: true,
})

export default async function ReaderRecipesPage() {
  const [items, settings] = await Promise.all([getApprovedSubmissions(), getSiteSettings()])
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Recepti čitalaca', href: '/recepti-citalaca/' }]} />
      <div className="mt-5 grid gap-6 rounded-3xl bg-wine p-7 text-white sm:p-10 md:grid-cols-[minmax(0,1.5fr)_auto] md:items-center">
        <div>
          <p className="eyebrow text-[#f3c7cc]">Iz vaših kuhinja</p>
          <h1 className="mt-2 text-[2.2rem] font-semibold text-white">Recepti čitalaca</h1>
          <p className="mt-2 max-w-xl text-white/85">
            Pošaljite svoj recept s fotografijom i pričom. Svaki recept pregleda uredništvo, a najbolje izdvajamo na Facebook stranici
            {settings.facebookGroupUrl ? ' i u grupi' : ''}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/moji-recepti/" className="btn bg-white text-bordo hover:bg-soft">
            Pošalji svoj recept
          </Link>
          {settings.facebookGroupUrl && (
            <a href={settings.facebookGroupUrl} className="btn border border-white/50 text-white hover:bg-white/10" rel="noopener">
              Facebook grupa
            </a>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <p className="mt-10 text-muted">Prvi recepti čitalaca uskoro stižu. Budite prvi koji će poslati svoj!</p>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <li key={s.id} className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/3] bg-soft">
                {s.cardImage ? <Image src={s.cardImage.url} alt="" fill sizes="(min-width: 1024px) 380px, 50vw" className="object-cover" /> : <ImagePlaceholder />}
                {s.featuredOnFacebook && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">Izdvojeno na Facebooku</span>
                )}
              </div>
              <div className="p-4">
                <p className="eyebrow text-[0.68rem]">Gostujući autor: {s.author?.name}</p>
                <h2 className="mt-1 font-serif text-xl font-semibold">
                  <Link href={`/recepti-citalaca/${s.id}/`} className="after:absolute after:inset-0 group-hover:text-bordo">
                    {s.title}
                  </Link>
                </h2>
                {s.totalMinutes && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                    <Clock aria-hidden="true" className="h-4 w-4 text-brand" /> {formatDuration(s.totalMinutes)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
