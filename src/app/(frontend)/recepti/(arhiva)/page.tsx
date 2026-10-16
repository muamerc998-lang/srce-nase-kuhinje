import type { Metadata } from 'next'
import { parseSearchState, serializeSearchState } from '@/lib/search/params'
import { searchRecipes } from '@/data/search'
import { getSiteSettings } from '@/data/site'
import { ArchiveView, buildFilterOptions, archiveIsIndexable } from '@/components/archive/ArchiveView'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { SearchBox } from '@/components/layout/SearchBox'
import { pageMeta } from '@/lib/seo/meta'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const state = parseSearchState(await searchParams)
  const title = state.q ? `Pretraga: ${state.q}` : state.stranica > 1 ? `Svi recepti — stranica ${state.stranica}` : 'Svi recepti'
  return pageMeta({
    title,
    description: 'Pregled svih recepata s filterima po kategoriji, namirnicama, vremenu i težini.',
    path: `/recepti/${state.stranica > 1 && archiveIsIndexable(state) ? serializeSearchState({ stranica: state.stranica }) : ''}`,
    noindex: !archiveIsIndexable(state),
  })
}

export default async function RecipesPage({ searchParams }: Props) {
  const state = parseSearchState(await searchParams)
  const [result, options, settings] = await Promise.all([
    searchRecipes(state, {}),
    buildFilterOptions(['kategorija', 'obrok', 'meso', 'vrijeme', 'glavna', 'sastojci', 'bez', 'metoda', 'tijesto', 'tezina', 'ishrana']),
    getSiteSettings(),
  ])
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Recepti', href: '/recepti/' }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-[2rem] font-semibold sm:text-[2.4rem]">{state.q ? `Rezultati za „${state.q}“` : 'Svi recepti'}</h1>
        <p className="mt-2 text-lg text-muted">
          Pretražite po nazivu jela ili namirnici, pa suzite izbor filterima. Pretraga prepoznaje i nazive bez kvačica (npr. „cevapi“) i
          regionalne nazive (krompir/krumpir).
        </p>
        <div className="mt-4 max-w-xl" id="pretraga">
          <SearchBox id="pretraga-arhiva" defaultValue={state.q} large />
        </div>
      </header>
      <div className="mt-8">
        <ArchiveView
          state={state}
          result={result}
          basePath="/recepti/"
          options={options}
          adsEnabled={settings.ads.enabled && settings.ads.slots.includes('archive-inline')}
        />
      </div>
    </div>
  )
}
