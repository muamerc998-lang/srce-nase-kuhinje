import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_submissions_status" AS ENUM('na-cekanju', 'odobreno', 'odbijeno');
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"story" varchar,
  	"servings" numeric,
  	"total_minutes" numeric,
  	"category_id" integer,
  	"ingredients" varchar NOT NULL,
  	"steps" varchar NOT NULL,
  	"image_id" integer,
  	"status" "enum_submissions_status" DEFAULT 'na-cekanju' NOT NULL,
  	"featured_on_facebook" boolean DEFAULT false,
  	"editor_note" varchar,
  	"client_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "submission_images" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"bio" varchar,
  	"blocked" boolean DEFAULT false,
  	"client_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "recipes" ADD COLUMN "guest_author_id" integer;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_guest_author_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "submissions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "submission_images_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "facebook_group_url" varchar;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_image_id_submission_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."submission_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "submissions_member_idx" ON "submissions" USING btree ("member_id");
  CREATE INDEX "submissions_category_idx" ON "submissions" USING btree ("category_id");
  CREATE INDEX "submissions_image_idx" ON "submissions" USING btree ("image_id");
  CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "submission_images_updated_at_idx" ON "submission_images" USING btree ("updated_at");
  CREATE INDEX "submission_images_created_at_idx" ON "submission_images" USING btree ("created_at");
  CREATE UNIQUE INDEX "submission_images_filename_idx" ON "submission_images" USING btree ("filename");
  CREATE INDEX "submission_images_sizes_card_sizes_card_filename_idx" ON "submission_images" USING btree ("sizes_card_filename");
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_guest_author_id_members_id_fk" FOREIGN KEY ("guest_author_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_guest_author_id_members_id_fk" FOREIGN KEY ("version_guest_author_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submission_images_fk" FOREIGN KEY ("submission_images_id") REFERENCES "public"."submission_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "recipes_guest_author_idx" ON "recipes" USING btree ("guest_author_id");
  CREATE INDEX "_recipes_v_version_version_guest_author_idx" ON "_recipes_v" USING btree ("version_guest_author_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_locked_documents_rels_submission_images_id_idx" ON "payload_locked_documents_rels" USING btree ("submission_images_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "submission_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "submission_images" CASCADE;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  ALTER TABLE "recipes" DROP CONSTRAINT "recipes_guest_author_id_members_id_fk";
  
  ALTER TABLE "_recipes_v" DROP CONSTRAINT "_recipes_v_version_guest_author_id_members_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_submissions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_submission_images_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_members_fk";
  
  DROP INDEX "recipes_guest_author_idx";
  DROP INDEX "_recipes_v_version_version_guest_author_idx";
  DROP INDEX "payload_locked_documents_rels_submissions_id_idx";
  DROP INDEX "payload_locked_documents_rels_submission_images_id_idx";
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  DROP INDEX "payload_preferences_rels_members_id_idx";
  ALTER TABLE "recipes" DROP COLUMN "guest_author_id";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_guest_author_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "submissions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "submission_images_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "members_id";
  ALTER TABLE "site_settings" DROP COLUMN "facebook_group_url";
  DROP TYPE "public"."enum_submissions_status";`)
}
