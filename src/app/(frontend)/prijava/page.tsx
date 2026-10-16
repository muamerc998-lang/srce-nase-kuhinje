import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getMember } from '@/lib/members/session'
import { formToken } from '@/lib/forms/protect'
import { AuthForms } from '@/components/forms/MemberForms'
import { pageMeta } from '@/lib/seo/meta'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMeta({ title: 'Prijava', description: 'Prijavite se i pošaljite svoj recept.', path: '/prijava/', noindex: true })

export default async function LoginPage() {
  if (await getMember()) redirect('/moji-recepti/')
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Recepti čitalaca</p>
        <h1 className="mt-2 text-[2.2rem] font-semibold">Podijelite svoj recept</h1>
        <p className="mt-3 text-muted">
          Napravite račun, pošaljite recept s fotografijom i pričom. Uredništvo pregleda svaki recept, a najbolje izdvajamo na našoj Facebook
          stranici i u grupi.
        </p>
      </div>
      <div className="mt-8">
        <AuthForms token={formToken()} />
      </div>
      <p className="mx-auto mt-6 max-w-md text-center text-sm text-muted">
        Za čuvanje recepata u Mojoj kuharici račun nije potreban.
      </p>
    </div>
  )
}
