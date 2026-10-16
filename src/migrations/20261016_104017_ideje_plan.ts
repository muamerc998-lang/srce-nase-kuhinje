import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "recipe_collections_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"recipe_id" integer,
  	"note" varchar,
  	"main_ingredients" varchar,
  	"make_ahead" varchar
  );
  
  CREATE TABLE "recipe_collections_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "recipe_collections_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_recipe_collections_v_version_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipe_id" integer,
  	"note" varchar,
  	"main_ingredients" varchar,
  	"make_ahead" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipe_collections_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipe_collections_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "recipes" ADD COLUMN "plan_id" varchar;
  ALTER TABLE "recipes" ADD COLUMN "family" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_plan_id" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_family" varchar;
  ALTER TABLE "recipe_collections" ADD COLUMN "headline" varchar;
  ALTER TABLE "recipe_collections" ADD COLUMN "author_id" integer;
  ALTER TABLE "recipe_collections" ADD COLUMN "article_intro" varchar;
  ALTER TABLE "recipe_collections" ADD COLUMN "show_overview" boolean DEFAULT true;
  ALTER TABLE "recipe_collections" ADD COLUMN "closing_title" varchar DEFAULT 'Kako odabrati';
  ALTER TABLE "recipe_collections" ADD COLUMN "closing" varchar;
  ALTER TABLE "recipe_collections" ADD COLUMN "plan_id" varchar;
  ALTER TABLE "recipe_collections_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "recipe_collections_rels" ADD COLUMN "recipe_collections_id" integer;
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_headline" varchar;
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_article_intro" varchar;
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_show_overview" boolean DEFAULT true;
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_closing_title" varchar DEFAULT 'Kako odabrati';
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_closing" varchar;
  ALTER TABLE "_recipe_collections_v" ADD COLUMN "version_plan_id" varchar;
  ALTER TABLE "_recipe_collections_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "_recipe_collections_v_rels" ADD COLUMN "recipe_collections_id" integer;
  ALTER TABLE "meal_pages_dorucak_sections_items" ADD COLUMN "main_ingredients" varchar;
  ALTER TABLE "meal_pages_dorucak_sections_items" ADD COLUMN "make_ahead" varchar;
  ALTER TABLE "meal_pages_rucak_sections_items" ADD COLUMN "main_ingredients" varchar;
  ALTER TABLE "meal_pages_rucak_sections_items" ADD COLUMN "make_ahead" varchar;
  ALTER TABLE "meal_pages_vecera_sections_items" ADD COLUMN "main_ingredients" varchar;
  ALTER TABLE "meal_pages_vecera_sections_items" ADD COLUMN "make_ahead" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_show_overview" boolean DEFAULT true;
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_show_overview" boolean DEFAULT true;
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_show_overview" boolean DEFAULT true;
  ALTER TABLE "recipe_collections_sections_items" ADD CONSTRAINT "recipe_collections_sections_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipe_collections_sections_items" ADD CONSTRAINT "recipe_collections_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipe_collections_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipe_collections_sections" ADD CONSTRAINT "recipe_collections_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipe_collections_faq" ADD CONSTRAINT "recipe_collections_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_version_sections_items" ADD CONSTRAINT "_recipe_collections_v_version_sections_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_version_sections_items" ADD CONSTRAINT "_recipe_collections_v_version_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipe_collections_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_version_sections" ADD CONSTRAINT "_recipe_collections_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipe_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_version_faq" ADD CONSTRAINT "_recipe_collections_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipe_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "recipe_collections_sections_items_order_idx" ON "recipe_collections_sections_items" USING btree ("_order");
  CREATE INDEX "recipe_collections_sections_items_parent_id_idx" ON "recipe_collections_sections_items" USING btree ("_parent_id");
  CREATE INDEX "recipe_collections_sections_items_recipe_idx" ON "recipe_collections_sections_items" USING btree ("recipe_id");
  CREATE INDEX "recipe_collections_sections_order_idx" ON "recipe_collections_sections" USING btree ("_order");
  CREATE INDEX "recipe_collections_sections_parent_id_idx" ON "recipe_collections_sections" USING btree ("_parent_id");
  CREATE INDEX "recipe_collections_faq_order_idx" ON "recipe_collections_faq" USING btree ("_order");
  CREATE INDEX "recipe_collections_faq_parent_id_idx" ON "recipe_collections_faq" USING btree ("_parent_id");
  CREATE INDEX "_recipe_collections_v_version_sections_items_order_idx" ON "_recipe_collections_v_version_sections_items" USING btree ("_order");
  CREATE INDEX "_recipe_collections_v_version_sections_items_parent_id_idx" ON "_recipe_collections_v_version_sections_items" USING btree ("_parent_id");
  CREATE INDEX "_recipe_collections_v_version_sections_items_recipe_idx" ON "_recipe_collections_v_version_sections_items" USING btree ("recipe_id");
  CREATE INDEX "_recipe_collections_v_version_sections_order_idx" ON "_recipe_collections_v_version_sections" USING btree ("_order");
  CREATE INDEX "_recipe_collections_v_version_sections_parent_id_idx" ON "_recipe_collections_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_recipe_collections_v_version_faq_order_idx" ON "_recipe_collections_v_version_faq" USING btree ("_order");
  CREATE INDEX "_recipe_collections_v_version_faq_parent_id_idx" ON "_recipe_collections_v_version_faq" USING btree ("_parent_id");
  ALTER TABLE "recipe_collections" ADD CONSTRAINT "recipe_collections_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipe_collections_rels" ADD CONSTRAINT "recipe_collections_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipe_collections_rels" ADD CONSTRAINT "recipe_collections_rels_recipe_collections_fk" FOREIGN KEY ("recipe_collections_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v" ADD CONSTRAINT "_recipe_collections_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_rels" ADD CONSTRAINT "_recipe_collections_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_rels" ADD CONSTRAINT "_recipe_collections_v_rels_recipe_collections_fk" FOREIGN KEY ("recipe_collections_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "recipes_plan_id_idx" ON "recipes" USING btree ("plan_id");
  CREATE INDEX "_recipes_v_version_version_plan_id_idx" ON "_recipes_v" USING btree ("version_plan_id");
  CREATE INDEX "recipe_collections_author_idx" ON "recipe_collections" USING btree ("author_id");
  CREATE UNIQUE INDEX "recipe_collections_plan_id_idx" ON "recipe_collections" USING btree ("plan_id");
  CREATE INDEX "recipe_collections_rels_guides_id_idx" ON "recipe_collections_rels" USING btree ("guides_id");
  CREATE INDEX "recipe_collections_rels_recipe_collections_id_idx" ON "recipe_collections_rels" USING btree ("recipe_collections_id");
  CREATE INDEX "_recipe_collections_v_version_version_author_idx" ON "_recipe_collections_v" USING btree ("version_author_id");
  CREATE INDEX "_recipe_collections_v_version_version_plan_id_idx" ON "_recipe_collections_v" USING btree ("version_plan_id");
  CREATE INDEX "_recipe_collections_v_rels_guides_id_idx" ON "_recipe_collections_v_rels" USING btree ("guides_id");
  CREATE INDEX "_recipe_collections_v_rels_recipe_collections_id_idx" ON "_recipe_collections_v_rels" USING btree ("recipe_collections_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipe_collections_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipe_collections_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipe_collections_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipe_collections_v_version_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipe_collections_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipe_collections_v_version_faq" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "recipe_collections_sections_items" CASCADE;
  DROP TABLE "recipe_collections_sections" CASCADE;
  DROP TABLE "recipe_collections_faq" CASCADE;
  DROP TABLE "_recipe_collections_v_version_sections_items" CASCADE;
  DROP TABLE "_recipe_collections_v_version_sections" CASCADE;
  DROP TABLE "_recipe_collections_v_version_faq" CASCADE;
  ALTER TABLE "recipe_collections" DROP CONSTRAINT "recipe_collections_author_id_authors_id_fk";
  
  ALTER TABLE "recipe_collections_rels" DROP CONSTRAINT "recipe_collections_rels_guides_fk";
  
  ALTER TABLE "recipe_collections_rels" DROP CONSTRAINT "recipe_collections_rels_recipe_collections_fk";
  
  ALTER TABLE "_recipe_collections_v" DROP CONSTRAINT "_recipe_collections_v_version_author_id_authors_id_fk";
  
  ALTER TABLE "_recipe_collections_v_rels" DROP CONSTRAINT "_recipe_collections_v_rels_guides_fk";
  
  ALTER TABLE "_recipe_collections_v_rels" DROP CONSTRAINT "_recipe_collections_v_rels_recipe_collections_fk";
  
  DROP INDEX "recipes_plan_id_idx";
  DROP INDEX "_recipes_v_version_version_plan_id_idx";
  DROP INDEX "recipe_collections_author_idx";
  DROP INDEX "recipe_collections_plan_id_idx";
  DROP INDEX "recipe_collections_rels_guides_id_idx";
  DROP INDEX "recipe_collections_rels_recipe_collections_id_idx";
  DROP INDEX "_recipe_collections_v_version_version_author_idx";
  DROP INDEX "_recipe_collections_v_version_version_plan_id_idx";
  DROP INDEX "_recipe_collections_v_rels_guides_id_idx";
  DROP INDEX "_recipe_collections_v_rels_recipe_collections_id_idx";
  ALTER TABLE "recipes" DROP COLUMN "plan_id";
  ALTER TABLE "recipes" DROP COLUMN "family";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_plan_id";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_family";
  ALTER TABLE "recipe_collections" DROP COLUMN "headline";
  ALTER TABLE "recipe_collections" DROP COLUMN "author_id";
  ALTER TABLE "recipe_collections" DROP COLUMN "article_intro";
  ALTER TABLE "recipe_collections" DROP COLUMN "show_overview";
  ALTER TABLE "recipe_collections" DROP COLUMN "closing_title";
  ALTER TABLE "recipe_collections" DROP COLUMN "closing";
  ALTER TABLE "recipe_collections" DROP COLUMN "plan_id";
  ALTER TABLE "recipe_collections_rels" DROP COLUMN "guides_id";
  ALTER TABLE "recipe_collections_rels" DROP COLUMN "recipe_collections_id";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_headline";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_author_id";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_article_intro";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_show_overview";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_closing_title";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_closing";
  ALTER TABLE "_recipe_collections_v" DROP COLUMN "version_plan_id";
  ALTER TABLE "_recipe_collections_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "_recipe_collections_v_rels" DROP COLUMN "recipe_collections_id";
  ALTER TABLE "meal_pages_dorucak_sections_items" DROP COLUMN "main_ingredients";
  ALTER TABLE "meal_pages_dorucak_sections_items" DROP COLUMN "make_ahead";
  ALTER TABLE "meal_pages_rucak_sections_items" DROP COLUMN "main_ingredients";
  ALTER TABLE "meal_pages_rucak_sections_items" DROP COLUMN "make_ahead";
  ALTER TABLE "meal_pages_vecera_sections_items" DROP COLUMN "main_ingredients";
  ALTER TABLE "meal_pages_vecera_sections_items" DROP COLUMN "make_ahead";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_show_overview";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_show_overview";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_show_overview";`)
}
