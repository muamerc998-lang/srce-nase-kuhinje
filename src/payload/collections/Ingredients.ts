import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import { isStaff, publicOrStaff } from '../access'
import { demoField, fillSlug, slugField, slugRedirectHook, uidField, seoFields, assertDemoNotPublished } from '../fields'
import { revalidateCollection, revalidateCollectionDelete, revalidateTags } from '../hooks/revalidate'
import { normalizeText } from '../../lib/text/normalize'

/** Promjena naziva, sinonima ili šireg pojma → ponovo izračunati indeks recepata koji je koriste. */
const reindexRecipes: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (operation !== 'update' || context?.skipReindex) return doc
  const sig = (d: typeof doc) =>
    JSON.stringify([d?.name, (d?.synonyms ?? []).map((s: { term: string }) => s.term), d?.broader?.id ?? d?.broader, d?.foodGroup])
  if (sig(doc) === sig(previousDoc)) return doc
  const recipes = await req.payload.find({
    collection: 'recipes',
    where: { 'index.facetKeys': { contains: `|i:${doc.id}|` } },
    pagination: false,
    depth: 0,
    req,
    select: { slug: true },
  })
  for (const r of recipes.docs) {
    await req.payload.update({ collection: 'recipes', id: r.id, data: {}, req, context: { reindex: true } })
  }
  revalidateTags(['recipes'])
  return doc
}

export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  labels: { singular: 'Namirnica', plural: 'Namirnice' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'broader', 'publicPage', 'isDemo'],
    group: 'Registri',
    description:
      'Kontrolisani registar namirnica. Zapis u registru ne znači javnu stranicu — javni detalj se uključuje posebno.',
  },
  access: { read: publicOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [fillSlug('name')],
    beforeChange: [
      ({ data }) => {
        assertDemoNotPublished(data)
        if (data) {
          data.searchName = normalizeText(
            [data.name, ...((data.synonyms as { term: string }[] | undefined) ?? []).map((s) => s.term)].join(' '),
          )
        }
        return data
      },
    ],
    afterChange: [revalidateCollection('ingredients'), reindexRecipes, slugRedirectHook('/namirnice')],
    afterDelete: [revalidateCollectionDelete('ingredients')],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Kanonski naziv', required: true, unique: true },
    {
      name: 'synonyms',
      type: 'array',
      label: 'Sinonimi i regionalni nazivi',
      admin: { description: 'npr. krumpir, češnjak. Ne unositi različite proizvode (mlijeko ≠ kondenzovano mlijeko).' },
      labels: { singular: 'Sinonim', plural: 'Sinonimi' },
      fields: [{ name: 'term', type: 'text', label: 'Izraz', required: true }],
    },
    {
      name: 'broader',
      type: 'relationship',
      relationTo: 'ingredients',
      label: 'Širi pojam',
      admin: { description: 'npr. "glatko brašno" → "pšenično brašno". Koristi se u filterima i alatu za namirnice.' },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'foodGroup',
      type: 'select',
      label: 'Grupa namirnica',
      options: [
        { label: 'Meso i mesne prerađevine', value: 'meso' },
        { label: 'Riba i plodovi mora', value: 'riba' },
        { label: 'Mlijeko i mliječni proizvodi', value: 'mlijecno' },
        { label: 'Jaja', value: 'jaja' },
        { label: 'Povrće', value: 'povrce' },
        { label: 'Voće', value: 'voce' },
        { label: 'Žitarice, brašno, tijesto', value: 'zitarice' },
        { label: 'Začini i dodaci', value: 'zacini' },
        { label: 'Ostalo', value: 'ostalo' },
      ],
      admin: { description: 'Koristi se za filter S mesom / Bez mesa.' },
    },
    {
      name: 'roundingHint',
      type: 'text',
      label: 'Napomena pri zaokruživanju',
      admin: { description: 'Prikazuje se kad preračun porcija zaokruži količinu (npr. za jaja).' },
    },
    {
      name: 'publicPage',
      type: 'checkbox',
      label: 'Objavi javnu stranicu namirnice',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      type: 'collapsible',
      label: 'Sadržaj javne stranice',
      admin: { initCollapsed: true },
      fields: [
        { name: 'description', type: 'textarea', label: 'Kratak opis' },
        { name: 'selection', type: 'textarea', label: 'Odabir i priprema' },
        { name: 'storage', type: 'textarea', label: 'Čuvanje' },
        { name: 'substitutes', type: 'textarea', label: 'Stvarne zamjene' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Fotografija' },
        { name: 'relatedGuides', type: 'relationship', relationTo: 'guides', hasMany: true, label: 'Povezani vodiči' },
        seoFields,
      ],
    },
    slugField('name'),
    uidField,
    demoField,
    { name: 'searchName', type: 'text', index: true, admin: { hidden: true } },
  ],
}
