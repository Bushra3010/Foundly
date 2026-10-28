CREATE TABLE "brand_profiles" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"from_answers" integer NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_matches" ADD COLUMN "sentiment" text;--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;