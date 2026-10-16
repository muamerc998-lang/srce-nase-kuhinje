import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Pretraga i filteri koriste ILIKE '%…%' nad normalizovanim tekstom
 * (index_search_text, index_facet_keys). GIN trigram indeksi čine te upite
 * indeksiranim. Ekstenzija pg_trgm je dio standardne PostgreSQL contrib
 * distribucije (dostupna je i u ugrađenom lokalnom PostgreSQL-u i kod većine
 * hosting ponuda za PostgreSQL).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS "recipes_search_text_trgm_idx" ON "recipes" USING gin ("index_search_text" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "recipes_search_title_trgm_idx" ON "recipes" USING gin ("index_search_title" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "recipes_facet_keys_trgm_idx" ON "recipes" USING gin ("index_facet_keys" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "ingredients_search_name_trgm_idx" ON "ingredients" USING gin ("search_name" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "recipes_status_published_idx" ON "recipes" ("_status", "published_at" DESC);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "recipes_search_text_trgm_idx";
    DROP INDEX IF EXISTS "recipes_search_title_trgm_idx";
    DROP INDEX IF EXISTS "recipes_facet_keys_trgm_idx";
    DROP INDEX IF EXISTS "ingredients_search_name_trgm_idx";
    DROP INDEX IF EXISTS "recipes_status_published_idx";
  `)
}
