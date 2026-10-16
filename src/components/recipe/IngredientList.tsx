'use client'
import Link from 'next/link'
import { formatQuantity, formatNumber, scaleQuantity } from '@/lib/quantities/scale'
import type { IngredientGroupView, IngredientLine } from '@/lib/recipes/types'

/** Tekst jedne stavke pri zadatom faktoru. Pri izvornoj količini koristi izvornu formulaciju ako postoji. */
export function lineParts(line: IngredientLine, factor: number) {
  const q = scaleQuantity(line, factor)
  if (factor === 1 && line.originalText) return { qty: '', text: line.originalText, rounded: null as string | null, q }
  const qty = formatQuantity(q)
  const isText = q.fixed && q.amount == null
  let rounded: string | null = null
  if (q.roundedFrom) {
    const from =
      q.roundedFrom.amountMax != null
        ? `${formatNumber(q.roundedFrom.amount)}–${formatNumber(q.roundedFrom.amountMax)}`
        : formatNumber(q.roundedFrom.amount)
    rounded = `zaokruženo s ${from}${line.roundingHint ? `. ${line.roundingHint}` : ''}`
  }
  return { qty: isText ? '' : qty, text: isText ? `${line.label} ${qty}`.trim() : line.label, rounded, q }
}

/**
 * Lista sastojaka po grupama. Alternativne stavke (ista altGroup oznaka)
 * prikazuju se zajedno s "ili".
 */
export function IngredientList({
  groups,
  factor,
  checked,
  onToggle,
  idPrefix,
  headingLevel = 3,
}: {
  groups: IngredientGroupView[]
  factor: number
  checked?: Set<string>
  onToggle?: (id: string) => void
  idPrefix: string
  headingLevel?: 3 | 4
}) {
  const H = `h${headingLevel}` as 'h3' | 'h4'
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.id}>
          {g.title && <H className="mb-2 font-sans text-base font-bold uppercase tracking-wide text-bordo">{g.title}</H>}
          <ul className="divide-y divide-line">
            {g.items.map((line, idx) => {
              const prev = g.items[idx - 1]
              const isAlt = !!line.altGroup && prev?.altGroup === line.altGroup
              const { qty, text, rounded } = lineParts(line, factor)
              const inputId = `${idPrefix}-${line.id}`
              const isChecked = checked?.has(line.id) ?? false
              return (
                <li key={line.id} className="avoid-break flex items-start gap-3 py-2.5">
                  {onToggle ? (
                    <input
                      id={inputId}
                      type="checkbox"
                      className="no-print mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
                      checked={isChecked}
                      onChange={() => onToggle(line.id)}
                    />
                  ) : (
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  )}
                  <label htmlFor={onToggle ? inputId : undefined} className={`flex-1 ${isChecked ? 'text-muted line-through' : ''}`}>
                    {isAlt && <span className="mr-1 font-semibold italic text-bordo">ili</span>}
                    {qty && <strong className="font-semibold">{qty} </strong>}
                    {line.publicPage && line.ingredientSlug ? (
                      <Link href={`/namirnice/${line.ingredientSlug}/`} className="underline decoration-dotted underline-offset-4 hover:text-brand">
                        {text}
                      </Link>
                    ) : (
                      text
                    )}
                    {line.note && <span className="text-muted">, {line.note}</span>}
                    {line.optional && <span className="text-muted"> (opcionalno)</span>}
                    {rounded && <span className="mt-0.5 block text-sm text-muted">{rounded}</span>}
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
