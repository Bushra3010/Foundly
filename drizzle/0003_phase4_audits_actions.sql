CREATE TYPE "public"."action_status" AS ENUM('detected', 'proposed', 'owner_edited', 'approved', 'queued', 'applied', 'verified', 'rejected', 'failed', 'rolled_back');--> statement-breakpoint
CREATE TYPE "public"."audit_status" AS ENUM('queued', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"target" text NOT NULL,
	"status" "audit_status" DEFAULT 'queued' NOT NULL,
	"checklist_version" integer NOT NULL,
	"pages_scanned" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"not_run" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"audit_id" uuid NOT NULL,
	"check_key" text NOT NULL,
	"category" text NOT NULL,
	"page" text,
	"passed" boolean NOT NULL,
	"severity" text NOT NULL,
	"evidence" text NOT NULL,
	"partial" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "improvement_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"finding_id" uuid,
	"check_key" text NOT NULL,
	"apply_kind" text NOT NULL,
	"title" text NOT NULL,
	"page" text,
	"evidence" text NOT NULL,
	"severity" text NOT NULL,
	"priority" integer NOT NULL,
	"hypothesis" text NOT NULL,
	"proposed_change" text NOT NULL,
	"draft" text NOT NULL,
	"draft_revision" integer DEFAULT 1 NOT NULL,
	"status" "action_status" DEFAULT 'proposed' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"approved_revision" integer,
	"approved_hash" text,
	"before_snapshot" jsonb,
	"applied_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"verification_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_actions" ADD CONSTRAINT "improvement_actions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_actions" ADD CONSTRAINT "improvement_actions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_actions" ADD CONSTRAINT "improvement_actions_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_actions" ADD CONSTRAINT "improvement_actions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audits_ws_idx" ON "audits" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "findings_audit_idx" ON "findings" USING btree ("audit_id");--> statement-breakpoint
CREATE INDEX "improvement_actions_ws_idx" ON "improvement_actions" USING btree ("workspace_id","status");