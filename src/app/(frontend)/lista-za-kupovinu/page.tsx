import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { ShoppingList } from '@/components/local/ShoppingList'
import { pageMeta } from '@/lib/seo/meta'

export const metadata: Metadata = pageMeta({
  title: 'Lista za kupovinu',
  description: 'Lista za kupovinu iz recepata i plana, uz ručno dodane stavke.',
  path: '/lista-za-kupovinu/',
  noindex: true,
})

export default function ShoppingPage() {
  return (
    <div className="container-page min-h-[75vh] pt-5">
      <Breadcrumbs items={[{ name: 'Lista za kupovinu', href: '/lista-za-kupovinu/' }]} />
      <h1 className="mt-4 text-[2rem] font-semibold sm:text-[2.4rem]">Lista za kupovinu</h1>
      <noscript>
        <p className="mt-4 rounded-lg bg-warning-bg p-4 text-warning-ink">Lista za kupovinu radi uz uključen JavaScript.</p>
      </noscript>
      <ShoppingList />
    </div>
  )
}
