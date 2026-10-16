'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type Suggestion = { title: string; slug: string }

/**
 * Pretraga: običan GET obrazac na /recepti/ (radi i bez JavaScripta).
 * S JavaScriptom nudi do 6 prijedloga, uz odgodu od 250 ms, najmanje 2 znaka
 * i prekid prethodnog zahtjeva — bez agresivnih zahtjeva pri tipkanju.
 */
export function SearchBox({
  id,
  large = false,
  defaultValue = '',
  autoFocus = false,
  label = 'Pretraži recepte',
  placeholder = 'Naziv jela ili namirnica…',
}: {
  id?: string
  large?: boolean
  defaultValue?: string
  autoFocus?: boolean
  label?: string
  placeholder?: string
}) {
  const autoId = useId()
  const inputId = id ?? `pretraga-${autoId}`
  const listId = `${inputId}-prijedlozi`
  const router = useRouter()
  const [q, setQ] = useState(defaultValue)
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const abort = useRef<AbortController | null>(null)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) return
    const t = setTimeout(async () => {
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      try {
        const res = await fetch(`/api/site/suggest/?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        if (!res.ok) return
        const data = (await res.json()) as { items: Suggestion[] }
        setItems(data.items)
        setActive(-1)
      } catch {
        /* prekinuto ili mreža nedostupna — obrazac i dalje radi */
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const shown = q.trim().length >= 2 ? items : []
  const showList = open && shown.length > 0

  return (
    <div ref={wrap} className="relative w-full">
      <form action="/recepti/" method="get" role="search" className="relative">
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <input
          id={inputId}
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          maxLength={100}
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showList) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(shown.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(-1, a - 1))
            } else if (e.key === 'Escape') {
              setOpen(false)
            } else if (e.key === 'Enter' && active >= 0) {
              e.preventDefault()
              setOpen(false)
              router.push(`/recepti/${shown[active].slug}/`)
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className={`field pr-12 ${large ? 'min-h-14 rounded-xl border-2 border-[#d8cbcd] pl-4 text-lg' : ''}`}
        />
        <button
          type="submit"
          className={`absolute right-1 top-1/2 -translate-y-1/2 icon-btn text-brand hover:bg-soft ${large ? 'h-12 w-12' : ''}`}
          aria-label="Traži"
        >
          <Search aria-hidden="true" className="h-5 w-5" />
        </button>
      </form>
      <ul
        id={listId}
        role="listbox"
        aria-label="Prijedlozi recepata"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-line bg-white shadow-lg"
      >
        {shown.map((s, i) => (
          <li
            key={s.slug}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            className={`cursor-pointer px-4 py-3 ${i === active ? 'bg-soft text-bordo' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              setOpen(false)
              router.push(`/recepti/${s.slug}/`)
            }}
          >
            {s.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
