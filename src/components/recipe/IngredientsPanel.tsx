'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBasket, CalendarPlus, Eraser, Minus, Plus } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { checksStore, planStore, shoppingStore, PLAN_LIMIT } from '@/lib/storage/stores'
import { newId } from '@/lib/storage/store'
import { formatNumber } from '@/lib/quantities/scale'
import { announce } from '../ui/Announcer'
import { useRecipe } from './RecipeContext'
import { IngredientList } from './IngredientList'

export function ServingsControl() {
  const { recipe, servings, setServings } = useRecipe()
  const hydrated = useHydrated()
  if (!recipe.baseServings) return null
  if (!recipe.scalable) {
    return (
      <p className="text-[0.95rem] text-muted">
        Količina: {recipe.baseServings} {recipe.yieldUnit}. Preračun porcija nije dostupan za ovaj recept.
      </p>
    )
  }
  const base = recipe.baseServings
  const presets = [0.5, 1, 2]
  return (
    <div className="no-print space-y-2">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Brzi preračun">
        {presets.map((p) => {
          const target = base * p
          const active = servings === target
          return (
            <button
              key={p}
              type="button"
              className={`btn min-w-14 px-3 ${active ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={active}
              disabled={!hydrated}
              onClick={() => setServings(target)}
            >
              {formatNumber(p)}×
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="ciljne-porcije" className="text-[0.95rem]">
          Količina ({recipe.yieldUnit}):
        </label>
        <button
          type="button"
          className="icon-btn border border-line"
          aria-label="Manje"
          disabled={!hydrated || (servings ?? base) <= 1}
          onClick={() => setServings((servings ?? base) - 1)}
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <input
          id="ciljne-porcije"
          type="number"
          inputMode="numeric"
          min={1}
          max={200}
          className="field w-20 text-center"
          value={servings ?? base}
          disabled={!hydrated}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isFinite(n) && n > 0) setServings(n)
          }}
        />
        <button
          type="button"
          className="icon-btn border border-line"
          aria-label="Više"
          disabled={!hydrated}
          onClick={() => setServings((servings ?? base) + 1)}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {servings !== base && (
        <p className="text-sm text-muted" role="status">
          Preračunato s {base} na {formatNumber(servings ?? base)} {recipe.yieldUnit}. Vrijeme pečenja i veličina kalupa se ne mijenjaju automatski.
        </p>
      )}
    </div>
  )
}

export function IngredientsPanel() {
  const { recipe, factor, servings } = useRecipe()
  const checksAll = useStore(checksStore)
  const plan = useStore(planStore)
  const hydrated = useHydrated()
  const [onlyUnchecked, setOnlyUnchecked] = useState(true)
  const checked = new Set(hydrated ? checksAll[recipe.uid] ?? [] : [])

  const toggle = (id: string) =>
    checksStore.set((c) => {
      const cur = new Set(c[recipe.uid] ?? [])
      if (cur.has(id)) cur.delete(id)
      else cur.add(id)
      const next = { ...c }
      if (cur.size) next[recipe.uid] = [...cur]
      else delete next[recipe.uid]
      return next
    })

  const allLines = recipe.groups.flatMap((g) => g.items)

  const addToList = () => {
    const skip = onlyUnchecked ? allLines.filter((l) => checked.has(l.id)).map((l) => l.id) : []
    if (skip.length === allLines.length) {
      announce('Svi sastojci su označeni — nema šta dodati na listu.', { tone: 'error' })
      return
    }
    const id = newId()
    shoppingStore.set((s) => ({
      ...s,
      sources: [
        ...s.sources.filter((x) => !(x.origin === 'recipe' && x.recipeId === recipe.uid)),
        {
          id,
          recipeId: recipe.uid,
          title: recipe.title,
          slug: recipe.slug,
          servings: servings ?? recipe.baseServings ?? 1,
          baseServings: recipe.scalable ? recipe.baseServings : null,
          origin: 'recipe',
          lines: allLines,
        },
      ],
      skip: { ...s.skip, [id]: skip },
    }))
    announce(`Sastojci su dodani na listu za kupovinu${skip.length ? ` (bez ${skip.length} označenih)` : ''}.`)
  }

  const addToPlan = () => {
    if (plan.length >= PLAN_LIMIT) {
      announce(`Plan već ima ${PLAN_LIMIT} recepata. Uklonite neki prije dodavanja.`, { tone: 'error' })
      return
    }
    planStore.set((p) => [
      ...p,
      {
        id: newId(),
        uid: recipe.uid,
        slug: recipe.slug,
        title: recipe.title,
        servings: servings ?? recipe.baseServings ?? 1,
        baseServings: recipe.scalable ? recipe.baseServings : null,
        yieldUnit: recipe.yieldUnit,
        day: null,
      },
    ])
    announce(`„${recipe.title}“ je dodan u plan (${plan.length + 1}/${PLAN_LIMIT}).`)
  }

  return (
    <section aria-labelledby="sastojci-naslov" id="sastojci" className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="sastojci-naslov" className="text-2xl font-semibold">
          Sastojci
        </h3>
        <p className="print-only">
          Količina: {formatNumber(servings ?? recipe.baseServings ?? 0)} {recipe.yieldUnit}
        </p>
      </div>
      <div className="mt-3">
        <ServingsControl />
      </div>
      <div className="mt-4">
        <IngredientList groups={recipe.groups} factor={factor} checked={checked} onToggle={toggle} idPrefix="sastojak" headingLevel={4} />
      </div>
      <noscript>
        <p className="mt-3 text-sm text-muted">Preračun porcija, označavanje sastojaka i lista za kupovinu traže uključen JavaScript.</p>
      </noscript>
      <div className="no-print mt-4 space-y-3 border-t border-line pt-4">
        {checked.size > 0 && (
          <button type="button" className="btn btn-ghost px-2 text-[0.95rem]" onClick={() => checksStore.set((c) => {
            const next = { ...c }
            delete next[recipe.uid]
            return next
          })}>
            <Eraser aria-hidden="true" className="h-4 w-4" /> Očisti oznake ({checked.size})
          </button>
        )}
        <fieldset className="space-y-2">
          <legend className="sr-only">Dodavanje na listu za kupovinu</legend>
          <label className="flex items-center gap-2 text-[0.95rem]">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--color-brand)]"
              checked={onlyUnchecked}
              onChange={(e) => setOnlyUnchecked(e.target.checked)}
            />
            Dodaj samo neoznačene (označeno = već imam)
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={addToList} disabled={!hydrated}>
              <ShoppingBasket aria-hidden="true" className="h-5 w-5" /> Na listu za kupovinu
            </button>
            <button type="button" className="btn btn-secondary" onClick={addToPlan} disabled={!hydrated}>
              <CalendarPlus aria-hidden="true" className="h-5 w-5" /> Dodaj u plan
            </button>
          </div>
        </fieldset>
        <p className="text-sm text-muted">
          <Link href="/lista-za-kupovinu/" className="link">
            Lista za kupovinu
          </Link>{' '}
          ·{' '}
          <Link href="/moj-plan/" className="link">
            Moj plan
          </Link>
        </p>
      </div>
    </section>
  )
}
