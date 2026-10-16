'use client'
import { useEffect, useState } from 'react'
import { normalizeText } from '@/lib/text/normalize'

/** Filtriranje indeksa namirnica u pregledniku (bez JS-a lista je i dalje potpuna). */
export function IngredientIndexFilter() {
  const [q, setQ] = useState('')
  useEffect(() => {
    const nq = normalizeText(q)
    document.querySelectorAll<HTMLElement>('[data-namirnica]').forEach((el) => {
      el.hidden = !!nq && !normalizeText(el.dataset.namirnica ?? '').includes(nq)
    })
    document.querySelectorAll<HTMLElement>('#popis-namirnica section').forEach((s) => {
      s.hidden = !!nq && !s.querySelector('[data-namirnica]:not([hidden])')
    })
  }, [q])
  return (
    <div className="mt-8 max-w-md">
      <label htmlFor="filter-namirnica" className="label">
        Pretraži namirnice
      </label>
      <input id="filter-namirnica" type="search" className="field" placeholder="npr. krompir, češnjak…" value={q} onChange={(e) => setQ(e.target.value)} />
    </div>
  )
}
