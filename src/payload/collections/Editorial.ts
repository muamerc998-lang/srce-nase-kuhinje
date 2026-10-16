import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '../access'
import { demoField, fillSlug, slugField, slugRedirectHook, uidField, seoFields, assertDemoNotPublished, articleContentFields, planIdField } from '../fields'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const previewUrl = (collection: string) => (doc: Record<string, unknown>) =>
  doc?.slug ? `${siteUrl()}/api/site/preview?collection=${collection}&slug=${encodeURIComponent(String(doc.slug))}` : null

const stampDates = ({ data, originalDoc }: { data?: Record<string, unknown>; originalDoc?: Record<string, unknown> }) => {
  assertDemoNotPublished(data)
  if (data?._status === 'published') {
    const now = new Date().toISOString()
    if (!data.publishedAt && !originalDoc?.publishedAt) data.publishedAt = now
    if (!data.contentUpdatedAt && !originalDoc?.contentUpdatedAt) data.contentUpdatedAt = now
  }
  return data
}

const dateFields = [
  { name: 'publishedAt', type: 'date', label: 'Datum objave', admin: { position: 'sidebar' } },
  {
    name: 'contentUpdatedAt',
    type: 'date',
    label: 'Datum stvarne izmjene',
    admin: { position: 'sidebar', description: 'Mijenjati samo kod bitne sadržajne izmjene.' },
  },
] as const

export const RecipeCollections: CollectionConfig = {
  slug: 'recipe-collections',
  labels: { singular: 'Kolekcija', plural: 'Kolekcije' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'indexable', 'isDemo'],
    group: 'Sadržaj',
    description: 'Urednički kurirane stranice. Ne praviti više kolekcija istog smisla ("brzo", "brzi recepti"…).',
    preview: previewUrl('recipe-collections'),
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrStaff, readVersions: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('title')],
    beforeChange: [stampDates],
    afterChange: [revalidateCollection('recipe-collections'), slugRedirectHook('/ideje')],
    afterDelete: [revalidateCollectionDelete('recipe-collections')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Naslov', required: true },
    { name: 'purpose', type: 'text', label: 'Namjena (interno)', admin: { description: 'Kome i zašto služi ova kolekcija.' } },
    { name: 'intro', type: 'textarea', label: 'Urednički uvod', required: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Naslovna fotografija' },
    {
      name: 'recipes',
      type: 'relationship',
      relationTo: 'recipes',
      hasMany: true,
      label: 'Recepti (redoslijed se poštuje)',
      minRows: 1,
    },
    {
      name: 'subfilters',
      type: 'select',
      hasMany: true,
      label: 'Podfilteri na stranici kolekcije',
      options: [
        { label: 'Kategorija', value: 'kategorija' },
        { label: 'Vrijeme', value: 'vrijeme' },
        { label: 'Težina', value: 'tezina' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Članak (ideje)',
      admin: { description: 'Ako su sekcije popunjene, stranica /ideje/ prikazuje članak iznad liste recepata. Pisati po content/PRAVILA-PISANJA.md.' },
      fields: articleContentFields(false),
    },
    {
      name: 'indexable',
      type: 'checkbox',
      label: 'Dozvoli indeksiranje',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Samo za kolekcije s jasnom, jedinstvenom namjenom i dovoljno recepata.' },
    },
    ...dateFields,
    seoFields,
    slugField('title'),
    planIdField('VOD'),
    uidField,
    demoField,
  ],
}

export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: { singular: 'Vodič', plural: 'Savjeti iz kuhinje (vodiči)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'isDemo', 'updatedAt'],
    group: 'Sadržaj',
    preview: previewUrl('guides'),
  },
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: publishedOrStaff, readVersions: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('title')],
    beforeChange: [stampDates],
    afterChange: [revalidateCollection('guides'), slugRedirectHook('/savjeti')],
    afterDelete: [revalidateCollectionDelete('guides')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Naslov', required: true },
    {
      name: 'answer',
      type: 'textarea',
      label: 'Kratak odgovor na početku',
      required: true,
      admin: { description: 'Jasan odgovor u 2–4 rečenice prije detalja.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Glavna fotografija' },
    { name: 'body', type: 'richText', label: 'Tekst vodiča' },
    { name: 'relatedIngredients', type: 'relationship', relationTo: 'ingredients', hasMany: true, label: 'Povezane namirnice' },
    { name: 'relatedRecipes', type: 'relationship', relationTo: 'recipes', hasMany: true, label: 'Povezani recepti' },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
      label: 'Autor / uredništvo',
      admin: { position: 'sidebar' },
    },
    ...dateFields,
    seoFields,
    slugField('title'),
    uidField,
    demoField,
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Informativna stranica', plural: 'Informativne stranice' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'needsEditorInput'],
    group: 'Sadržaj',
    description: 'O nama, Urednička politika, Privatnost, Kolačići, Uslovi korištenja…',
    preview: previewUrl('pages'),
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrStaff, readVersions: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('title')],
    beforeChange: [
      ({ data }) => {
        if (process.env.SITE_ENV === 'production' && data?._status === 'published' && data?.needsEditorInput) {
          throw new Error('Stranica je označena kao nedovršena (potrebna urednička dopuna) i ne može se objaviti u produkciji.')
        }
        return stampDates({ data })
      },
    ],
    afterChange: [revalidateCollection('pages')],
    afterDelete: [revalidateCollectionDelete('pages')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Naslov', required: true },
    { name: 'body', type: 'richText', label: 'Sadržaj' },
    {
      name: 'needsEditorInput',
      type: 'checkbox',
      label: 'Potrebna urednička dopuna',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Pravni podaci, kontakt i obrada podataka moraju se uskladiti sa stvarnim hostingom i servisima prije objave.',
      },
    },
    {
      name: 'footerGroup',
      type: 'select',
      label: 'Grupa u footeru',
      options: [
        { label: 'O portalu', value: 'portal' },
        { label: 'Pravno', value: 'pravno' },
      ],
      admin: { position: 'sidebar' },
    },
    ...dateFields,
    seoFields,
    slugField('title'),
    demoField,
  ],
}
