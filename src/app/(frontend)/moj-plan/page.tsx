import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { Plan } from '@/components/local/Plan'
import { pageMeta } from '@/lib/seo/meta'

export const metadata: Metadata = pageMeta({
  title: 'Moj plan',
  description: 'Plan do sedam recepata s porcijama i danima, iz kojeg se pravi lista za kupovinu.',
  path: '/moj-plan/',
  noindex: true,
})

export default function PlanPage() {
  return (
    <div className="container-page min-h-[75vh] pt-5">
      <Breadcrumbs items={[{ name: 'Moj plan', href: '/moj-plan/' }]} />
      <h1 className="mt-4 text-[2rem] font-semibold sm:text-[2.4rem]">Moj plan</h1>
      <p className="mt-2 max-w-3xl text-lg text-muted">Odaberite do sedam recepata, po želji im dodijelite dan i napravite listu za kupovinu.</p>
      <noscript>
        <p className="mt-4 rounded-lg bg-warning-bg p-4 text-warning-ink">Plan radi uz uključen JavaScript.</p>
      </noscript>
      <Plan />
    </div>
  )
}
