import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCollections } from '@/data/content'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return pageMeta({
    title: 'Ideje i kolekcije recepata',
    description: 'Urednički izbori recepata po obroku, prilici, namirnici i vremenu: šta skuhati danas i kako odabrati.',
    path: '/ideje/',
  })
}

export default async function IdeasIndex() {
  const items = (await getCollections()).filter((c) => !c.isDemo || process.env.NODE_ENV !== 'production')
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Ideje', href: '/ideje/' }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">Ideje i kolekcije</h1>
        <p className="mt-2 text-lg text-muted">Kada ne znate šta pripremiti: izbori recepata po obroku, prilici i vremenu, uz kratko objašnjenje zašto baš oni.</p>
      </header>
      {items.length === 0 ? (
        <p className="mt-8 text-muted">Prve ideje će uskoro biti objavljene.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.slug} className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/3] bg-soft">
                {c.cardImage ? (
                  <Image src={c.cardImage.url} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-serif text-xl font-semibold">
                  <Link href={`/ideje/${c.slug}/`} className="after:absolute after:inset-0 hover:text-bordo">
                    {c.article.headline || c.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-muted">{c.intro}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
