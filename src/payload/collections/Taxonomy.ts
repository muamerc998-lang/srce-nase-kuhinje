import type { CollectionConfig } from 'payload'
import { isStaff, publicOrStaff } from '../access'
import { demoField, fillSlug, slugField, slugRedirectHook, uidField, seoFields, assertDemoNotPublished } from '../fields'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { normalizeText } from '../../lib/text/normalize'

const noDemoInProd = ({ data }: { data?: Record<string, unknown> }) => {
  assertDemoNotPublished(data)
  return data
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategorija', plural: 'Kategorije' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'order', 'showInMenu'],
    group: 'Registri',
    description: 'Prazne kategorije se javno ne prikazuju.',
  },
  defaultSort: 'order',
  access: { read: publicOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('name')],
    beforeChange: [noDemoInProd],
    afterChange: [revalidateCollection('categories'), revalidateCollection('recipes'), slugRedirectHook('/kategorije')],
    afterDelete: [revalidateCollectionDelete('categories')],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Naziv', required: true },
    { name: 'intro', type: 'textarea', label: 'Kratak uvod' },
    {
      name: 'body',
      type: 'textarea',
      label: 'Tekst o kategoriji (ispod recepata)',
      admin: { description: 'Pasusi odvojeni praznim redom. Šta pripada kategoriji, kako odabrati recept, korisne napomene.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Nadređena kategorija',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Fotografija' },
    { name: 'order', type: 'number', label: 'Redoslijed', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'showInMenu', type: 'checkbox', label: 'Prikaži u meniju Recepti', defaultValue: true, admin: { position: 'sidebar' } },
    seoFields,
    slugField('name'),
    uidField,
    demoField,
  ],
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Oznaka', plural: 'Oznake' },
  admin: {
    useAsTitle: 'name',
    group: 'Registri',
    description: 'Kontrolisane oznake. Sinonim spojiti tako da se postavi "Spojeno u" — recepti tada koriste glavnu oznaku.',
  },
  access: { read: publicOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('name')],
    beforeChange: [noDemoInProd],
    afterChange: [revalidateCollection('recipes')],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Naziv', required: true, unique: true },
    {
      name: 'group',
      type: 'select',
      label: 'Grupa',
      defaultValue: 'ostalo',
      options: [
        { label: 'Glavna namirnica', value: 'namirnica' },
        { label: 'Vrsta tijesta', value: 'tijesto' },
        { label: 'Ostalo', value: 'ostalo' },
      ],
      admin: { description: 'Glavna namirnica i vrsta tijesta prikazuju se kao filteri. Sastav (posno, bez glutena…) i način (rerna, tava) su posebna polja recepta.' },
    },
    {
      name: 'synonyms',
      type: 'text',
      label: 'Sinonimi za pretragu',
      admin: { description: 'Odvojiti tačka-zarezom, npr. pasulj; fažol' },
    },
    {
      name: 'mergedInto',
      type: 'relationship',
      relationTo: 'tags',
      label: 'Spojeno u (sinonim)',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    { name: 'public', type: 'checkbox', label: 'Prikazuj javno uz recept', defaultValue: true },
    slugField('name'),
    demoField,
  ],
}

export const SearchSynonyms: CollectionConfig = {
  slug: 'search-synonyms',
  labels: { singular: 'Sinonim pretrage', plural: 'Sinonimi pretrage' },
  admin: {
    useAsTitle: 'label',
    group: 'Registri',
    description: 'Grupe izraza koji se u pretrazi tretiraju isto (npr. palačinke / pačinke / palačinci). Sinonimi namirnica se unose kod namirnice.',
  },
  access: { read: publicOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) {
          const terms = ((data.terms as { term: string }[]) ?? []).map((t) => t.term)
          data.label = terms.join(' / ')
          data.normalized = terms.map(normalizeText).filter(Boolean).join('|')
        }
        return data
      },
    ],
    afterChange: [revalidateCollection('search-synonyms')],
  },
  fields: [
    { name: 'terms', type: 'array', label: 'Izrazi', labels: { singular: 'Izraz', plural: 'Izrazi' }, minRows: 2, fields: [{ name: 'term', type: 'text', label: 'Izraz', required: true }] },
    { name: 'label', type: 'text', admin: { hidden: true } },
    { name: 'normalized', type: 'text', admin: { hidden: true } },
    demoField,
  ],
}

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Autor / uredništvo', plural: 'Autori i uredništvo' },
  admin: {
    useAsTitle: 'name',
    group: 'Sadržaj',
    description: 'Unositi samo stvarne osobe ili stvarno imenovano uredništvo. Ne izmišljati biografije ni tvrdnje o testiranju.',
  },
  access: { read: publicOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('name')],
    beforeChange: [noDemoInProd],
    afterChange: [revalidateCollection('authors'), revalidateCollection('recipes')],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Ime / naziv', required: true },
    { name: 'isTeam', type: 'checkbox', label: 'Ovo je uredništvo (tim)', defaultValue: false },
    { name: 'role', type: 'text', label: 'Uloga', admin: { description: 'npr. urednica recepata' } },
    { name: 'bio', type: 'textarea', label: 'Biografija' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Fotografija' },
    slugField('name'),
    demoField,
  ],
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Preusmjerenje', plural: 'Preusmjerenja' },
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'type'], group: 'Sistem' },
  access: { read: () => true, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateCollection('redirects')], afterDelete: [revalidateCollectionDelete('redirects')] },
  fields: [
    {
      name: 'from',
      type: 'text',
      label: 'Stara putanja',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'npr. /recepti/stari-slug/' },
      validate: (v: unknown) => (typeof v === 'string' && v.startsWith('/') ? true : 'Putanja mora počinjati s /'),
    },
    {
      name: 'to',
      type: 'text',
      label: 'Nova putanja',
      required: true,
      validate: (v: unknown) => (typeof v === 'string' && v.startsWith('/') ? true : 'Putanja mora počinjati s /'),
    },
    {
      name: 'type',
      type: 'select',
      label: 'Vrsta',
      defaultValue: '301',
      options: [
        { label: '301 — trajno preusmjerenje', value: '301' },
        { label: '410 — trajno uklonjeno', value: '410' },
      ],
    },
  ],
}
