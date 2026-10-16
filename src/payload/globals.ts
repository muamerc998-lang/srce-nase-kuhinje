import type { Field, GlobalConfig } from 'payload'
import { isStaff } from './access'
import { revalidateGlobal } from './hooks/revalidate'
import { articleContentFields } from './fields'

const section = (name: string, label: string, defaultTitle: string, fields: Field[] = []): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Prikaži sekciju', defaultValue: true },
        { name: 'title', type: 'text', label: 'Naslov sekcije', defaultValue: defaultTitle },
      ],
    },
    ...fields,
  ],
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Postavke sajta',
  admin: { group: 'Postavke' },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('site-settings')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brend',
          fields: [
            { name: 'siteName', type: 'text', label: 'Naziv', defaultValue: 'Srce naše kuhinje', required: true },
            { name: 'tagline', type: 'text', label: 'Kratki opis', defaultValue: 'Provjereni domaći recepti, jasno i bez suvišnog.' },
            {
              name: 'description',
              type: 'textarea',
              label: 'Opis portala (footer i SEO)',
              defaultValue: 'Praktična digitalna kuharica: pronađite jelo, pripremite ga korak po korak i sačuvajte omiljene recepte.',
            },
            {
              name: 'facebookUrl',
              type: 'text',
              label: 'URL Facebook stranice',
              admin: { description: 'Upisati tačan URL stvarne stranice. Prazno = link se ne prikazuje.' },
              validate: (v: unknown) =>
                !v || /^https:\/\/(www\.)?facebook\.com\/.+/.test(String(v)) ? true : 'Upišite puni https://facebook.com/… URL',
            },
            { name: 'facebookName', type: 'text', label: 'Naziv Facebook stranice', defaultValue: 'Srce naše kuhinje – najbolji recepti' },
            { name: 'facebookGroupUrl', type: 'text', label: 'URL Facebook grupe' },
            { name: 'organizationName', type: 'text', label: 'Naziv izdavača / organizacije (za schema.org)' },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo (kad bude dostavljen original)' },
          ],
        },
        {
          label: 'Funkcije',
          fields: [
            {
              name: 'features',
              type: 'group',
              label: 'Uključene funkcije',
              fields: [
                { name: 'comments', type: 'checkbox', label: 'Iskustva i pitanja čitalaca (moderirano)', defaultValue: true },
                { name: 'ratings', type: 'checkbox', label: 'Ocjene (prikaz samo odobrenih)', defaultValue: true },
                {
                  name: 'pantryPromo',
                  type: 'checkbox',
                  label: 'Promotivni blok "Šta imate u kuhinji?" na početnoj',
                  defaultValue: false,
                  admin: { description: 'Uključiti tek kad urednik odobri bazu namirnica za javnu upotrebu.' },
                },
                { name: 'corrections', type: 'checkbox', label: 'Prijava greške u receptu', defaultValue: true },
                {
                  name: 'minCollectionRecipes',
                  type: 'number',
                  label: 'Najmanji broj recepata za javni prikaz kolekcije',
                  defaultValue: 3,
                  min: 1,
                  admin: { description: 'Kolekcija s manje objavljenih recepata se ne prikazuje (ni stranica ni linkovi).' },
                },
              ],
            },
          ],
        },
        {
          label: 'Oglasi',
          fields: [
            {
              name: 'ads',
              type: 'group',
              label: 'Oglasna mjesta',
              admin: {
                description:
                  'Isključeno po defaultu. Oglasna skripta i consent rješenje se ne učitavaju dok nisu odabrani i konfigurisani. U načinu kuhanja nikad nema oglasa.',
              },
              fields: [
                { name: 'enabled', type: 'checkbox', label: 'Rezerviši oglasna mjesta', defaultValue: false },
                {
                  name: 'slots',
                  type: 'select',
                  hasMany: true,
                  label: 'Aktivna mjesta',
                  options: [
                    { label: 'Recept — nakon osnovnih podataka', value: 'recipe-after-facts' },
                    { label: 'Recept — nakon koraka', value: 'recipe-after-steps' },
                    { label: 'Arhiva — između redova', value: 'archive-inline' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigacija i footer',
  admin: { group: 'Postavke' },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('navigation')] },
  fields: [
    {
      name: 'recipeMenu',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Kategorije u meniju "Recepti"',
      admin: { description: 'Prazno = osnovne kategorije označene za meni. Prazne kategorije se ne prikazuju.' },
    },
    {
      name: 'footerCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Kategorije u footeru',
    },
    {
      name: 'footerGuides',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
      maxRows: 6,
      label: 'Vodiči u footeru',
    },
  ],
}

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Početna stranica',
  admin: {
    group: 'Postavke',
    description: 'Sekcija bez dovoljno objavljenog sadržaja se automatski izostavlja. Isti recept se ne ponavlja u glavnom izboru.',
  },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('home-page')] },
  fields: [
    section('hero', '1. Šta danas pripremamo?', 'Šta danas pripremamo?', [
      { name: 'text', type: 'textarea', label: 'Kratka poruka', defaultValue: 'Upišite naziv jela ili namirnicu koju imate.' },
      { name: 'image', type: 'upload', relationTo: 'media', label: 'Fotografija hrane' },
    ]),
    section('quickLinks', '2. Brzi izbor', 'Brzi izbor', [
      {
        name: 'links',
        type: 'array',
        label: 'Linkovi',
        maxRows: 6,
        admin: { description: 'Svaki link vodi na postojeću kolekciju ili kategoriju — bez duplih odredišta.' },
        fields: [
          { name: 'label', type: 'text', required: true, label: 'Naziv' },
          {
            name: 'targetType',
            type: 'select',
            required: true,
            label: 'Odredište',
            defaultValue: 'collection',
            options: [
              { label: 'Kolekcija', value: 'collection' },
              { label: 'Kategorija', value: 'category' },
            ],
          },
          {
            name: 'collection',
            type: 'relationship',
            relationTo: 'recipe-collections',
            admin: { condition: (_, s) => s?.targetType === 'collection' },
          },
          {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            admin: { condition: (_, s) => s?.targetType === 'category' },
          },
        ],
      },
    ]),
    section('featured', '3. Danas izdvajamo', 'Danas izdvajamo', [
      {
        name: 'items',
        type: 'array',
        label: 'Izdvojeni recepti (prvi je veća kartica)',
        maxRows: 9,
        fields: [
          { name: 'recipe', type: 'relationship', relationTo: 'recipes', required: true },
          {
            type: 'row',
            fields: [
              { name: 'startsAt', type: 'date', label: 'Prikaz od' },
              { name: 'endsAt', type: 'date', label: 'Prikaz do' },
            ],
          },
        ],
      },
    ]),
    section('categories', '4. Osnovne kategorije', 'Recepti po kategorijama', [
      { name: 'items', type: 'relationship', relationTo: 'categories', hasMany: true, label: 'Kategorije (prazno = osnovne)' },
    ]),
    section('facebook', '5. Sa naše Facebook stranice', 'Sa naše Facebook stranice', [
      {
        name: 'text',
        type: 'textarea',
        label: 'Uvod',
        defaultValue: 'Recepti koje smo nedavno podijelili na Facebook stranici.',
      },
      { name: 'count', type: 'number', label: 'Broj recepata (4–6)', min: 4, max: 6, defaultValue: 6 },
    ]),
    section('pantry', '6. Šta imate u kuhinji?', 'Šta imate u kuhinji?', [
      { name: 'text', type: 'textarea', label: 'Uvod', defaultValue: 'Odaberite namirnice koje imate i pogledajte šta možete pripremiti.' },
      { name: 'quickIngredients', type: 'relationship', relationTo: 'ingredients', hasMany: true, maxRows: 8, label: 'Brze opcije' },
    ]),
    section('sweet', '7. Nešto slatko', 'Nešto slatko', [
      { name: 'recipes', type: 'relationship', relationTo: 'recipes', hasMany: true, maxRows: 6, label: 'Recepti (4–6)' },
    ]),
    section('season', '8. U sezoni', 'U sezoni', [
      { name: 'collection', type: 'relationship', relationTo: 'recipe-collections', label: 'Kolekcija' },
      { name: 'guide', type: 'relationship', relationTo: 'guides', label: 'Praktični vodič' },
    ]),
    section('latest', '9. Najnoviji recepti', 'Najnoviji recepti'),
    section('guides', '10. Savjeti iz kuhinje', 'Savjeti iz kuhinje', [
      { name: 'items', type: 'relationship', relationTo: 'guides', hasMany: true, maxRows: 3, label: 'Vodiči (prazno = najnoviji)' },
    ]),
    section('community', '11. Facebook zajednica', 'Pridružite nam se na Facebooku', [
      {
        name: 'text',
        type: 'textarea',
        label: 'Tekst',
        defaultValue: 'Svakog dana dijelimo recepte i odgovaramo na vaša pitanja.',
      },
    ]),
  ],
}

const mealGroup = (name: string, label: string, title: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'title', type: 'text', label: 'Naslov (H1)', defaultValue: title },
    { name: 'intro', type: 'textarea', label: 'Kratak uvod' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Fotografija' },
    {
      name: 'collections',
      type: 'relationship',
      relationTo: 'recipe-collections',
      hasMany: true,
      maxRows: 6,
      label: 'Izdvojene kolekcije',
    },
    { name: 'seoDescription', type: 'textarea', label: 'SEO opis', maxLength: 170 },
    {
      type: 'collapsible',
      label: 'Članak (blog)',
      fields: articleContentFields(true),
    },
  ],
})

export const MealPages: GlobalConfig = {
  slug: 'meal-pages',
  label: 'Stranice obroka',
  admin: { group: 'Postavke', description: 'Doručak, ručak i večera: uvod, fotografija i izdvojene kolekcije. Recepti se biraju poljem Obrok na receptu.' },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('meal-pages')] },
  fields: [
    mealGroup('dorucak', 'Doručak', 'Doručak'),
    mealGroup('rucak', 'Ručak', 'Ručak'),
    mealGroup('vecera', 'Večera', 'Večera'),
  ],
}

export const PantryBasics: GlobalConfig = {
  slug: 'pantry-basics',
  label: 'Osnovne namirnice',
  admin: {
    group: 'Postavke',
    description: 'Spisak koji korisnik potvrđuje opcijom "Imam osnovne namirnice". Ništa se ne pretpostavlja bez te opcije.',
  },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('pantry-basics')] },
  fields: [
    { name: 'items', type: 'relationship', relationTo: 'ingredients', hasMany: true, label: 'Osnovne namirnice' },
    {
      name: 'publicApproved',
      type: 'checkbox',
      label: 'Baza namirnica odobrena za javnu upotrebu alata',
      defaultValue: false,
    },
  ],
}
