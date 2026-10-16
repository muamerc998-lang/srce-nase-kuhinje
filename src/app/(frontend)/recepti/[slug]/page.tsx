import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { draftMode, headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  getRecipe,
  getRecipeDraft,
  getRelatedCards,
  getApprovedComments,
  getCardsByIds,
  type RecipeView,
} from '@/data/recipes'
import { getRedirect } from '@/data/content'
import { getSiteSettings } from '@/data/site'
import { payloadClient } from '@/data/payload'
import { Breadcrumbs, DemoNotice, type Crumb } from '@/components/ui/Navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { RecipeCard, RecipeRow, CardGrid } from '@/components/recipe/RecipeCard'
import { RecipeProvider } from '@/components/recipe/RecipeContext'
import { IngredientsPanel } from '@/components/recipe/IngredientsPanel'
import { CookingMode } from '@/components/recipe/CookingMode'
import { RecipeActions, MobileRecipeBar, RecentTracker } from '@/components/recipe/RecipeActions'
import {
  RecipeFacts,
  StepsList,
  TipsBlock,
  FaqBlock,
  RelatedGuides,
  AdSlot,
} from '@/components/recipe/RecipeSections'
import { CommentForm, CorrectionForm } from '@/components/forms/Forms'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { recipeJsonLd } from '@/lib/seo/jsonld'
import { absolute, formatDate, pageMeta } from '@/lib/seo/meta'
import { formToken } from '@/lib/forms/protect'

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return [] // stranice se generišu pri prvom posjetu i keširaju (ISR)
}

type Props = { params: Promise<{ slug: string }> }

