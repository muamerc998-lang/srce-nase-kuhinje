'use client'
import { createContext, useContext, useState } from 'react'
import type { IngredientGroupView, StepGroupView } from '@/lib/recipes/types'

export interface RecipeClientData {
  uid: string
  slug: string
  title: string
  image: string | null
  baseServings: number | null
  yieldUnit: string
  scalable: boolean
  groups: IngredientGroupView[]
  stepGroups: StepGroupView[]
}

interface Ctx {
  recipe: RecipeClientData
  servings: number | null
  setServings: (n: number) => void
  factor: number
}

const RecipeCtx = createContext<Ctx | null>(null)

export function RecipeProvider({ recipe, children }: { recipe: RecipeClientData; children: React.ReactNode }) {
  const [servings, setServingsState] = useState<number | null>(recipe.baseServings)
  const factor = recipe.scalable && recipe.baseServings && servings ? servings / recipe.baseServings : 1
  return (
    <RecipeCtx.Provider
      value={{
        recipe,
        servings,
        factor,
        setServings: (n) => {
          if (!recipe.scalable) return
          setServingsState(Math.min(200, Math.max(0.5, Math.round(n * 2) / 2)))
        },
      }}
    >
      {children}
    </RecipeCtx.Provider>
  )
}

export function useRecipe() {
  const c = useContext(RecipeCtx)
  if (!c) throw new Error('useRecipe izvan RecipeProvider-a')
  return c
}
