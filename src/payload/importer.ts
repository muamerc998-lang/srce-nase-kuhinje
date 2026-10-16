import fs from 'node:fs'
import path from 'node:path'
import type { Payload, Where } from 'payload'
import { importFileSchema, type ImportFile, type RecipeImport } from '../lib/content/schema'

export interface ImportOptions {
  dryRun: boolean
  /** objavi odmah (podrazumijevano: draft) */
  publish?: boolean
  /** postojeći recept dobija novu DRAFT verziju (objavljena verzija ostaje netaknuta) */
  updateDrafts?: boolean
  /** označi sve uvezeno kao demonstracijski sadržaj */
  markDemo?: boolean
  /** osnovni direktorij za relativne putanje slika */
  baseDir: string
}

export type ImportAction = 'create' | 'update-draft' | 'skip' | 'error'

export interface ImportEntry {
  type: 'datoteka' | 'namirnica' | 'recept' | 'ideja'
  slug: string
  action: ImportAction
  message?: string
}

export interface ImportReport {
  ok: boolean
  dryRun: boolean
  entries: ImportEntry[]
  summary: Record<ImportAction, number>
}

type Id = number | string

async function findOne(payload: Payload, collection: 'recipes' | 'ingredients', uid: string | undefined, slug: string) {
  const or: Where[] = [{ slug: { equals: slug } }, ...(uid ? [{ uid: { equals: uid } }] : [])]
  const res = await payload.find({
    collection,
    where: { or },
    limit: 2,
    depth: 0,
    draft: collection === 'recipes',
    overrideAccess: true,
    select: { slug: true, uid: true },
  })
  // uid ima prednost pred slugom
  return res.docs.find((d) => uid && d.uid === uid) ?? res.docs[0]
}

