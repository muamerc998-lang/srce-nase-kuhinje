'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ClipboardCopy, Plus, Printer, RefreshCw, ShoppingBasket, Trash2 } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { shoppingStore, planStore, planSignature } from '@/lib/storage/stores'
import { newId } from '@/lib/storage/store'
import { mergeShoppingSources, formatMergedItem } from '@/lib/shopping/merge'
import { announce } from '../ui/Announcer'
import { sourcesFromPlan } from './Plan'

export function ShoppingList() {
  const s = useStore(shoppingStore)
  const plan = useStore(planStore)
  const hydrated = useHydrated()
  const [text, setText] = useState('')
  const [confirmRefresh, setConfirmRefresh] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const items = useMemo(() => mergeShoppingSources(s.sources, { skipLineIds: s.skip }), [s.sources, s.skip])
  const checked = new Set(s.checked)
  const planChanged = s.planSig !== null ? s.planSig !== planSignature(plan) : plan.length > 0 && !s.sources.some((x) => x.origin === 'plan')

  if (!hydrated) return <p className="mt-8 text-muted">Učitavam listu…</p>

  const toggle = (key: string) =>
    shoppingStore.set((st) => ({ ...st, checked: st.checked.includes(key) ? st.checked.filter((k) => k !== key) : [...st.checked, key] }))

  const refresh = async (force: boolean) => {
    setBusy(true)
    try {
      const { sources } = await sourcesFromPlan(plan)
      const nextSources = [...s.sources.filter((x) => x.origin !== 'plan'), ...sources]
      const nextKeys = new Set(mergeShoppingSources(nextSources, { skipLineIds: s.skip }).map((i) => i.key))
      const lostChecked = s.checked.filter((k) => !k.startsWith('rucno:') && !nextKeys.has(k))
      if (lostChecked.length && !force) {
        setConfirmRefresh(lostChecked.length)
        return
      }
      shoppingStore.set((st) => ({
        ...st,
        sources: nextSources,
        planSig: plan.length ? planSignature(plan) : null,
        // ručne stavke i njihove oznake ostaju; oznake izvedenih stavki koje i dalje postoje također
        checked: st.checked.filter((k) => k.startsWith('rucno:') || nextKeys.has(k)),
      }))
      setConfirmRefresh(null)
      announce('Lista je osvježena prema planu. Ručno dodane stavke su sačuvane.')
    } catch {
      announce('Osvježavanje nije uspjelo — provjerite internet vezu.', { tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const asText = () =>
    [
      ...items.map((i) => `${checked.has(i.key) ? '[x]' : '[ ]'} ${formatMergedItem(i)}`),
      ...s.manual.map((m) => `${checked.has(`rucno:${m.id}`) ? '[x]' : '[ ]'} ${m.text}`),
    ].join('\n')

  const empty = items.length === 0 && s.manual.length === 0

  return (
    <div className="mt-6">
      {planChanged && plan.length > 0 && (
        <div role="status" className="no-print mb-6 rounded-xl border border-[#e9d48a] bg-warning-bg p-4 text-warning-ink">
          <p className="font-semibold">Plan je promijenjen nakon pravljenja liste.</p>
          <p className="mt-1">Lista se ne mijenja sama. Osvježite je kad budete spremni — ručno dodane stavke ostaju.</p>
          {confirmRefresh !== null ? (
            <div className="mt-3">
              <p>
                {confirmRefresh} označen{confirmRefresh === 1 ? 'a stavka' : 'ih stavki'} više neće biti na listi jer više nisu u planu.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={() => refresh(true)} disabled={busy}>
                  Osvježi svejedno
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmRefresh(null)}>
                  Odustani
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-primary mt-3" onClick={() => refresh(false)} disabled={busy}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" /> {busy ? 'Osvježavam…' : 'Osvježi listu'}
            </button>
          )}
        </div>
      )}

      {empty ? (
        <div className="rounded-2xl border border-line bg-cream p-8 text-center">
          <ShoppingBasket aria-hidden="true" className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-3 text-2xl font-semibold">Lista je prazna</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Dodajte sastojke sa stranice recepta („Na listu za kupovinu“), napravite listu iz <Link href="/moj-plan/" className="link">plana</Link> ili
            upišite stavku ručno ispod.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {items.map((i) => (
              <li key={i.key} className="flex items-start gap-3 px-4 py-3">
                <input
                  id={`stavka-${i.key}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
                  checked={checked.has(i.key)}
                  onChange={() => toggle(i.key)}
                />
                <label htmlFor={`stavka-${i.key}`} className={`flex-1 ${checked.has(i.key) ? 'text-muted line-through' : ''}`}>
                  {formatMergedItem(i)}
                  <span className="block text-sm text-muted">iz: {i.sources.map((x) => x.title).join(', ')}</span>
                </label>
              </li>
            ))}
            {s.manual.map((m) => {
              const key = `rucno:${m.id}`
              return (
                <li key={key} className="flex items-start gap-3 px-4 py-3">
                  <input id={key} type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]" checked={checked.has(key)} onChange={() => toggle(key)} />
                  <label htmlFor={key} className={`flex-1 ${checked.has(key) ? 'text-muted line-through' : ''}`}>
                    {m.text}
                    <span className="block text-sm text-muted">dodano ručno</span>
                  </label>
                  <button
                    type="button"
                    className="icon-btn no-print h-9 w-9 hover:bg-soft"
                    aria-label={`Obriši ${m.text}`}
                    onClick={() => shoppingStore.set((st) => ({ ...st, manual: st.manual.filter((x) => x.id !== m.id), checked: st.checked.filter((k) => k !== key) }))}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-sm text-muted">
            Iste namirnice se spajaju samo u spojivim jedinicama (g i kg, ml i l). Kašike, komadi i „po ukusu“ se ne pretvaraju u grame.
          </p>
        </>
      )}

      <form
        className="no-print mt-6 flex max-w-lg gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const t = text.trim().slice(0, 200)
          if (!t) return
          shoppingStore.set((st) => ({ ...st, manual: [...st.manual, { id: newId(), text: t }] }))
          setText('')
        }}
      >
        <label htmlFor="rucna-stavka" className="sr-only">
          Dodaj stavku
        </label>
        <input id="rucna-stavka" className="field" placeholder="Dodaj stavku, npr. kafa" value={text} onChange={(e) => setText(e.target.value)} maxLength={200} />
        <button type="submit" className="btn btn-secondary">
          <Plus aria-hidden="true" className="h-5 w-5" /> Dodaj
        </button>
      </form>

      {!empty && (
        <div className="no-print mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(asText())
                announce('Lista je kopirana kao tekst.')
              } catch {
                announce('Kopiranje nije uspjelo.', { tone: 'error' })
              }
            }}
          >
            <ClipboardCopy aria-hidden="true" className="h-5 w-5" /> Kopiraj kao tekst
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <Printer aria-hidden="true" className="h-5 w-5" /> Štampaj
          </button>
          {s.checked.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => shoppingStore.set((st) => ({ ...st, checked: [] }))}>
              Poništi oznake
            </button>
          )}
        </div>
      )}

      {s.sources.length > 0 && (
        <section aria-labelledby="izvori" className="no-print mt-10">
          <h2 id="izvori" className="text-xl font-semibold">
            Recepti na listi
          </h2>
          <ul className="mt-3 space-y-2">
            {s.sources.map((src) => (
              <li key={src.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-4 py-2">
                <span>
                  <Link href={`/recepti/${src.slug}/`} className="font-semibold hover:text-brand">
                    {src.title}
                  </Link>
                  <span className="text-sm text-muted">
                    {' '}
                    · {src.origin === 'plan' ? 'iz plana' : 'dodano s recepta'}
                    {src.baseServings ? ` · ${src.servings} porc.` : ''}
                  </span>
                </span>
                {src.origin === 'recipe' && (
                  <button
                    type="button"
                    className="btn btn-ghost min-h-10 px-2 text-sm"
                    onClick={() => shoppingStore.set((st) => ({ ...st, sources: st.sources.filter((x) => x.id !== src.id) }))}
                  >
                    Ukloni s liste
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
