import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Cake,
  Carrot,
  Cherry,
  Coffee,
  Croissant,
  CupSoda,
  Drumstick,
  Layers,
  Moon,
  Salad,
  Soup,
  UtensilsCrossed,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, typeof Cake> = {
  'slatki-recepti': Cake,
  'glavna-jela': Drumstick,
  palacinke: Layers,
  'pite-i-peciva': Croissant,
  'supe-i-corbe': Soup,
  salate: Salad,
  'predjela-i-prilozi': Carrot,
  zimnica: Cherry,
  napici: CupSoda,
}
import { getHomeData } from '@/data/home'
import { getSiteSettings } from '@/data/site'
import { SearchBox } from '@/components/layout/SearchBox'
import { RecipeCard, RecipeRow, CardGrid } from '@/components/recipe/RecipeCard'
import { RecentlyViewed } from '@/components/recipe/RecentlyViewed'
import { SectionHead, quickIcon } from '@/components/ui/Section'
import { JsonLd } from '@/components/seo/JsonLd'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { PantryHero } from '@/components/pantry/PantryHero'
import { pageMeta, absolute } from '@/lib/seo/meta'

export const revalidate = 3600

const MEAL_ICONS = { dorucak: Coffee, rucak: Soup, vecera: Moon } as const
const MEAL_HINTS = {
  dorucak: 'jaja, peciva, kaše',
  rucak: 'glavna jela i supe',
  vecera: 'lagano i brzo',
} as const

function recipesWord(n: number) {
  return n % 10 === 1 && n % 100 !== 11
    ? 'recept'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
      ? 'recepta'
      : 'recepata'
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    ...pageMeta({ title: `${s.siteName} — domaći recepti`, description: s.description, path: '/' }),
    title: { absolute: `${s.siteName} — domaći recepti` },
  }
}

