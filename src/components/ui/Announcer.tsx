'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Jedinstvena "live region" za čitače ekrana + vidljiva kratka poruka (toast),
 * po potrebi s dugmetom Poništi.
 */
type Message = { id: number; text: string; undo?: () => void; tone?: 'info' | 'error' }
type Listener = (m: Message) => void

const listeners = new Set<Listener>()
let seq = 0

export function announce(text: string, opts: { undo?: () => void; tone?: 'info' | 'error' } = {}) {
  const m = { id: ++seq, text, ...opts }
  listeners.forEach((l) => l(m))
}

export function Announcer() {
  const [msg, setMsg] = useState<Message | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const l: Listener = (m) => {
      setMsg(m)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setMsg(null), m.undo ? 7000 : 4000)
    }
    listeners.add(l)
    return () => {
      listeners.delete(l)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {msg?.text ?? ''}
      </div>
      {msg && (
        <div
          className="no-print fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6"
          // vizuelni toast; čitač ekrana čita live region iznad
        >
          <div
            className={`flex max-w-md items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
              msg.tone === 'error' ? 'bg-bordo' : 'bg-ink'
            }`}
          >
            <span aria-hidden="true">{msg.text}</span>
            {msg.undo && (
              <button
                type="button"
                className="min-h-11 rounded-md px-3 font-semibold text-white underline underline-offset-2 hover:bg-white/10"
                onClick={() => {
                  msg.undo?.()
                  setMsg(null)
                }}
              >
                Poništi
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
