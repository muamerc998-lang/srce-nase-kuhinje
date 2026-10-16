'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChefHat, ChevronLeft, ChevronRight, ListChecks, Sun, X } from 'lucide-react'
import { useStore } from '@/lib/storage/hooks'
import { cookingStore } from '@/lib/storage/stores'
import { useRecipe } from './RecipeContext'
import { IngredientList } from './IngredientList'
import { StepTimerButton } from './TimerDock'

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener?: (t: string, cb: () => void) => void }

/**
 * Način kuhanja: jedan korak, veliki tekst, prethodni/sljedeći, pristup
 * sastojcima, tajmer koraka. Napredak se pamti lokalno. Bez oglasa.
 * Tastatura: ← / → za korake, Escape za izlaz (fokus se vraća na dugme).
 */
export function CookingMode() {
  const { recipe, factor } = useRecipe()
  const steps = recipe.stepGroups.flatMap((g) => g.steps.map((s) => ({ ...s, group: g.title })))
  const progress = useStore(cookingStore)
  const saved = progress[recipe.uid]
  const [open, setOpen] = useState(false)
  const [asking, setAsking] = useState(false)
  const [step, setStep] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const [wake, setWake] = useState<'off' | 'on' | 'unsupported'>('off')
  const wakeRef = useRef<WakeLockSentinelLike | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  const persist = useCallback(
    (i: number) => cookingStore.set((p) => ({ ...p, [recipe.uid]: { step: i, updatedAt: new Date().toISOString() } })),
    [recipe.uid],
  )
  const go = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(steps.length - 1, i))
      setStep(n)
      persist(n)
    },
    [steps.length, persist],
  )

  const releaseWake = async () => {
    await wakeRef.current?.release().catch(() => {})
    wakeRef.current = null
    setWake((w) => (w === 'unsupported' ? w : 'off'))
  }

  const toggleWake = async () => {
    if (wake === 'on') return releaseWake()
    const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock
    if (!wl) {
      setWake('unsupported')
      return
    }
    try {
      wakeRef.current = await wl.request('screen')
      wakeRef.current.addEventListener?.('release', () => setWake('off'))
      setWake('on')
    } catch {
      setWake('unsupported')
    }
  }

  const start = (from: number) => {
    setAsking(false)
    setOpen(true)
    go(from)
    // Način kuhanja drži ekran upaljenim kad preglednik to podržava (korisnik ga može isključiti).
    if (wake !== 'on') void toggleWake()
  }

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if ((open || asking) && !d.open) d.showModal()
    if (!open && !asking && d.open) d.close()
    document.documentElement.dataset.cooking = open ? '1' : ''
  }, [open, asking])

  useEffect(() => {
    if (open) heading.current?.focus()
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') go(step + 1)
      if (e.key === 'ArrowLeft') go(step - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, step, go])

  if (!steps.length) return null
  const cur = steps[step]

  return (
    <>
      <button
        ref={opener}
        type="button"
        className="btn btn-primary no-print"
        onClick={() => {
          if (saved && saved.step > 0 && saved.step < steps.length) setAsking(true)
          else start(0)
        }}
      >
        <ChefHat aria-hidden="true" className="h-5 w-5" /> Način kuhanja
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="kuhanje-naslov"
        onClose={() => {
          setOpen(false)
          setAsking(false)
          setShowIngredients(false)
          void releaseWake()
          document.documentElement.dataset.cooking = ''
          opener.current?.focus()
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 text-ink backdrop:bg-black/50"
      >
        {asking ? (
          <div className="mx-auto flex h-full max-w-lg flex-col justify-center gap-4 p-6">
            <h2 id="kuhanje-naslov" className="text-2xl font-semibold">
              Nastaviti gdje ste stali?
            </h2>
            <p>
              Posljednji put ste bili na koraku {(saved?.step ?? 0) + 1} od {steps.length}.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={() => start(saved?.step ?? 0)} autoFocus>
                Nastavi
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => start(0)}>
                Počni ispočetka
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setAsking(false)}>
                Odustani
              </button>
            </div>
          </div>
        ) : open ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
              <p className="min-w-0 truncate font-semibold">{recipe.title}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={`btn px-3 ${showIngredients ? 'btn-primary' : 'btn-ghost'}`}
                  aria-pressed={showIngredients}
                  onClick={() => setShowIngredients((s) => !s)}
                >
                  <ListChecks aria-hidden="true" className="h-5 w-5" /> <span className="hidden sm:inline">Sastojci</span>
                  <span className="sr-only sm:hidden">Sastojci</span>
                </button>
                {wake !== 'unsupported' && (
                  <button
                    type="button"
                    className={`btn px-3 ${wake === 'on' ? 'btn-primary' : 'btn-ghost'}`}
                    aria-pressed={wake === 'on'}
                    onClick={toggleWake}
                    title="Ekran ostaje upaljen dok je način kuhanja otvoren"
                  >
                    <Sun aria-hidden="true" className="h-5 w-5" /> <span className="hidden sm:inline">Ne gasi ekran</span>
                    <span className="sr-only sm:hidden">Ne gasi ekran</span>
                  </button>
                )}
                <button type="button" className="icon-btn hover:bg-soft" onClick={() => dialog.current?.close()}>
                  <X aria-hidden="true" className="h-6 w-6" />
                  <span className="sr-only">Izađi iz načina kuhanja</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-5 py-8">
                {showIngredients ? (
                  <div>
                    <h2 id="kuhanje-naslov" className="mb-4 text-2xl font-semibold" tabIndex={-1} ref={heading}>
                      Sastojci
                    </h2>
                    <IngredientList groups={recipe.groups} factor={factor} idPrefix="kuhanje" headingLevel={3} />
                  </div>
                ) : (
                  <div>
                    <h2 id="kuhanje-naslov" ref={heading} tabIndex={-1} className="font-sans text-lg font-semibold text-brand focus:outline-none">
                      Korak {step + 1} od {steps.length}
                      {cur.group ? ` · ${cur.group}` : ''}
                    </h2>
                    {cur.title && <p className="mt-3 font-serif text-2xl font-semibold">{cur.title}</p>}
                    <p className="mt-3 text-[1.6rem] leading-relaxed sm:text-[1.9rem]">{cur.text}</p>
                    {cur.timerMinutes ? (
                      <StepTimerButton
                        recipeUid={recipe.uid}
                        recipeTitle={recipe.title}
                        recipeSlug={recipe.slug}
                        stepId={cur.id}
                        stepNumber={step + 1}
                        minutes={cur.timerMinutes}
                        label={cur.timerLabel}
                      />
                    ) : null}
                    {wake === 'unsupported' && (
                      <p className="mt-6 text-sm text-muted">Ovaj preglednik ne podržava zadržavanje upaljenog ekrana.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-line p-3">
              <button type="button" className="btn btn-secondary min-h-14 text-lg" disabled={step === 0} onClick={() => go(step - 1)}>
                <ChevronLeft aria-hidden="true" className="h-6 w-6" /> Prethodni
              </button>
              {step < steps.length - 1 ? (
                <button type="button" className="btn btn-primary min-h-14 text-lg" onClick={() => go(step + 1)}>
                  Sljedeći <ChevronRight aria-hidden="true" className="h-6 w-6" />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary min-h-14 text-lg"
                  onClick={() => {
                    cookingStore.set((p) => {
                      const next = { ...p }
                      delete next[recipe.uid]
                      return next
                    })
                    dialog.current?.close()
                  }}
                >
                  Završi
                </button>
              )}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
