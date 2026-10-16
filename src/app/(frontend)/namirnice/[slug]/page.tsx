import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPublicIngredient, getRedirect } from '@/data/content'
import { Breadcrumbs, DemoNotice } from '@/components/ui/Navigation'
import { RecipeCard, CardGrid } from '@/components/recipe/RecipeCard'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export async function generateStaticParams() {
  return [] // generiše se pri prvom posjetu (ISR)
}
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const i = await getPublicIngredient(slug)
  if (!i) return { title: 'Namirnica nije pronađena', robots: { index: false } }
  return pageMeta({
    title: i.seo.title || `${i.name[0].toLocaleUpperCase('bs')}${i.name.slice(1)}: odabir, čuvanje i recepti`,
    description: i.seo.description || i.description || `Sve o namirnici ${i.name} i recepti u kojima se koristi.`,
    path: `/namirnice/${i.slug}/`,
    image: i.shareImage,
    noindex: !!i.seo.noindex || i.isDemo,
  })
}

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params
  const i = await getPublicIngredient(slug)
  if (!i) {
    const r = await getRedirect(`/namirnice/${slug}/`)
    if (r?.type === '301') permanentRedirect(r.to)
    notFound()
  }
  const title = `${i.name[0].toLocaleUpperCase('bs')}${i.name.slice(1)}`
  const sections = [
    ['Odabir i priprema', i.selection],
    ['Čuvanje', i.storage],
    ['Zamjene', i.substitutes],
  ].filter(([, v]) => v) as [string, string][]
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Namirnice', href: '/namirnice/' }, { name: title, href: `/namirnice/${i.slug}/` }]} />
      {i.isDemo && (
        <div className="mt-4">
          <DemoNotice what="Ova stranica namirnice" />
        </div>
      )}
      <div className="mt-5 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">{title}</h1>
          {i.synonyms.length > 0 && <p className="mt-1 text-muted">Poznato i kao: {i.synonyms.join(', ')}</p>}
          {i.description && <p className="mt-4 text-lg">{i.description}</p>}
          {sections.map(([h, t]) => (
            <section key={h} className="mt-6">
              <h2 className="text-2xl font-semibold">{h}</h2>
              <p className="mt-2">{t}</p>
            </section>
          ))}
          {i.guides.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Povezani vodiči</h2>
              <ul className="mt-3 space-y-2">
                {i.guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/savjeti/${g.slug}/`} className="link font-semibold">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {i.image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={i.image.url} alt={i.image.alt} fill priority sizes="(min-width: 768px) 460px, 100vw" className="object-cover" />
          </div>
        )}
      </div>
      {i.recipes.length > 0 && (
        <section aria-labelledby="recepti-namirnica" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="recepti-namirnica" className="text-2xl font-semibold">
              Recepti s namirnicom: {i.name}
            </h2>
            <Link href={`/recepti/?sastojci=${i.slug}`} className="link">
              Svi recepti s ovom namirnicom
            </Link>
          </div>
          <div className="mt-5">
            <CardGrid>
              {i.recipes.map((r) => (
                <li key={r.id}>
                  <RecipeCard recipe={r} />
                </li>
              ))}
            </CardGrid>
          </div>
        </section>
      )}
    </div>
  )
}
