'use client'
import { useActionState, useId, useState } from 'react'
import { loginMember, registerMember, submitMemberRecipe, updateProfile } from '@/app/(frontend)/clan-actions'
import type { FormState } from '@/app/(frontend)/actions'
import { Field, Hidden, Status, useToken } from './Forms'

const initial: FormState = { status: 'idle', message: '' }

export function AuthForms({ token }: { token: string }) {
  const [tab, setTab] = useState<'prijava' | 'registracija'>('prijava')
  const [loginState, loginAction, loginPending] = useActionState(loginMember, initial)
  const [regState, regAction, regPending] = useActionState(registerMember, initial)
  const t = useToken(token)
  return (
    <div className="card mx-auto max-w-md p-6 sm:p-8">
      <div role="tablist" aria-label="Prijava ili registracija" className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
        {(['prijava', 'registracija'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-11 rounded-full font-semibold ${tab === k ? 'bg-brand text-white' : 'text-ink hover:text-brand'}`}
          >
            {k === 'prijava' ? 'Prijava' : 'Novi račun'}
          </button>
        ))}
      </div>
      {tab === 'prijava' ? (
        <form action={loginAction} className="relative mt-6 space-y-4" noValidate>
          <Field name="email" label="Email" type="email" state={loginState} required autoComplete="email" maxLength={120} />
          <Field name="password" label="Lozinka" type="password" state={loginState} required autoComplete="current-password" maxLength={128} />
          <Status state={loginState} />
          <button type="submit" className="btn btn-primary w-full" disabled={loginPending}>
            {loginPending ? 'Prijavljujem…' : 'Prijavi se'}
          </button>
        </form>
      ) : (
        <form action={regAction} className="relative mt-6 space-y-4" noValidate>
          <Hidden token={t} />
          <Field name="displayName" label="Ime za prikaz" state={regState} required autoComplete="nickname" maxLength={60} hint="Ovo ime se prikazuje uz vaše objavljene recepte." />
          <Field name="email" label="Email" type="email" state={regState} required autoComplete="email" maxLength={120} hint="Ne objavljuje se." />
          <Field name="password" label="Lozinka" type="password" state={regState} required autoComplete="new-password" maxLength={128} hint="Najmanje 8 znakova." />
          <Status state={regState} />
          <button type="submit" className="btn btn-primary w-full" disabled={regPending}>
            {regPending ? 'Pravim račun…' : 'Napravi račun'}
          </button>
        </form>
      )}
    </div>
  )
}

export function ProfileForm({ displayName, bio }: { displayName: string; bio: string }) {
  const [state, action, pending] = useActionState(updateProfile, { ...initial, values: { displayName, bio } })
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field name="displayName" label="Ime za prikaz" state={state} required maxLength={60} />
      <Field name="bio" label="Kratko predstavljanje" state={state} textarea maxLength={600} hint="Nekoliko rečenica o vama i vašoj kuhinji — prikazuje se uz objavljene recepte." />
      <Status state={state} />
      <button type="submit" className="btn btn-secondary" disabled={pending}>
        {pending ? 'Čuvam…' : 'Sačuvaj profil'}
      </button>
    </form>
  )
}

export function SubmitRecipeForm({ token, categories }: { token: string; categories: Array<{ id: number; name: string }> }) {
  const [state, action, pending] = useActionState(submitMemberRecipe, initial)
  const t = useToken(token)
  const id = useId()
  return (
    <form action={action} className="relative space-y-5" key={state.status === 'ok' ? 'ok' : 'form'} noValidate>
      <Hidden token={t} />
      <Field name="title" label="Naziv recepta" state={state} required maxLength={120} />
      <Field name="story" label="Priča uz recept" state={state} textarea maxLength={3000} hint="Odakle je recept, za koje prilike ga pravite, savjeti iz vašeg iskustva." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="servings" label="Porcije" type="number" state={state} />
        <Field name="totalMinutes" label="Ukupno vrijeme (min)" type="number" state={state} />
        <div>
          <label htmlFor={`${id}-kat`} className="label">
            Kategorija <span className="font-normal text-muted">(opcionalno)</span>
          </label>
          <select id={`${id}-kat`} name="category" className="field" defaultValue={state.values?.category ?? ''}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field name="ingredients" label="Sastojci" state={state} required textarea maxLength={4000} hint="Jedan sastojak po redu, npr. „500 g brašna“." />
      <Field name="steps" label="Priprema" state={state} required textarea maxLength={8000} hint="Jedan korak po redu." />
      <div>
        <label htmlFor={`${id}-slika`} className="label">
          Fotografija <span className="font-normal text-muted">(opcionalno)</span>
        </label>
        <p className="mb-1 text-sm text-muted">JPG, PNG ili WebP do 8 MB. Pošaljite samo vlastitu fotografiju jela.</p>
        <input id={`${id}-slika`} name="image" type="file" accept="image/jpeg,image/png,image/webp" className="field py-2" />
        {state.errors?.image && <p className="mt-1 text-sm font-semibold text-brand">{state.errors.image}</p>}
      </div>
      <Status state={state} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Šaljem…' : 'Pošalji recept na odobrenje'}
      </button>
      <p className="text-sm text-muted">Uredništvo pregleda svaki recept prije objave. Slanjem potvrđujete da je recept i fotografija vaša.</p>
    </form>
  )
}
