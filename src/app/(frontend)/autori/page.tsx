import type { Metadata } from 'next'
import Image from 'next/image'
import { getAuthors } from '@/data/content'
import { Breadcrumbs, DemoNotice } from '@/components/ui/Navigation'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export const metadata: Metadata = pageMeta({
  title: 'Autori i uredništvo',
  description: 'Ko priprema i uređuje recepte na portalu Srce naše kuhinje.',
  path: '/autori/',
})

export default async function AuthorsPage() {
  const authors = await getAuthors()
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Autori i uredništvo', href: '/autori/' }]} />
      <h1 className="mt-4 text-[2rem] font-semibold sm:text-[2.4rem]">Autori i uredništvo</h1>
      {authors.length === 0 ? (
        <p className="mt-4 text-muted">Podaci o uredništvu bit će objavljeni uskoro.</p>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {authors.map((a) => (
            <li key={a.slug} id={a.slug} className="scroll-mt-24 rounded-xl border border-line p-5">
              {a.isDemo && (
                <div className="mb-3">
                  <DemoNotice what="Ovaj zapis o autoru" />
                </div>
              )}
              <div className="flex items-center gap-4">
                {a.image && <Image src={a.image.url} alt={a.image.alt} width={72} height={72} className="h-18 w-18 rounded-full object-cover" />}
                <div>
                  <h2 className="text-xl font-semibold">{a.name}</h2>
                  {a.role && <p className="text-muted">{a.role}</p>}
                </div>
              </div>
              {a.bio && <p className="mt-3">{a.bio}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
