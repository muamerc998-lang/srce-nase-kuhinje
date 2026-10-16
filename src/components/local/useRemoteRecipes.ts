'use client'
import { useEffect, useState } from 'react'
import type { RecipeCard } from '@/data/mappers'
import type { IngredientLine } from '@/lib/recipes/types'

export interface RemoteRecipe {
  card: RecipeCard
  baseServings: number | null
  yieldUnit: string
  scalable: boolean
  lines: IngredientLine[]
}

export async function fetchRecipes(uids: string[], withIngredients = false) {
  const res = await fetch(`/api/site/recipes/?uids=${uids.join(',')}${withIngredients ? '&sastojci=1' : ''}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as { recipes: RemoteRecipe[]; missing: string[] }
}

/**
 * Osvježava podatke sačuvanih recepata sa servera. Ako mreža nije dostupna,
 * lokalne liste ostaju upotrebljive (status 'offline').
 */
export function useRemoteRecipes(uids: string[]) {
  const key = [...new Set(uids)].sort().join(',')
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'ok' | 'offline'; byUid: Map<string, RemoteRecipe>; missing: Set<string> }>({
    status: 'idle',
    byUid: new Map(),
    missing: new Set(),
  })
  useEffect(() => {
    if (!key) return
    let cancelled = false
    fetchRecipes(key.split(','))
      .then((d) => {
        if (cancelled) return
        setState({ status: 'ok', byUid: new Map(d.recipes.map((r) => [r.card.uid, r])), missing: new Set(d.missing) })
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, status: 'offline' })))
    return () => {
      cancelled = true
    }
  }, [key])
  if (!key) return { status: 'ok' as const, byUid: new Map<string, RemoteRecipe>(), missing: new Set<string>() }
  return state
}
