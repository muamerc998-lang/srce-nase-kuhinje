import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "meal_pages_dorucak_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"recipe_id" integer NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "meal_pages_dorucak_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "meal_pages_dorucak_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "meal_pages_rucak_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"recipe_id" integer NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "meal_pages_rucak_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "meal_pages_rucak_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "meal_pages_vecera_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"recipe_id" integer NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "meal_pages_vecera_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "meal_pages_vecera_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_headline" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_author_id" integer;
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_content_updated_at" timestamp(3) with time zone;
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_article_intro" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_closing_title" varchar DEFAULT 'Kako odabrati';
  ALTER TABLE "meal_pages" ADD COLUMN "dorucak_closing" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_headline" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_author_id" integer;
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_content_updated_at" timestamp(3) with time zone;
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_article_intro" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_closing_title" varchar DEFAULT 'Kako odabrati';
  ALTER TABLE "meal_pages" ADD COLUMN "rucak_closing" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_headline" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_author_id" integer;
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_content_updated_at" timestamp(3) with time zone;
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_article_intro" varchar;
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_closing_title" varchar DEFAULT 'Kako odabrati';
  ALTER TABLE "meal_pages" ADD COLUMN "vecera_closing" varchar;
  ALTER TABLE "meal_pages_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "meal_pages_dorucak_sections_items" ADD CONSTRAINT "meal_pages_dorucak_sections_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages_dorucak_sections_items" ADD CONSTRAINT "meal_pages_dorucak_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages_dorucak_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_dorucak_sections" ADD CONSTRAINT "meal_pages_dorucak_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_dorucak_faq" ADD CONSTRAINT "meal_pages_dorucak_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_rucak_sections_items" ADD CONSTRAINT "meal_pages_rucak_sections_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages_rucak_sections_items" ADD CONSTRAINT "meal_pages_rucak_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages_rucak_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_rucak_sections" ADD CONSTRAINT "meal_pages_rucak_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_rucak_faq" ADD CONSTRAINT "meal_pages_rucak_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_vecera_sections_items" ADD CONSTRAINT "meal_pages_vecera_sections_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages_vecera_sections_items" ADD CONSTRAINT "meal_pages_vecera_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages_vecera_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_vecera_sections" ADD CONSTRAINT "meal_pages_vecera_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_pages_vecera_faq" ADD CONSTRAINT "meal_pages_vecera_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "meal_pages_dorucak_sections_items_order_idx" ON "meal_pages_dorucak_sections_items" USING btree ("_order");
  CREATE INDEX "meal_pages_dorucak_sections_items_parent_id_idx" ON "meal_pages_dorucak_sections_items" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_dorucak_sections_items_recipe_idx" ON "meal_pages_dorucak_sections_items" USING btree ("recipe_id");
  CREATE INDEX "meal_pages_dorucak_sections_order_idx" ON "meal_pages_dorucak_sections" USING btree ("_order");
  CREATE INDEX "meal_pages_dorucak_sections_parent_id_idx" ON "meal_pages_dorucak_sections" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_dorucak_faq_order_idx" ON "meal_pages_dorucak_faq" USING btree ("_order");
  CREATE INDEX "meal_pages_dorucak_faq_parent_id_idx" ON "meal_pages_dorucak_faq" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_rucak_sections_items_order_idx" ON "meal_pages_rucak_sections_items" USING btree ("_order");
  CREATE INDEX "meal_pages_rucak_sections_items_parent_id_idx" ON "meal_pages_rucak_sections_items" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_rucak_sections_items_recipe_idx" ON "meal_pages_rucak_sections_items" USING btree ("recipe_id");
  CREATE INDEX "meal_pages_rucak_sections_order_idx" ON "meal_pages_rucak_sections" USING btree ("_order");
  CREATE INDEX "meal_pages_rucak_sections_parent_id_idx" ON "meal_pages_rucak_sections" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_rucak_faq_order_idx" ON "meal_pages_rucak_faq" USING btree ("_order");
  CREATE INDEX "meal_pages_rucak_faq_parent_id_idx" ON "meal_pages_rucak_faq" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_vecera_sections_items_order_idx" ON "meal_pages_vecera_sections_items" USING btree ("_order");
  CREATE INDEX "meal_pages_vecera_sections_items_parent_id_idx" ON "meal_pages_vecera_sections_items" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_vecera_sections_items_recipe_idx" ON "meal_pages_vecera_sections_items" USING btree ("recipe_id");
  CREATE INDEX "meal_pages_vecera_sections_order_idx" ON "meal_pages_vecera_sections" USING btree ("_order");
  CREATE INDEX "meal_pages_vecera_sections_parent_id_idx" ON "meal_pages_vecera_sections" USING btree ("_parent_id");
  CREATE INDEX "meal_pages_vecera_faq_order_idx" ON "meal_pages_vecera_faq" USING btree ("_order");
  CREATE INDEX "meal_pages_vecera_faq_parent_id_idx" ON "meal_pages_vecera_faq" USING btree ("_parent_id");
  ALTER TABLE "meal_pages" ADD CONSTRAINT "meal_pages_dorucak_author_id_authors_id_fk" FOREIGN KEY ("dorucak_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages" ADD CONSTRAINT "meal_pages_rucak_author_id_authors_id_fk" FOREIGN KEY ("rucak_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages" ADD CONSTRAINT "meal_pages_vecera_author_id_authors_id_fk" FOREIGN KEY ("vecera_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_pages_rels" ADD CONSTRAINT "meal_pages_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "meal_pages_dorucak_dorucak_author_idx" ON "meal_pages" USING btree ("dorucak_author_id");
  CREATE INDEX "meal_pages_rucak_rucak_author_idx" ON "meal_pages" USING btree ("rucak_author_id");
  CREATE INDEX "meal_pages_vecera_vecera_author_idx" ON "meal_pages" USING btree ("vecera_author_id");
  CREATE INDEX "meal_pages_rels_guides_id_idx" ON "meal_pages_rels" USING btree ("guides_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "meal_pages_dorucak_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_dorucak_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_dorucak_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_rucak_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_rucak_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_rucak_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_vecera_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_vecera_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meal_pages_vecera_faq" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "meal_pages_dorucak_sections_items" CASCADE;
  DROP TABLE "meal_pages_dorucak_sections" CASCADE;
  DROP TABLE "meal_pages_dorucak_faq" CASCADE;
  DROP TABLE "meal_pages_rucak_sections_items" CASCADE;
  DROP TABLE "meal_pages_rucak_sections" CASCADE;
  DROP TABLE "meal_pages_rucak_faq" CASCADE;
  DROP TABLE "meal_pages_vecera_sections_items" CASCADE;
  DROP TABLE "meal_pages_vecera_sections" CASCADE;
  DROP TABLE "meal_pages_vecera_faq" CASCADE;
  ALTER TABLE "meal_pages" DROP CONSTRAINT "meal_pages_dorucak_author_id_authors_id_fk";
  
  ALTER TABLE "meal_pages" DROP CONSTRAINT "meal_pages_rucak_author_id_authors_id_fk";
  
  ALTER TABLE "meal_pages" DROP CONSTRAINT "meal_pages_vecera_author_id_authors_id_fk";
  
  ALTER TABLE "meal_pages_rels" DROP CONSTRAINT "meal_pages_rels_guides_fk";
  
  DROP INDEX "meal_pages_dorucak_dorucak_author_idx";
  DROP INDEX "meal_pages_rucak_rucak_author_idx";
  DROP INDEX "meal_pages_vecera_vecera_author_idx";
  DROP INDEX "meal_pages_rels_guides_id_idx";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_headline";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_author_id";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_content_updated_at";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_article_intro";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_closing_title";
  ALTER TABLE "meal_pages" DROP COLUMN "dorucak_closing";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_headline";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_author_id";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_content_updated_at";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_article_intro";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_closing_title";
  ALTER TABLE "meal_pages" DROP COLUMN "rucak_closing";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_headline";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_author_id";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_content_updated_at";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_article_intro";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_closing_title";
  ALTER TABLE "meal_pages" DROP COLUMN "vecera_closing";
  ALTER TABLE "meal_pages_rels" DROP COLUMN "guides_id";`)
}
