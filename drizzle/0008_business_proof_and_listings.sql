ALTER TABLE "businesses" ADD COLUMN "founded_year" integer;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "team_size" integer;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "projects_completed" integer;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "credentials" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "listings" jsonb DEFAULT '[]'::jsonb NOT NULL;