import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recipes_methods" AS ENUM('pecenje', 'kuhanje', 'przenje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  CREATE TYPE "public"."enum_recipes_diets" AS ENUM('vegetarijansko', 'posno', 'bez-glutena', 'bez-laktoze', 'bez-jaja');
  CREATE TYPE "public"."enum_recipes_ingredient_groups_items_unit" AS ENUM('bez', 'g', 'kg', 'ml', 'dl', 'l', 'kom', 'cesanj', 'glavica', 'list', 'kriska', 'struk', 'vezica', 'kesica', 'paket', 'konzerva', 'tegla', 'kasika', 'kasicica', 'solja', 'casa', 'prstohvat', 'po-ukusu', 'po-potrebi');
  CREATE TYPE "public"."enum_recipes_difficulty" AS ENUM('lako', 'srednje', 'zahtjevno');
  CREATE TYPE "public"."enum_recipes_equipment_oven_mode" AS ENUM('gornji-donji', 'ventilator', 'donji', 'gornji');
  CREATE TYPE "public"."enum_recipes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipes_v_version_methods" AS ENUM('pecenje', 'kuhanje', 'przenje', 'pirjanje', 'rostilj', 'bez-pecenja', 'bez-kuhanja', 'zimnica');
  CREATE TYPE "public"."enum__recipes_v_version_diets" AS ENUM('vegetarijansko', 'posno', 'bez-glutena', 'bez-laktoze', 'bez-jaja');
  CREATE TYPE "public"."enum__recipes_v_version_ingredient_groups_items_unit" AS ENUM('bez', 'g', 'kg', 'ml', 'dl', 'l', 'kom', 'cesanj', 'glavica', 'list', 'kriska', 'struk', 'vezica', 'kesica', 'paket', 'konzerva', 'tegla', 'kasika', 'kasicica', 'solja', 'casa', 'prstohvat', 'po-ukusu', 'po-potrebi');
  CREATE TYPE "public"."enum__recipes_v_version_difficulty" AS ENUM('lako', 'srednje', 'zahtjevno');
  CREATE TYPE "public"."enum__recipes_v_version_equipment_oven_mode" AS ENUM('gornji-donji', 'ventilator', 'donji', 'gornji');
  CREATE TYPE "public"."enum__recipes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_recipe_collections_subfilters" AS ENUM('kategorija', 'vrijeme', 'tezina');
  CREATE TYPE "public"."enum_recipe_collections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipe_collections_v_version_subfilters" AS ENUM('kategorija', 'vrijeme', 'tezina');
  CREATE TYPE "public"."enum__recipe_collections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_footer_group" AS ENUM('portal', 'pravno');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_footer_group" AS ENUM('portal', 'pravno');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_comments_kind" AS ENUM('iskustvo', 'pitanje');
  CREATE TYPE "public"."enum_comments_status" AS ENUM('na-cekanju', 'odobreno', 'odbijeno', 'spam');
  CREATE TYPE "public"."enum_messages_kind" AS ENUM('kontakt', 'greska');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('novo', 'u-obradi', 'rijeseno', 'spam');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '410');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_site_settings_ads_slots" AS ENUM('recipe-after-facts', 'recipe-after-steps', 'archive-inline');
  CREATE TYPE "public"."enum_home_page_quick_links_links_target_type" AS ENUM('collection', 'category');
  CREATE TABLE "recipes_alternative_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "recipes_methods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_recipes_methods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "recipes_diets" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_recipes_diets",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "recipes_ingredient_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"amount" numeric,
  	"amount_max" numeric,
  	"unit" "enum_recipes_ingredient_groups_items_unit" DEFAULT 'g',
  	"label" varchar,
  	"note" varchar,
  	"optional" boolean DEFAULT false,
  	"alt_group" varchar,
  	"original_text" varchar
  );
  
  CREATE TABLE "recipes_ingredient_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "recipes_step_groups_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"timer_minutes" numeric,
  	"timer_label" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "recipes_step_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "recipes_tips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "recipes_substitutions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "recipes_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "recipes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"before_you_start" varchar,
  	"hero_image_id" integer,
  	"share_image_id" integer,
  	"difficulty" "enum_recipes_difficulty",
  	"yield_servings" numeric,
  	"yield_unit" varchar DEFAULT 'porcija',
  	"yield_scalable" boolean DEFAULT true,
  	"times_prep_minutes" numeric,
  	"times_cook_minutes" numeric,
  	"times_rest_minutes" numeric,
  	"times_rest_label" varchar,
  	"times_total_minutes" numeric,
  	"equipment_pan_size" varchar,
  	"equipment_temperature" numeric,
  	"equipment_oven_mode" "enum_recipes_equipment_oven_mode",
  	"equipment_other" varchar,
  	"storage" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"uid" varchar,
  	"primary_category_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"content_updated_at" timestamp(3) with time zone,
  	"facebook_posted_at" timestamp(3) with time zone,
  	"facebook_post_url" varchar,
  	"is_demo" boolean DEFAULT false,
  	"index_search_title" varchar,
  	"index_search_text" varchar,
  	"index_facet_keys" varchar,
  	"index_total_minutes" numeric,
  	"index_match_profile" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_recipes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "recipes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"recipes_id" integer,
  	"guides_id" integer,
  	"authors_id" integer,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_recipes_v_version_alternative_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_methods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__recipes_v_version_methods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_recipes_v_version_diets" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__recipes_v_version_diets",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_recipes_v_version_ingredient_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"amount" numeric,
  	"amount_max" numeric,
  	"unit" "enum__recipes_v_version_ingredient_groups_items_unit" DEFAULT 'g',
  	"label" varchar,
  	"note" varchar,
  	"optional" boolean DEFAULT false,
  	"alt_group" varchar,
  	"original_text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_ingredient_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_step_groups_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"timer_minutes" numeric,
  	"timer_label" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_step_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_tips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_substitutions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_before_you_start" varchar,
  	"version_hero_image_id" integer,
  	"version_share_image_id" integer,
  	"version_difficulty" "enum__recipes_v_version_difficulty",
  	"version_yield_servings" numeric,
  	"version_yield_unit" varchar DEFAULT 'porcija',
  	"version_yield_scalable" boolean DEFAULT true,
  	"version_times_prep_minutes" numeric,
  	"version_times_cook_minutes" numeric,
  	"version_times_rest_minutes" numeric,
  	"version_times_rest_label" varchar,
  	"version_times_total_minutes" numeric,
  	"version_equipment_pan_size" varchar,
  	"version_equipment_temperature" numeric,
  	"version_equipment_oven_mode" "enum__recipes_v_version_equipment_oven_mode",
  	"version_equipment_other" varchar,
  	"version_storage" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_uid" varchar,
  	"version_primary_category_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_content_updated_at" timestamp(3) with time zone,
  	"version_facebook_posted_at" timestamp(3) with time zone,
  	"version_facebook_post_url" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_index_search_title" varchar,
  	"version_index_search_text" varchar,
  	"version_index_facet_keys" varchar,
  	"version_index_total_minutes" numeric,
  	"version_index_match_profile" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__recipes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_recipes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"recipes_id" integer,
  	"guides_id" integer,
  	"authors_id" integer,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "ingredients_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL
  );
  
  CREATE TABLE "ingredients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"broader_id" integer,
  	"rounding_hint" varchar,
  	"public_page" boolean DEFAULT false,
  	"description" varchar,
  	"selection" varchar,
  	"storage" varchar,
  	"substitutes" varchar,
  	"image_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"uid" varchar,
  	"is_demo" boolean DEFAULT false,
  	"search_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ingredients_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"guides_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"intro" varchar,
  	"parent_id" integer,
  	"image_id" integer,
  	"order" numeric DEFAULT 100,
  	"show_in_menu" boolean DEFAULT true,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"uid" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "recipe_collections_subfilters" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_recipe_collections_subfilters",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "recipe_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"purpose" varchar,
  	"intro" varchar,
  	"image_id" integer,
  	"indexable" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"content_updated_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"uid" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_recipe_collections_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "recipe_collections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"recipes_id" integer
  );
  
  CREATE TABLE "_recipe_collections_v_version_subfilters" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__recipe_collections_v_version_subfilters",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_recipe_collections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_purpose" varchar,
  	"version_intro" varchar,
  	"version_image_id" integer,
  	"version_indexable" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_content_updated_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_uid" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__recipe_collections_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_recipe_collections_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"recipes_id" integer
  );
  
  CREATE TABLE "guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"answer" varchar,
  	"hero_image_id" integer,
  	"body" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"content_updated_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"uid" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"ingredients_id" integer,
  	"recipes_id" integer,
  	"authors_id" integer
  );
  
  CREATE TABLE "_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_answer" varchar,
  	"version_hero_image_id" integer,
  	"version_body" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_content_updated_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_uid" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"ingredients_id" integer,
  	"recipes_id" integer,
  	"authors_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"needs_editor_input" boolean DEFAULT true,
  	"footer_group" "enum_pages_footer_group",
  	"published_at" timestamp(3) with time zone,
  	"content_updated_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_needs_editor_input" boolean DEFAULT true,
  	"version_footer_group" "enum__pages_v_version_footer_group",
  	"version_published_at" timestamp(3) with time zone,
  	"version_content_updated_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"is_team" boolean DEFAULT false,
  	"role" varchar,
  	"bio" varchar,
  	"image_id" integer,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"merged_into_id" integer,
  	"public" boolean DEFAULT true,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_synonyms_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL
  );
  
  CREATE TABLE "search_synonyms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"normalized" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"is_demo" boolean DEFAULT false,
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
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipe_id" integer NOT NULL,
  	"kind" "enum_comments_kind" DEFAULT 'iskustvo' NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"text" varchar NOT NULL,
  	"rating" numeric,
  	"status" "enum_comments_status" DEFAULT 'na-cekanju' NOT NULL,
  	"reply" varchar,
  	"client_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_messages_kind" NOT NULL,
  	"subject" varchar NOT NULL,
  	"recipe_id" integer,
  	"name" varchar,
  	"email" varchar,
  	"message" varchar NOT NULL,
  	"status" "enum_messages_status" DEFAULT 'novo',
  	"client_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"type" "enum_redirects_type" DEFAULT '301',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
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
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"recipes_id" integer,
  	"ingredients_id" integer,
  	"categories_id" integer,
  	"recipe_collections_id" integer,
  	"guides_id" integer,
  	"pages_id" integer,
  	"authors_id" integer,
  	"tags_id" integer,
  	"search_synonyms_id" integer,
  	"media_id" integer,
  	"comments_id" integer,
  	"messages_id" integer,
  	"redirects_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_ads_slots" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_ads_slots",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Srce naše kuhinje' NOT NULL,
  	"tagline" varchar DEFAULT 'Provjereni domaći recepti, jasno i bez suvišnog.',
  	"description" varchar DEFAULT 'Praktična digitalna kuharica: pronađite jelo, pripremite ga korak po korak i sačuvajte omiljene recepte.',
  	"facebook_url" varchar,
  	"facebook_name" varchar DEFAULT 'Srce naše kuhinje – najbolji recepti',
  	"organization_name" varchar,
  	"logo_id" integer,
  	"features_comments" boolean DEFAULT true,
  	"features_ratings" boolean DEFAULT true,
  	"features_pantry_promo" boolean DEFAULT false,
  	"features_corrections" boolean DEFAULT true,
  	"ads_enabled" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"guides_id" integer
  );
  
  CREATE TABLE "home_page_quick_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"target_type" "enum_home_page_quick_links_links_target_type" DEFAULT 'collection' NOT NULL,
  	"collection_id" integer,
  	"category_id" integer
  );
  
  CREATE TABLE "home_page_featured_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"recipe_id" integer NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_enabled" boolean DEFAULT true,
  	"hero_title" varchar DEFAULT 'Šta danas pripremamo?',
  	"hero_text" varchar DEFAULT 'Upišite naziv jela ili namirnicu koju imate.',
  	"hero_image_id" integer,
  	"quick_links_enabled" boolean DEFAULT true,
  	"quick_links_title" varchar DEFAULT 'Brzi izbor',
  	"featured_enabled" boolean DEFAULT true,
  	"featured_title" varchar DEFAULT 'Danas izdvajamo',
  	"categories_enabled" boolean DEFAULT true,
  	"categories_title" varchar DEFAULT 'Recepti po kategorijama',
  	"facebook_enabled" boolean DEFAULT true,
  	"facebook_title" varchar DEFAULT 'Sa naše Facebook stranice',
  	"facebook_text" varchar DEFAULT 'Recepti koje smo nedavno podijelili na Facebook stranici.',
  	"facebook_count" numeric DEFAULT 6,
  	"pantry_enabled" boolean DEFAULT true,
  	"pantry_title" varchar DEFAULT 'Šta imate u kuhinji?',
  	"pantry_text" varchar DEFAULT 'Odaberite namirnice koje imate i pogledajte šta možete pripremiti.',
  	"sweet_enabled" boolean DEFAULT true,
  	"sweet_title" varchar DEFAULT 'Nešto slatko',
  	"season_enabled" boolean DEFAULT true,
  	"season_title" varchar DEFAULT 'U sezoni',
  	"season_collection_id" integer,
  	"season_guide_id" integer,
  	"latest_enabled" boolean DEFAULT true,
  	"latest_title" varchar DEFAULT 'Najnoviji recepti',
  	"guides_enabled" boolean DEFAULT true,
  	"guides_title" varchar DEFAULT 'Savjeti iz kuhinje',
  	"community_enabled" boolean DEFAULT true,
  	"community_title" varchar DEFAULT 'Pridružite nam se na Facebooku',
  	"community_text" varchar DEFAULT 'Svakog dana dijelimo recepte i odgovaramo na vaša pitanja.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"ingredients_id" integer,
  	"recipes_id" integer,
  	"guides_id" integer
  );
  
  CREATE TABLE "pantry_basics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"public_approved" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pantry_basics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"ingredients_id" integer
  );
  
  ALTER TABLE "recipes_alternative_names" ADD CONSTRAINT "recipes_alternative_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_methods" ADD CONSTRAINT "recipes_methods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_diets" ADD CONSTRAINT "recipes_diets_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_ingredient_groups_items" ADD CONSTRAINT "recipes_ingredient_groups_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes_ingredient_groups_items" ADD CONSTRAINT "recipes_ingredient_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes_ingredient_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_ingredient_groups" ADD CONSTRAINT "recipes_ingredient_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_step_groups_steps" ADD CONSTRAINT "recipes_step_groups_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes_step_groups_steps" ADD CONSTRAINT "recipes_step_groups_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes_step_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_step_groups" ADD CONSTRAINT "recipes_step_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_tips" ADD CONSTRAINT "recipes_tips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_substitutions" ADD CONSTRAINT "recipes_substitutions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_faq" ADD CONSTRAINT "recipes_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_primary_category_id_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_alternative_names" ADD CONSTRAINT "_recipes_v_version_alternative_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_methods" ADD CONSTRAINT "_recipes_v_version_methods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_diets" ADD CONSTRAINT "_recipes_v_version_diets_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_ingredient_groups_items" ADD CONSTRAINT "_recipes_v_version_ingredient_groups_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_ingredient_groups_items" ADD CONSTRAINT "_recipes_v_version_ingredient_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v_version_ingredient_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_ingredient_groups" ADD CONSTRAINT "_recipes_v_version_ingredient_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_step_groups_steps" ADD CONSTRAINT "_recipes_v_version_step_groups_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_step_groups_steps" ADD CONSTRAINT "_recipes_v_version_step_groups_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v_version_step_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_step_groups" ADD CONSTRAINT "_recipes_v_version_step_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_tips" ADD CONSTRAINT "_recipes_v_version_tips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_substitutions" ADD CONSTRAINT "_recipes_v_version_substitutions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_faq" ADD CONSTRAINT "_recipes_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_parent_id_recipes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_share_image_id_media_id_fk" FOREIGN KEY ("version_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_primary_category_id_categories_id_fk" FOREIGN KEY ("version_primary_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_synonyms" ADD CONSTRAINT "ingredients_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_broader_id_ingredients_id_fk" FOREIGN KEY ("broader_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingredients_rels" ADD CONSTRAINT "ingredients_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ingredients_rels" ADD CONSTRAINT "ingredients_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipe_collections_subfilters" ADD CONSTRAINT "recipe_collections_subfilters_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipe_collections" ADD CONSTRAINT "recipe_collections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recipe_collections_rels" ADD CONSTRAINT "recipe_collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipe_collections_rels" ADD CONSTRAINT "recipe_collections_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_version_subfilters" ADD CONSTRAINT "_recipe_collections_v_version_subfilters_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipe_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v" ADD CONSTRAINT "_recipe_collections_v_parent_id_recipe_collections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipe_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v" ADD CONSTRAINT "_recipe_collections_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_rels" ADD CONSTRAINT "_recipe_collections_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipe_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipe_collections_v_rels" ADD CONSTRAINT "_recipe_collections_v_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags_merged_into_id_tags_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_synonyms_terms" ADD CONSTRAINT "search_synonyms_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_synonyms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipe_collections_fk" FOREIGN KEY ("recipe_collections_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_synonyms_fk" FOREIGN KEY ("search_synonyms_id") REFERENCES "public"."search_synonyms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_ads_slots" ADD CONSTRAINT "site_settings_ads_slots_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_quick_links_links" ADD CONSTRAINT "home_page_quick_links_links_collection_id_recipe_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."recipe_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_quick_links_links" ADD CONSTRAINT "home_page_quick_links_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_quick_links_links" ADD CONSTRAINT "home_page_quick_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_featured_items" ADD CONSTRAINT "home_page_featured_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_featured_items" ADD CONSTRAINT "home_page_featured_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_season_collection_id_recipe_collections_id_fk" FOREIGN KEY ("season_collection_id") REFERENCES "public"."recipe_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_season_guide_id_guides_id_fk" FOREIGN KEY ("season_guide_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pantry_basics_rels" ADD CONSTRAINT "pantry_basics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pantry_basics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pantry_basics_rels" ADD CONSTRAINT "pantry_basics_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "recipes_alternative_names_order_idx" ON "recipes_alternative_names" USING btree ("_order");
  CREATE INDEX "recipes_alternative_names_parent_id_idx" ON "recipes_alternative_names" USING btree ("_parent_id");
  CREATE INDEX "recipes_methods_order_idx" ON "recipes_methods" USING btree ("order");
  CREATE INDEX "recipes_methods_parent_idx" ON "recipes_methods" USING btree ("parent_id");
  CREATE INDEX "recipes_diets_order_idx" ON "recipes_diets" USING btree ("order");
  CREATE INDEX "recipes_diets_parent_idx" ON "recipes_diets" USING btree ("parent_id");
  CREATE INDEX "recipes_ingredient_groups_items_order_idx" ON "recipes_ingredient_groups_items" USING btree ("_order");
  CREATE INDEX "recipes_ingredient_groups_items_parent_id_idx" ON "recipes_ingredient_groups_items" USING btree ("_parent_id");
  CREATE INDEX "recipes_ingredient_groups_items_ingredient_idx" ON "recipes_ingredient_groups_items" USING btree ("ingredient_id");
  CREATE INDEX "recipes_ingredient_groups_order_idx" ON "recipes_ingredient_groups" USING btree ("_order");
  CREATE INDEX "recipes_ingredient_groups_parent_id_idx" ON "recipes_ingredient_groups" USING btree ("_parent_id");
  CREATE INDEX "recipes_step_groups_steps_order_idx" ON "recipes_step_groups_steps" USING btree ("_order");
  CREATE INDEX "recipes_step_groups_steps_parent_id_idx" ON "recipes_step_groups_steps" USING btree ("_parent_id");
  CREATE INDEX "recipes_step_groups_steps_image_idx" ON "recipes_step_groups_steps" USING btree ("image_id");
  CREATE INDEX "recipes_step_groups_order_idx" ON "recipes_step_groups" USING btree ("_order");
  CREATE INDEX "recipes_step_groups_parent_id_idx" ON "recipes_step_groups" USING btree ("_parent_id");
  CREATE INDEX "recipes_tips_order_idx" ON "recipes_tips" USING btree ("_order");
  CREATE INDEX "recipes_tips_parent_id_idx" ON "recipes_tips" USING btree ("_parent_id");
  CREATE INDEX "recipes_substitutions_order_idx" ON "recipes_substitutions" USING btree ("_order");
  CREATE INDEX "recipes_substitutions_parent_id_idx" ON "recipes_substitutions" USING btree ("_parent_id");
  CREATE INDEX "recipes_faq_order_idx" ON "recipes_faq" USING btree ("_order");
  CREATE INDEX "recipes_faq_parent_id_idx" ON "recipes_faq" USING btree ("_parent_id");
  CREATE INDEX "recipes_hero_image_idx" ON "recipes" USING btree ("hero_image_id");
  CREATE INDEX "recipes_share_image_idx" ON "recipes" USING btree ("share_image_id");
  CREATE UNIQUE INDEX "recipes_slug_idx" ON "recipes" USING btree ("slug");
  CREATE UNIQUE INDEX "recipes_uid_idx" ON "recipes" USING btree ("uid");
  CREATE INDEX "recipes_primary_category_idx" ON "recipes" USING btree ("primary_category_id");
  CREATE INDEX "recipes_is_demo_idx" ON "recipes" USING btree ("is_demo");
  CREATE INDEX "recipes_index_index_total_minutes_idx" ON "recipes" USING btree ("index_total_minutes");
  CREATE INDEX "recipes_updated_at_idx" ON "recipes" USING btree ("updated_at");
  CREATE INDEX "recipes_created_at_idx" ON "recipes" USING btree ("created_at");
  CREATE INDEX "recipes__status_idx" ON "recipes" USING btree ("_status");
  CREATE INDEX "recipes_rels_order_idx" ON "recipes_rels" USING btree ("order");
  CREATE INDEX "recipes_rels_parent_idx" ON "recipes_rels" USING btree ("parent_id");
  CREATE INDEX "recipes_rels_path_idx" ON "recipes_rels" USING btree ("path");
  CREATE INDEX "recipes_rels_recipes_id_idx" ON "recipes_rels" USING btree ("recipes_id");
  CREATE INDEX "recipes_rels_guides_id_idx" ON "recipes_rels" USING btree ("guides_id");
  CREATE INDEX "recipes_rels_authors_id_idx" ON "recipes_rels" USING btree ("authors_id");
  CREATE INDEX "recipes_rels_categories_id_idx" ON "recipes_rels" USING btree ("categories_id");
  CREATE INDEX "recipes_rels_tags_id_idx" ON "recipes_rels" USING btree ("tags_id");
  CREATE INDEX "_recipes_v_version_alternative_names_order_idx" ON "_recipes_v_version_alternative_names" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_alternative_names_parent_id_idx" ON "_recipes_v_version_alternative_names" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_methods_order_idx" ON "_recipes_v_version_methods" USING btree ("order");
  CREATE INDEX "_recipes_v_version_methods_parent_idx" ON "_recipes_v_version_methods" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_version_diets_order_idx" ON "_recipes_v_version_diets" USING btree ("order");
  CREATE INDEX "_recipes_v_version_diets_parent_idx" ON "_recipes_v_version_diets" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_version_ingredient_groups_items_order_idx" ON "_recipes_v_version_ingredient_groups_items" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_ingredient_groups_items_parent_id_idx" ON "_recipes_v_version_ingredient_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_ingredient_groups_items_ingredient_idx" ON "_recipes_v_version_ingredient_groups_items" USING btree ("ingredient_id");
  CREATE INDEX "_recipes_v_version_ingredient_groups_order_idx" ON "_recipes_v_version_ingredient_groups" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_ingredient_groups_parent_id_idx" ON "_recipes_v_version_ingredient_groups" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_step_groups_steps_order_idx" ON "_recipes_v_version_step_groups_steps" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_step_groups_steps_parent_id_idx" ON "_recipes_v_version_step_groups_steps" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_step_groups_steps_image_idx" ON "_recipes_v_version_step_groups_steps" USING btree ("image_id");
  CREATE INDEX "_recipes_v_version_step_groups_order_idx" ON "_recipes_v_version_step_groups" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_step_groups_parent_id_idx" ON "_recipes_v_version_step_groups" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_tips_order_idx" ON "_recipes_v_version_tips" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_tips_parent_id_idx" ON "_recipes_v_version_tips" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_substitutions_order_idx" ON "_recipes_v_version_substitutions" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_substitutions_parent_id_idx" ON "_recipes_v_version_substitutions" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_faq_order_idx" ON "_recipes_v_version_faq" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_faq_parent_id_idx" ON "_recipes_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_parent_idx" ON "_recipes_v" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_version_version_hero_image_idx" ON "_recipes_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_recipes_v_version_version_share_image_idx" ON "_recipes_v" USING btree ("version_share_image_id");
  CREATE INDEX "_recipes_v_version_version_slug_idx" ON "_recipes_v" USING btree ("version_slug");
  CREATE INDEX "_recipes_v_version_version_uid_idx" ON "_recipes_v" USING btree ("version_uid");
  CREATE INDEX "_recipes_v_version_version_primary_category_idx" ON "_recipes_v" USING btree ("version_primary_category_id");
  CREATE INDEX "_recipes_v_version_version_is_demo_idx" ON "_recipes_v" USING btree ("version_is_demo");
  CREATE INDEX "_recipes_v_version_index_version_index_total_minutes_idx" ON "_recipes_v" USING btree ("version_index_total_minutes");
  CREATE INDEX "_recipes_v_version_version_updated_at_idx" ON "_recipes_v" USING btree ("version_updated_at");
  CREATE INDEX "_recipes_v_version_version_created_at_idx" ON "_recipes_v" USING btree ("version_created_at");
  CREATE INDEX "_recipes_v_version_version__status_idx" ON "_recipes_v" USING btree ("version__status");
  CREATE INDEX "_recipes_v_created_at_idx" ON "_recipes_v" USING btree ("created_at");
  CREATE INDEX "_recipes_v_updated_at_idx" ON "_recipes_v" USING btree ("updated_at");
  CREATE INDEX "_recipes_v_latest_idx" ON "_recipes_v" USING btree ("latest");
  CREATE INDEX "_recipes_v_rels_order_idx" ON "_recipes_v_rels" USING btree ("order");
  CREATE INDEX "_recipes_v_rels_parent_idx" ON "_recipes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_recipes_v_rels_path_idx" ON "_recipes_v_rels" USING btree ("path");
  CREATE INDEX "_recipes_v_rels_recipes_id_idx" ON "_recipes_v_rels" USING btree ("recipes_id");
  CREATE INDEX "_recipes_v_rels_guides_id_idx" ON "_recipes_v_rels" USING btree ("guides_id");
  CREATE INDEX "_recipes_v_rels_authors_id_idx" ON "_recipes_v_rels" USING btree ("authors_id");
  CREATE INDEX "_recipes_v_rels_categories_id_idx" ON "_recipes_v_rels" USING btree ("categories_id");
  CREATE INDEX "_recipes_v_rels_tags_id_idx" ON "_recipes_v_rels" USING btree ("tags_id");
  CREATE INDEX "ingredients_synonyms_order_idx" ON "ingredients_synonyms" USING btree ("_order");
  CREATE INDEX "ingredients_synonyms_parent_id_idx" ON "ingredients_synonyms" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ingredients_name_idx" ON "ingredients" USING btree ("name");
  CREATE INDEX "ingredients_broader_idx" ON "ingredients" USING btree ("broader_id");
  CREATE INDEX "ingredients_image_idx" ON "ingredients" USING btree ("image_id");
  CREATE UNIQUE INDEX "ingredients_slug_idx" ON "ingredients" USING btree ("slug");
  CREATE UNIQUE INDEX "ingredients_uid_idx" ON "ingredients" USING btree ("uid");
  CREATE INDEX "ingredients_is_demo_idx" ON "ingredients" USING btree ("is_demo");
  CREATE INDEX "ingredients_search_name_idx" ON "ingredients" USING btree ("search_name");
  CREATE INDEX "ingredients_updated_at_idx" ON "ingredients" USING btree ("updated_at");
  CREATE INDEX "ingredients_created_at_idx" ON "ingredients" USING btree ("created_at");
  CREATE INDEX "ingredients_rels_order_idx" ON "ingredients_rels" USING btree ("order");
  CREATE INDEX "ingredients_rels_parent_idx" ON "ingredients_rels" USING btree ("parent_id");
  CREATE INDEX "ingredients_rels_path_idx" ON "ingredients_rels" USING btree ("path");
  CREATE INDEX "ingredients_rels_guides_id_idx" ON "ingredients_rels" USING btree ("guides_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE UNIQUE INDEX "categories_uid_idx" ON "categories" USING btree ("uid");
  CREATE INDEX "categories_is_demo_idx" ON "categories" USING btree ("is_demo");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "recipe_collections_subfilters_order_idx" ON "recipe_collections_subfilters" USING btree ("order");
  CREATE INDEX "recipe_collections_subfilters_parent_idx" ON "recipe_collections_subfilters" USING btree ("parent_id");
  CREATE INDEX "recipe_collections_image_idx" ON "recipe_collections" USING btree ("image_id");
  CREATE UNIQUE INDEX "recipe_collections_slug_idx" ON "recipe_collections" USING btree ("slug");
  CREATE UNIQUE INDEX "recipe_collections_uid_idx" ON "recipe_collections" USING btree ("uid");
  CREATE INDEX "recipe_collections_is_demo_idx" ON "recipe_collections" USING btree ("is_demo");
  CREATE INDEX "recipe_collections_updated_at_idx" ON "recipe_collections" USING btree ("updated_at");
  CREATE INDEX "recipe_collections_created_at_idx" ON "recipe_collections" USING btree ("created_at");
  CREATE INDEX "recipe_collections__status_idx" ON "recipe_collections" USING btree ("_status");
  CREATE INDEX "recipe_collections_rels_order_idx" ON "recipe_collections_rels" USING btree ("order");
  CREATE INDEX "recipe_collections_rels_parent_idx" ON "recipe_collections_rels" USING btree ("parent_id");
  CREATE INDEX "recipe_collections_rels_path_idx" ON "recipe_collections_rels" USING btree ("path");
  CREATE INDEX "recipe_collections_rels_recipes_id_idx" ON "recipe_collections_rels" USING btree ("recipes_id");
  CREATE INDEX "_recipe_collections_v_version_subfilters_order_idx" ON "_recipe_collections_v_version_subfilters" USING btree ("order");
  CREATE INDEX "_recipe_collections_v_version_subfilters_parent_idx" ON "_recipe_collections_v_version_subfilters" USING btree ("parent_id");
  CREATE INDEX "_recipe_collections_v_parent_idx" ON "_recipe_collections_v" USING btree ("parent_id");
  CREATE INDEX "_recipe_collections_v_version_version_image_idx" ON "_recipe_collections_v" USING btree ("version_image_id");
  CREATE INDEX "_recipe_collections_v_version_version_slug_idx" ON "_recipe_collections_v" USING btree ("version_slug");
  CREATE INDEX "_recipe_collections_v_version_version_uid_idx" ON "_recipe_collections_v" USING btree ("version_uid");
  CREATE INDEX "_recipe_collections_v_version_version_is_demo_idx" ON "_recipe_collections_v" USING btree ("version_is_demo");
  CREATE INDEX "_recipe_collections_v_version_version_updated_at_idx" ON "_recipe_collections_v" USING btree ("version_updated_at");
  CREATE INDEX "_recipe_collections_v_version_version_created_at_idx" ON "_recipe_collections_v" USING btree ("version_created_at");
  CREATE INDEX "_recipe_collections_v_version_version__status_idx" ON "_recipe_collections_v" USING btree ("version__status");
  CREATE INDEX "_recipe_collections_v_created_at_idx" ON "_recipe_collections_v" USING btree ("created_at");
  CREATE INDEX "_recipe_collections_v_updated_at_idx" ON "_recipe_collections_v" USING btree ("updated_at");
  CREATE INDEX "_recipe_collections_v_latest_idx" ON "_recipe_collections_v" USING btree ("latest");
  CREATE INDEX "_recipe_collections_v_rels_order_idx" ON "_recipe_collections_v_rels" USING btree ("order");
  CREATE INDEX "_recipe_collections_v_rels_parent_idx" ON "_recipe_collections_v_rels" USING btree ("parent_id");
  CREATE INDEX "_recipe_collections_v_rels_path_idx" ON "_recipe_collections_v_rels" USING btree ("path");
  CREATE INDEX "_recipe_collections_v_rels_recipes_id_idx" ON "_recipe_collections_v_rels" USING btree ("recipes_id");
  CREATE INDEX "guides_hero_image_idx" ON "guides" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "guides" USING btree ("slug");
  CREATE UNIQUE INDEX "guides_uid_idx" ON "guides" USING btree ("uid");
  CREATE INDEX "guides_is_demo_idx" ON "guides" USING btree ("is_demo");
  CREATE INDEX "guides_updated_at_idx" ON "guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "guides" USING btree ("_status");
  CREATE INDEX "guides_rels_order_idx" ON "guides_rels" USING btree ("order");
  CREATE INDEX "guides_rels_parent_idx" ON "guides_rels" USING btree ("parent_id");
  CREATE INDEX "guides_rels_path_idx" ON "guides_rels" USING btree ("path");
  CREATE INDEX "guides_rels_ingredients_id_idx" ON "guides_rels" USING btree ("ingredients_id");
  CREATE INDEX "guides_rels_recipes_id_idx" ON "guides_rels" USING btree ("recipes_id");
  CREATE INDEX "guides_rels_authors_id_idx" ON "guides_rels" USING btree ("authors_id");
  CREATE INDEX "_guides_v_parent_idx" ON "_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_hero_image_idx" ON "_guides_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "_guides_v" USING btree ("version_slug");
  CREATE INDEX "_guides_v_version_version_uid_idx" ON "_guides_v" USING btree ("version_uid");
  CREATE INDEX "_guides_v_version_version_is_demo_idx" ON "_guides_v" USING btree ("version_is_demo");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_latest_idx" ON "_guides_v" USING btree ("latest");
  CREATE INDEX "_guides_v_rels_order_idx" ON "_guides_v_rels" USING btree ("order");
  CREATE INDEX "_guides_v_rels_parent_idx" ON "_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guides_v_rels_path_idx" ON "_guides_v_rels" USING btree ("path");
  CREATE INDEX "_guides_v_rels_ingredients_id_idx" ON "_guides_v_rels" USING btree ("ingredients_id");
  CREATE INDEX "_guides_v_rels_recipes_id_idx" ON "_guides_v_rels" USING btree ("recipes_id");
  CREATE INDEX "_guides_v_rels_authors_id_idx" ON "_guides_v_rels" USING btree ("authors_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_is_demo_idx" ON "pages" USING btree ("is_demo");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_is_demo_idx" ON "_pages_v" USING btree ("version_is_demo");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "authors_image_idx" ON "authors" USING btree ("image_id");
  CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_is_demo_idx" ON "authors" USING btree ("is_demo");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");
  CREATE INDEX "tags_merged_into_idx" ON "tags" USING btree ("merged_into_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_is_demo_idx" ON "tags" USING btree ("is_demo");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "search_synonyms_terms_order_idx" ON "search_synonyms_terms" USING btree ("_order");
  CREATE INDEX "search_synonyms_terms_parent_id_idx" ON "search_synonyms_terms" USING btree ("_parent_id");
  CREATE INDEX "search_synonyms_is_demo_idx" ON "search_synonyms" USING btree ("is_demo");
  CREATE INDEX "search_synonyms_updated_at_idx" ON "search_synonyms" USING btree ("updated_at");
  CREATE INDEX "search_synonyms_created_at_idx" ON "search_synonyms" USING btree ("created_at");
  CREATE INDEX "media_is_demo_idx" ON "media" USING btree ("is_demo");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "comments_recipe_idx" ON "comments" USING btree ("recipe_id");
  CREATE INDEX "comments_status_idx" ON "comments" USING btree ("status");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX "messages_recipe_idx" ON "messages" USING btree ("recipe_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_recipes_id_idx" ON "payload_locked_documents_rels" USING btree ("recipes_id");
  CREATE INDEX "payload_locked_documents_rels_ingredients_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredients_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_recipe_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("recipe_collections_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_search_synonyms_id_idx" ON "payload_locked_documents_rels" USING btree ("search_synonyms_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_ads_slots_order_idx" ON "site_settings_ads_slots" USING btree ("order");
  CREATE INDEX "site_settings_ads_slots_parent_idx" ON "site_settings_ads_slots" USING btree ("parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "navigation_rels_order_idx" ON "navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_categories_id_idx" ON "navigation_rels" USING btree ("categories_id");
  CREATE INDEX "navigation_rels_guides_id_idx" ON "navigation_rels" USING btree ("guides_id");
  CREATE INDEX "home_page_quick_links_links_order_idx" ON "home_page_quick_links_links" USING btree ("_order");
  CREATE INDEX "home_page_quick_links_links_parent_id_idx" ON "home_page_quick_links_links" USING btree ("_parent_id");
  CREATE INDEX "home_page_quick_links_links_collection_idx" ON "home_page_quick_links_links" USING btree ("collection_id");
  CREATE INDEX "home_page_quick_links_links_category_idx" ON "home_page_quick_links_links" USING btree ("category_id");
  CREATE INDEX "home_page_featured_items_order_idx" ON "home_page_featured_items" USING btree ("_order");
  CREATE INDEX "home_page_featured_items_parent_id_idx" ON "home_page_featured_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_featured_items_recipe_idx" ON "home_page_featured_items" USING btree ("recipe_id");
  CREATE INDEX "home_page_hero_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "home_page_season_season_collection_idx" ON "home_page" USING btree ("season_collection_id");
  CREATE INDEX "home_page_season_season_guide_idx" ON "home_page" USING btree ("season_guide_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_categories_id_idx" ON "home_page_rels" USING btree ("categories_id");
  CREATE INDEX "home_page_rels_ingredients_id_idx" ON "home_page_rels" USING btree ("ingredients_id");
  CREATE INDEX "home_page_rels_recipes_id_idx" ON "home_page_rels" USING btree ("recipes_id");
  CREATE INDEX "home_page_rels_guides_id_idx" ON "home_page_rels" USING btree ("guides_id");
  CREATE INDEX "pantry_basics_rels_order_idx" ON "pantry_basics_rels" USING btree ("order");
  CREATE INDEX "pantry_basics_rels_parent_idx" ON "pantry_basics_rels" USING btree ("parent_id");
  CREATE INDEX "pantry_basics_rels_path_idx" ON "pantry_basics_rels" USING btree ("path");
  CREATE INDEX "pantry_basics_rels_ingredients_id_idx" ON "pantry_basics_rels" USING btree ("ingredients_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "recipes_alternative_names" CASCADE;
  DROP TABLE "recipes_methods" CASCADE;
  DROP TABLE "recipes_diets" CASCADE;
  DROP TABLE "recipes_ingredient_groups_items" CASCADE;
  DROP TABLE "recipes_ingredient_groups" CASCADE;
  DROP TABLE "recipes_step_groups_steps" CASCADE;
  DROP TABLE "recipes_step_groups" CASCADE;
  DROP TABLE "recipes_tips" CASCADE;
  DROP TABLE "recipes_substitutions" CASCADE;
  DROP TABLE "recipes_faq" CASCADE;
  DROP TABLE "recipes" CASCADE;
  DROP TABLE "recipes_rels" CASCADE;
  DROP TABLE "_recipes_v_version_alternative_names" CASCADE;
  DROP TABLE "_recipes_v_version_methods" CASCADE;
  DROP TABLE "_recipes_v_version_diets" CASCADE;
  DROP TABLE "_recipes_v_version_ingredient_groups_items" CASCADE;
  DROP TABLE "_recipes_v_version_ingredient_groups" CASCADE;
  DROP TABLE "_recipes_v_version_step_groups_steps" CASCADE;
  DROP TABLE "_recipes_v_version_step_groups" CASCADE;
  DROP TABLE "_recipes_v_version_tips" CASCADE;
  DROP TABLE "_recipes_v_version_substitutions" CASCADE;
  DROP TABLE "_recipes_v_version_faq" CASCADE;
  DROP TABLE "_recipes_v" CASCADE;
  DROP TABLE "_recipes_v_rels" CASCADE;
  DROP TABLE "ingredients_synonyms" CASCADE;
  DROP TABLE "ingredients" CASCADE;
  DROP TABLE "ingredients_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "recipe_collections_subfilters" CASCADE;
  DROP TABLE "recipe_collections" CASCADE;
  DROP TABLE "recipe_collections_rels" CASCADE;
  DROP TABLE "_recipe_collections_v_version_subfilters" CASCADE;
  DROP TABLE "_recipe_collections_v" CASCADE;
  DROP TABLE "_recipe_collections_v_rels" CASCADE;
  DROP TABLE "guides" CASCADE;
  DROP TABLE "guides_rels" CASCADE;
  DROP TABLE "_guides_v" CASCADE;
  DROP TABLE "_guides_v_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "search_synonyms_terms" CASCADE;
  DROP TABLE "search_synonyms" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_ads_slots" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_rels" CASCADE;
  DROP TABLE "home_page_quick_links_links" CASCADE;
  DROP TABLE "home_page_featured_items" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "pantry_basics" CASCADE;
  DROP TABLE "pantry_basics_rels" CASCADE;
  DROP TYPE "public"."enum_recipes_methods";
  DROP TYPE "public"."enum_recipes_diets";
  DROP TYPE "public"."enum_recipes_ingredient_groups_items_unit";
  DROP TYPE "public"."enum_recipes_difficulty";
  DROP TYPE "public"."enum_recipes_equipment_oven_mode";
  DROP TYPE "public"."enum_recipes_status";
  DROP TYPE "public"."enum__recipes_v_version_methods";
  DROP TYPE "public"."enum__recipes_v_version_diets";
  DROP TYPE "public"."enum__recipes_v_version_ingredient_groups_items_unit";
  DROP TYPE "public"."enum__recipes_v_version_difficulty";
  DROP TYPE "public"."enum__recipes_v_version_equipment_oven_mode";
  DROP TYPE "public"."enum__recipes_v_version_status";
  DROP TYPE "public"."enum_recipe_collections_subfilters";
  DROP TYPE "public"."enum_recipe_collections_status";
  DROP TYPE "public"."enum__recipe_collections_v_version_subfilters";
  DROP TYPE "public"."enum__recipe_collections_v_version_status";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum__guides_v_version_status";
  DROP TYPE "public"."enum_pages_footer_group";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_footer_group";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_comments_kind";
  DROP TYPE "public"."enum_comments_status";
  DROP TYPE "public"."enum_messages_kind";
  DROP TYPE "public"."enum_messages_status";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_site_settings_ads_slots";
  DROP TYPE "public"."enum_home_page_quick_links_links_target_type";`)
}
