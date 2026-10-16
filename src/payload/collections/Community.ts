import type { CollectionConfig, Where } from 'payload'
import { adminField, isStaff, staffField } from '../access'
import { revalidateTags } from '../hooks/revalidate'

/**
 * Članovi (čitaoci) — odvojeni od korisnika CMS-a. Prijava ide kroz javne
 * serverske akcije s vlastitim kolačićem; administraciju ne mogu otvoriti.
 */
export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: 'Član', plural: 'Članovi (čitaoci)' },
  admin: { useAsTitle: 'displayName', group: 'Zajednica', defaultColumns: ['displayName', 'email', 'blocked', 'createdAt'] },
  auth: {
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 60 * 60 * 24 * 30,
  },
  access: {
    // javni unos isključivo kroz serverske akcije (validacija, rate limit)
    create: isStaff,
    read: ({ req }) => (req.user ? (req.user.collection === 'users' ? true : { id: { equals: req.user.id } }) : false),
    update: isStaff,
    delete: isStaff,
    admin: () => false,
  },
  hooks: {
    // Brisanjem člana brišu se i njegovi poslani recepti.
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'submissions', where: { member: { equals: id } }, req, overrideAccess: true })
      },
    ],
  },
  fields: [
    { name: 'displayName', type: 'text', label: 'Ime za prikaz', required: true, maxLength: 60 },
    { name: 'bio', type: 'textarea', label: 'Kratko predstavljanje', maxLength: 600 },
    { name: 'blocked', type: 'checkbox', label: 'Blokiran (ne može slati recepte)', defaultValue: false, access: { update: staffField } },
    { name: 'clientHash', type: 'text', access: { read: adminField }, admin: { readOnly: true } },
  ],
}

/** Slike koje šalju čitaoci: samo provjerene i ponovo kodirane slike (vidi submit akciju). */
export const SubmissionImages: CollectionConfig = {
  slug: 'submission-images',
  labels: { singular: 'Slika čitaoca', plural: 'Slike čitalaca' },
  admin: { group: 'Zajednica' },
  access: {
    read: () => true, // URL-ovi se prikazuju samo na odobrenim receptima
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  upload: {
    staticDir: 'media/citaoci',
    mimeTypes: ['image/webp'],
    imageSizes: [{ name: 'card', width: 800, height: 600 }],
  },
  fields: [{ name: 'alt', type: 'text', required: true, label: 'Opis slike' }],
}

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: { singular: 'Recept čitaoca', plural: 'Recepti čitalaca' },
  admin: {
    useAsTitle: 'title',
    group: 'Zajednica',
    defaultColumns: ['title', 'member', 'status', 'featuredOnFacebook', 'createdAt'],
    description: 'Ništa se ne objavljuje bez odobrenja. Status „Odobreno“ otvara javnu stranicu /recepti-citalaca/…',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'members') return { or: [{ member: { equals: req.user.id } }, { status: { equals: 'odobreno' } }] } as Where
      return { status: { equals: 'odobreno' } }
    },
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateTags(['submissions'])
        return doc
      },
    ],
  },
  fields: [
    { name: 'member', type: 'relationship', relationTo: 'members', required: true, label: 'Član', index: true },
    { name: 'title', type: 'text', required: true, label: 'Naziv recepta', maxLength: 120 },
    { name: 'story', type: 'textarea', label: 'Priča uz recept', maxLength: 3000 },
    {
      type: 'row',
      fields: [
        { name: 'servings', type: 'number', label: 'Porcije', min: 1, max: 100 },
        { name: 'totalMinutes', type: 'number', label: 'Ukupno vrijeme (min)', min: 1, max: 6000 },
        { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Kategorija' },
      ],
    },
    { name: 'ingredients', type: 'textarea', required: true, label: 'Sastojci (jedan po redu)', maxLength: 4000 },
    { name: 'steps', type: 'textarea', required: true, label: 'Priprema (jedan korak po redu)', maxLength: 8000 },
    { name: 'image', type: 'upload', relationTo: 'submission-images', label: 'Fotografija' },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'na-cekanju',
      index: true,
      options: [
        { label: 'Na čekanju', value: 'na-cekanju' },
        { label: 'Odobreno (javno)', value: 'odobreno' },
        { label: 'Odbijeno', value: 'odbijeno' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featuredOnFacebook',
      type: 'checkbox',
      label: 'Izdvojeno na Facebook stranici i u grupi',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'editorNote', type: 'textarea', label: 'Poruka autoru (vidi je samo autor)', admin: { position: 'sidebar' } },
    { name: 'clientHash', type: 'text', access: { read: adminField }, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
