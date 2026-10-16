import { z } from 'zod'
import { UNITS } from '../quantities/units'
import { METHOD_OPTIONS, DIET_OPTIONS, DIFFICULTY_OPTIONS, MEAL_OPTIONS } from '../search/params'

/**
 * Format za uvoz/izvoz recepata i namirnica: "srce-nase-kuhinje/v1".
 * Veze se navode slugovima (kategorije, autori, oznake, namirnice, vodiči).
 * Detaljan opis: docs/content-model.md; primjer: content/examples/primjer-uvoza.json
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: mala slova, brojevi i crtice')
const text = (max = 2000) => z.string().trim().min(1).max(max)
const optText = (max = 2000) => z.string().trim().max(max).optional().nullable()
const minutes = z.number().int().min(0).max(60 * 24 * 14).optional().nullable()
const unitCode = z
  .string()
  .refine((u) => u === 'bez' || u === '' || u in UNITS, { message: 'nepoznata jedinica' })

const values = <T extends readonly { value: string }[]>(opts: T) =>
  z.enum(opts.map((o) => o.value) as [string, ...string[]])

export const ingredientImportSchema = z.object({
  uid: z.string().uuid().optional(),
  slug,
  name: text(80),
  synonyms: z.array(text(80)).max(20).default([]),
  broader: slug.optional().nullable(),
  foodGroup: z.enum(['meso', 'riba', 'mlijecno', 'jaja', 'povrce', 'voce', 'zitarice', 'zacini', 'ostalo']).optional().nullable(),
  roundingHint: optText(300),
  publicPage: z.boolean().default(false),
  description: optText(),
  selection: optText(),
  storage: optText(),
  substitutes: optText(),
})

const ingredientLineSchema = z
  .object({
    ingredient: slug,
    amount: z.number().positive().max(100000).optional().nullable(),
    amountMax: z.number().positive().max(100000).optional().nullable(),
    unit: unitCode.default('bez'),
    label: optText(120),
    note: optText(120),
    optional: z.boolean().default(false),
    altGroup: optText(40),
    originalText: optText(200),
  })
  .superRefine((l, ctx) => {
    if (l.amountMax != null && (l.amount == null || l.amountMax <= l.amount)) {
      ctx.addIssue({ code: 'custom', message: 'amountMax mora biti veći od amount', path: ['amountMax'] })
    }
    const textUnit = l.unit === 'po-ukusu' || l.unit === 'po-potrebi'
    if (textUnit && l.amount != null) {
      ctx.addIssue({ code: 'custom', message: '"po ukusu/po potrebi" ne smije imati količinu', path: ['amount'] })
    }
  })

const stepSchema = z.object({
  title: optText(120),
  text: text(3000),
  timerMinutes: z.number().min(0.5).max(1440).optional().nullable(),
  timerLabel: optText(80),
})

export const recipeImportSchema = z.object({
  uid: z.string().uuid().optional(),
  slug,
  title: text(120),
  alternativeNames: z.array(text(120)).max(10).default([]),
  summary: text(300),
  beforeYouStart: optText(),
  primaryCategory: slug,
  secondaryCategories: z.array(slug).max(3).default([]),
  tags: z.array(slug).max(6).default([]),
  authors: z.array(slug).min(1),
  difficulty: values(DIFFICULTY_OPTIONS),
  methods: z.array(values(METHOD_OPTIONS)).default([]),
  diets: z.array(values(DIET_OPTIONS)).default([]),
  meals: z.array(values(MEAL_OPTIONS)).default([]),
  yield: z
    .object({
      servings: z.number().int().min(1).max(200).optional().nullable(),
      unit: optText(30),
      scalable: z.boolean().default(true),
    })
    .default({ scalable: true }),
  times: z
    .object({
      prepMinutes: minutes,
      cookMinutes: minutes,
      restMinutes: minutes,
      restLabel: optText(40),
      totalMinutes: minutes,
    })
    .default({}),
  equipment: z
    .object({
      panSize: optText(60),
      temperature: z.number().min(0).max(300).optional().nullable(),
      ovenMode: z.enum(['gornji-donji', 'ventilator', 'donji', 'gornji']).optional().nullable(),
      other: optText(200),
    })
    .default({}),
  ingredientGroups: z
    .array(z.object({ title: optText(80), items: z.array(ingredientLineSchema).min(1) }))
    .min(1),
  stepGroups: z.array(z.object({ title: optText(80), steps: z.array(stepSchema).min(1) })).min(1),
  tips: z.array(text()).default([]),
  substitutions: z.array(text()).default([]),
  storage: optText(),
  faq: z.array(z.object({ question: text(200), answer: text() })).default([]),
  relatedRecipes: z.array(slug).default([]),
  relatedGuides: z.array(slug).default([]),
  servedWith: z.array(slug).max(4).default([]),
  leftovers: z.object({ text: optText(), recipe: slug.optional().nullable(), guide: slug.optional().nullable() }).default({}),
  seo: z.object({ title: optText(70), description: optText(170) }).default({}),
  facebook: z
    .object({ postedAt: z.string().datetime({ offset: true }).optional().nullable(), postUrl: z.string().url().optional().nullable() })
    .default({}),
  image: z.object({ file: z.string().min(1), alt: text(200), credit: optText(120) }).optional(),
  /** interno: odakle su podaci recepta (obavezno za novi sadržaj, vidi PRAVILA-PISANJA.md) */
  sourceNote: optText(2000),
  /** interno: ID iz sadržajnog plana (content/plan) */
  planId: z.string().regex(/^SNK-\d{3,4}$/).optional().nullable(),
  /** interno: tematska porodica (npr. Cheesecake) */
  family: optText(80),
})

/** Članak „Ideje“ (kolekcija s člankom) — VOD-… iz plana. Recepti se navode slugom i moraju već postojati. */
export const ideaImportSchema = z.object({
  planId: z.string().regex(/^VOD-\d{3}$/).optional().nullable(),
  slug,
  title: text(120),
  headline: optText(120),
  intro: text(400),
  purpose: optText(300),
  author: slug.optional().nullable(),
  articleIntro: optText(3000),
  showOverview: z.boolean().default(true),
  sections: z
    .array(
      z.object({
        title: text(120),
        text: optText(3000),
        items: z
          .array(z.object({ recipe: slug, note: optText(2000), mainIngredients: optText(160), makeAhead: optText(120) }))
          .default([]),
      }),
    )
    .default([]),
  closingTitle: optText(120),
  closing: optText(3000),
  faq: z.array(z.object({ question: text(200), answer: text() })).default([]),
  /** recepti liste ispod članka; ako je prazno, uzimaju se recepti iz sekcija */
  recipes: z.array(slug).default([]),
  relatedGuides: z.array(slug).default([]),
  relatedIdeas: z.array(slug).default([]),
  subfilters: z.array(z.enum(['kategorija', 'vrijeme', 'tezina'])).default([]),
  seo: z.object({ title: optText(70), description: optText(170) }).default({}),
})

export const importFileSchema = z.object({
  format: z.literal('srce-nase-kuhinje/v1'),
  ingredients: z.array(ingredientImportSchema).default([]),
  recipes: z.array(recipeImportSchema).default([]),
  ideas: z.array(ideaImportSchema).default([]),
})

export type IngredientImport = z.infer<typeof ingredientImportSchema>
export type RecipeImport = z.infer<typeof recipeImportSchema>
export type IdeaImport = z.infer<typeof ideaImportSchema>
export type ImportFile = z.infer<typeof importFileSchema>
