import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recipes_article_level" AS ENUM('h2', 'h3');
  CREATE TYPE "public"."enum_recipes_approach" AS ENUM('prakticni', 'tehnika', 'tradicionalni', 'brzi', 'detaljni');
  CREATE TYPE "public"."enum__recipes_v_version_article_level" AS ENUM('h2', 'h3');
  CREATE TYPE "public"."enum__recipes_v_version_approach" AS ENUM('prakticni', 'tehnika', 'tradicionalni', 'brzi', 'detaljni');
  CREATE TABLE "recipes_article" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"level" "enum_recipes_article_level" DEFAULT 'h2',
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "_recipes_v_version_article" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"level" "enum__recipes_v_version_article_level" DEFAULT 'h2',
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "recipes" ADD COLUMN "approach" "enum_recipes_approach";
  ALTER TABLE "_recipes_v" ADD COLUMN "version_approach" "enum__recipes_v_version_approach";
  ALTER TABLE "recipes_article" ADD CONSTRAINT "recipes_article_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_article" ADD CONSTRAINT "_recipes_v_version_article_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "recipes_article_order_idx" ON "recipes_article" USING btree ("_order");
  CREATE INDEX "recipes_article_parent_id_idx" ON "recipes_article" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_article_order_idx" ON "_recipes_v_version_article" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_article_parent_id_idx" ON "_recipes_v_version_article" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "recipes_article" CASCADE;
  DROP TABLE "_recipes_v_version_article" CASCADE;
  ALTER TABLE "recipes" DROP COLUMN "approach";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_approach";
  DROP TYPE "public"."enum_recipes_article_level";
  DROP TYPE "public"."enum_recipes_approach";
  DROP TYPE "public"."enum__recipes_v_version_article_level";
  DROP TYPE "public"."enum__recipes_v_version_approach";`)
}
