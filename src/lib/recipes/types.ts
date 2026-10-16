/** Oblik podataka recepta koji koristi javni interfejs (nezavisno od CMS-a). */

export interface IngredientLine {
  /** stabilni ID reda u receptu */
  id: string
  ingredientId: string
  ingredientSlug?: string
  /** kanonski naziv namirnice iz registra */
  name: string
  /** prikazni oblik u receptu, npr. "glatkog brašna" */
  label: string
  amount: number | null
  amountMax?: number | null
  unit: string
  /** pripremna napomena, npr. "sitno sjeckan" */
  note?: string
  optional: boolean
  /** isti ključ = alternativne namirnice ("maslac ili margarin") */
  altGroup?: string
  /** urednička napomena kod zaokruživanja (npr. za jaja) */
  roundingHint?: string
  /** izvorna urednička formulacija (prikazuje se pri izvornoj količini) */
  originalText?: string
  /** namirnica ima javnu stranicu */
  publicPage?: boolean
}

export interface IngredientGroupView {
  id: string
  title?: string
  items: IngredientLine[]
}

export interface StepView {
  id: string
  title?: string
  text: string
  timerMinutes?: number | null
  timerLabel?: string
  image?: ImageView | null
}

export interface StepGroupView {
  id: string
  title?: string
  steps: StepView[]
}

export interface ImageView {
  url: string
  alt: string
  width: number
  height: number
  focalX?: number | null
  focalY?: number | null
}

export interface RecipeTimes {
  prepMinutes?: number | null
  cookMinutes?: number | null
  restMinutes?: number | null
  restLabel?: string | null
  totalMinutes?: number | null
}

export type Difficulty = 'lako' | 'srednje' | 'zahtjevno'
