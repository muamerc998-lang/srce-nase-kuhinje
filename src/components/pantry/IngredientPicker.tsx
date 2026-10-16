'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'

type Opt = { slug: string; name: string; matched?: string | null }

/**
 * Višestruki izbor normalizovanih namirnica s prijedlozima (combobox).
 * Odabrane vrijednosti idu u skriveno polje kao slugovi odvojeni zarezom.
 */
export function IngredientPicker({ name, label, initial, hint }: { name: string; label: string; initial: Opt[]; hint?: string }) {
  const id = useId()
  const [selected, setSelected] = useState<Opt[]>(initial)
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Opt[]>([])
  const [active, setActive] = useState(-1)
  const abort = useRef<AbortController | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!q.trim()) return
    const t = setTimeout(async () => {
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      try {
        const res = await fetch(`/api/site/ingredients/?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
        const data = (await res.json()) as { items: Opt[] }
        setItems(data.items.filter((i) => !selected.some((s) => s.slug === i.slug)))
        setActive(0)
      } catch {
        /* prekinuto */
      }
    }, 200)
    return () => clearTimeout(t)
  }, [q, selected])

  const add = (o: Opt) => {
    setSelected((s) => (s.some((x) => x.slug === o.slug) ? s : [...s, o]))
    setQ('')
    setItems([])
    input.current?.focus()
  }

  const visible = q.trim() ? items : []
  const listId = `${id}-lista`
  return (
    <div>
      <label htmlFor={`${id}-unos`} className="label">
        {label}
      </label>
      {hint && <p className="mb-1 text-sm text-muted">{hint}</p>}
      <input type="hidden" name={name} value={selected.map((s) => s.slug).join(',')} />
      {selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label={`Odabrano: ${label}`}>
          {selected.map((s) => (
            <li key={s.slug}>
              <button
                type="button"
                className="chip bg-soft font-semibold"
                onClick={() => setSelected((all) => all.filter((x) => x.slug !== s.slug))}
                aria-label={`Ukloni ${s.name}`}
              >
                {s.name} <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <input
          ref={input}
          id={`${id}-unos`}
          type="text"
          className="field"
          autoComplete="off"
          placeholder="Počnite tipkati, npr. jaja"
          value={q}
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && visible[active] ? `${listId}-${active}` : undefined}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(visible.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter') {
              if (visible[active]) {
                e.preventDefault()
                add(visible[active])
              }
            } else if (e.key === 'Escape') {
              setItems([])
            } else if (e.key === 'Backspace' && !q && selected.length) {
              setSelected((s) => s.slice(0, -1))
            }
          }}
        />
        <ul id={listId} role="listbox" aria-label={label} hidden={visible.length === 0} className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
          {visible.map((o, i) => (
            <li
              key={o.slug}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`cursor-pointer px-4 py-2.5 ${i === active ? 'bg-soft text-bordo' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                add(o)
              }}
            >
              {o.name}
              {o.matched && <span className="text-sm text-muted"> ({o.matched})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
