import Link from 'next/link'
import { X } from 'lucide-react'
import {
  serializeSearchState,
  hasActiveFilters,
  METHOD_OPTIONS,
  DIET_OPTIONS,
  DIFFICULTY_OPTIONS,
  MEAL_OPTIONS,
  TIME_OPTIONS,
  type SearchState,
} from '@/lib/search/params'
import type { SearchResult } from '@/data/search'
import { getCategories, getIngredientRegistry, getFacetStats, getTagRegistry } from '@/data/site'
import { RecipeCard, CardGrid } from '../recipe/RecipeCard'
import { Pagination } from '../ui/Navigation'
import { FilterPanel, SortSelect, type FilterOptions } from './FilterPanel'
import { AdSlot } from '../recipe/RecipeSections'

type Chip = { label: string; href: string }

async function buildChips(state: SearchState, basePath: string): Promise<Chip[]> {
  const [cats, ings, tags] = await Promise.all([getCategories(), getIngredientRegistry(), getTagRegistry()])
  const chips: Chip[] = []
  const href = (patch: Partial<SearchState>) => `${basePath}${serializeSearchState({ ...state, ...patch, stranica: 1 })}`
  if (state.q) chips.push({ label: `Pretraga: „${state.q}“`, href: href({ q: '' }) })
  for (const s of state.kategorija)
    chips.push({ label: cats.find((c) => c.slug === s)?.name ?? s, href: href({ kategorija: state.kategorija.filter((x) => x !== s) }) })
  const both = state.sastojci.length > 1 ? (state.sastojciNacin === 'bilo' ? ' (bilo koja)' : ' (sve)') : ''
  for (const s of state.sastojci)
    chips.push({ label: `Sa: ${ings.find((i) => i.slug === s)?.name ?? s}${both}`, href: href({ sastojci: state.sastojci.filter((x) => x !== s) }) })
  for (const s of state.bez) chips.push({ label: `Bez: ${ings.find((i) => i.slug === s)?.name ?? s}`, href: href({ bez: state.bez.filter((x) => x !== s) }) })
  if (state.vrijeme) chips.push({ label: `Do ${state.vrijeme < 60 ? `${state.vrijeme} min` : `${state.vrijeme / 60} h`}`, href: href({ vrijeme: null }) })
  for (const s of state.metoda)
    chips.push({ label: METHOD_OPTIONS.find((m) => m.value === s)?.label ?? s, href: href({ metoda: state.metoda.filter((x) => x !== s) }) })
  for (const s of state.tezina)
    chips.push({ label: DIFFICULTY_OPTIONS.find((m) => m.value === s)?.label ?? s, href: href({ tezina: state.tezina.filter((x) => x !== s) }) })
  for (const s of state.obrok)
    chips.push({ label: MEAL_OPTIONS.find((m) => m.value === s)?.label ?? s, href: href({ obrok: state.obrok.filter((x) => x !== s) }) })
  if (state.meso) chips.push({ label: state.meso === 'da' ? 'S mesom' : 'Bez mesa', href: href({ meso: null }) })
  for (const s of state.oznaka) chips.push({ label: tags.find((t) => t.slug === s)?.name ?? s, href: href({ oznaka: state.oznaka.filter((x) => x !== s) }) })
  for (const s of state.ishrana)
    chips.push({ label: DIET_OPTIONS.find((m) => m.value === s)?.label ?? s, href: href({ ishrana: state.ishrana.filter((x) => x !== s) }) })
  return chips
}

export async function buildFilterOptions(
  groups: FilterOptions['groups'],
  opts: { withinCategoryId?: number } = {},
): Promise<FilterOptions> {
  const [cats, ings, stats, tagReg] = await Promise.all([getCategories(), getIngredientRegistry(), getFacetStats(), getTagRegistry()])
  const visible = cats.filter((c) => c.count > 0)
  const ordered: FilterOptions['categories'] = []
  const add = (parentId: number | null, depth: number) => {
    for (const c of visible.filter((x) => x.parentId === parentId)) {
      if (opts.withinCategoryId && c.id === opts.withinCategoryId) continue
      ordered.push({ slug: c.slug, name: c.name, count: c.count, depth })
      add(c.id, depth + 1)
    }
  }
  if (opts.withinCategoryId) add(opts.withinCategoryId, 0)
  else add(null, 0)
  const ingredients = ings
    .map((i) => ({ slug: i.slug, name: i.name, count: stats.counts[`i:${i.id}`] ?? 0 }))
    .filter((i) => i.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'bs'))
    .slice(0, 80)
    .sort((a, b) => a.name.localeCompare(b.name, 'bs'))
  return {
    categories: ordered,
    ingredients,
    methods: METHOD_OPTIONS,
    difficulties: DIFFICULTY_OPTIONS,
    diets: DIET_OPTIONS,
    meals: MEAL_OPTIONS,
    times: TIME_OPTIONS,
    tags: tagReg
      .map((t) => ({ slug: t.slug, name: t.name, group: t.group, count: stats.counts[`t:${t.id}`] ?? 0 }))
      .filter((t) => t.count > 0 && t.group !== 'ostalo'),
    groups: ordered.length ? groups : groups.filter((g) => g !== 'kategorija'),
  }
}

