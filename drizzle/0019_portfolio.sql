CREATE TYPE "public"."portfolio_demo_status" AS ENUM('none', 'coming_soon', 'live', 'maintenance');--> statement-breakpoint
CREATE TABLE "portfolio_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"bytes" "bytea" NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"client_name" text,
	"show_client" boolean DEFAULT false NOT NULL,
	"client_label" text NOT NULL,
	"category" text NOT NULL,
	"industry" text,
	"summary" text NOT NULL,
	"description" text,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"demo_url" text,
	"demo_logins" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"demo_status" "portfolio_demo_status" DEFAULT 'none' NOT NULL,
	"embeddable" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "portfolio_media" ADD CONSTRAINT "portfolio_media_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_media_project_idx" ON "portfolio_media" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "portfolio_projects_published_idx" ON "portfolio_projects" USING btree ("published","sort_order");--> statement-breakpoint
-- Same as 0007: block the Supabase Data API; the app connects as the table owner.
ALTER TABLE "portfolio_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "portfolio_media" ENABLE ROW LEVEL SECURITY;
