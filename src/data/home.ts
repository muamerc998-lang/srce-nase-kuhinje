import { unstable_cache } from './cache'
import type { HomePage } from '@/payload-types'
import { payloadClient } from './payload'
import { getCardsByIds, getFacebookCards, getLatestCards } from './recipes'
import { getCategories, getSiteSettings, getFacetStats, getMealPages } from './site'
import { getCollection, getGuides, getGuide } from './content'
import type { RecipeCard } from './mappers'

const idOf = (x: unknown): number | null => (x == null ? null : typeof x === 'object' ? (x as { id: number }).id : (x as number))
const slugOf = (x: unknown): string | null => (x && typeof x === 'object' ? ((x as { slug?: string }).slug ?? null) : null)

/**
 * Sastavlja početnu prema uredničkim postavkama. Recept se ne ponavlja u
 * glavnim sekcijama; sekcija bez dovoljno sadržaja se izostavlja.
 */
export const getHomeData = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const [home, settings, categories] = await Promise.all([
      payload.findGlobal({ slug: 'home-page', depth: 1 }) as Promise<HomePage>,
      getSiteSettings(),
      getCategories(),
    ])
    // Izdvojeni (glavni izbor) se ne ponavljaju nigdje. Facebook i urednički
    // slatki izbor isključuju samo izdvojene; automatske sekcije (sezona, najnovije)
    // izbjegavaju sve što je već prikazano.
    const featuredUsed = new Set<number>()
    const shown = new Set<number>()
    const take = (cards: RecipeCard[], n: number, exclude: Set<number>, mark?: Set<number>) => {
      const out: RecipeCard[] = []
      for (const c of cards) {
        if (out.length >= n) break
        if (exclude.has(c.id) || out.some((o) => o.id === c.id)) continue
        out.push(c)
        mark?.add(c.id)
        shown.add(c.id)
      }
      return out
    }
    const now = Date.now()

    // 3. Danas izdvajamo
    const featuredIds = (home.featured?.items ?? [])
      .filter((it) => (!it.startsAt || Date.parse(it.startsAt) <= now) && (!it.endsAt || Date.parse(it.endsAt) >= now))
      .map((it) => idOf(it.recipe))
      .filter((x): x is number => x != null)
    const featured = home.featured?.enabled ? take(await getCardsByIds(featuredIds), 4, new Set(), featuredUsed) : []

    // 5. Facebook
    const fbCount = Math.min(6, Math.max(4, home.facebook?.count ?? 6))
    const facebook = home.facebook?.enabled ? take(await getFacebookCards(fbCount + 6), fbCount, featuredUsed) : []

    // 7. Nešto slatko
    const sweetIds = (home.sweet?.recipes ?? []).map(idOf).filter((x): x is number => x != null)
    const sweet = home.sweet?.enabled ? take(await getCardsByIds(sweetIds), 6, featuredUsed) : []

    // 8. Sezona
    const seasonSlug = slugOf(home.season?.collection)
    const seasonCollection = home.season?.enabled && seasonSlug ? await getCollection(seasonSlug) : null
    const seasonCards = seasonCollection ? take(await getCardsByIds(seasonCollection.recipeIds), 3, featuredUsed) : []
    const seasonGuideSlug = slugOf(home.season?.guide)
    const seasonGuide = home.season?.enabled && seasonGuideSlug ? await getGuide(seasonGuideSlug) : null

    // 9. Najnovije
    const latest = home.latest?.enabled ? take(await getLatestCards(24), 6, new Set(shown)) : []

    // 10. Vodiči
    const chosenGuides = (home.guides?.items ?? []).map(slugOf).filter(Boolean) as string[]
    const allGuides = await getGuides(12)
    const guides = home.guides?.enabled
      ? (chosenGuides.length ? chosenGuides.map((s) => allGuides.find((g) => g.slug === s)).filter(Boolean) : allGuides)
          .filter((g) => g && g.slug !== seasonGuide?.slug)
          .slice(0, 3)
      : []

    // 4. Kategorije
    const chosenCats = (home.categories?.items ?? []).map(idOf).filter((x): x is number => x != null)
    const cats = (chosenCats.length ? chosenCats.map((id) => categories.find((c) => c.id === id)) : categories.filter((c) => !c.parentId))
      .filter((c): c is NonNullable<typeof c> => !!c && c.count > 0)

    const rawLinks = home.quickLinks?.enabled
      ? (home.quickLinks.links ?? [])
          .map((l) => {
            const href =
              l.targetType === 'collection' && slugOf(l.collection)
                ? `/ideje/${slugOf(l.collection)}/`
                : l.targetType === 'category' && slugOf(l.category)
                  ? `/kategorije/${slugOf(l.category)}/`
                  : null
            return href ? { label: l.label, href } : null
          })
          .filter((x): x is { label: string; href: string } => !!x)
          .filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i)
      : []
    // Kolekcije ispod praga broja recepata se ne linkuju.
    const quickLinks = (
      await Promise.all(
        rawLinks.map(async (l) => {
          const m = l.href.match(/^\/(?:kolekcije|ideje)\/([^/]+)\/$/)
          return !m || (await getCollection(m[1])) ? l : null
        }),
      )
    ).filter((l): l is { label: string; href: string } => !!l)

    const [stats, mealPages] = await Promise.all([getFacetStats(), getMealPages()])
    const meals = (['dorucak', 'rucak', 'vecera'] as const)
      .map((k) => ({ key: k, title: mealPages[k].title, image: mealPages[k].image, count: stats.counts[`o:${k}`] ?? 0 }))
      .filter((m) => m.count > 0)

    const pantryIngredients = (home.pantry?.quickIngredients ?? [])
      .map((i) => (i && typeof i === 'object' ? { name: i.name, slug: i.slug ?? '' } : null))
      .filter((x): x is { name: string; slug: string } => !!x)

    return {
      hero: {
        title: home.hero?.title || 'Šta danas pripremamo?',
        text: home.hero?.text ?? '',
        image: home.hero?.image && typeof home.hero.image === 'object' ? home.hero.image : null,
      },
      quickLinks,
      meals,
      featured: { title: home.featured?.title || 'Danas izdvajamo', cards: featured },
      categories: home.categories?.enabled ? { title: home.categories.title || 'Recepti po kategorijama', items: cats } : null,
      facebook: { title: home.facebook?.title || 'Sa naše Facebook stranice', text: home.facebook?.text ?? '', cards: facebook.length >= 4 ? facebook : [] },
      pantry:
        home.pantry?.enabled
          ? { title: home.pantry.title || 'Šta imate u kuhinji?', text: home.pantry.text ?? '', ingredients: pantryIngredients }
          : null,
      sweet: { title: home.sweet?.title || 'Nešto slatko', cards: sweet.length >= 4 ? sweet : [] },
      season: seasonCollection && (seasonCards.length || seasonGuide) ? { title: home.season?.title || 'U sezoni', collection: seasonCollection, cards: seasonCards, guide: seasonGuide } : null,
      latest: { title: home.latest?.title || 'Najnoviji recepti', cards: latest },
      guides: { title: home.guides?.title || 'Savjeti iz kuhinje', items: guides as NonNullable<(typeof guides)[number]>[] },
      community: home.community?.enabled && settings.facebookUrl ? { title: home.community.title || '', text: home.community.text ?? '', url: settings.facebookUrl } : null,
    }
  },
  ['home-data'],
  { tags: ['home-page', 'recipes', 'guides', 'recipe-collections', 'categories', 'site-settings'], revalidate: 3600 },
)
