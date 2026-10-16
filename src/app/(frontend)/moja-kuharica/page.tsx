import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { Cookbook } from '@/components/local/Cookbook'
import { pageMeta } from '@/lib/seo/meta'

export const metadata: Metadata = pageMeta({
  title: 'Moja kuharica',
  description: 'Vaši sačuvani recepti i privatne kolekcije, čuvani u ovom pregledniku.',
  path: '/moja-kuharica/',
  noindex: true,
})

export default function CookbookPage() {
  return (
    <div className="container-page min-h-[75vh] pt-5">
      <Breadcrumbs items={[{ name: 'Moja kuharica', href: '/moja-kuharica/' }]} />
      <h1 className="mt-4 text-[2rem] font-semibold sm:text-[2.4rem]">Moja kuharica</h1>
      <p className="mt-2 max-w-3xl text-lg text-muted">
        Recepti koje ste sačuvali srcem. Čuvaju se samo u ovom pregledniku — bez računa i bez slanja na server.
      </p>
      <noscript>
        <p className="mt-4 rounded-lg bg-warning-bg p-4 text-warning-ink">Moja kuharica radi uz uključen JavaScript.</p>
      </noscript>
      <Cookbook />
    </div>
  )
}
