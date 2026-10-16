import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { hr } from '@payloadcms/translations/languages/hr'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Recipes } from './payload/collections/Recipes'
import { Ingredients } from './payload/collections/Ingredients'
import { Categories, Tags, SearchSynonyms, Authors, Redirects } from './payload/collections/Taxonomy'
import { RecipeCollections, Guides, Pages } from './payload/collections/Editorial'
import { Users, Media, Comments, Messages } from './payload/collections/System'
import { Members, Submissions, SubmissionImages } from './payload/collections/Community'
import { SiteSettings, Navigation, HomePage, PantryBasics, MealPages } from './payload/globals'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET nije postavljen.')
}

const useS3 = !!process.env.S3_BUCKET

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Srce naše kuhinje (CMS)' },
  },
  i18n: { supportedLanguages: { hr, en }, fallbackLanguage: 'hr' },
  collections: [
    Recipes,
    Ingredients,
    Categories,
    RecipeCollections,
    Guides,
    Pages,
    Authors,
    Tags,
    SearchSynonyms,
    Media,
    Comments,
    Messages,
    Redirects,
    Submissions,
    SubmissionImages,
    Members,
    Users,
  ],
  globals: [SiteSettings, Navigation, HomePage, MealPages, PantryBasics],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-not-for-production',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Shema se mijenja isključivo migracijama (ponovljivo u svim okruženjima).
    push: false,
    prodMigrations: migrations,
  }),
  sharp,
  upload: { limits: { fileSize: 15_000_000 } },
  plugins: [
    s3Storage({
      enabled: useS3,
      collections: { media: true, 'submission-images': { prefix: 'citaoci' } },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
