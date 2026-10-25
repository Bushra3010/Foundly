ALTER TABLE "businesses" ADD COLUMN "monitoring_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tracked_questions" ADD COLUMN "keyword" text;--> statement-breakpoint
CREATE UNIQUE INDEX "tracked_questions_ws_keyword_idx" ON "tracked_questions" USING btree ("workspace_id",lower("keyword")) WHERE "tracked_questions"."keyword" is not null and "tracked_questions"."archived_at" is null;--> statement-breakpoint
-- Businesses that already ran AI checks count as started, so their home shows results.
UPDATE "businesses" b SET "monitoring_started_at" = r.first_run
FROM (SELECT "business_id", min("created_at") AS first_run FROM "monitoring_runs" GROUP BY "business_id") r
WHERE r."business_id" = b."id" AND b."monitoring_started_at" IS NULL;
