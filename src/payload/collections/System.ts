import type { CollectionConfig } from 'payload'
import { adminField, hasRole, isAdmin, isStaff, publicOrStaff, staffField, type Role } from '../access'
import { demoField } from '../fields'
import { revalidateTags } from '../hooks/revalidate'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Korisnik CMS-a', plural: 'Korisnici CMS-a' },
  admin: { useAsTitle: 'email', group: 'Sistem', defaultColumns: ['email', 'name', 'roles'] },
  auth: {
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8,
    cookies: { sameSite: 'Lax', secure: process.env.SITE_ENV === 'production' },
  },
  access: {
    read: ({ req }) => (req.user?.collection === 'users' ? (hasRole(req.user as { roles?: Role[] }, 'admin') ? true : { id: { equals: req.user.id } }) : false),
    create: isAdmin,
    update: ({ req }) => (req.user?.collection === 'users' ? (hasRole(req.user as { roles?: Role[] }, 'admin') ? true : { id: { equals: req.user.id } }) : false),
    delete: isAdmin,
    admin: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Ime' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      label: 'Uloge',
      defaultValue: ['editor'],
      required: true,
      saveToJWT: true,
      access: { update: adminField, create: adminField },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Urednik', value: 'editor' },
      ],
    },
  ],
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Medij', plural: 'Mediji' },
  admin: { group: 'Sadržaj', defaultColumns: ['filename', 'alt', 'isDemo'] },
  access: { read: publicOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 320, height: 240, position: 'centre' },
      { name: 'card', width: 800, height: 600 },
      { name: 'wide', width: 1600 },
      // Open Graph / Facebook: 1,91:1, rez prema fokusnoj tački
      { name: 'og', width: 1200, height: 630 },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  hooks: {
    afterChange: [() => revalidateTags(['recipes', 'guides', 'categories', 'recipe-collections'])],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alternativni tekst',
      required: true,
      admin: { description: 'Opišite šta je na slici (npr. "Komad musake s krompirom na tanjiru").' },
    },
    { name: 'credit', type: 'text', label: 'Autor fotografije / izvor' },
    demoField,
  ],
}

const textLimits = { maxLength: 2000 }

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: { singular: 'Komentar / ocjena', plural: 'Komentari i ocjene' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'recipe', 'kind', 'rating', 'status', 'createdAt'],
    group: 'Zajednica',
    description: 'Ništa se ne objavljuje automatski. Odobrite ili odbijte svaku poruku.',
  },
  access: {
    // Javno: samo odobreno. Email i tehnički podaci su zaštićeni na nivou polja.
    read: ({ req }) => (req.user?.collection === 'users' ? true : { status: { equals: 'odobreno' } }),
    create: isStaff, // javni unos ide isključivo kroz serverske akcije s validacijom i rate limitom
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        const rid = typeof doc.recipe === 'object' ? doc.recipe?.id : doc.recipe
        revalidateTags([`comments:${rid}`, 'recipes'])
        return doc
      },
    ],
  },
  fields: [
    { name: 'recipe', type: 'relationship', relationTo: 'recipes', required: true, label: 'Recept', index: true },
    {
      name: 'kind',
      type: 'select',
      label: 'Vrsta',
      required: true,
      defaultValue: 'iskustvo',
      options: [
        { label: 'Iskustvo', value: 'iskustvo' },
        { label: 'Pitanje', value: 'pitanje' },
      ],
    },
    { name: 'name', type: 'text', label: 'Ime', required: true, maxLength: 60 },
    { name: 'email', type: 'email', label: 'Email (privatno)', access: { read: staffField } },
    { name: 'text', type: 'textarea', label: 'Tekst', required: true, ...textLimits },
    { name: 'rating', type: 'number', label: 'Ocjena (1–5)', min: 1, max: 5 },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'na-cekanju',
      index: true,
      options: [
        { label: 'Na čekanju', value: 'na-cekanju' },
        { label: 'Odobreno', value: 'odobreno' },
        { label: 'Odbijeno', value: 'odbijeno' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'reply', type: 'textarea', label: 'Odgovor uredništva (javno)', ...textLimits },
    {
      name: 'clientHash',
      type: 'text',
      label: 'Tehnički otisak (hash IP-a)',
      access: { read: adminField },
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Poruka', plural: 'Kontakt i prijave grešaka' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'kind', 'recipe', 'status', 'createdAt'],
    group: 'Zajednica',
    description: 'Privatne poruke. Nisu javne i ne izlaze kroz javni API.',
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    {
      name: 'kind',
      type: 'select',
      label: 'Vrsta',
      required: true,
      options: [
        { label: 'Kontakt', value: 'kontakt' },
        { label: 'Prijava greške u receptu', value: 'greska' },
      ],
    },
    { name: 'subject', type: 'text', label: 'Naslov', required: true },
    { name: 'recipe', type: 'relationship', relationTo: 'recipes', label: 'Recept' },
    { name: 'name', type: 'text', label: 'Ime' },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'message', type: 'textarea', label: 'Poruka', required: true, maxLength: 5000 },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'novo',
      options: [
        { label: 'Novo', value: 'novo' },
        { label: 'U obradi', value: 'u-obradi' },
        { label: 'Riješeno', value: 'rijeseno' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'clientHash', type: 'text', access: { read: adminField }, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
