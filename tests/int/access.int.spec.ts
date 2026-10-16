/**
 * Kontrola javnog pristupa i urednički tokovi nad stvarnom bazom.
 * Pretpostavlja: npm run db, npm run migrate, npm run seed:demo.
 * HTTP provjere se izvršavaju ako radi server na BASE_URL (npm run dev / start).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { runImport } from '@/payload/importer'

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
let payload: Payload
let serverUp = false
const created: Array<{ collection: 'recipes' | 'ingredients' | 'comments' | 'messages' | 'redirects'; id: number }> = []

beforeAll(async () => {
  payload = await getPayload({ config })
  serverUp = await fetch(`${BASE}/robots.txt`).then((r) => r.ok).catch(() => false)
})

afterAll(async () => {
  for (const c of created.reverse()) {
    await payload.delete({ collection: c.collection, id: c.id, overrideAccess: true }).catch(() => {})
  }
})

describe('Local API bez prijave (javni pristup)', () => {
  it('ne vraća draft recepte, ni uz draft=true', async () => {
    const a = await payload.find({ collection: 'recipes', where: { slug: { equals: 'gulas' } }, overrideAccess: false })
    expect(a.totalDocs).toBe(0)
    const b = await payload.find({ collection: 'recipes', where: { slug: { equals: 'gulas' } }, draft: true, overrideAccess: false })
    expect(b.totalDocs).toBe(0)
  })

  it('ne dozvoljava čitanje verzija, poruka i korisnika', async () => {
    await expect(payload.findVersions({ collection: 'recipes', overrideAccess: false })).rejects.toThrow()
    await expect(payload.find({ collection: 'messages', overrideAccess: false })).rejects.toThrow()
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })

  it('komentari: javno samo odobreni, bez emaila i tehničkih podataka', async () => {
    const recipe = (await payload.find({ collection: 'recipes', where: { slug: { equals: 'palacinke' } }, limit: 1 })).docs[0]
    const pending = await payload.create({
      collection: 'comments',
      overrideAccess: true,
      data: { recipe: recipe.id, kind: 'iskustvo', name: 'Test čekanje', text: 'Ovo čeka odobrenje urednika.', status: 'na-cekanju' },
    })
    const approved = await payload.create({
      collection: 'comments',
      overrideAccess: true,
      data: {
        recipe: recipe.id,
        kind: 'iskustvo',
        name: 'Test odobreno',
        email: 'privatno@example.test',
        text: 'Odobren testni komentar.',
        status: 'odobreno',
        clientHash: 'abc',
      },
    })
    created.push({ collection: 'comments', id: pending.id }, { collection: 'comments', id: approved.id })
    const pub = await payload.find({ collection: 'comments', where: { recipe: { equals: recipe.id } }, overrideAccess: false })
    const ids = pub.docs.map((d) => d.id)
    expect(ids).toContain(approved.id)
    expect(ids).not.toContain(pending.id)
    const doc = pub.docs.find((d) => d.id === approved.id)!
    expect(doc.email).toBeUndefined()
    expect(doc.clientHash).toBeUndefined()
  })

  it('javnost ne može kreirati komentar mimo serverske validacije', async () => {
    const recipe = (await payload.find({ collection: 'recipes', limit: 1 })).docs[0]
    await expect(
      payload.create({ collection: 'comments', overrideAccess: false, data: { recipe: recipe.id, kind: 'iskustvo', name: 'X', text: 'spam spam spam', status: 'odobreno' } }),
    ).rejects.toThrow()
  })
})

describe('uvoz sadržaja', () => {
  const file = JSON.parse(fs.readFileSync('content/examples/primjer-uvoza.json', 'utf8'))
  file.recipes[0].slug = `test-uvoz-${Date.now()}`
  file.ingredients[0].slug = `test-namirnica-${Date.now()}`
  file.ingredients[0].name = `test namirnica ${Date.now()}`
  file.recipes[0].ingredientGroups[0].items[0].ingredient = file.ingredients[0].slug

  it('dry-run ne zapisuje ništa i javlja planirane radnje', async () => {
    const r = await runImport(payload, file, { dryRun: true, baseDir: process.cwd() })
    expect(r.ok).toBe(true)
    expect(r.summary.create).toBe(2)
    const found = await payload.find({ collection: 'recipes', where: { slug: { equals: file.recipes[0].slug } }, draft: true, overrideAccess: true })
    expect(found.totalDocs).toBe(0)
  })

  it('uvoz pravi DRAFT koji javnost ne vidi; ponovni uvoz prepoznaje duplikat', async () => {
    const r = await runImport(payload, file, { dryRun: false, baseDir: process.cwd() })
    expect(r.ok).toBe(true)
    const draft = await payload.find({ collection: 'recipes', where: { slug: { equals: file.recipes[0].slug } }, draft: true, overrideAccess: true })
    expect(draft.docs[0]._status).toBe('draft')
    created.push({ collection: 'recipes', id: draft.docs[0].id })
    const ing = await payload.find({ collection: 'ingredients', where: { slug: { equals: file.ingredients[0].slug } }, overrideAccess: true })
    created.push({ collection: 'ingredients', id: ing.docs[0].id })

    const pub = await payload.find({ collection: 'recipes', where: { slug: { equals: file.recipes[0].slug } }, overrideAccess: false })
    expect(pub.totalDocs).toBe(0)

    const again = await runImport(payload, file, { dryRun: false, baseDir: process.cwd() })
    expect(again.entries.filter((e) => e.type === 'recept').map((e) => e.action)).toEqual(['skip'])
  })

  it('neispravna datoteka se odbija bez zapisa', async () => {
    const r = await runImport(payload, { format: 'pogresno' }, { dryRun: false, baseDir: process.cwd() })
    expect(r.ok).toBe(false)
    expect(r.summary.error).toBeGreaterThan(0)
  })
})

describe('urednički tok: objava, izmjena sluga i preusmjerenje', () => {
  it('objava → vidljivo; promjena sluga → 301 sa stare putanje', async () => {
    const cat = (await payload.find({ collection: 'categories', where: { slug: { equals: 'salate' } } })).docs[0]
    const author = (await payload.find({ collection: 'authors', limit: 1 })).docs[0]
    const ing = (await payload.find({ collection: 'ingredients', where: { slug: { equals: 'paradajz' } } })).docs[0]
    const slug = `test-objava-${Date.now()}`
    const draft = await payload.create({
      collection: 'recipes',
      overrideAccess: true,
      draft: true,
      data: {
        title: 'Test objava',
        slug,
        summary: 'Testni recept.',
        difficulty: 'lako',
        authors: [author.id],
        primaryCategory: cat.id,
        ingredientGroups: [{ items: [{ ingredient: ing.id, amount: 2, unit: 'kom' }] }],
        stepGroups: [{ steps: [{ text: 'Isjeći.' }] }],
        isDemo: true,
        _status: 'draft',
      },
    })
    created.push({ collection: 'recipes', id: draft.id })
    expect((await payload.find({ collection: 'recipes', where: { slug: { equals: slug } }, overrideAccess: false })).totalDocs).toBe(0)

    await payload.update({ collection: 'recipes', id: draft.id, overrideAccess: true, data: { _status: 'published' } })
    const pub = await payload.find({ collection: 'recipes', where: { slug: { equals: slug } }, overrideAccess: false })
    expect(pub.totalDocs).toBe(1)
    expect(pub.docs[0].publishedAt).toBeTruthy()
    expect(pub.docs[0].index?.searchText).toContain('paradajz')

    await payload.update({ collection: 'recipes', id: draft.id, overrideAccess: true, data: { slug: `${slug}-novi`, _status: 'published' } })
    const redirect = await payload.find({ collection: 'redirects', where: { from: { equals: `/recepti/${slug}/` } }, overrideAccess: true })
    expect(redirect.docs[0]?.to).toBe(`/recepti/${slug}-novi/`)
    created.push({ collection: 'redirects', id: redirect.docs[0].id })

    if (serverUp) {
      const res = await fetch(`${BASE}/recepti/${slug}/`, { redirect: 'manual' })
      expect([301, 308]).toContain(res.status)
      expect(res.headers.get('location')).toContain(`/recepti/${slug}-novi/`)
    }
  })
})

describe('javni REST API (HTTP)', () => {
  it('ne otkriva draftove, poruke, korisnike ni verzije', async () => {
    if (!serverUp) return
    const drafts = await fetch(`${BASE}/api/recipes/?draft=true&where[slug][equals]=gulas`).then((r) => r.json())
    expect(drafts.totalDocs ?? 0).toBe(0)
    for (const path of ['/api/messages/', '/api/users/', '/api/recipes/versions/', '/api/comments/?where[status][equals]=na-cekanju']) {
      const r = await fetch(`${BASE}${path}`)
      if (r.status === 200) {
        const body = await r.json()
        expect(body.totalDocs ?? body.docs?.length ?? 0, path).toBe(0)
      } else {
        expect([401, 403], path).toContain(r.status)
      }
    }
  })
  it('stranica draft recepta vraća 404', async () => {
    if (!serverUp) return
    expect((await fetch(`${BASE}/recepti/gulas/`)).status).toBe(404)
  })
  it('API sastojaka za plan ne vraća draft', async () => {
    if (!serverUp) return
    const gulas = (await payload.find({ collection: 'recipes', where: { slug: { equals: 'gulas' } }, draft: true, overrideAccess: true })).docs[0]
    const data = await fetch(`${BASE}/api/site/recipes/?uids=${gulas.uid}&sastojci=1`).then((r) => r.json())
    expect(data.recipes).toHaveLength(0)
    expect(data.missing).toEqual([gulas.uid])
  })
})
