/**
 * Ažurira samo urednički tekst postojećih recepata (pristup, članak, savjeti, zamjene, čuvanje,
 * „šta poslužiti uz ovo“) iz datoteke uvoza. Sastojci, koraci, slike i ostala polja se ne diraju.
 *
 *   npx tsx scripts/azuriraj-clanke.ts <datoteka.json> <slug,slug>              → pregled (ništa se ne zapisuje)
 *   ... --primijeni                                                             → nova draft verzija
 *   ... --primijeni --objavi                                                    → izmjena se odmah objavljuje
 *
 * Za produkciju: DATABASE_URL iz .env.neon.
 */
import 'dotenv/config'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { recipeImportSchema } from '../src/lib/content/schema'
import { parseInline, wordCount } from '../src/lib/content/article-text'

async function main() {
  const [file, slugArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  if (!file || !slugArg) {
    console.error('Upotreba: npx tsx scripts/azuriraj-clanke.ts <datoteka.json> <slug,slug> [--primijeni] [--objavi]')
    process.exit(2)
  }
  const apply = process.argv.includes('--primijeni')
  const publish = apply && process.argv.includes('--objavi')
  const slugs = slugArg.split(',').map((s) => s.trim())
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { recipes: unknown[] }
  const payload = await getPayload({ config })
  let ok = true

  for (const slug of slugs) {
    const raw = data.recipes.find((r) => (r as { slug?: string }).slug === slug)
    const parsed = raw ? recipeImportSchema.safeParse(raw) : null
    if (!parsed?.success) {
      console.log(`✗ ${slug}: ${raw ? parsed?.error.message : 'nema ga u datoteci'}`)
      ok = false
      continue
    }
    const r = parsed.data
    const found = await payload.find({ collection: 'recipes', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true, overrideAccess: true })
    const doc = found.docs[0]
    if (!doc) {
      console.log(`✗ ${slug}: recept ne postoji u bazi`)
      ok = false
      continue
    }

    // Interni linkovi u tekstu moraju voditi na objavljene recepte
    const missing: string[] = []
    for (const sec of r.article)
      for (const part of parseInline(sec.body))
        if (part.type === 'link' && part.href.startsWith('/recepti/')) {
          const target = part.href.split('/')[2]
          const t = await payload.find({ collection: 'recipes', where: { slug: { equals: target }, _status: { equals: 'published' } }, limit: 1, depth: 0, overrideAccess: true })
          if (!t.docs.length) missing.push(part.href)
        }
    const servedWith: number[] = []
    for (const s of r.servedWith) {
      const t = await payload.find({ collection: 'recipes', where: { slug: { equals: s } }, limit: 1, depth: 0, overrideAccess: true })
      if (t.docs[0]) servedWith.push(t.docs[0].id as number)
      else missing.push(`servedWith: ${s}`)
    }
    if (missing.length) {
      console.log(`✗ ${slug}: neobjavljene veze: ${missing.join(', ')}`)
      ok = false
      continue
    }

    const words = wordCount(r.article.map((a) => a.body))
    console.log(`${apply ? '✓' : '·'} ${slug}: ${r.article.length} sekcija, ${words} riječi, pristup ${r.approach ?? '—'}${publish ? ' → objavljeno' : apply ? ' → draft' : ''}`)
    if (!apply) continue
    await payload.update({
      collection: 'recipes',
      id: doc.id,
      overrideAccess: true,
      draft: !publish,
      data: {
        approach: (r.approach ?? null) as never,
        article: r.article.map((a) => ({ level: a.level, title: a.title ?? undefined, body: a.body })),
        tips: r.tips.map((text) => ({ text })),
        substitutions: r.substitutions.map((text) => ({ text })),
        storage: r.storage ?? null,
        servedWith,
        _status: publish ? 'published' : 'draft',
      },
    })
  }
  if (!apply && ok) console.log('\nZa stvarnu izmjenu ponovite s --primijeni (i --objavi za objavu).')
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
