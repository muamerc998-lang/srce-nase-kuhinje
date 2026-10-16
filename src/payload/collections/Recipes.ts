import type { CollectionConfig } from 'payload'
import { publishedOrStaff, isStaff, staffField } from '../access'
import { demoField, fillSlug, seoFields, slugField, slugRedirectHook, uidField, assertDemoNotPublished, planIdField } from '../fields'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { computeRecipeIndex } from '../hooks/recipeIndex'
import { unitOptions } from '../../lib/quantities/units'
import { METHOD_OPTIONS, DIET_OPTIONS, DIFFICULTY_OPTIONS, MEAL_OPTIONS } from '../../lib/search/params'

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  labels: { singular: 'Recept', plural: 'Recepti' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'primaryCategory', '_status', 'isDemo', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    group: 'Sadržaj',
    preview: (doc) =>
      doc?.slug
        ? `${siteUrl()}/api/site/preview?collection=recipes&slug=${encodeURIComponent(String(doc.slug))}`
        : null,
  },
  versions: { drafts: { autosave: false, schedulePublish: false }, maxPerDoc: 30 },
  access: {
    read: publishedOrStaff,
    readVersions: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeValidate: [fillSlug('title')],
    beforeChange: [
      ({ data }) => {
        assertDemoNotPublished(data)
        return data
      },
      computeRecipeIndex,
    ],
    afterChange: [revalidateCollection('recipes'), slugRedirectHook('/recepti')],
    afterDelete: [revalidateCollectionDelete('recipes')],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Osnovno',
          fields: [
            { name: 'title', type: 'text', label: 'Naslov', required: true, maxLength: 120 },
            {
              name: 'alternativeNames',
              type: 'array',
              label: 'Alternativni nazivi',
              admin: { description: 'Drugi nazivi pod kojima ljudi traže ovo jelo (koriste se u pretrazi).' },
              labels: { singular: 'Naziv', plural: 'Nazivi' },
              fields: [{ name: 'name', type: 'text', label: 'Naziv', required: true }],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Kratak opis',
              required: true,
              maxLength: 300,
              admin: { description: 'Jedna-dvije rečenice ispod naslova. Bez dugog uvoda.' },
            },
            {
              name: 'beforeYouStart',
              type: 'textarea',
              label: 'Kratka napomena prije početka',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Glavna fotografija',
                  admin: { description: 'Obavezna za objavu (osim u razvoju). Mora prikazivati baš ovo jelo.' },
                },
                {
                  name: 'shareImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Fotografija za dijeljenje (opcionalno)',
                  admin: { description: 'Ako je prazno, koristi se glavna fotografija izrezana prema fokusnoj tački.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Podaci',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'difficulty', type: 'select', label: 'Težina', required: true, options: [...DIFFICULTY_OPTIONS] },
                { name: 'methods', type: 'select', hasMany: true, label: 'Način pripreme', options: [...METHOD_OPTIONS] },
                { name: 'diets', type: 'select', hasMany: true, label: 'Prehrambena svojstva', options: [...DIET_OPTIONS] },
              ],
            },
            {
              name: 'yield',
              type: 'group',
              label: 'Prinos',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'servings', type: 'number', label: 'Količina (broj)', min: 1, max: 200 },
                    {
                      name: 'unit',
                      type: 'text',
                      label: 'Jedinica prinosa',
                      defaultValue: 'porcija',
                      admin: { description: 'npr. porcija, komada, kriški, tegli' },
                    },
                    {
                      name: 'scalable',
                      type: 'checkbox',
                      label: 'Dozvoli preračun porcija',
                      defaultValue: true,
                      admin: { description: 'Isključiti ako recept nema pouzdanu osnovnu količinu.' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'times',
              type: 'group',
              label: 'Vrijeme (minute)',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'prepMinutes', type: 'number', label: 'Priprema', min: 0 },
                    { name: 'cookMinutes', type: 'number', label: 'Kuhanje / pečenje', min: 0 },
                    { name: 'restMinutes', type: 'number', label: 'Čekanje / hlađenje', min: 0 },
                    {
                      name: 'restLabel',
                      type: 'text',
                      label: 'Naziv čekanja (genitiv)',
                      admin: { description: 'npr. hlađenja, dizanja tijesta, mariniranja' },
                    },
                  ],
                },
                {
                  name: 'totalMinutes',
                  type: 'number',
                  label: 'Ukupno proteklo vrijeme',
                  min: 0,
                  admin: {
                    description:
                      'Upisati stvarno proteklo vrijeme. Ako se radnje preklapaju, ukupno je manje od zbira. Prazno = zbir.',
                  },
                },
              ],
            },
            {
              name: 'equipment',
              type: 'group',
              label: 'Kalup i oprema',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'panSize', type: 'text', label: 'Kalup / posuda', admin: { description: 'npr. 24 × 30 cm' } },
                    { name: 'temperature', type: 'number', label: 'Temperatura (°C)', min: 0, max: 300 },
                    {
                      name: 'ovenMode',
                      type: 'select',
                      label: 'Način pečenja',
                      options: [
                        { label: 'Gornji i donji grijač', value: 'gornji-donji' },
                        { label: 'Ventilator', value: 'ventilator' },
                        { label: 'Donji grijač', value: 'donji' },
                        { label: 'Gornji grijač / grill', value: 'gornji' },
                      ],
                    },
                  ],
                },
                { name: 'other', type: 'text', label: 'Ostala oprema' },
              ],
            },
          ],
        },
        {
          label: 'Sastojci',
          fields: [
            {
              name: 'ingredientGroups',
              type: 'array',
              label: 'Grupe sastojaka',
              minRows: 1,
              labels: { singular: 'Grupa', plural: 'Grupe' },
              admin: { description: 'Jedna grupa bez naslova za jednostavne recepte; više grupa za biskvit, kremu, preljev…' },
              fields: [
                { name: 'title', type: 'text', label: 'Naslov grupe (opcionalno)' },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Sastojci',
                  minRows: 1,
                  labels: { singular: 'Sastojak', plural: 'Sastojci' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'ingredient', type: 'relationship', relationTo: 'ingredients', required: true, label: 'Namirnica' },
                        { name: 'amount', type: 'number', label: 'Količina', admin: { step: 0.01, width: '14%' } },
                        {
                          name: 'amountMax',
                          type: 'number',
                          label: 'Do (raspon)',
                          admin: { step: 0.01, width: '14%' },
                        },
                        {
                          name: 'unit',
                          type: 'select',
                          label: 'Jedinica',
                          defaultValue: 'g',
                          options: unitOptions,
                          admin: { width: '18%' },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Prikazni naziv',
                          admin: { description: 'Kako piše u receptu, npr. "glatkog brašna". Prazno = naziv namirnice.' },
                        },
                        { name: 'note', type: 'text', label: 'Napomena', admin: { description: 'npr. sitno sjeckan' } },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'optional', type: 'checkbox', label: 'Opcionalno', defaultValue: false },
                        {
                          name: 'altGroup',
                          type: 'text',
                          label: 'Alternativna grupa',
                          admin: { description: 'Isti kratki ključ za "maslac ili margarin" (npr. "mast").' },
                        },
                      ],
                    },
                    {
                      name: 'originalText',
                      type: 'text',
                      label: 'Izvorna formulacija (opcionalno)',
                      admin: { description: 'Prikazuje se pri izvornoj količini umjesto automatski složenog reda.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Priprema',
          fields: [
            {
              name: 'stepGroups',
              type: 'array',
              label: 'Grupe koraka',
              minRows: 1,
              labels: { singular: 'Grupa', plural: 'Grupe' },
              fields: [
                { name: 'title', type: 'text', label: 'Naslov grupe (opcionalno)' },
                {
                  name: 'steps',
                  type: 'array',
                  label: 'Koraci',
                  minRows: 1,
                  labels: { singular: 'Korak', plural: 'Koraci' },
                  fields: [
                    { name: 'title', type: 'text', label: 'Kratak naslov (opcionalno)' },
                    { name: 'text', type: 'textarea', label: 'Tekst koraka', required: true },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'timerMinutes',
                          type: 'number',
                          label: 'Tajmer (minute)',
                          min: 0.5,
                          max: 1440,
                          admin: { step: 0.5, description: 'Samo ako korak ima jasno trajanje.' },
                        },
                        { name: 'timerLabel', type: 'text', label: 'Naziv tajmera', admin: { description: 'npr. Pečenje kore' } },
                      ],
                    },
                    { name: 'image', type: 'upload', relationTo: 'media', label: 'Fotografija koraka (opcionalno)' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Urednički tekst',
          description: 'Članak iznad kartice recepta. Pisati po content/UREDNICKI-VODIC.md: struktura, broj i nazivi sekcija zavise od jela.',
          fields: [
            {
              name: 'approach',
              type: 'select',
              label: 'Urednički pristup (interno)',
              access: { read: staffField },
              admin: { description: 'Pomaže da uzastopni recepti ne liče jedan na drugi. Ne prikazuje se javno.' },
              options: [
                { label: 'Praktični vodič', value: 'prakticni' },
                { label: 'Tehnika i rezultat', value: 'tehnika' },
                { label: 'Tradicionalni recept', value: 'tradicionalni' },
                { label: 'Brzi svakodnevni recept', value: 'brzi' },
                { label: 'Detaljniji kulinarski vodič', value: 'detaljni' },
              ],
            },
            {
              name: 'article',
              type: 'array',
              label: 'Sekcije članka',
              labels: { singular: 'Sekcija', plural: 'Sekcije' },
              admin: { description: 'Prva sekcija može biti bez naslova (uvod). Tekst: pasusi odvojeni praznim redom; red koji počinje s „- “ je stavka liste.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'level', type: 'select', label: 'Nivo naslova', defaultValue: 'h2', options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }], admin: { width: '20%' } },
                    { name: 'title', type: 'text', label: 'Naslov (opcionalno)', admin: { width: '80%' } },
                  ],
                },
                { name: 'body', type: 'textarea', label: 'Tekst', required: true },
              ],
            },
          ],
        },
        {
          label: 'Savjeti i pitanja',
          fields: [
            { name: 'tips', type: 'array', label: 'Savjeti', labels: { singular: 'Savjet', plural: 'Savjeti' }, fields: [{ name: 'text', type: 'textarea', label: 'Tekst', required: true }] },
            {
              name: 'substitutions',
              type: 'array',
              label: 'Zamjene',
              labels: { singular: 'Zamjena', plural: 'Zamjene' },
              fields: [{ name: 'text', type: 'textarea', label: 'Tekst', required: true }],
            },
            { name: 'storage', type: 'textarea', label: 'Čuvanje' },
            {
              name: 'faq',
              type: 'array',
              label: 'Česta pitanja',
              labels: { singular: 'Pitanje', plural: 'Pitanja' },
              admin: { description: 'Samo stvarno relevantna pitanja za ovaj recept.' },
              fields: [
                { name: 'question', type: 'text', required: true, label: 'Pitanje' },
                { name: 'answer', type: 'textarea', required: true, label: 'Odgovor' },
              ],
            },
          ],
        },
        {
          label: 'Veze',
          fields: [
            {
              name: 'relatedRecipes',
              type: 'relationship',
              relationTo: 'recipes',
              hasMany: true,
              label: 'Povezani recepti (ručni izbor)',
              admin: { description: 'Ako je popunjeno, ima prednost nad automatskim izborom.' },
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
            { name: 'relatedGuides', type: 'relationship', relationTo: 'guides', hasMany: true, label: 'Povezani vodiči' },
            {
              name: 'servedWith',
              type: 'relationship',
              relationTo: 'recipes',
              hasMany: true,
              maxRows: 4,
              label: 'Šta poslužiti uz ovo? (prilozi, salate, supe)',
              admin: { description: 'Samo recepti koji stvarno idu uz ovo jelo.' },
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
            {
              name: 'leftovers',
              type: 'group',
              label: 'Ostaci',
              fields: [
                { name: 'text', type: 'textarea', label: 'Kratka napomena o iskorištavanju ostataka' },
                { name: 'recipe', type: 'relationship', relationTo: 'recipes', label: 'Recept za ostatke' },
                { name: 'guide', type: 'relationship', relationTo: 'guides', label: 'Vodič' },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoFields] },
      ],
    },
    // --- bočna traka ---
    slugField('title'),
    uidField,
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
      label: 'Autor / uredništvo',
      admin: { position: 'sidebar' },
    },
    {
      name: 'primaryCategory',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Primarna kategorija',
      admin: { position: 'sidebar' },
    },
    {
      name: 'guestAuthor',
      type: 'relationship',
      relationTo: 'members',
      label: 'Gostujući autor (čitalac)',
      admin: { position: 'sidebar', description: 'Ako je recept nastao iz recepta čitaoca.' },
    },
    {
      name: 'meals',
      type: 'select',
      hasMany: true,
      label: 'Obrok',
      options: [...MEAL_OPTIONS],
      admin: { position: 'sidebar', description: 'Isti recept može biti i za doručak i za večeru — bez duplih stranica.' },
    },
    {
      name: 'secondaryCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Sekundarne kategorije',
      admin: { position: 'sidebar', description: 'Samo ako zaista trebaju.' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      maxRows: 5,
      label: 'Oznake',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Datum objave',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'contentUpdatedAt',
      type: 'date',
      label: 'Datum stvarne izmjene',
      admin: {
        position: 'sidebar',
        description: 'Prikazuje se čitaocima i u sitemapu. Mijenjati samo kod bitne sadržajne izmjene.',
      },
    },
    {
      name: 'facebook',
      type: 'group',
      label: 'Facebook',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'postedAt',
          type: 'date',
          label: 'Datum Facebook objave',
          admin: { description: 'Popunjeno = recept se može pojaviti u bloku "Sa naše Facebook stranice".' },
        },
        { name: 'postUrl', type: 'text', label: 'URL objave (opcionalno)' },
      ],
    },
    {
      name: 'sourceNote',
      type: 'textarea',
      label: 'Izvori / reference (interno)',
      access: { read: staffField },
      admin: { position: 'sidebar', description: 'Odakle su preuzeti podaci recepta (link, knjiga, porodični recept). Nije javno. Vidi content/PRAVILA-PISANJA.md.' },
    },
    { ...planIdField('SNK'), access: { read: staffField } },
    {
      name: 'family',
      type: 'text',
      label: 'Tematska porodica (interno)',
      access: { read: staffField },
      admin: { position: 'sidebar', description: 'npr. Cheesecake, Hurmašice — za povezivanje srodnih izvedbi; nije kategorija ni oznaka.' },
    },
    demoField,
    // --- izvedena polja za pretragu i alate (računaju se automatski) ---
    {
      name: 'index',
      type: 'group',
      label: 'Izvedeni indeks (automatski)',
      admin: { position: 'sidebar', readOnly: true, condition: () => false },
      fields: [
        { name: 'searchTitle', type: 'text' },
        { name: 'searchText', type: 'textarea' },
        { name: 'facetKeys', type: 'textarea' },
        { name: 'totalMinutes', type: 'number', index: true },
        { name: 'matchProfile', type: 'json' },
      ],
    },
  ],
}