export async function ArchiveView({
  state,
  result,
  basePath,
  options,
  scope,
  adsEnabled = false,
  emptyHint,
}: {
  state: SearchState
  result: SearchResult
  basePath: string
  options: FilterOptions
  scope?: string
  adsEnabled?: boolean
  emptyHint?: React.ReactNode
}) {
  const chips = await buildChips(state, basePath)
  const filtered = hasActiveFilters(state)
  const n = result.total
  const resultsLabel = `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'recept' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'recepta' : 'recepata'}`

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
        <FilterPanel state={state} options={options} action={basePath} total={n} activeCount={chips.length} scope={scope} />
      </aside>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="font-semibold">
            {filtered ? `Pronađeno: ${resultsLabel}` : resultsLabel}
          </p>
          <SortSelect state={state} action={basePath} />
        </div>
        {chips.length > 0 && (
          <div className="mt-3">
            <h2 className="sr-only">Aktivni uslovi</h2>
            <ul className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="chip bg-soft" aria-label={`Ukloni uslov: ${c.label}`}>
                    {c.label}
                    <X aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </li>
              ))}
              {chips.length > 1 && (
                <li>
                  <Link href={basePath} className="chip">
                    Ukloni sve
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}

        {result.cards.length === 0 ? (
          <div className="mt-8 rounded-xl border border-line bg-cream p-6">
            <h2 className="text-xl font-semibold">Nema recepata za odabrane uslove</h2>
            <p className="mt-2 text-muted">Pokušajte ukloniti neki od uslova iznad ili proširite pretragu.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {state.q && (state.kategorija.length || state.sastojci.length || state.vrijeme || state.metoda.length) ? (
                <li>
                  <Link className="chip" href={`/recepti/${serializeSearchState({ q: state.q })}`}>
                    Traži „{state.q}“ bez filtera
                  </Link>
                </li>
              ) : null}
              {state.vrijeme && (
                <li>
                  <Link className="chip" href={`${basePath}${serializeSearchState({ ...state, vrijeme: null, stranica: 1 })}`}>
                    Bez ograničenja vremena
                  </Link>
                </li>
              )}
              {state.sastojci.length > 1 && state.sastojciNacin === 'sve' && (
                <li>
                  <Link className="chip" href={`${basePath}${serializeSearchState({ ...state, sastojciNacin: 'bilo', stranica: 1 })}`}>
                    Bilo koja od odabranih namirnica
                  </Link>
                </li>
              )}
              <li>
                <Link className="chip" href="/recepti/">
                  Svi recepti
                </Link>
              </li>
            </ul>
            {emptyHint}
          </div>
        ) : (
          <div className="mt-6">
            <CardGrid>
              {result.cards.map((c, i) => (
                <li key={c.id} className={adsEnabled && i === 6 ? 'contents' : undefined}>
                  {adsEnabled && i === 6 ? (
                    <>
                      <div className="col-span-full">
                        <AdSlot slot="archive-inline" enabled />
                      </div>
                      <RecipeCard recipe={c} priority={i < 3} headingLevel={2} />
                    </>
                  ) : (
                    <RecipeCard recipe={c} priority={i < 3} headingLevel={2} />
                  )}
                </li>
              ))}
            </CardGrid>
          </div>
        )}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          hrefFor={(p) => `${basePath}${serializeSearchState({ ...state, stranica: p })}`}
        />
      </div>
    </div>
  )
}

/** Archive je indeksabilan samo bez filtera, pretrage i nestandardnog sortiranja. */
export function archiveIsIndexable(state: SearchState) {
  return !hasActiveFilters(state) && state.sort === 'najnovije'
}
