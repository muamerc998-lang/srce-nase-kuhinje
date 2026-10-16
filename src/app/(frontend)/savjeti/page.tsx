import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getGuides } from '@/data/content'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return pageMeta({
    title: 'Savjeti iz kuhinje',
    description: 'Praktični vodiči: tehnike, namirnice i čuvanje hrane, jasno i bez suvišnog.',
    path: '/savjeti/',
  })
}

export default async function GuidesIndex() {
  const guides = await getGuides()
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Savjeti iz kuhinje', href: '/savjeti/' }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">Savjeti iz kuhinje</h1>
        <p className="mt-2 text-lg text-muted">Kratki praktični vodiči uz recepte: odmah odgovor, pa detalji.</p>
      </header>
      {guides.length === 0 ? (
        <p className="mt-8 text-muted">Vodiči će uskoro biti objavljeni.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <li key={g.slug} className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/3] bg-soft">
                {g.cardImage ? (
                  <Image src={g.cardImage.url} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-serif text-xl font-semibold">
                  <Link href={`/savjeti/${g.slug}/`} className="after:absolute after:inset-0 hover:text-bordo">
                    {g.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-muted">{g.answer}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