async function slugMap(payload: Payload, collection: 'categories' | 'authors' | 'tags' | 'guides', slugs: string[]) {
  const map = new Map<string, Id>()
  const unique = [...new Set(slugs)]
  if (!unique.length) return map
  const res = await payload.find({
    collection,
    where: { slug: { in: unique } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    draft: collection === 'guides',
    select: { slug: true },
  })
  for (const d of res.docs) map.set(String(d.slug), d.id)
  return map
}

function summarize(entries: ImportEntry[]): ImportReport['summary'] {
  const s = { create: 0, 'update-draft': 0, skip: 0, error: 0 }
  for (const e of entries) s[e.action]++
  return s
}

export async function runImport(payload: Payload, input: unknown, opts: ImportOptions): Promise<ImportReport> {
  const entries: ImportEntry[] = []
  const parsed = importFileSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 50)) {
      entries.push({ type: 'datoteka', slug: issue.path.join('.'), action: 'error', message: issue.message })
    }
    return { ok: false, dryRun: opts.dryRun, entries, summary: summarize(entries) }
  }
  const file: ImportFile = parsed.data

  // Duplikati unutar same datoteke
  for (const [kind, list] of [
    ['namirnica', file.ingredients],
    ['recept', file.recipes],
    ['ideja', file.ideas],
  ] as const) {
    const seen = new Set<string>()
    for (const r of list) {
      if (seen.has(r.slug)) entries.push({ type: kind, slug: r.slug, action: 'error', message: 'slug se ponavlja u datoteci' })
      seen.add(r.slug)
    }
  }
  if (entries.length) return { ok: false, dryRun: opts.dryRun, entries, summary: summarize(entries) }

  const demo = !!opts.markDemo

  // --- Namirnice (redoslijed: šire namirnice prvo) ---
  const ingredientIds = new Map<string, Id>()
  const pending = [...file.ingredients]
  const fileSlugs = new Set(pending.map((i) => i.slug))
  let progress = true
  while (pending.length && progress) {
    progress = false
    for (let i = 0; i < pending.length; i++) {
      const ing = pending[i]
      if (ing.broader && fileSlugs.has(ing.broader) && !ingredientIds.has(ing.broader)) continue
      pending.splice(i--, 1)
      progress = true
      const existing = await findOne(payload, 'ingredients', ing.uid, ing.slug)
      if (existing) {
        ingredientIds.set(ing.slug, existing.id)
        entries.push({ type: 'namirnica', slug: ing.slug, action: 'skip', message: 'već postoji u registru (nije mijenjana)' })
        continue
      }
      let broaderId: Id | undefined
      if (ing.broader) {
        broaderId = ingredientIds.get(ing.broader) ?? (await findOne(payload, 'ingredients', undefined, ing.broader))?.id
        if (broaderId == null) {
          entries.push({ type: 'namirnica', slug: ing.slug, action: 'error', message: `širi pojam "${ing.broader}" ne postoji` })
          continue
        }
      }
      if (opts.dryRun) {
        ingredientIds.set(ing.slug, `novo:${ing.slug}`)
      } else {
        const created = await payload.create({
          collection: 'ingredients',
          overrideAccess: true,
          data: {
            uid: ing.uid,
            slug: ing.slug,
            name: ing.name,
            synonyms: ing.synonyms.map((term) => ({ term })),
            broader: broaderId as number | undefined,
            foodGroup: (ing.foodGroup ?? undefined) as never,
            roundingHint: ing.roundingHint ?? undefined,
            publicPage: ing.publicPage,
            description: ing.description ?? undefined,
            selection: ing.selection ?? undefined,
            storage: ing.storage ?? undefined,
            substitutes: ing.substitutes ?? undefined,
            isDemo: demo,
          },
        })
        ingredientIds.set(ing.slug, created.id)
      }
      entries.push({ type: 'namirnica', slug: ing.slug, action: 'create' })
    }
  }
  for (const ing of pending) {
    entries.push({ type: 'namirnica', slug: ing.slug, action: 'error', message: 'kružna veza širih pojmova' })
  }

  // --- Reference za recepte ---
  const cats = await slugMap(payload, 'categories', file.recipes.flatMap((r) => [r.primaryCategory, ...r.secondaryCategories]))
  const authors = await slugMap(payload, 'authors', file.recipes.flatMap((r) => r.authors))
  const tags = await slugMap(payload, 'tags', file.recipes.flatMap((r) => r.tags))
  const guides = await slugMap(payload, 'guides', file.recipes.flatMap((r) => [...r.relatedGuides, ...(r.leftovers.guide ? [r.leftovers.guide] : [])]))
  const neededIngredients = [...new Set(file.recipes.flatMap((r) => r.ingredientGroups.flatMap((g) => g.items.map((i) => i.ingredient))))]
  for (const s of neededIngredients) {
    if (!ingredientIds.has(s)) {
      const found = await findOne(payload, 'ingredients', undefined, s)
      if (found) ingredientIds.set(s, found.id)
    }
  }

  const recipeIds = new Map<string, Id>()
  const toLink: RecipeImport[] = []

  for (const r of file.recipes) {
    const missing: string[] = []
    const need = (map: Map<string, Id>, slugs: string[], label: string) =>
      slugs.forEach((s) => !map.has(s) && missing.push(`${label} "${s}"`))
    need(cats, [r.primaryCategory, ...r.secondaryCategories], 'kategorija')
    need(authors, r.authors, 'autor')
    need(tags, r.tags, 'oznaka')
    need(guides, [...r.relatedGuides, ...(r.leftovers.guide ? [r.leftovers.guide] : [])], 'vodič')
    need(ingredientIds, r.ingredientGroups.flatMap((g) => g.items.map((i) => i.ingredient)), 'namirnica')
    let imagePath: string | undefined
    if (r.image) {
      imagePath = path.resolve(opts.baseDir, r.image.file)
      if (!fs.existsSync(imagePath)) missing.push(`slika "${r.image.file}"`)
    }
    if (missing.length) {
      entries.push({ type: 'recept', slug: r.slug, action: 'error', message: `nedostaje: ${missing.join(', ')}` })
      continue
    }

    const existing = await findOne(payload, 'recipes', r.uid, r.slug)
    if (existing && !opts.updateDrafts) {
      recipeIds.set(r.slug, existing.id)
      entries.push({
        type: 'recept',
        slug: r.slug,
        action: 'skip',
        message: 'već postoji (uid/slug). Za novu draft verziju pokrenite s --update-drafts.',
      })
      continue
    }

    if (opts.dryRun) {
      recipeIds.set(r.slug, existing?.id ?? `novo:${r.slug}`)
      entries.push({ type: 'recept', slug: r.slug, action: existing ? 'update-draft' : 'create' })
      toLink.push(r)
      continue
    }

    let heroImage: Id | undefined
    if (r.image && imagePath) {
      const media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt: r.image.alt, credit: r.image.credit ?? undefined, isDemo: demo },
        filePath: imagePath,
      })
      heroImage = media.id
    }

    const data = {
      uid: r.uid,
      slug: r.slug,
      title: r.title,
      alternativeNames: r.alternativeNames.map((name) => ({ name })),
      summary: r.summary,
      beforeYouStart: r.beforeYouStart ?? undefined,
      heroImage: heroImage as number | undefined,
      difficulty: r.difficulty as 'lako' | 'srednje' | 'zahtjevno',
      methods: r.methods as never,
      diets: r.diets as never,
      meals: r.meals as never,
      yield: { servings: r.yield.servings ?? undefined, unit: r.yield.unit ?? undefined, scalable: r.yield.scalable },
      times: r.times as never,
      equipment: r.equipment as never,
      ingredientGroups: r.ingredientGroups.map((g) => ({
        title: g.title ?? undefined,
        items: g.items.map((it) => ({
          ingredient: ingredientIds.get(it.ingredient) as number,
          amount: it.amount ?? undefined,
          amountMax: it.amountMax ?? undefined,
          unit: (it.unit || 'bez') as never,
          label: it.label ?? undefined,
          note: it.note ?? undefined,
          optional: it.optional,
          altGroup: it.altGroup ?? undefined,
          originalText: it.originalText ?? undefined,
        })),
      })),
      stepGroups: r.stepGroups.map((g) => ({
        title: g.title ?? undefined,
        steps: g.steps.map((s) => ({
          title: s.title ?? undefined,
          text: s.text,
          timerMinutes: s.timerMinutes ?? undefined,
          timerLabel: s.timerLabel ?? undefined,
        })),
      })),
      tips: r.tips.map((text) => ({ text })),
      substitutions: r.substitutions.map((text) => ({ text })),
      storage: r.storage ?? undefined,
      faq: r.faq,
      relatedGuides: r.relatedGuides.map((s) => guides.get(s) as number),
      leftovers: { text: r.leftovers.text ?? undefined, guide: r.leftovers.guide ? (guides.get(r.leftovers.guide) as number) : undefined },
      authors: r.authors.map((s) => authors.get(s) as number),
      primaryCategory: cats.get(r.primaryCategory) as number,
      secondaryCategories: r.secondaryCategories.map((s) => cats.get(s) as number),
      tags: r.tags.map((s) => tags.get(s) as number),
      seo: { title: r.seo.title ?? undefined, description: r.seo.description ?? undefined },
      facebook: { postedAt: r.facebook.postedAt ?? undefined, postUrl: r.facebook.postUrl ?? undefined },
      sourceNote: r.sourceNote ?? undefined,
      planId: r.planId ?? undefined,
      approach: (r.approach ?? undefined) as never,
      article: r.article.map((a) => ({ level: a.level, title: a.title ?? undefined, body: a.body })),
      family: r.family ?? undefined,
      isDemo: demo,
    }

    try {
      if (existing) {
        const { uid: _uid, ...rest } = data
        await payload.update({
          collection: 'recipes',
          id: existing.id,
          overrideAccess: true,
          draft: true,
          data: { ...rest, _status: 'draft' },
        })
        recipeIds.set(r.slug, existing.id)
        entries.push({ type: 'recept', slug: r.slug, action: 'update-draft', message: 'nova draft verzija; objavljena verzija nije promijenjena' })
      } else {
        const created = await payload.create({
          collection: 'recipes',
          overrideAccess: true,
          draft: !opts.publish,
          data: { ...data, _status: opts.publish ? 'published' : 'draft' },
        })
        recipeIds.set(r.slug, created.id)
        entries.push({ type: 'recept', slug: r.slug, action: 'create', message: opts.publish ? 'objavljeno' : 'draft' })
      }
      toLink.push(r)
    } catch (e) {
      entries.push({ type: 'recept', slug: r.slug, action: 'error', message: (e as Error).message })
    }
  }

  // --- Povezani recepti (drugi prolaz, nakon što svi postoje) ---
  for (const r of toLink) {
    const linkSlugs = [...r.relatedRecipes, ...r.servedWith, ...(r.leftovers.recipe ? [r.leftovers.recipe] : [])]
    if (!linkSlugs.length) continue
    const resolved = new Map<string, Id>()
    const ids: Id[] = []
    for (const s of [...new Set(linkSlugs)]) {
      const id = recipeIds.get(s) ?? (await findOne(payload, 'recipes', undefined, s))?.id
      if (id == null) {
        entries.push({ type: 'recept', slug: r.slug, action: 'error', message: `povezani recept "${s}" ne postoji` })
      } else {
        resolved.set(s, id)
        ids.push(id)
      }
    }
    if (!opts.dryRun && resolved.size) {
      const id = recipeIds.get(r.slug)!
      await payload.update({
        collection: 'recipes',
        id,
        overrideAccess: true,
        draft: !opts.publish,
        data: {
          relatedRecipes: r.relatedRecipes.map((s) => resolved.get(s)).filter((x) => x != null) as number[],
          servedWith: r.servedWith.map((s) => resolved.get(s)).filter((x) => x != null) as number[],
          ...(r.leftovers.recipe && resolved.get(r.leftovers.recipe) != null
            ? { leftovers: { text: r.leftovers.text ?? undefined, recipe: resolved.get(r.leftovers.recipe) as number, guide: r.leftovers.guide ? (guides.get(r.leftovers.guide) as number) : undefined } }
            : {}),
        },
      })
    }
  }

  // --- Članci „Ideje“ (kolekcije s člankom) ---
  if (file.ideas.length) {
    const ideaAuthors = await slugMap(payload, 'authors', file.ideas.flatMap((i) => (i.author ? [i.author] : [])))
    const ideaGuides = await slugMap(payload, 'guides', file.ideas.flatMap((i) => i.relatedGuides))
    const findIdea = async (slug: string) =>
      (await payload.find({ collection: 'recipe-collections', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true, overrideAccess: true, select: { slug: true } })).docs[0]
    const ideaIds = new Map<string, Id>()
    const linkIdeas: { id: Id; related: string[] }[] = []
    for (const idea of file.ideas) {
      const sectionSlugs = idea.sections.flatMap((s) => s.items.map((i) => i.recipe))
      const listSlugs = idea.recipes.length ? idea.recipes : [...new Set(sectionSlugs)]
      const missing: string[] = []
      const rid = new Map<string, Id>()
      for (const s of [...new Set([...sectionSlugs, ...listSlugs])]) {
        const id = recipeIds.get(s) ?? (await findOne(payload, 'recipes', undefined, s))?.id
        if (id == null) missing.push(`recept "${s}"`)
        else rid.set(s, id)
      }
      if (idea.author && !ideaAuthors.has(idea.author)) missing.push(`autor "${idea.author}"`)
      idea.relatedGuides.forEach((g) => !ideaGuides.has(g) && missing.push(`vodič "${g}"`))
      if (!listSlugs.length) missing.push('barem jedan recept')
      if (missing.length) {
        entries.push({ type: 'ideja', slug: idea.slug, action: 'error', message: `nedostaje: ${missing.join(', ')}` })
        continue
      }
      const existing = await findIdea(idea.slug)
      if (existing && !opts.updateDrafts) {
        ideaIds.set(idea.slug, existing.id)
        entries.push({ type: 'ideja', slug: idea.slug, action: 'skip', message: 'već postoji. Za novu draft verziju pokrenite s --update-drafts.' })
        continue
      }
      if (opts.dryRun) {
        entries.push({ type: 'ideja', slug: idea.slug, action: existing ? 'update-draft' : 'create' })
        continue
      }
      const data = {
        planId: idea.planId ?? undefined,
        slug: idea.slug,
        title: idea.title,
        intro: idea.intro,
        purpose: idea.purpose ?? undefined,
        headline: idea.headline ?? undefined,
        author: idea.author ? (ideaAuthors.get(idea.author) as number) : undefined,
        articleIntro: idea.articleIntro ?? undefined,
        showOverview: idea.showOverview,
        sections: idea.sections.map((s) => ({
          title: s.title,
          text: s.text ?? undefined,
          items: s.items.map((it) => ({
            recipe: rid.get(it.recipe) as number,
            note: it.note ?? undefined,
            mainIngredients: it.mainIngredients ?? undefined,
            makeAhead: it.makeAhead ?? undefined,
          })),
        })),
        closingTitle: idea.closingTitle ?? undefined,
        closing: idea.closing ?? undefined,
        faq: idea.faq,
        recipes: listSlugs.map((s) => rid.get(s) as number),
        relatedGuides: idea.relatedGuides.map((g) => ideaGuides.get(g) as number),
        subfilters: idea.subfilters as never,
        seo: { title: idea.seo.title ?? undefined, description: idea.seo.description ?? undefined },
        isDemo: demo,
      }
      try {
        const doc = existing
          ? await payload.update({ collection: 'recipe-collections', id: existing.id, overrideAccess: true, draft: true, data: { ...data, _status: 'draft' } })
          : await payload.create({ collection: 'recipe-collections', overrideAccess: true, draft: true, data: { ...data, _status: 'draft' } })
        ideaIds.set(idea.slug, doc.id)
        if (idea.relatedIdeas.length) linkIdeas.push({ id: doc.id, related: idea.relatedIdeas })
        entries.push({ type: 'ideja', slug: idea.slug, action: existing ? 'update-draft' : 'create', message: 'draft' })
      } catch (e) {
        entries.push({ type: 'ideja', slug: idea.slug, action: 'error', message: (e as Error).message })
      }
    }
    // povezane ideje: samo one koje postoje (dok uža tema nije napisana, veza se preskače — bez lažnih linkova)
    for (const l of linkIdeas) {
      const ids: Id[] = []
      for (const s of l.related) {
        const id = ideaIds.get(s) ?? (await findIdea(s))?.id
        if (id != null) ids.push(id)
        else entries.push({ type: 'ideja', slug: s, action: 'skip', message: 'povezana ideja još ne postoji; veza nije dodana' })
      }
      if (ids.length) await payload.update({ collection: 'recipe-collections', id: l.id, overrideAccess: true, draft: true, data: { relatedCollections: ids as number[] } })
    }
  }

  const summary = summarize(entries)
  return { ok: summary.error === 0, dryRun: opts.dryRun, entries, summary }
}

export function formatReport(report: ImportReport): string {
  const lines = [
    report.dryRun ? 'PROBNI UVOZ (dry-run) — ništa nije zapisano.' : 'UVOZ ZAVRŠEN.',
    `Novo: ${report.summary.create} · Nova draft verzija: ${report.summary['update-draft']} · Preskočeno: ${report.summary.skip} · Greške: ${report.summary.error}`,
    '',
  ]
  for (const e of report.entries) {
    lines.push(`[${e.action.toUpperCase()}] ${e.type} ${e.slug}${e.message ? ` — ${e.message}` : ''}`)
  }
  return lines.join('\n')
}