async function load(slug: string): Promise<{ recipe: RecipeView | null; preview: boolean }> {
  const dm = await draftMode()
  if (dm.isEnabled) {
    // Draft pregled samo za prijavljene korisnike CMS-a
    const payload = await payloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (user?.collection === 'users') return { recipe: await getRecipeDraft(slug), preview: true }
  }
  return { recipe: await getRecipe(slug), preview: false }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { recipe } = await load(slug)
  if (!recipe) return { title: 'Recept nije pronađen', robots: { index: false } }
  const settings = await getSiteSettings()
  const meta = pageMeta({
    title: recipe.seo.title || recipe.title,
    description: recipe.seo.description || recipe.summary,
    path: `/recepti/${recipe.slug}/`,
    image: recipe.shareImage,
    type: 'article',
    noindex: !!recipe.seo.noindex || recipe.isDemo || recipe.status !== 'published',
    publishedTime: recipe.publishedAt,
    modifiedTime: recipe.contentUpdatedAt,
  })
  return settings.facebookUrl
    ? { ...meta, other: { 'article:publisher': settings.facebookUrl } }
    : meta
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params
  const { recipe, preview } = await load(slug)
  if (!recipe) {
    const redirect = await getRedirect(`/recepti/${slug}/`)
    if (redirect && redirect.type === '301') permanentRedirect(redirect.to)
    notFound()
  }

  const settings = await getSiteSettings()
  const [related, community] = await Promise.all([
    getRelatedCards(recipe.id, recipe.relatedRecipeIds, recipe.primaryCategoryId, recipe.facetKeys),
    getApprovedComments(recipe.id),
  ])
  const servedWith = recipe.servedWithIds.length
    ? await getCardsByIds(recipe.servedWithIds.filter((id) => id !== recipe.id))
    : []
  const canonical = absolute(`/recepti/${recipe.slug}/`)
  const saveTarget = {
    uid: recipe.uid,
    slug: recipe.slug,
    title: recipe.title,
    image: recipe.image?.url ?? null,
  }
  const crumbs: Crumb[] = []
  if (recipe.parentCategory)
    crumbs.push({
      name: recipe.parentCategory.name,
      href: `/kategorije/${recipe.parentCategory.slug}/`,
    })
  if (recipe.category)
    crumbs.push({ name: recipe.category.name, href: `/kategorije/${recipe.category.slug}/` })
  crumbs.push({ name: recipe.title, href: `/recepti/${recipe.slug}/` })
  const adsOn = (slot: string) => settings.ads.enabled && settings.ads.slots.includes(slot)
  const token = formToken()
  const showRatings = settings.features.ratings

  return (
    <article className="pb-8">
      <RecipeProvider
        recipe={{
          uid: recipe.uid,
          slug: recipe.slug,
          title: recipe.title,
          image: recipe.image?.url ?? null,
          baseServings: recipe.yield.servings,
          yieldUnit: recipe.yield.unit,
          scalable: recipe.yield.scalable,
          groups: recipe.ingredientGroups,
          stepGroups: recipe.stepGroups,
        }}
      >
        <div className="container-page pt-5">
          {preview && (
            <p className="no-print mb-4 rounded-lg bg-ink px-4 py-3 text-white">
              Pregled prije objave (status: {recipe.status === 'published' ? 'objavljeno' : 'draft'}
              ).{' '}
              <Link href="/api/site/preview/exit/" prefetch={false} className="underline">
                Izađi iz pregleda
              </Link>
            </p>
          )}
          <Breadcrumbs items={crumbs} />
          {recipe.isDemo && (
            <div className="mt-4">
              <DemoNotice what="Ovaj recept" />
            </div>
          )}

          <div className="mt-5 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
            <header>
              <p className="print-only text-sm">{canonical}</p>
              {recipe.category && <p className="eyebrow">{recipe.category.name}</p>}
              <h1 className="mt-2 text-[2.1rem] font-semibold leading-[1.1] sm:text-[2.8rem]">
                {recipe.title}
              </h1>
              <p className="mt-3 text-lg text-muted">{recipe.summary}</p>
              <p className="mt-3 text-[0.95rem] text-muted">
                {recipe.authors.length > 0 && (
                  <>
                    Priprema:{' '}
                    {recipe.authors.map((a, i) => (
                      <span key={a.slug}>
                        {i > 0 && ', '}
                        <Link
                          href={`/autori/#${a.slug}`}
                          className="font-semibold text-ink hover:text-brand"
                        >
                          {a.name}
                        </Link>
                      </span>
                    ))}
                    {' · '}
                  </>
                )}
                {recipe.guestAuthor && (
                <>
                  Recept čitaoca: <strong className="text-ink">{recipe.guestAuthor.name}</strong>{' · '}
                </>
              )}
                Ažurirano:{' '}
                <time dateTime={recipe.contentUpdatedAt ?? undefined}>
                  {formatDate(recipe.contentUpdatedAt)}
                </time>
                {community.rating && showRatings && (
                  <>
                    {' · '}
                    <a href="#iskustva" className="hover:text-brand">
                      Ocjena {String(community.rating.average).replace('.', ',')} od 5 (
                      {community.rating.count})
                    </a>
                  </>
                )}
              </p>
              <div className="mt-5">
                <RecipeActions recipe={saveTarget} canonical={canonical} />
              </div>
            </header>
            <div className="print-photo relative aspect-[4/3] overflow-hidden rounded-3xl bg-soft shadow-[var(--shadow-card)]">
              {recipe.image ? (
                <Image
                  src={recipe.image.url}
                  alt={recipe.image.alt}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                  style={{
                    objectPosition: `${recipe.image.focalX ?? 50}% ${recipe.image.focalY ?? 50}%`,
                  }}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          </div>

          <div className="mt-6">
            <RecipeFacts recipe={recipe} />
          </div>
          <AdSlot slot="recipe-after-facts" enabled={adsOn('recipe-after-facts')} />

          {recipe.beforeYouStart && (
            <aside
              className="avoid-break mt-6 rounded-xl border-l-4 border-brand bg-soft px-5 py-4"
              aria-label="Prije početka"
            >
              <p>
                <strong>Prije početka:</strong> {recipe.beforeYouStart}
              </p>
            </aside>
          )}

          <div
            id="recept"
            className="recipe-columns mt-8 grid scroll-mt-24 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <div className="rounded-3xl border border-line bg-cream p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
              <IngredientsPanel />
            </div>
            <section aria-labelledby="priprema-naslov" id="priprema" className="scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="priprema-naslov" className="text-2xl font-semibold">
                  Priprema
                </h2>
                <CookingMode />
              </div>
              <div className="mt-5">
                <StepsList recipe={recipe} />
              </div>
            </section>
          </div>

          <AdSlot slot="recipe-after-steps" enabled={adsOn('recipe-after-steps')} />

          <div className="mt-12 grid max-w-3xl gap-10">
            <TipsBlock title="Savjeti" items={recipe.tips} />
            <TipsBlock title="Zamjene" items={recipe.substitutions} />
            {recipe.storage && (
              <section aria-labelledby="cuvanje" className="avoid-break">
                <h2 id="cuvanje" className="text-2xl font-semibold">
                  Čuvanje
                </h2>
                <p className="mt-3">{recipe.storage}</p>
              </section>
            )}
            {(servedWith.length > 0 || recipe.leftovers.text) && (
              <section aria-labelledby="uz-jelo" className="no-print">
                {servedWith.length > 0 && (
                  <>
                    <p className="eyebrow">Kompletan obrok</p>
                    <h2 id="uz-jelo" className="mt-1 text-2xl font-semibold">
                      Šta poslužiti uz ovo?
                    </h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {servedWith.map((c) => (
                        <li key={c.id}>
                          <RecipeRow recipe={c} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {recipe.leftovers.text && (
                  <div className="mt-5 rounded-2xl border border-line bg-sand px-5 py-4">
                    <h3
                      id={servedWith.length ? undefined : 'uz-jelo'}
                      className="font-sans text-base font-bold"
                    >
                      Ostalo vam je?
                    </h3>
                    <p className="mt-1">{recipe.leftovers.text}</p>
                    {(recipe.leftovers.recipe || recipe.leftovers.guide) && (
                      <p className="mt-2 flex flex-wrap gap-x-4">
                        {recipe.leftovers.recipe && (
                          <Link
                            href={`/recepti/${recipe.leftovers.recipe.slug}/`}
                            className="link font-semibold"
                          >
                            {recipe.leftovers.recipe.title}
                          </Link>
                        )}
                        {recipe.leftovers.guide && (
                          <Link
                            href={`/savjeti/${recipe.leftovers.guide.slug}/`}
                            className="link font-semibold"
                          >
                            {recipe.leftovers.guide.title}
                          </Link>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
            <FaqBlock faq={recipe.faq} />
            <RelatedGuides guides={recipe.relatedGuides} />
          </div>

          {related.length > 0 && (
            <section aria-labelledby="povezani" className="no-print mt-14">
              <h2 id="povezani" className="text-2xl font-semibold">
                Možda vam se svidi i
              </h2>
              <div className="mt-5">
                <CardGrid cols={4}>
                  {related.map((r) => (
                    <li key={r.id}>
                      <RecipeCard recipe={r} />
                    </li>
                  ))}
                </CardGrid>
              </div>
            </section>
          )}

          <section
            aria-labelledby="iskustva"
            id="iskustva"
            className="no-print mt-14 grid scroll-mt-24 gap-10 lg:grid-cols-2"
          >
            <div>
              <h2 id="iskustva-naslov" className="text-2xl font-semibold">
                Iskustva i pitanja čitalaca
              </h2>
              {showRatings && (
                <p className="mt-2 text-muted">
                  {community.rating
                    ? `Prosječna ocjena ${String(community.rating.average).replace('.', ',')} od 5 (${community.rating.count} ${community.rating.count === 1 ? 'ocjena' : 'ocjena'}).`
                    : 'Još nema ocjena.'}
                </p>
              )}
              {community.comments.length === 0 ? (
                <p className="mt-4 text-muted">
                  Još nema objavljenih iskustava. Budite prvi koji će podijeliti kako je recept
                  uspio.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {community.comments.map((c) => (
                    <li key={c.id} className="rounded-xl border border-line p-4">
                      <p className="font-semibold">
                        {c.name}
                        <span className="font-normal text-muted">
                          {' · '}
                          {c.kind === 'pitanje' ? 'pitanje' : 'iskustvo'} ·{' '}
                          {formatDate(c.createdAt)}
                          {c.rating && showRatings ? ` · ocjena ${c.rating}/5` : ''}
                        </span>
                      </p>
                      <p className="mt-2 whitespace-pre-line">{c.text}</p>
                      {c.reply && (
                        <p className="mt-3 rounded-lg bg-soft p-3">
                          <strong>Uredništvo:</strong> {c.reply}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-8">
              {settings.features.comments && recipe.status === 'published' && (
                <div>
                  <h3 className="text-xl font-semibold">
                    Podijelite iskustvo ili postavite pitanje
                  </h3>
                  <div className="mt-4">
                    <CommentForm
                      recipeUid={recipe.uid}
                      token={token}
                      ratingsEnabled={showRatings}
                    />
                  </div>
                </div>
              )}
              {settings.facebookGroupUrl && (
                <p className="text-[0.95rem] text-muted">
                  Napravili ste ovo jelo? Fotografiju možete podijeliti i u našoj{' '}
                  <a href={settings.facebookGroupUrl} className="link" rel="noopener">
                    Facebook grupi
                  </a>
                  .
                </p>
              )}
              {settings.features.corrections && recipe.status === 'published' && (
                <details className="rounded-xl border border-line p-4">
                  <summary className="min-h-11 cursor-pointer content-center font-semibold">
                    Prijavi grešku u receptu
                  </summary>
                  <div className="mt-4">
                    <CorrectionForm recipeUid={recipe.uid} token={token} />
                  </div>
                </details>
              )}
            </div>
          </section>
        </div>
        <MobileRecipeBar recipe={saveTarget} />
        <RecentTracker recipe={saveTarget} />
      </RecipeProvider>
      <JsonLd
        data={recipeJsonLd({
          url: canonical,
          title: recipe.title,
          summary: recipe.summary,
          images: [recipe.image, recipe.shareImage].filter(Boolean).map((i) => absolute(i!.url)),
          authors: recipe.authors,
          organizationName: settings.organizationName || settings.siteName,
          publishedAt: recipe.publishedAt,
          updatedAt: recipe.contentUpdatedAt,
          times: recipe.times,
          yieldText: recipe.yield.servings ? `${recipe.yield.servings} ${recipe.yield.unit}` : null,
          category: recipe.category?.name,
          ingredientGroups: recipe.ingredientGroups,
          stepGroups: recipe.stepGroups,
          keywords: recipe.tags,
          rating: showRatings ? community.rating : null,
        })}
      />
    </article>
  )
}
