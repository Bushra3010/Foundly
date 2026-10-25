-- WordPress connector retired: its tasks become ordinary copy-and-paste tasks,
-- and stored WordPress application passwords are deleted.
UPDATE "improvement_actions" SET "apply_kind" = 'manual' WHERE "apply_kind" = 'wordpress_append';--> statement-breakpoint
DELETE FROM "integrations" WHERE "kind" = 'wordpress';--> statement-breakpoint
-- Hosted websites retired: dropping their tables below carries out any website deletion still pending.
UPDATE "deletion_requests" SET "completed_at" = now() WHERE "kind" = 'website' AND "completed_at" IS NULL AND "cancelled_at" IS NULL;--> statement-breakpoint
DROP TABLE "assets" CASCADE;--> statement-breakpoint
DROP TABLE "custom_domains" CASCADE;--> statement-breakpoint
DROP TABLE "leads" CASCADE;--> statement-breakpoint
DROP TABLE "site_slug_redirects" CASCADE;--> statement-breakpoint
DROP TABLE "site_versions" CASCADE;--> statement-breakpoint
DROP TABLE "sites" CASCADE;--> statement-breakpoint
ALTER TABLE "improvement_actions" DROP COLUMN "before_snapshot";--> statement-breakpoint
ALTER TABLE "improvement_actions" DROP COLUMN "external_target";--> statement-breakpoint
DROP TYPE "public"."domain_status";--> statement-breakpoint
DROP TYPE "public"."lead_status";