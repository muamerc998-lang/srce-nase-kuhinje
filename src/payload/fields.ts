import type { CollectionBeforeValidateHook, CollectionAfterChangeHook, Field, TextField } from 'payload'
import { randomUUID } from 'node:crypto'
import { slugify } from '../lib/text/normalize'

/** Jedinstven slug; ako je prazan, pravi se iz naslova/naziva. */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug (dio URL-a)',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: `Prazno = automatski iz polja "${from}". Promjena sluga objavljenog sadržaja pravi 301 preusmjerenje.`,
  },
  validate: (value: unknown) =>
    value == null || value === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value))
      ? true
      : 'Slug smije sadržavati samo mala slova bez dijakritike, brojeve i crtice.',
})

export const fillSlug =
  (from = 'title'): CollectionBeforeValidateHook =>
  ({ data }) => {
    if (data && !data.slug && typeof data[from] === 'string') {
      data.slug = slugify(data[from])
    }
    return data
  }

/** Stabilni vanjski ID (za uvoz/izvoz i lokalnu kuharicu). Ne mijenja se. */
export const uidField: Field = {
  name: 'uid',
  type: 'text',
  label: 'Stabilni ID',
  unique: true,
  index: true,
  admin: { position: 'sidebar', readOnly: true },
  hooks: {
    beforeChange: [({ value, originalDoc }) => originalDoc?.uid || value || randomUUID()],
  },
}

export const demoField: Field = {
  name: 'isDemo',
  type: 'checkbox',
  label: 'Demonstracijski sadržaj (nije za objavu)',
  defaultValue: false,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Demo zapisi se u produkciji ne prikazuju javno i ne mogu se objaviti. Uklanjanje: npm run demo:remove.',
  },
}

export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', label: 'SEO naslov', maxLength: 70, admin: { description: 'Prazno = naslov.' } },
    {
      name: 'description',
      type: 'textarea',
      label: 'SEO opis',
      maxLength: 170,
      admin: { description: 'Prazno = sažetak.' },
    },
    { name: 'noindex', type: 'checkbox', label: 'Ne indeksirati ovu stranicu', defaultValue: false },
  ],
}

/** Kad se slug objavljenog sadržaja promijeni, stara putanja se trajno preusmjerava. */
export const slugRedirectHook =
  (prefix: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update') return doc
    const wasPublic = previousDoc?._status ? previousDoc._status === 'published' : true
    if (!wasPublic || !previousDoc?.slug || previousDoc.slug === doc.slug || !doc.slug) return doc
    const from = `${prefix}/${previousDoc.slug}/`
    const to = `${prefix}/${doc.slug}/`
    const existing = await req.payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      limit: 1,
      req,
      depth: 0,
    })
    if (existing.docs[0]) {
      await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data: { to }, req })
    } else {
      await req.payload.create({ collection: 'redirects', data: { from, to, type: '301' }, req })
    }
    // Lanci: sva preusmjerenja koja su vodila na staru adresu sada vode na novu.
    await req.payload.update({
      collection: 'redirects',
      where: { to: { equals: from } },
      data: { to },
      req,
    })
    return doc
  }

/** Zabrana objave demo sadržaja u produkciji. */
export function assertDemoNotPublished(data: Record<string, unknown> | undefined) {
  if (
    process.env.SITE_ENV === 'production' &&
    data?.isDemo &&
    (data._status === 'published' || data._status === undefined)
  ) {
    throw new Error('Demonstracijski sadržaj se ne može objaviti u produkciji.')
  }
}

/**
 * Polja članka s idejama (stranice obroka i kolekcije /ideje/): uvod, sekcije s
 * numerisanim prijedlozima (svaki prijedlog = postojeći recept + vlastiti opis),
 * završni savjet, česta pitanja i vodiči. Pregledna tabela se gradi automatski
 * iz podataka recepata, pa vremena uvijek odgovaraju receptu.
 */
export const articleContentFields = (withDate: boolean): Field[] => [
  { name: 'headline', type: 'text', label: 'Naslov članka (H1)', admin: { description: 'npr. Ideje za doručak: 15 slanih i slatkih prijedloga' } },
  { name: 'author', type: 'relationship', relationTo: 'authors', label: 'Autor' },
  ...(withDate ? [{ name: 'contentUpdatedAt', type: 'date', label: 'Datum izmjene' } as Field] : []),
  { name: 'articleIntro', type: 'textarea', label: 'Uvod (pasusi odvojeni praznim redom)' },
  {
    name: 'showOverview',
    type: 'checkbox',
    label: 'Prikaži preglednu tabelu (jelo, glavne namirnice, vrijeme, unaprijed)',
    defaultValue: true,
  },
  {
    name: 'sections',
    type: 'array',
    label: 'Sekcije s prijedlozima',
    labels: { singular: 'Sekcija', plural: 'Sekcije' },
    fields: [
      { name: 'title', type: 'text', label: 'Naslov sekcije (H2)', required: true },
      { name: 'text', type: 'textarea', label: 'Uvod sekcije (pasusi odvojeni praznim redom)' },
      {
        name: 'items',
        type: 'array',
        label: 'Prijedlozi',
        labels: { singular: 'Prijedlog', plural: 'Prijedlozi' },
        fields: [
          { name: 'recipe', type: 'relationship', relationTo: 'recipes', required: true, label: 'Recept' },
          { name: 'note', type: 'textarea', label: 'Vlastiti opis (60–90 riječi; pasusi odvojeni praznim redom)' },
          { name: 'mainIngredients', type: 'text', label: 'Glavne namirnice (za tabelu)' },
          { name: 'makeAhead', type: 'text', label: 'Priprema unaprijed (za tabelu)', admin: { description: 'npr. "navečer, 8 h u frižideru" ili "ne"' } },
        ],
      },
    ],
  },
  { name: 'closingTitle', type: 'text', label: 'Naslov završnog dijela', defaultValue: 'Kako odabrati' },
  { name: 'closing', type: 'textarea', label: 'Završni savjet (pasusi odvojeni praznim redom)' },
  {
    name: 'faq',
    type: 'array',
    label: 'Česta pitanja',
    labels: { singular: 'Pitanje', plural: 'Pitanja' },
    fields: [
      { name: 'question', type: 'text', label: 'Pitanje', required: true },
      { name: 'answer', type: 'textarea', label: 'Odgovor', required: true },
    ],
  },
  { name: 'relatedGuides', type: 'relationship', relationTo: 'guides', hasMany: true, label: 'Povezani vodiči' },
  {
    name: 'relatedCollections',
    type: 'relationship',
    relationTo: 'recipe-collections',
    hasMany: true,
    label: 'Povezane ideje (uže teme)',
  },
]

/** Trajni ID iz sadržajnog plana (SNK-… / VOD-…). Interno. */
export const planIdField = (prefix: 'SNK' | 'VOD'): TextField => ({
  name: 'planId',
  type: 'text',
  label: 'ID iz plana',
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: `npr. ${prefix}-0001 (iz content/plan)` },
  validate: (v: unknown) => (!v || new RegExp(`^${prefix}-\\d{3,4}$`).test(String(v)) ? true : `Format: ${prefix}-0001`),
})
