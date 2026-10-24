CREATE TYPE "public"."contact_method" AS ENUM('phone', 'whatsapp', 'video');--> statement-breakpoint
CREATE TYPE "public"."website_request_status" AS ENUM('new', 'contacted', 'in_progress', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "website_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"requested_by" uuid,
	"goal" text NOT NULL,
	"pages" text,
	"style" text,
	"examples" text,
	"contact_method" "contact_method" NOT NULL,
	"contact_value" text NOT NULL,
	"contact_time" text,
	"status" "website_request_status" DEFAULT 'new' NOT NULL,
	"team_note" text,
	"delivered_url" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "website_requests" ADD CONSTRAINT "website_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_requests" ADD CONSTRAINT "website_requests_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_requests" ADD CONSTRAINT "website_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "website_requests_workspace_idx" ON "website_requests" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "website_requests_open_idx" ON "website_requests" USING btree ("business_id") WHERE "website_requests"."status" in ('new', 'contacted', 'in_progress');--> statement-breakpoint
ALTER TABLE "website_requests" ENABLE ROW LEVEL SECURITY;