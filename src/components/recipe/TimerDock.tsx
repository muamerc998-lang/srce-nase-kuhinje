'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Timer, X } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { timersStore, timerRemaining, pauseTimer, resumeTimer, startTimer, type TimerState } from '@/lib/storage/stores'
import { announce } from '../ui/Announcer'

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(h ? 2 : 1, '0')
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}

/** Osvježava prikaz svake sekunde i odmah po povratku iz pozadine. */
export function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const tick = () => setNow(Date.now())
    const id = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [active])
  return now
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 880
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.85)
  } catch {
    /* zvuk nije dostupan */
  }
  try {
    navigator.vibrate?.([200, 100, 200])
  } catch {
    /* ignore */
  }
}

export function TimerControls({ t, now, compact = false }: { t: TimerState; now: number; compact?: boolean }) {
  const remaining = timerRemaining(t, now)
  const done = remaining <= 0
  const update = (fn: (x: TimerState) => TimerState) => timersStore.set((all) => all.map((x) => (x.id === t.id ? fn(x) : x)))
  return (
    <div className="flex items-center gap-1">
      <span className={`min-w-[4.5rem] font-mono text-lg tabular-nums ${done ? 'font-bold text-brand' : ''}`} aria-hidden="true">
        {done ? 'Gotovo' : formatClock(remaining)}
      </span>
      {!done &&
        (t.endsAt === null ? (
          <button type="button" className="icon-btn hover:bg-soft" aria-label={`Nastavi tajmer: ${t.label}`} onClick={() => update((x) => resumeTimer(x))}>
            <Play aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : (
          <button type="button" className="icon-btn hover:bg-soft" aria-label={`Pauziraj tajmer: ${t.label}`} onClick={() => update((x) => pauseTimer(x))}>
            <Pause aria-hidden="true" className="h-5 w-5" />
          </button>
        ))}
      {!compact && (
        <button
          type="button"
          className="icon-btn hover:bg-soft"
          aria-label={`Ponovo pokreni tajmer: ${t.label}`}
          onClick={() => update((x) => ({ ...x, endsAt: Date.now() + x.durationMs, remainingMs: x.durationMs }))}
        >
          <RotateCcw aria-hidden="true" className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        className="icon-btn hover:bg-soft"
        aria-label={`Poništi tajmer: ${t.label}`}
        onClick={() => timersStore.set((all) => all.filter((x) => x.id !== t.id))}
      >
        <X aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  )
}

/** Dugme uz korak s unesenim trajanjem. */
export function StepTimerButton(props: {
  recipeUid: string
  recipeTitle: string
  recipeSlug: string
  stepId: string
  stepNumber: number
  minutes: number
  label?: string
}) {
  const timers = useStore(timersStore)
  const hydrated = useHydrated()
  const existing = timers.find((t) => t.recipeUid === props.recipeUid && t.stepId === props.stepId)
  const now = useNow(!!existing)
  if (existing) {
    return (
      <div className="no-print mt-2 inline-flex items-center gap-2 rounded-lg border border-line bg-soft px-2 py-1">
        <Timer aria-hidden="true" className="h-5 w-5 text-brand" />
        <span className="sr-only">Tajmer {existing.label}</span>
        <TimerControls t={existing} now={now} />
      </div>
    )
  }
  const label = props.label || `Korak ${props.stepNumber}`
  return (
    <button
      type="button"
      className="no-print btn btn-secondary mt-2 px-3 text-[0.95rem]"
      disabled={!hydrated}
      onClick={() => {
        timersStore.set((all) => [
          ...all.filter((t) => timerRemaining(t) > 0 || t.endsAt === null).slice(-9),
          startTimer({
            recipeUid: props.recipeUid,
            recipeTitle: props.recipeTitle,
            recipeSlug: props.recipeSlug,
            stepId: props.stepId,
            stepNumber: props.stepNumber,
            label,
            durationMs: Math.round(props.minutes * 60_000),
          }),
        ])
        announce(`Tajmer „${label}“ je pokrenut.`)
      }}
    >
      <Timer aria-hidden="true" className="h-4 w-4" /> Tajmer {props.minutes} min
    </button>
  )
}

/** Plutajući prikaz aktivnih tajmera na svim stranicama. */
export function TimerDock() {
  const timers = useStore(timersStore)
  const hydrated = useHydrated()
  const now = useNow(timers.length > 0)
  const notified = useRef(new Set<string>())

  useEffect(() => {
    for (const t of timers) {
      if (timerRemaining(t, now) <= 0 && !notified.current.has(t.id)) {
        notified.current.add(t.id)
        beep()
        announce(`Tajmer „${t.label}“ (${t.recipeTitle}) je završio.`)
      }
    }
  }, [timers, now])

  if (!hydrated || timers.length === 0) return null
  return (
    <aside aria-label="Aktivni tajmeri" className="no-print fixed bottom-20 left-3 z-40 max-w-[calc(100vw-1.5rem)] space-y-2 md:bottom-4">
      {timers.map((t) => (
        <div key={t.id} className="flex items-center gap-2 rounded-xl border border-line bg-white py-1 pl-3 pr-1 shadow-lg">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{t.label}</p>
            <Link href={`/recepti/${t.recipeSlug}/`} className="block truncate text-xs text-muted hover:underline">
              {t.recipeTitle} · korak {t.stepNumber}
            </Link>
          </div>
          <TimerControls t={t} now={now} compact />
        </div>
      ))}
      <p className="sr-only">Tajmeri rade dok je stranica otvorena; kad je preglednik zatvoren, alarm se ne oglašava.</p>
    </aside>
  )
}
