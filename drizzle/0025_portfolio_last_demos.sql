-- Turns on three more UI demos built from the Alok16012 repos (static, sample data in the visitor's browser, served from /public/demos/<slug>/).
UPDATE "portfolio_projects" SET "demo_url" = '/demos/hotel-sales-command-center/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'hotel-sales-command-center';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'hotel-sales-command-center');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hotel-sales-command-center-1.webp', 'Command Center', 0 FROM "portfolio_projects" WHERE "slug" = 'hotel-sales-command-center';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hotel-sales-command-center-2.webp', 'Lead inbox', 1 FROM "portfolio_projects" WHERE "slug" = 'hotel-sales-command-center';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hotel-sales-command-center-3.webp', 'Pipeline', 2 FROM "portfolio_projects" WHERE "slug" = 'hotel-sales-command-center';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hotel-sales-command-center-4.webp', 'Guest profile', 3 FROM "portfolio_projects" WHERE "slug" = 'hotel-sales-command-center';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hotel-sales-command-center-5.webp', 'Analytics', 4 FROM "portfolio_projects" WHERE "slug" = 'hotel-sales-command-center';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/legal-registration-services-site/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'legal-registration-services-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'legal-registration-services-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/legal-registration-services-site-1.webp', 'Home with consultation form', 0 FROM "portfolio_projects" WHERE "slug" = 'legal-registration-services-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/legal-registration-services-site-2.webp', 'All services', 1 FROM "portfolio_projects" WHERE "slug" = 'legal-registration-services-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/legal-registration-services-site-3.webp', 'Service page', 2 FROM "portfolio_projects" WHERE "slug" = 'legal-registration-services-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/legal-registration-services-site-4.webp', 'Client dashboard', 3 FROM "portfolio_projects" WHERE "slug" = 'legal-registration-services-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/maheshwari-realcon-site/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'maheshwari-realcon-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'maheshwari-realcon-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/maheshwari-realcon-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'maheshwari-realcon-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/maheshwari-realcon-site-2.webp', 'Property search', 1 FROM "portfolio_projects" WHERE "slug" = 'maheshwari-realcon-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/maheshwari-realcon-site-3.webp', 'Property detail', 2 FROM "portfolio_projects" WHERE "slug" = 'maheshwari-realcon-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/maheshwari-realcon-site-4.webp', 'Projects', 3 FROM "portfolio_projects" WHERE "slug" = 'maheshwari-realcon-site';
