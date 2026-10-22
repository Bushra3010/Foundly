CREATE TYPE "public"."observation_status" AS ENUM('answered', 'answered_uncited', 'refusal', 'partial', 'timeout', 'unavailable', 'error');--> statement-breakpoint
CREATE TYPE "public"."question_group" AS ENUM('service', 'purchase', 'comparison', 'location', 'branded');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('reserved', 'settled', 'released');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('queued', 'running', 'completed', 'partial', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "brand_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"observation_id" uuid NOT NULL,
	"brand_key" text NOT NULL,
	"brand_name" text NOT NULL,
	"mentioned" boolean NOT NULL,
	"cited" boolean NOT NULL,
	"matched_text" text,
	"listed_position" integer,
	"ambiguous" boolean DEFAULT false NOT NULL,
	"extraction_version" integer NOT NULL,
	"correction" text,
	"correction_reason" text,
	"corrected_by" uuid,
	"corrected_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_accounts" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"ref_type" text,
	"ref_id" text,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_ledger_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "credit_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"settled_amount" integer,
	"status" "reservation_status" DEFAULT 'reserved' NOT NULL,
	"ref_type" text NOT NULL,
	"ref_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "monitoring_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"trigger" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "run_status" DEFAULT 'queued' NOT NULL,
	"question_ids" jsonb NOT NULL,
	"providers" jsonb NOT NULL,
	"samples" integer DEFAULT 1 NOT NULL,
	"config_hash" text NOT NULL,
	"reservation_id" uuid,
	"planned_observations" integer NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"provider" text NOT NULL,
	"source_type" text NOT NULL,
	"model" text,
	"requested_locale" text,
	"applied_locale" text NOT NULL,
	"search_enabled" boolean NOT NULL,
	"sample" integer DEFAULT 1 NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "observation_status" NOT NULL,
	"raw_answer" text,
	"citations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"raw_response" jsonb,
	"error_message" text,
	"latency_ms" integer,
	"extraction_version" integer NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "observations_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "tracked_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"text" text NOT NULL,
	"group" "question_group" NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"location" text,
	"replaces_id" uuid,
	"approved_by" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "aliases" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "owned_domains" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "brand_matches" ADD CONSTRAINT "brand_matches_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_matches" ADD CONSTRAINT "brand_matches_observation_id_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_matches" ADD CONSTRAINT "brand_matches_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_accounts" ADD CONSTRAINT "credit_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_reservations" ADD CONSTRAINT "credit_reservations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitoring_runs" ADD CONSTRAINT "monitoring_runs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitoring_runs" ADD CONSTRAINT "monitoring_runs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitoring_runs" ADD CONSTRAINT "monitoring_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_run_id_monitoring_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."monitoring_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_question_id_tracked_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."tracked_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_questions" ADD CONSTRAINT "tracked_questions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_questions" ADD CONSTRAINT "tracked_questions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_questions" ADD CONSTRAINT "tracked_questions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_matches_obs_idx" ON "brand_matches" USING btree ("observation_id");--> statement-breakpoint
CREATE INDEX "brand_matches_ws_idx" ON "brand_matches" USING btree ("workspace_id","brand_key");--> statement-breakpoint
CREATE INDEX "credit_ledger_ws_idx" ON "credit_ledger" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "monitoring_runs_key_idx" ON "monitoring_runs" USING btree ("workspace_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "monitoring_runs_ws_idx" ON "monitoring_runs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "observations_ws_idx" ON "observations" USING btree ("workspace_id","captured_at");--> statement-breakpoint
CREATE INDEX "observations_run_idx" ON "observations" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "tracked_questions_workspace_idx" ON "tracked_questions" USING btree ("workspace_id");