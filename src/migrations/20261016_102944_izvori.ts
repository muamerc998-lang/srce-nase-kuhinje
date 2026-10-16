import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipes" ADD COLUMN "source_note" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_source_note" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipes" DROP COLUMN "source_note";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_source_note";`)
}
