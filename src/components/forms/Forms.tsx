'use client'
import { useActionState, useEffect, useId, useState } from 'react'
import { submitComment, submitContact, submitCorrection, type FormState } from '@/app/(frontend)/actions'

const initial: FormState = { status: 'idle', message: '' }

/** Svjež vremenski žeton (stranica može biti keširana; bez JS-a koristi se žeton iz HTML-a). */
export function useToken(fallback: string) {
  const [token, setToken] = useState(fallback)
  useEffect(() => {
    fetch('/api/site/form-token/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.token && setToken(d.token))
      .catch(() => {})
  }, [])
  return token
}

export function Hidden({ token }: { token: string }) {
  return (
    <>
      <input type="hidden" name="token" value={token} />
      {/* honeypot: ljudima skriveno, botovi ga popune */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Web stranica (ostavite prazno)
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  )
}

export function Status({ state }: { state: FormState }) {
  if (state.status === 'idle') return null
  return (
    <p
      role={state.status === 'error' ? 'alert' : 'status'}
      className={`rounded-lg px-4 py-3 ${state.status === 'ok' ? 'bg-[#e8f5ec] text-success' : 'bg-soft text-bordo'}`}
    >
      {state.message}
    </p>
  )
}

export function Field({
  name,
  label,
  state,
  type = 'text',
  required = false,
  textarea = false,
  hint,
  autoComplete,
  maxLength,
}: {
  name: string
  label: string
  state: FormState
  type?: string
  required?: boolean
  textarea?: boolean
  hint?: string
  autoComplete?: string
  maxLength?: number
}) {
  const id = useId()
  const err = state.errors?.[name]
  const describedBy = [hint ? `${id}-hint` : '', err ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name,
    required,
    maxLength,
    defaultValue: state.values?.[name] ?? '',
    'aria-invalid': err ? true : undefined,
    'aria-describedby': describedBy,
    className: `field ${err ? 'border-brand' : ''}`,
  }
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {!required && <span className="font-normal text-muted">(opcionalno)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mb-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {textarea ? <textarea {...common} rows={5} /> : <input {...common} type={type} autoComplete={autoComplete} />}
      {err && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-brand">
          {err}
        </p>
      )}
    </div>
  )
}

export function CommentForm({ recipeUid, token, ratingsEnabled }: { recipeUid: string; token: string; ratingsEnabled: boolean }) {
  const [state, action, pending] = useActionState(submitComment, initial)
  const t = useToken(token)
  // nakon uspjeha forma se prazni (key)
  return (
    <form action={action} className="relative space-y-4" key={state.status === 'ok' ? 'ok' : 'form'} noValidate>
      <Hidden token={t} />
      <input type="hidden" name="recipe" value={recipeUid} />
      <fieldset>
        <legend className="label">Vrsta poruke</legend>
        <div className="flex flex-wrap gap-4">
          {[
            ['iskustvo', 'Iskustvo s receptom'],
            ['pitanje', 'Pitanje'],
          ].map(([v, l]) => (
            <label key={v} className="inline-flex min-h-11 items-center gap-2">
              <input type="radio" name="kind" value={v} defaultChecked={(state.values?.kind ?? 'iskustvo') === v} className="h-5 w-5 accent-[var(--color-brand)]" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      {ratingsEnabled && (
        <fieldset>
          <legend className="label">
            Ocjena <span className="font-normal text-muted">(opcionalno, samo uz iskustvo)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {['', '1', '2', '3', '4', '5'].map((v) => (
              <label key={v} className="chip cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-soft">
                <input type="radio" name="rating" value={v} defaultChecked={(state.values?.rating ?? '') === v} className="h-4 w-4 accent-[var(--color-brand)]" />
                {v === '' ? 'Bez ocjene' : `${v} od 5`}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <Field name="name" label="Ime" state={state} required autoComplete="given-name" maxLength={60} />
      <Field
        name="email"
        label="Email"
        type="email"
        state={state}
        autoComplete="email"
        hint="Ne objavljuje se. Potreban samo ako želite odgovor emailom."
        maxLength={120}
      />
      <Field name="text" label="Poruka" state={state} required textarea maxLength={2000} />
      <Status state={state} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Šaljem…' : 'Pošalji'}
      </button>
      <p className="text-sm text-muted">Poruke se objavljuju tek nakon uredničkog pregleda.</p>
    </form>
  )
}

export function CorrectionForm({ recipeUid, token }: { recipeUid: string; token: string }) {
  const [state, action, pending] = useActionState(submitCorrection, initial)
  const t = useToken(token)
  return (
    <form action={action} className="relative space-y-4" key={state.status === 'ok' ? 'ok' : 'form'} noValidate>
      <Hidden token={t} />
      <input type="hidden" name="recipe" value={recipeUid} />
      <Field name="message" label="Šta nije u redu?" state={state} required textarea maxLength={3000} hint="Npr. pogrešna količina, nejasan korak ili vrijeme pečenja." />
      <Field name="email" label="Email" type="email" state={state} autoComplete="email" hint="Samo ako želite da vam se javimo." maxLength={120} />
      <Status state={state} />
      <button type="submit" className="btn btn-secondary" disabled={pending}>
        {pending ? 'Šaljem…' : 'Pošalji prijavu'}
      </button>
    </form>
  )
}

export function ContactForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(submitContact, initial)
  const t = useToken(token)
  return (
    <form action={action} className="relative max-w-xl space-y-4" key={state.status === 'ok' ? 'ok' : 'form'} noValidate>
      <Hidden token={t} />
      <Field name="name" label="Ime" state={state} required autoComplete="name" maxLength={80} />
      <Field name="email" label="Email" type="email" state={state} required autoComplete="email" maxLength={120} />
      <Field name="subject" label="Naslov" state={state} required maxLength={120} />
      <Field name="message" label="Poruka" state={state} required textarea maxLength={5000} />
      <Status state={state} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Šaljem…' : 'Pošalji poruku'}
      </button>
    </form>
  )
}
