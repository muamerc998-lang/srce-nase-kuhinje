'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, ShoppingBasket, Trash2 } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { planStore, shoppingStore, planSignature, DAYS, PLAN_LIMIT, type PlanEntry } from '@/lib/storage/stores'
import { announce } from '../ui/Announcer'
import { fetchRecipes, useRemoteRecipes } from './useRemoteRecipes'
import type { ShoppingSource } from '@/lib/shopping/merge'

/** Izvori liste iz plana (sastojci se dohvataju sa servera u trenutku pravljenja liste). */
export async function sourcesFromPlan(plan: PlanEntry[]): Promise<{ sources: ShoppingSource[]; missing: string[] }> {
  if (!plan.length) return { sources: [], missing: [] }
  const data = await fetchRecipes([...new Set(plan.map((p) => p.uid))], true)
  const byUid = new Map(data.recipes.map((r) => [r.card.uid, r]))
  const sources: ShoppingSource[] = []
  for (const p of plan) {
    const r = byUid.get(p.uid)
    if (!r) continue
    sources.push({
      id: `plan:${p.id}`,
      recipeId: p.uid,
      title: r.card.title,
      slug: r.card.slug,
      servings: p.servings,
      baseServings: r.scalable ? r.baseServings : null,
      origin: 'plan',
      lines: r.lines,
    })
  }
  return { sources, missing: data.missing }
}

export function Plan() {
  const plan = useStore(planStore)
  const hydrated = useHydrated()
  const remote = useRemoteRecipes(plan.map((p) => p.uid))
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (!hydrated) return <p className="mt-8 text-muted">Učitavam plan…</p>

  const update = (id: string, patch: Partial<PlanEntry>) => planStore.set((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const buildList = async () => {
    setBusy(true)
    try {
      const { sources, missing } = await sourcesFromPlan(plan)
      shoppingStore.set((s) => ({ ...s, sources: [...s.sources.filter((x) => x.origin !== 'plan'), ...sources], planSig: planSignature(plan) }))
      announce(missing.length ? `Lista je napravljena. ${missing.length} recept(a) više nije dostupno.` : 'Lista za kupovinu je napravljena iz plana.')
      router.push('/lista-za-kupovinu/')
    } catch {
      announce('Lista nije mogla biti napravljena — provjerite internet vezu i pokušajte ponovo.', { tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  if (plan.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-cream p-8 text-center">
        <CalendarDays aria-hidden="true" className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-2xl font-semibold">Plan je prazan</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Na stranici recepta odaberite broj porcija i kliknite „Dodaj u plan“. Plan prima do {PLAN_LIMIT} recepata; isti recept možete dodati više
          puta.
        </p>
        <Link href="/recepti/" className="btn btn-primary mt-5">
          Pronađite recepte
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <p className="font-semibold" role="status">
        U planu: {plan.length} od {PLAN_LIMIT}
      </p>
      <ol className="mt-4 space-y-3">
        {plan.map((e, idx) => {
          const missing = remote.missing.has(e.uid)
          return (
            <li key={e.id} className={`grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end ${missing ? 'border-dashed bg-cream' : 'border-line'}`}>
              <div>
                <span className="text-sm text-muted">{idx + 1}.</span>{' '}
                {missing ? (
                  <span className="font-semibold">
                    {e.title} <span className="font-normal text-muted">— recept više nije dostupan</span>
                  </span>
                ) : (
                  <Link href={`/recepti/${e.slug}/`} className="font-serif text-lg font-semibold hover:text-brand">
                    {e.title}
                  </Link>
                )}
              </div>
              <div>
                <label htmlFor={`dan-${e.id}`} className="block text-sm text-muted">
                  Dan
                </label>
                <select id={`dan-${e.id}`} className="field w-auto py-1.5" value={e.day ?? ''} onChange={(ev) => update(e.id, { day: (ev.target.value || null) as PlanEntry['day'] })}>
                  <option value="">Bez dana</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                {e.baseServings ? (
                  <>
                    <label htmlFor={`porcije-${e.id}`} className="block text-sm text-muted">
                      Količina ({e.yieldUnit})
                    </label>
                    <input
                      id={`porcije-${e.id}`}
                      type="number"
                      min={1}
                      max={200}
                      className="field w-24 py-1.5"
                      value={e.servings}
                      onChange={(ev) => {
                        const n = Number(ev.target.value)
                        if (n >= 1 && n <= 200) update(e.id, { servings: n })
                      }}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted">Izvorna količina recepta</p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  planStore.set((p) => p.filter((x) => x.id !== e.id))
                  announce(`„${e.title}“ je uklonjen iz plana.`, { undo: () => planStore.set((p) => (p.length < PLAN_LIMIT ? [...p.slice(0, idx), e, ...p.slice(idx)] : p)) })
                }}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" /> Ukloni
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={buildList} disabled={busy}>
          <ShoppingBasket aria-hidden="true" className="h-5 w-5" /> {busy ? 'Pravim listu…' : 'Napravi listu za kupovinu'}
        </button>
        <Link href="/lista-za-kupovinu/" className="btn btn-secondary">
          Otvori listu
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted">Dodavanje u plan i čuvanje u kuharicu su odvojene radnje. Plan se čuva samo u ovom pregledniku.</p>
    </div>
  )
}