export default async function HomePage() {
  const [d, settings] = await Promise.all([getHomeData(), getSiteSettings()])
  const [bigFeatured, ...featuredList] = d.featured.cards

  return (
    <>
      {/* 1. Šta danas kuhamo? */}
      <section aria-labelledby="hero-naslov" className="border-b border-line bg-cream">
        <div className="container-page grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow eyebrow-line">Srce naše kuhinje</p>
            <h1
              id="hero-naslov"
              className="mt-4 text-[2.4rem] font-semibold leading-[1.08] sm:text-[3.2rem]"
            >
              {d.hero.title}
            </h1>
            {d.hero.text && <p className="mt-4 max-w-lg text-lg text-muted">{d.hero.text}</p>}
            <div className="mt-6 max-w-xl">
              <SearchBox
                id="pretraga-pocetna"
                large
                label="Naziv jela ili namirnice"
                placeholder="npr. piletina krompir, palačinke…"
              />
            </div>
            {d.meals.length > 0 && (
              <nav aria-label="Izbor obroka" className="mt-6">
                <ul className="grid grid-cols-3 gap-2 sm:gap-3">
                  {d.meals.map((m) => {
                    const Icon = MEAL_ICONS[m.key]
                    return (
                      <li key={m.key}>
                        <Link
                          href={`/${m.key}/`}
                          className="ring-logo card-stripes group flex h-full flex-col items-start gap-2 rounded-2xl bg-white p-3 pt-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 sm:p-4 sm:pt-5"
                        >
                          <span className="icon-soft h-9 w-9 sm:h-10 sm:w-10">
                            <Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
                          </span>
                          <span className="font-serif text-lg font-semibold leading-tight group-hover:text-bordo sm:text-xl">
                            {m.title}
                          </span>
                          <span className="hidden text-sm text-muted sm:block">
                            {MEAL_HINTS[m.key]}
                          </span>
                          <span className="text-xs font-semibold text-muted sm:text-sm">
                            {m.count} {recipesWord(m.count)}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            )}
          </div>
          <div className="lg:pl-4">
            <PantryHero
              title={d.pantry?.title ?? 'Šta imate u frižideru?'}
              text={
                d.pantry?.text ||
                'Upišite namirnice koje imate — pokazat ćemo šta možete skuhati i šta eventualno nedostaje.'
              }
              quick={d.pantry?.ingredients ?? []}
            />
          </div>
        </div>
        {d.quickLinks.length > 0 && (
          <nav
            aria-label={d.quickLinks.length ? 'Brzi izbor' : undefined}
            className="container-page pb-10"
          >
            <ul className="card-stripes grid overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-4">
              {d.quickLinks.map((l) => {
                const Icon = quickIcon(l.label)
                return (
                  <li
                    key={l.href}
                    className="border-line [&:not(:last-child)]:border-b sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:[&:not(:last-child)]:border-r"
                  >
                    <Link
                      href={l.href}
                      className="group flex min-h-16 items-center gap-3 px-5 py-4 font-semibold hover:bg-soft hover:text-bordo"
                    >
                      <span className="icon-soft h-9 w-9 shrink-0">
                        <Icon aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" />
                      </span>
                      <span className="flex-1">{l.label}</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 text-muted group-hover:text-brand"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </section>

      {/* 3. Danas izdvajamo */}
      {bigFeatured && (
        <section aria-labelledby="izdvajamo" className="section">
          <div className="container-page">
            <SectionHead
              id="izdvajamo"
              eyebrow="Odabrano za vas"
              title="Danas izdvajamo"
              href="/recepti/"
              linkLabel="Svi recepti"
            />
            <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
              <RecipeCard recipe={bigFeatured} size="large" priority badge="Danas izdvajamo" />
              {featuredList.length > 0 && (
                <ul className="flex flex-col gap-4">
                  {featuredList.map((c) => (
                    <li key={c.id}>
                      <RecipeRow recipe={c} />
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/sta-danas-kuhati/"
                      className="flex items-center justify-between rounded-2xl border border-dashed border-[#d9c9c0] px-5 py-4 font-semibold hover:border-brand hover:text-bordo"
                    >
                      Ne znate šta kuhati? Krenite od namirnica koje imate
                      <ArrowRight aria-hidden="true" className="h-4 w-4 text-brand" />
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Kategorije */}
      {d.categories && d.categories.items.length > 0 && (
        <section aria-labelledby="kategorije" className="section bg-cream">
          <div className="container-page">
            <SectionHead
              id="kategorije"
              eyebrow="Recepti"
              title={d.categories.title}
              href="/recepti/"
              linkLabel="Svi recepti"
            />
            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {d.categories.items.map((c, i) =>
                c.image ? (
                  <li key={c.slug} className="group relative overflow-hidden rounded-2xl bg-sand">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={c.image.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading={i < 4 ? 'eager' : 'lazy'}
                      />
                      <div
                        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="absolute inset-x-0 bottom-0 p-3 font-serif text-lg font-semibold leading-tight text-white sm:p-4 sm:text-xl">
                      <Link
                        href={`/kategorije/${c.slug}/`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {c.name}
                      </Link>
                      <span className="mt-0.5 block font-sans text-sm font-normal text-white/85">
                        {c.count} {recipesWord(c.count)}
                      </span>
                    </h3>
                  </li>
                ) : (
                  <li
                    key={c.slug}
                    className="ring-logo card-stripes group relative flex flex-col rounded-2xl bg-white p-4 pt-6 sm:p-5 sm:pt-7"
                  >
                    {(() => {
                      const Icon = CATEGORY_ICONS[c.slug] ?? UtensilsCrossed
                      return (
                        <span className="icon-soft h-11 w-11">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                      )
                    })()}
                    <h3 className="mt-3 font-serif text-lg font-semibold leading-tight sm:text-xl">
                      <Link
                        href={`/kategorije/${c.slug}/`}
                        className="after:absolute after:inset-0 after:content-[''] group-hover:text-bordo"
                      >
                        {c.name}
                      </Link>
                    </h3>
                    {c.intro && (
                      <p className="mt-1 line-clamp-2 text-[0.9rem] text-muted">{c.intro}</p>
                    )}
                    <p className="mt-auto pt-2 text-sm font-semibold text-muted">
                      {c.count} {recipesWord(c.count)}
                    </p>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      )}

      {/* 5. Sa naše Facebook stranice */}
      {d.facebook.cards.length > 0 && (
        <section aria-labelledby="facebook" className="section">
          <div className="container-page">
            <SectionHead
              id="facebook"
              eyebrow="Sa naše Facebook stranice"
              title="Nedavno smo podijelili"
              text={d.facebook.text}
              href={settings.facebookUrl ?? undefined}
              linkLabel="Pratite nas na Facebooku"
            />
            <div className="mt-7">
              <CardGrid cols={3}>
                {d.facebook.cards.map((c) => (
                  <li key={c.id}>
                    <RecipeCard recipe={c} />
                  </li>
                ))}
              </CardGrid>
            </div>
          </div>
        </section>
      )}

      {/* 7. Nešto slatko */}
      {d.sweet.cards.length > 0 && (
        <section aria-labelledby="slatko" className="section bg-cream">
          <div className="container-page">
            <SectionHead
              id="slatko"
              eyebrow="Za desert"
              title={d.sweet.title}
              href="/kategorije/slatki-recepti/"
              linkLabel="Svi slatki recepti"
            />
            <div className="mt-7">
              <CardGrid cols={4}>
                {d.sweet.cards.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <RecipeCard recipe={c} />
                  </li>
                ))}
              </CardGrid>
            </div>
          </div>
        </section>
      )}

      {/* 8. U sezoni */}
      {d.season && (
        <section aria-labelledby="sezona" className="section">
          <div className="container-page">
            <div className="grid overflow-hidden rounded-3xl border border-line bg-sand md:grid-cols-2">
              <div className="relative min-h-64 bg-soft">
                {d.season.collection.image ? (
                  <Image
                    src={d.season.collection.image.url}
                    alt={d.season.collection.image.alt}
                    fill
                    sizes="(min-width: 768px) 600px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="eyebrow">U sezoni</p>
                <h2
                  id="sezona"
                  className="mt-2 text-[1.9rem] font-semibold leading-tight sm:text-[2.3rem]"
                >
                  {d.season.title}
                </h2>
                <p className="mt-3 text-muted">{d.season.collection.intro}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/ideje/${d.season.collection.slug}/`} className="btn btn-primary">
                    Pogledajte recepte <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  {d.season.guide && (
                    <Link href={`/savjeti/${d.season.guide.slug}/`} className="btn btn-secondary">
                      {d.season.guide.title}
                    </Link>
                  )}
                </div>
                {d.season.cards.length > 0 && (
                  <ul className="mt-6 space-y-1.5 border-t border-[#e3d6c8] pt-4 text-[0.95rem]">
                    {d.season.cards.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/recepti/${c.slug}/`}
                          className="inline-flex items-center gap-2 hover:text-bordo"
                        >
                          <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-brand" />{' '}
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. Najnoviji recepti */}
      {d.latest.cards.length > 0 && (
        <section aria-labelledby="najnovije" className="section pt-0">
          <div className="container-page">
            <SectionHead
              id="najnovije"
              eyebrow="Svježe na stranici"
              title={d.latest.title}
              href="/recepti/"
              linkLabel="Pregled svih recepata"
            />
            <div className="mt-7">
              <CardGrid cols={3}>
                {d.latest.cards.map((c) => (
                  <li key={c.id}>
                    <RecipeCard recipe={c} />
                  </li>
                ))}
              </CardGrid>
            </div>
            <div className="mt-10">
              <RecentlyViewed />
            </div>
          </div>
        </section>
      )}

      {/* 10. Savjeti iz kuhinje */}
      {d.guides.items.length > 0 && (
        <section aria-labelledby="savjeti" className="section bg-cream">
          <div className="container-page">
            <SectionHead
              id="savjeti"
              eyebrow="Savjeti iz kuhinje"
              title={d.guides.title}
              href="/savjeti/"
              linkLabel="Svi savjeti"
            />
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              {d.guides.items[0] && (
                <article className="group relative overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative aspect-[16/9] bg-soft">
                    {d.guides.items[0].cardImage ? (
                      <Image
                        src={d.guides.items[0].cardImage.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 580px, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-2xl font-semibold">
                      <Link
                        href={`/savjeti/${d.guides.items[0].slug}/`}
                        className="after:absolute after:inset-0 group-hover:text-bordo"
                      >
                        {d.guides.items[0].title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-muted">{d.guides.items[0].answer}</p>
                  </div>
                </article>
              )}
              <ul className="divide-y divide-line">
                {d.guides.items.slice(1).map((g) => (
                  <li key={g.slug} className="group relative py-5 first:pt-0">
                    <p className="eyebrow text-[0.68rem]">Vodič</p>
                    <h3 className="mt-1 flex items-start justify-between gap-4 font-serif text-xl font-semibold">
                      <Link
                        href={`/savjeti/${g.slug}/`}
                        className="after:absolute after:inset-0 group-hover:text-bordo"
                      >
                        {g.title}
                      </Link>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="mt-1 h-5 w-5 shrink-0 text-brand"
                      />
                    </h3>
                    <p className="mt-1 line-clamp-2 text-muted">{g.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 11. Facebook zajednica */}
      {d.community && (
        <section aria-labelledby="zajednica" className="pt-14">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-white px-6 py-8 shadow-[var(--shadow-card)] lg:flex-row lg:items-center sm:px-10">
              <div>
                <p className="eyebrow">Zajednica</p>
                <h2 id="zajednica" className="mt-2 text-[1.75rem] font-semibold">
                  {d.community.title}
                </h2>
                <p className="mt-1 max-w-xl text-muted">{d.community.text}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:shrink-0">
                <a href={d.community.url} className="btn btn-primary" rel="noopener">
                  Facebook stranica <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
                {settings.facebookGroupUrl && (
                  <a href={settings.facebookGroupUrl} className="btn btn-heart" rel="noopener">
                    Pridružite se grupi
                  </a>
                )}
                <Link href="/moji-recepti/" className="btn btn-ghost">
                  Pošaljite svoj recept
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              '@id': `${absolute('/')}#website`,
              name: settings.siteName,
              url: absolute('/'),
              inLanguage: 'bs',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${absolute('/recepti/')}?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'Organization',
              '@id': `${absolute('/')}#organization`,
              name: settings.organizationName || settings.siteName,
              url: absolute('/'),
              logo: absolute('/brand/logo-kvadrat.jpg'),
              sameAs: settings.facebookUrl ? [settings.facebookUrl] : undefined,
            },
          ],
        }}
      />
    </>
  )
}
