import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tags_group" AS ENUM('namirnica', 'tijesto', 'ostalo');
  ALTER TYPE "public"."enum_recipes_methods" ADD VALUE 'friteza' BEFORE 'bez-kuhanja';
  ALTER TYPE "public"."enum__recipes_v_version_methods" ADD VALUE 'friteza' BEFORE 'bez-kuhanja';
  ALTER TABLE "recipes_diets" ALTER COLUMN "value" SET DATA TYPE text;
  UPDATE "recipes_diets" SET "value" = 'bez-mlijeka' WHERE "value" = 'bez-laktoze';
  DROP TYPE "public"."enum_recipes_diets";
  CREATE TYPE "public"."enum_recipes_diets" AS ENUM('posno', 'vegetarijansko', 'vegansko', 'bez-jaja', 'bez-mlijeka', 'bez-glutena', 'bez-brasna', 'bez-kvasca');
  ALTER TABLE "recipes_diets" ALTER COLUMN "value" SET DATA TYPE "public"."enum_recipes_diets" USING "value"::"public"."enum_recipes_diets";
  ALTER TABLE "_recipes_v_version_diets" ALTER COLUMN "value" SET DATA TYPE text;
  UPDATE "_recipes_v_version_diets" SET "value" = 'bez-mlijeka' WHERE "value" = 'bez-laktoze';
  DROP TYPE "public"."enum__recipes_v_version_diets";
  CREATE TYPE "public"."enum__recipes_v_version_diets" AS ENUM('posno', 'vegetarijansko', 'vegansko', 'bez-jaja', 'bez-mlijeka', 'bez-glutena', 'bez-brasna', 'bez-kvasca');
  ALTER TABLE "_recipes_v_version_diets" ALTER COLUMN "value" SET DATA TYPE "public"."enum__recipes_v_version_diets" USING "value"::"public"."enum__recipes_v_version_diets";
  ALTER TABLE "categories" ADD COLUMN "body" varchar;
  ALTER TABLE "tags" ADD COLUMN "group" "enum_tags_group" DEFAULT 'ostalo';
  ALTER TABLE "tags" ADD COLUMN "synonyms" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipes_methods" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_recipes_methods";
  CREATE TYPE "public"."enum_recipes_methods" AS ENUM('pecenje', 'przenje', 'kuhanje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  ALTER TABLE "recipes_methods" ALTER COLUMN "value" SET DATA TYPE "public"."enum_recipes_methods" USING "value"::"public"."enum_recipes_methods";
  ALTER TABLE "recipes_diets" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_recipes_diets";
  CREATE TYPE "public"."enum_recipes_diets" AS ENUM('vegetarijansko', 'posno', 'bez-glutena', 'bez-laktoze', 'bez-jaja');
  ALTER TABLE "recipes_diets" ALTER COLUMN "value" SET DATA TYPE "public"."enum_recipes_diets" USING "value"::"public"."enum_recipes_diets";
  ALTER TABLE "_recipes_v_version_methods" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__recipes_v_version_methods";
  CREATE TYPE "public"."enum__recipes_v_version_methods" AS ENUM('pecenje', 'przenje', 'kuhanje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  ALTER TABLE "_recipes_v_version_methods" ALTER COLUMN "value" SET DATA TYPE "public"."enum__recipes_v_version_methods" USING "value"::"public"."enum__recipes_v_version_methods";
  ALTER TABLE "_recipes_v_version_diets" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__recipes_v_version_diets";
  CREATE TYPE "public"."enum__recipes_v_version_diets" AS ENUM('vegetarijansko', 'posno', 'bez-glutena', 'bez-laktoze', 'bez-jaja');
  ALTER TABLE "_recipes_v_version_diets" ALTER COLUMN "value" SET DATA TYPE "public"."enum__recipes_v_version_diets" USING "value"::"public"."enum__recipes_v_version_diets";
  ALTER TABLE "categories" DROP COLUMN "body";
  ALTER TABLE "tags" DROP COLUMN "group";
  ALTER TABLE "tags" DROP COLUMN "synonyms";
  DROP TYPE "public"."enum_tags_group";`)
}
