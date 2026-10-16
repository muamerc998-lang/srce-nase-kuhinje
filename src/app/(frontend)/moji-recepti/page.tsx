import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMember } from '@/lib/members/session'
import { getOwnSubmissions } from '@/data/community'
import { getCategories, getSiteSettings } from '@/data/site'
import { formToken } from '@/lib/forms/protect'
import { absolute, formatDate, pageMeta } from '@/lib/seo/meta'
import { ProfileForm, SubmitRecipeForm } from '@/components/forms/MemberForms'
import { ShareLinks } from '@/components/community/ShareLinks'
import { logoutMember } from '../clan-actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMeta({ title: 'Moji recepti', path: '/moji-recepti/', noindex: true })

const STATUS: Record<string, { label: string; cls: string }> = {
  'na-cekanju': { label: 'Čeka odobrenje', cls: 'bg-warning-bg text-warning-ink' },
  odobreno: { label: 'Objavljeno', cls: 'bg-[#e8f5ec] text-success' },
  odbijeno: { label: 'Nije odobreno', cls: 'bg-soft text-bordo' },
}

export default async function MyRecipesPage() {
  const member = await getMember()
  if (!member) redirect('/prijava/')
  const [subs, cats, settings] = await Promise.all([getOwnSubmissions(member.id), getCategories(), getSiteSettings()])
  const topCats = cats.filter((c) => !c.parentId).map((c) => ({ id: c.id, name: c.name }))

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Moj profil</p>
          <h1 className="mt-2 text-[2.2rem] font-semibold">Zdravo, {member.displayName}</h1>
        </div>
        <form action={logoutMember}>
          <button type="submit" className="btn btn-ghost">
            Odjava
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="novi" className="card p-5 sm:p-7">
          <h2 id="novi" className="text-2xl font-semibold">
            Pošalji novi recept
          </h2>
          <div className="mt-5">
            <SubmitRecipeForm token={formToken()} categories={topCats} />
          </div>
        </section>
        <div className="space-y-8">
          <section aria-labelledby="poslani" className="card p-5 sm:p-6">
            <h2 id="poslani" className="text-xl font-semibold">
              Moji poslani recepti
            </h2>
            {subs.length === 0 ? (
              <p className="mt-3 text-muted">Još niste poslali nijedan recept.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {subs.map((s) => (
                  <li key={s.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{s.title}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">Poslano: {formatDate(s.createdAt)}</p>
                    {s.featuredOnFacebook && <p className="mt-2 text-sm font-semibold text-brand">Izdvojeno na našoj Facebook stranici i u grupi</p>}
                    {s.editorNote && (
                      <p className="mt-2 rounded-lg bg-cream px-3 py-2 text-sm">
                        <strong>Uredništvo:</strong> {s.editorNote}
                      </p>
                    )}
                    {s.status === 'odobreno' && (
                      <div className="mt-3 space-y-2">
                        <Link href={`/recepti-citalaca/${s.id}/`} className="link text-sm font-semibold">
                          Otvori javnu stranicu
                        </Link>
                        <ShareLinks url={absolute(`/recepti-citalaca/${s.id}/`)} title={s.title} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="profil" className="card p-5 sm:p-6">
            <h2 id="profil" className="text-xl font-semibold">
              Predstavljanje
            </h2>
            <div className="mt-4">
              <ProfileForm displayName={member.displayName} bio={member.bio ?? ''} />
            </div>
          </section>
          {settings.facebookGroupUrl && (
            <section className="rounded-2xl bg-wine p-5 text-white">
              <p className="font-semibold">Volite kuhati s drugima?</p>
              <p className="mt-1 text-white/85">U našoj Facebook grupi članovi dijele recepte, slike i savjete.</p>
              <a href={settings.facebookGroupUrl} className="mt-3 inline-block font-semibold text-[#ffd9dd] underline" rel="noopener">
                Pridružite se grupi
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
