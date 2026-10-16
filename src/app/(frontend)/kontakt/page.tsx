import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Navigation'
import { ContactForm } from '@/components/forms/Forms'
import { getPage } from '@/data/content'
import { RichText } from '@/components/content/RichText'
import { formToken } from '@/lib/forms/protect'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export const metadata: Metadata = pageMeta({
  title: 'Kontakt',
  description: 'Pošaljite poruku uredništvu portala Srce naše kuhinje.',
  path: '/kontakt/',
})

export default async function ContactPage() {
  const page = await getPage('kontakt')
  return (
    <div className="container-page pt-5">
      <Breadcrumbs items={[{ name: 'Kontakt', href: '/kontakt/' }]} />
      <h1 className="mt-4 text-[2rem] font-semibold sm:text-[2.4rem]">Kontakt</h1>
      {page?.body ? (
        <div className="mt-3 max-w-2xl">
          <RichText data={page.body} />
        </div>
      ) : (
        <p className="mt-2 max-w-2xl text-lg text-muted">
          Imate pitanje, prijedlog ili ste pronašli grešku? Pišite nam. Za pitanje o konkretnom receptu najbrže je koristiti obrazac na stranici
          recepta.
        </p>
      )}
      <p className="mt-2 max-w-2xl text-sm text-muted">Poruke nisu javne i čuva ih uredništvo u administraciji sajta.</p>
      <div className="mt-6">
        <ContactForm token={formToken()} />
      </div>
    </div>
  )
}
