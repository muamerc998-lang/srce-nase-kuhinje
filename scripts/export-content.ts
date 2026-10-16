/**
 * Izvoz recepata i namirnica u format za uvoz ("srce-nase-kuhinje/v1").
 *
 *   npm run content:export -- izvoz.json            → objavljeni recepti + sve namirnice
 *   npm run content:export -- izvoz.json --draftovi → uključuje i najnovije draft verzije
 *   npm run content:export -- izvoz.json --bez-demo → izostavlja demonstracijski sadržaj
 *
 * Slike se ne izvoze (samo podaci); izvoz se validira istom shemom kao uvoz.
 */
import 'dotenv/config'
import fs from 'node:fs'
import { getPayload, type Where } from 'payload'
import config from '../src/payload.config'
import { importFileSchema } from '../src/lib/content/schema'
import type { Category, Author, Tag, Ingredient, Guide, Recipe } from '../src/payload-types'

const slug = (x: unknown) => (x && typeof x === 'object' ? ((x as { slug?: string }).slug ?? '') : '')

async function main() {
  const out = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'izvoz-sadrzaja.json'
  const drafts = process.argv.includes('--draftovi')
  const noDemo = process.argv.includes('--bez-demo')
  const payload = await getPayload({ config })
  const demoWhere: Where = noDemo ? { isDemo: { not_equals: true } } : {}

  const ingredients = await payload.find({ collection: 'ingredients', where: demoWhere, pagination: false, depth: 1, overrideAccess: true })
  const recipes = await payload.find({
    collection: 'recipes',
    where: drafts ? demoWhere : { and: [{ _status: { equals: 'published' } }, demoWhere] },
    pagination: false,
    depth: 2,
    draft: drafts,
    overrideAccess: true,
  })

  const data = {
    format: 'srce-nase-kuhinje/v1',
    ingredients: ingredients.docs.map((i: Ingredient) => ({
      uid: i.uid ?? undefined,
      slug: i.slug ?? '',
      name: i.name,
      synonyms: (i.synonyms ?? []).map((s) => s.term),
      broader: slug(i.broader) || null,
      foodGroup: i.foodGroup ?? null,
      roundingHint: i.roundingHint ?? null,
      publicPage: !!i.publicPage,
      description: i.description ?? null,
      selection: i.selection ?? null,
      storage: i.storage ?? null,
      substitutes: i.substitutes ?? null,
    })),
    recipes: recipes.docs.map((r: Recipe) => ({
      uid: r.uid ?? undefined,
      slug: r.slug ?? '',
      title: r.title,
      alternativeNames: (r.alternativeNames ?? []).map((a) => a.name),
      summary: r.summary,
      beforeYouStart: r.beforeYouStart ?? null,
      primaryCategory: slug(r.primaryCategory as Category),
      secondaryCategories: (r.secondaryCategories ?? []).map(slug),
      tags: (r.tags ?? []).map((t) => slug(t as Tag)),
      authors: (r.authors ?? []).map((a) => slug(a as Author)),
      difficulty: r.difficulty,
      methods: r.methods ?? [],
      diets: r.diets ?? [],
      meals: r.meals ?? [],
      yield: { servings: r.yield?.servings ?? null, unit: r.yield?.unit ?? null, scalable: r.yield?.scalable ?? true },
      times: {
        prepMinutes: r.times?.prepMinutes ?? null,
        cookMinutes: r.times?.cookMinutes ?? null,
        restMinutes: r.times?.restMinutes ?? null,
        restLabel: r.times?.restLabel ?? null,
        totalMinutes: r.times?.totalMinutes ?? null,
      },
      equipment: {
        panSize: r.equipment?.panSize ?? null,
        temperature: r.equipment?.temperature ?? null,
        ovenMode: r.equipment?.ovenMode ?? null,
        other: r.equipment?.other ?? null,
      },
      ingredientGroups: (r.ingredientGroups ?? []).map((g) => ({
        title: g.title ?? null,
        items: (g.items ?? []).map((it) => ({
          ingredient: slug(it.ingredient),
          amount: it.amount ?? null,
          amountMax: it.amountMax ?? null,
          unit: it.unit ?? 'bez',
          label: it.label ?? null,
          note: it.note ?? null,
          optional: !!it.optional,
          altGroup: it.altGroup ?? null,
          originalText: it.originalText ?? null,
        })),
      })),
      stepGroups: (r.stepGroups ?? []).map((g) => ({
        title: g.title ?? null,
        steps: (g.steps ?? []).map((s) => ({ title: s.title ?? null, text: s.text, timerMinutes: s.timerMinutes ?? null, timerLabel: s.timerLabel ?? null })),
      })),
      tips: (r.tips ?? []).map((t) => t.text),
      substitutions: (r.substitutions ?? []).map((t) => t.text),
      storage: r.storage ?? null,
      faq: (r.faq ?? []).map((f) => ({ question: f.question, answer: f.answer })),
      relatedRecipes: (r.relatedRecipes ?? []).map(slug).filter(Boolean),
      relatedGuides: (r.relatedGuides ?? []).map((g) => slug(g as Guide)).filter(Boolean),
      servedWith: (r.servedWith ?? []).map(slug).filter(Boolean),
      leftovers: { text: r.leftovers?.text ?? null, recipe: slug(r.leftovers?.recipe) || null, guide: slug(r.leftovers?.guide) || null },
      seo: { title: r.seo?.title ?? null, description: r.seo?.description ?? null },
      facebook: { postedAt: r.facebook?.postedAt ?? null, postUrl: r.facebook?.postUrl ?? null },
    })),
  }
  const check = importFileSchema.safeParse(data)
  if (!check.success) {
    console.error('Izvoz ne prolazi validaciju formata:', check.error.issues.slice(0, 10))
    process.exit(1)
  }
  fs.writeFileSync(out, JSON.stringify(data, null, 2))
  console.log(`Izvezeno: ${data.ingredients.length} namirnica, ${data.recipes.length} recepata → ${out}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
