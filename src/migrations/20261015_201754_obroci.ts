import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recipes_meals" AS ENUM('dorucak', 'rucak', 'vecera');
  CREATE TYPE "public"."enum__recipes_v_version_meals" AS ENUM('dorucak', 'rucak', 'vecera');
  CREATE TYPE "public"."enum_ingredients_food_group" AS ENUM('meso', 'riba', 'mlijecno', 'jaja', 'povrce', 'voce', 'zitarice', 'zacini', 'ostalo');
  CREATE TABLE "recipes_meals" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_recipes_meals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_recipes_v_version_meals" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__recipes_v_version_meals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "meal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"dorucak_title" varchar DEFAULT 'Doručak',
  	"dorucak_intro" varchar,
  	"dorucak_image_id" integer,
  	"dorucak_seo_description" varchar,
  	"rucak_title" varchar DEFAULT 'Ručak',
  	"rucak_intro" varchar,
  	"rucak_image_id" integer,
  	"rucak_seo_description" varchar,
  	"vecera_title" varchar DEFAULT 'Večera',
  	"vecera_intro" varchar,
  	"vecera_image_id" integer,
  	"vecera_seo_description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "meal_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"recipe_collections_id" integer
  );
  
  ALTER TABLE "recipes_methods" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_recipes_methods";
  CREATE TYPE "public"."enum_recipes_methods" AS ENUM('pecenje', 'przenje', 'kuhanje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  ALTER TABLE "recipes_methods" ALTER COLUMN "value" SET DATA TYPE "public"."enum_recipes_methods" USING "value"::"public"."enum_recipes_methods";
  ALTER TABLE "_recipes_v_version_methods" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__recipes_v_version_methods";
  CREATE TYPE "public"."enum__recipes_v_version_methods" AS ENUM('pecenje', 'przenje', 'kuhanje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  ALTER TABLE "_recipes_v_version_methods" ALTER COLUMN "value" SET DATA TYPE "public"."enum__recipes_v_version_methods" USING "value"::"public"."enum__recipes_v_version_methods";
  ALTER TABLE "recipes" ADD COLUMN "leftovers_text" varchar;
  ALTER TABLE "recipes" ADD COLUMN "leftovers_recipe_id" integer;
  ALTER TABLE "recipes" ADD COLUMN "leftovers_guide_id" integer;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_leftovers_text" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_leftovers_recipe_id" integer;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_leftovers_guide_id" integer;
  ALTER TABLE "ingredients" ADD COLUMN "food_group" "enum_ingredients_food_group";
  ALTER TABLE "site_settings" ADD COLUMN "features_min_collection_recipes" numeric DEFAULT 3;
  ALTER TABLE "recipes_meals" ADD CONSTRAINT "recipes_meals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_meals" ADD CONSTRAINT "_recipes_v_version_meals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages" ADD CONSTRAINT "meal_pages_dorucak_image_id_media_id_fk" FOREIGN KEY ("dorucak_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages" ADD CONSTRAINT "meal_pages_rucak_image_id_media_id_fk" FOREIGN KEY ("rucak_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages" ADD CONSTRAINT "meal_pages_vecera_image_id_media_id_fk" FOREIGN KEY ("vecera_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages_rels" ADD CONSTRAINT "meal_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_rels" ADD CONSTRAINT "meal_pages_rels_recipe_collections_fk" FOREIGN KEY ("recipe_collections_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "recipes_meals_order_idx" ON "recipes_meals" USING btree ("order");
  CREATE INDEX "recipes_meals_parent_idx" ON "recipes_meals" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_version_meals_order_idx" ON "_recipes_v_version_meals" USING btree ("order");
  CREATE INDEX "_recipes_v_version_meals_parent_idx" ON "_recipes_v_version_meals" USING btree ("parent_id");
  CREATE INDEX "meal_pages_dorucak_dorucak_image_idx" ON "meal_pages" USING btree ("dorucak_image_id");
  CREATE INDEX "meal_pages_rucak_rucak_image_idx" ON "meal_pages" USING btree ("rucak_image_id");
  CREATE INDEX "meal_pages_vecera_vecera_image_idx" ON "meal_pages" USING btree ("vecera_image_id");
  CREATE INDEX "meal_pages_rels_order_idx" ON "meal_pages_rels" USING btree ("order");
  CREATE INDEX "meal_pages_rels_parent_idx" ON "meal_pages_rels" USING btree ("parent_id");
  CREATE INDEX "meal_pages_rels_path_idx" ON "meal_pages_rels" USING btree ("path");
  CREATE INDEX "meal_pages_rels_recipe_collections_id_idx" ON "meal_pages_rels" USING btree ("recipe_collections_id");
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_leftovers_recipe_id_recipes_id_fk" FOREIGN KEY ("leftovers_recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_leftovers_guide_id_guides_id_fk" FOREIGN KEY ("leftovers_guide_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_leftovers_recipe_id_recipes_id_fk" FOREIGN KEY ("version_leftovers_recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_leftovers_guide_id_guides_id_fk" FOREIGN KEY ("version_leftovers_guide_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "recipes_leftovers_leftovers_recipe_idx" ON "recipes" USING btree ("leftovers_recipe_id");
  CREATE INDEX "recipes_leftovers_leftovers_guide_idx" ON "recipes" USING btree ("leftovers_guide_id");
  CREATE INDEX "_recipes_v_version_leftovers_version_leftovers_recipe_idx" ON "_recipes_v" USING btree ("version_leftovers_recipe_id");
  CREATE INDEX "_recipes_v_version_leftovers_version_leftovers_guide_idx" ON "_recipes_v" USING btree ("version_leftovers_guide_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipes_meals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_meals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "recipes_meals" CASCADE;
  DROP TABLE "_recipes_v_version_meals" CASCADE;
  DROP TABLE "meal_pages" CASCADE;
  DROP TABLE "meal_pages_rels" CASCADE;
  ALTER TABLE "recipes" DROP CONSTRAINT "recipes_leftovers_recipe_id_recipes_id_fk";
  
  ALTER TABLE "recipes" DROP CONSTRAINT "recipes_leftovers_guide_id_guides_id_fk";
  
  ALTER TABLE "_recipes_v" DROP CONSTRAINT "_recipes_v_version_leftovers_recipe_id_recipes_id_fk";
  
  ALTER TABLE "_recipes_v" DROP CONSTRAINT "_recipes_v_version_leftovers_guide_id_guides_id_fk";
  
  ALTER TABLE "recipes_methods" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_recipes_methods";
  CREATE TYPE "public"."enum_recipes_methods" AS ENUM('pecenje', 'kuhanje', 'przenje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  ALTER TABLE "recipes_methods" ALTER COLUMN "value" SET DATA TYPE "public"."enum_recipes_methods" USING "value"::"public"."enum_recipes_methods";
  ALTER TABLE "_recipes_v_version_methods" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__recipes_v_version_methods";
  CREATE TYPE "public"."enum__recipes_v_version_methods" AS ENUM('pecenje', 'kuhanje', 'przenje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  ALTER TABLE "_recipes_v_version_methods" ALTER COLUMN "value" SET DATA TYPE "public"."enum__recipes_v_version_methods" USING "value"::"public"."enum__recipes_v_version_methods";
  DROP INDEX "recipes_leftovers_leftovers_recipe_idx";
  DROP INDEX "recipes_leftovers_leftovers_guide_idx";
  DROP INDEX "_recipes_v_version_leftovers_version_leftovers_recipe_idx";
  DROP INDEX "_recipes_v_version_leftovers_version_leftovers_guide_idx";
  ALTER TABLE "recipes" DROP COLUMN "leftovers_text";
  ALTER TABLE "recipes" DROP COLUMN "leftovers_recipe_id";
  ALTER TABLE "recipes" DROP COLUMN "leftovers_guide_id";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_leftovers_text";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_leftovers_recipe_id";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_leftovers_guide_id";
  ALTER TABLE "ingredients" DROP COLUMN "food_group";
  ALTER TABLE "site_settings" DROP COLUMN "features_min_collection_recipes";
  DROP TYPE "public"."enum_recipes_meals";
  DROP TYPE "public"."enum__recipes_v_version_meals";
  DROP TYPE "public"."enum_ingredients_food_group";`)
}
