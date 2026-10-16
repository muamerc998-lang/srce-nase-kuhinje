'use client'
import { Heart } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { cookbookStore, type SavedRecipe } from '@/lib/storage/stores'
import { announce } from '../ui/Announcer'

export interface SaveTarget {
  uid: string
  slug: string
  title: string
  image: string | null
}

export function toggleSaved(r: SaveTarget) {
  const current = cookbookStore.get()
  const existing = current.items.find((i) => i.uid === r.uid)
  if (existing) {
    cookbookStore.set((c) => ({ ...c, items: c.items.filter((i) => i.uid !== r.uid) }))
    announce(`Recept „${r.title}“ je uklonjen iz kuharice.`, {
      undo: () => cookbookStore.set((c) => ({ ...c, items: [...c.items, existing] })),
    })
  } else {
    const item: SavedRecipe = { ...r, savedAt: new Date().toISOString(), lists: [] }
    cookbookStore.set((c) => ({ ...c, items: [item, ...c.items] }))
    announce(
      cookbookStore.persistent()
        ? `Recept „${r.title}“ je sačuvan u Mojoj kuharici.`
        : `Recept je sačuvan samo do zatvaranja stranice — preglednik ne dozvoljava lokalno čuvanje.`,
      { tone: cookbookStore.persistent() ? 'info' : 'error' },
    )
  }
}

/** Dugme srce. Ne aktivira link kartice (nalazi se izvan linka). */
export function SaveButton({ recipe, variant = 'icon' }: { recipe: SaveTarget; variant?: 'icon' | 'full' }) {
  const cb = useStore(cookbookStore)
  const hydrated = useHydrated()
  const saved = hydrated && cb.items.some((i) => i.uid === recipe.uid)
  const label = saved ? `Ukloni „${recipe.title}“ iz kuharice` : `Sačuvaj „${recipe.title}“ u kuharicu`

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={`btn ${saved ? 'btn-primary' : 'btn-secondary'}`}
        aria-pressed={saved}
        disabled={!hydrated}
        onClick={() => toggleSaved(recipe)}
      >
        <Heart aria-hidden="true" className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'Sačuvano' : 'Sačuvaj recept'}
        <span className="sr-only"> {recipe.title}</span>
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`icon-btn shadow-sm transition-colors disabled:opacity-60 ${saved ? 'bg-brand text-white hover:bg-bordo' : 'bg-white/95 text-brand hover:bg-white'}`}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={!hydrated}
      onClick={(e) => {
        e.stopPropagation()
        toggleSaved(recipe)
      }}
    >
      <Heart aria-hidden="true" className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
