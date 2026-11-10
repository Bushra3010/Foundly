-- Turns on the UI demos built from the Alok16012 repos (static, sample data in the visitor's browser, served from /public/demos/<slug>/).
UPDATE "portfolio_projects" SET "demo_url" = '/demos/admission-path4u-crm/', "demo_logins" = '[{"role": "Admin", "login": "admin@admissionpath4u.example", "secret": "admin123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'admission-path4u-crm';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-crm');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-crm-1.webp', 'CRM dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-crm-2.webp', 'Leads list', 1 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-crm-3.webp', 'Lead detail with payments', 2 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-crm-4.webp', 'Students and fee tracking', 3 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-crm-5.webp', 'HRMS attendance grid', 4 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-crm';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/admission-path4u-site/', "demo_logins" = '[{"role": "Admin", "login": "admin@admissionpath4u.demo", "secret": "path4u-demo"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'admission-path4u-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-site-2.webp', 'College directory with filters', 1 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-site-3.webp', 'B.Tech course page', 2 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-site-4.webp', 'Admin dashboard', 3 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/admission-path4u-site-5.webp', 'Admin colleges', 4 FROM "portfolio_projects" WHERE "slug" = 'admission-path4u-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/ashok-sweets-store/', "demo_logins" = '[{"role": "Store admin (/admin/)", "login": "admin@ashoksweets.com", "secret": "Ashok@2026"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'ashok-sweets-store';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'ashok-sweets-store');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ashok-sweets-store-1.webp', 'Storefront home with today''s fresh mithai', 0 FROM "portfolio_projects" WHERE "slug" = 'ashok-sweets-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ashok-sweets-store-2.webp', 'Sweets catalogue with live stock', 1 FROM "portfolio_projects" WHERE "slug" = 'ashok-sweets-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ashok-sweets-store-3.webp', 'Checkout review (payment simulated)', 2 FROM "portfolio_projects" WHERE "slug" = 'ashok-sweets-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ashok-sweets-store-4.webp', 'Store admin overview', 3 FROM "portfolio_projects" WHERE "slug" = 'ashok-sweets-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ashok-sweets-store-5.webp', 'Admin transactions with order status', 4 FROM "portfolio_projects" WHERE "slug" = 'ashok-sweets-store';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/balaji-electronics-store/', "demo_logins" = '[{"role": "Admin", "login": "/demos/balaji-electronics-store/#admin", "secret": "passcode balaji-admin"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'balaji-electronics-store';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'balaji-electronics-store');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/balaji-electronics-store-1.webp', 'Storefront home', 0 FROM "portfolio_projects" WHERE "slug" = 'balaji-electronics-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/balaji-electronics-store-2.webp', 'Product catalogue', 1 FROM "portfolio_projects" WHERE "slug" = 'balaji-electronics-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/balaji-electronics-store-3.webp', 'Product detail', 2 FROM "portfolio_projects" WHERE "slug" = 'balaji-electronics-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/balaji-electronics-store-4.webp', 'Customer intelligence admin', 3 FROM "portfolio_projects" WHERE "slug" = 'balaji-electronics-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/balaji-electronics-store-5.webp', 'Lead gate before the catalogue', 4 FROM "portfolio_projects" WHERE "slug" = 'balaji-electronics-store';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/blinksai-growth-site/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'blinksai-growth-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'blinksai-growth-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/blinksai-growth-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'blinksai-growth-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/blinksai-growth-site-2.webp', 'Platforms', 1 FROM "portfolio_projects" WHERE "slug" = 'blinksai-growth-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/blinksai-growth-site-3.webp', 'Automation services', 2 FROM "portfolio_projects" WHERE "slug" = 'blinksai-growth-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/blinksai-growth-site-4.webp', 'Ad landing page with lead form', 3 FROM "portfolio_projects" WHERE "slug" = 'blinksai-growth-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/blinksai-growth-site-5.webp', 'Work', 4 FROM "portfolio_projects" WHERE "slug" = 'blinksai-growth-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/clatians-website/', "demo_logins" = '[{"role": "CMS admin", "login": "/admin/login (password only)", "secret": "clatians-demo"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'clatians-website';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'clatians-website');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'clatians-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-2.webp', 'Courses', 1 FROM "portfolio_projects" WHERE "slug" = 'clatians-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-3.webp', 'CMS dashboard', 2 FROM "portfolio_projects" WHERE "slug" = 'clatians-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-4.webp', 'Leads', 3 FROM "portfolio_projects" WHERE "slug" = 'clatians-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-5.webp', 'Blog manager', 4 FROM "portfolio_projects" WHERE "slug" = 'clatians-website';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/clatians-website-cms/', "demo_logins" = '[{"role": "CMS admin", "login": "/admin/login (password only)", "secret": "clatians-demo"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'clatians-website-cms';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'clatians-website-cms');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-cms-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'clatians-website-cms';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-cms-2.webp', 'CLAT exam page', 1 FROM "portfolio_projects" WHERE "slug" = 'clatians-website-cms';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-cms-3.webp', 'Admission page', 2 FROM "portfolio_projects" WHERE "slug" = 'clatians-website-cms';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-cms-4.webp', 'CMS courses', 3 FROM "portfolio_projects" WHERE "slug" = 'clatians-website-cms';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/clatians-website-cms-5.webp', 'Home page content editor', 4 FROM "portfolio_projects" WHERE "slug" = 'clatians-website-cms';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/dayare-haram-tours-crm/', "demo_logins" = '[{"role": "Admin", "login": "admin", "secret": "admin123"}, {"role": "Sales", "login": "sales", "secret": "demo123"}, {"role": "Operations", "login": "imran", "secret": "demo123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'dayare-haram-tours-crm';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'dayare-haram-tours-crm');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dayare-haram-tours-crm-1.webp', 'Dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'dayare-haram-tours-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dayare-haram-tours-crm-2.webp', 'Leads pipeline', 1 FROM "portfolio_projects" WHERE "slug" = 'dayare-haram-tours-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dayare-haram-tours-crm-3.webp', 'Bookings', 2 FROM "portfolio_projects" WHERE "slug" = 'dayare-haram-tours-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dayare-haram-tours-crm-4.webp', 'Umrah and Hajj itineraries', 3 FROM "portfolio_projects" WHERE "slug" = 'dayare-haram-tours-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dayare-haram-tours-crm-5.webp', 'Payments', 4 FROM "portfolio_projects" WHERE "slug" = 'dayare-haram-tours-crm';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/dcw-education-superapp/', "demo_logins" = '[{"role": "Admin", "login": "admin", "secret": "admin123"}, {"role": "Counselling staff", "login": "staff", "secret": "staff123"}, {"role": "Employer", "login": "employer", "secret": "employer123"}, {"role": "Associate", "login": "associate", "secret": "associate123"}, {"role": "Student", "login": "student", "secret": "student123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'dcw-education-superapp';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'dcw-education-superapp');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dcw-education-superapp-1.webp', 'Distance Courses Wala home', 0 FROM "portfolio_projects" WHERE "slug" = 'dcw-education-superapp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dcw-education-superapp-2.webp', 'College search with filters', 1 FROM "portfolio_projects" WHERE "slug" = 'dcw-education-superapp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dcw-education-superapp-3.webp', 'University detail page', 2 FROM "portfolio_projects" WHERE "slug" = 'dcw-education-superapp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dcw-education-superapp-4.webp', 'Admin console overview', 3 FROM "portfolio_projects" WHERE "slug" = 'dcw-education-superapp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/dcw-education-superapp-5.webp', 'Students pipeline', 4 FROM "portfolio_projects" WHERE "slug" = 'dcw-education-superapp';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/driveway-ride-booking/', "demo_logins" = '[{"role": "Customer", "login": "customer@driveway.demo", "secret": "demo1234"}, {"role": "Rider (driver)", "login": "rider@driveway.demo", "secret": "demo1234"}, {"role": "Admin", "login": "admin@driveway.demo", "secret": "demo1234"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'driveway-ride-booking';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'driveway-ride-booking');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/driveway-ride-booking-1.webp', 'Customer app home with live map and services', 0 FROM "portfolio_projects" WHERE "slug" = 'driveway-ride-booking';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/driveway-ride-booking-2.webp', 'Choose a ride with fares for every vehicle', 1 FROM "portfolio_projects" WHERE "slug" = 'driveway-ride-booking';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/driveway-ride-booking-3.webp', 'Live ride with driver and OTP', 2 FROM "portfolio_projects" WHERE "slug" = 'driveway-ride-booking';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/driveway-ride-booking-4.webp', 'Rider app with a new ride request', 3 FROM "portfolio_projects" WHERE "slug" = 'driveway-ride-booking';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/driveway-ride-booking-5.webp', 'Admin dashboard', 4 FROM "portfolio_projects" WHERE "slug" = 'driveway-ride-booking';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/edumatch-consultancy-crm/', "demo_logins" = '[{"role": "Admin", "login": "admin@edumatch.example", "secret": "admin123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'edumatch-consultancy-crm';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'edumatch-consultancy-crm');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/edumatch-consultancy-crm-1.webp', 'CRM dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'edumatch-consultancy-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/edumatch-consultancy-crm-2.webp', 'Study-abroad leads', 1 FROM "portfolio_projects" WHERE "slug" = 'edumatch-consultancy-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/edumatch-consultancy-crm-3.webp', 'Lead detail with payments', 2 FROM "portfolio_projects" WHERE "slug" = 'edumatch-consultancy-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/edumatch-consultancy-crm-4.webp', 'Students and fee tracking', 3 FROM "portfolio_projects" WHERE "slug" = 'edumatch-consultancy-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/edumatch-consultancy-crm-5.webp', 'HRMS attendance grid', 4 FROM "portfolio_projects" WHERE "slug" = 'edumatch-consultancy-crm';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/falcon-plus-bags-store/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'falcon-plus-bags-store';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'falcon-plus-bags-store');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/falcon-plus-bags-store-1.webp', 'Home page hero', 0 FROM "portfolio_projects" WHERE "slug" = 'falcon-plus-bags-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/falcon-plus-bags-store-2.webp', 'Luggage range with prices and colours', 1 FROM "portfolio_projects" WHERE "slug" = 'falcon-plus-bags-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/falcon-plus-bags-store-3.webp', 'Product page with colour and size options', 2 FROM "portfolio_projects" WHERE "slug" = 'falcon-plus-bags-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/falcon-plus-bags-store-4.webp', 'Cart drawer', 3 FROM "portfolio_projects" WHERE "slug" = 'falcon-plus-bags-store';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/falcon-plus-bags-store-5.webp', 'Corporate gifting', 4 FROM "portfolio_projects" WHERE "slug" = 'falcon-plus-bags-store';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/gamehub-multiplayer-games/', "demo_logins" = '[{"role": "Player (/)", "login": "9999999999", "secret": "demo123"}, {"role": "Super Admin (/admin/)", "login": "superadmin", "secret": "demo123"}, {"role": "Admin (/admin/)", "login": "admin", "secret": "demo123"}, {"role": "Agent (/admin/)", "login": "agent", "secret": "demo123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'gamehub-multiplayer-games';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'gamehub-multiplayer-games');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gamehub-multiplayer-games-1.webp', 'Player home with games and coin balance', 0 FROM "portfolio_projects" WHERE "slug" = 'gamehub-multiplayer-games';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gamehub-multiplayer-games-2.webp', 'Teen Patti table with bots', 1 FROM "portfolio_projects" WHERE "slug" = 'gamehub-multiplayer-games';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gamehub-multiplayer-games-3.webp', 'Dragon Tiger betting round', 2 FROM "portfolio_projects" WHERE "slug" = 'gamehub-multiplayer-games';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gamehub-multiplayer-games-4.webp', 'Ludo table', 3 FROM "portfolio_projects" WHERE "slug" = 'gamehub-multiplayer-games';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gamehub-multiplayer-games-5.webp', 'Super Admin console', 4 FROM "portfolio_projects" WHERE "slug" = 'gamehub-multiplayer-games';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/gmb-review-manager/', "demo_logins" = '[{"role": "Agency owner", "login": "Tap Google se Login Karo (one-tap demo account)", "secret": "none"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'gmb-review-manager';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'gmb-review-manager');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gmb-review-manager-1.webp', 'Agency dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'gmb-review-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gmb-review-manager-2.webp', 'Reviews with replies', 1 FROM "portfolio_projects" WHERE "slug" = 'gmb-review-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gmb-review-manager-3.webp', 'AI review text generator', 2 FROM "portfolio_projects" WHERE "slug" = 'gmb-review-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gmb-review-manager-4.webp', 'Review QR code', 3 FROM "portfolio_projects" WHERE "slug" = 'gmb-review-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gmb-review-manager-5.webp', 'Businesses', 4 FROM "portfolio_projects" WHERE "slug" = 'gmb-review-manager';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/gym-membership-system/', "demo_logins" = '[{"role": "Owner", "login": "admin", "secret": "admin@123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'gym-membership-system';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'gym-membership-system');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gym-membership-system-1.webp', 'Owner dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'gym-membership-system';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gym-membership-system-2.webp', 'Members list', 1 FROM "portfolio_projects" WHERE "slug" = 'gym-membership-system';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gym-membership-system-3.webp', 'Member profile with QR card', 2 FROM "portfolio_projects" WHERE "slug" = 'gym-membership-system';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gym-membership-system-4.webp', 'Attendance check-in', 3 FROM "portfolio_projects" WHERE "slug" = 'gym-membership-system';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/gym-membership-system-5.webp', 'Billing and payments', 4 FROM "portfolio_projects" WHERE "slug" = 'gym-membership-system';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/hello-doctor-neet-counselling/', "demo_logins" = '[{"role": "Admin", "login": "admin@hellodoctor.example", "secret": "admin123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'hello-doctor-neet-counselling';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'hello-doctor-neet-counselling');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hello-doctor-neet-counselling-1.webp', 'Home page', 0 FROM "portfolio_projects" WHERE "slug" = 'hello-doctor-neet-counselling';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hello-doctor-neet-counselling-2.webp', 'NEET UG cut-offs', 1 FROM "portfolio_projects" WHERE "slug" = 'hello-doctor-neet-counselling';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hello-doctor-neet-counselling-3.webp', 'Colleges directory', 2 FROM "portfolio_projects" WHERE "slug" = 'hello-doctor-neet-counselling';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hello-doctor-neet-counselling-4.webp', 'CRM leads', 3 FROM "portfolio_projects" WHERE "slug" = 'hello-doctor-neet-counselling';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/hello-doctor-neet-counselling-5.webp', 'CRM students', 4 FROM "portfolio_projects" WHERE "slug" = 'hello-doctor-neet-counselling';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/idealdigiskills-education-erp/', "demo_logins" = '[{"role": "Super Admin", "login": "admin", "secret": "admin123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'idealdigiskills-education-erp';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'idealdigiskills-education-erp');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/idealdigiskills-education-erp-1.webp', 'Admin dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'idealdigiskills-education-erp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/idealdigiskills-education-erp-2.webp', 'Students', 1 FROM "portfolio_projects" WHERE "slug" = 'idealdigiskills-education-erp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/idealdigiskills-education-erp-3.webp', 'Due fee collection', 2 FROM "portfolio_projects" WHERE "slug" = 'idealdigiskills-education-erp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/idealdigiskills-education-erp-4.webp', 'Admission lead dashboard', 3 FROM "portfolio_projects" WHERE "slug" = 'idealdigiskills-education-erp';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/idealdigiskills-education-erp-5.webp', 'Branches and wallets', 4 FROM "portfolio_projects" WHERE "slug" = 'idealdigiskills-education-erp';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/ldrf-skill-courses-site/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'ldrf-skill-courses-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'ldrf-skill-courses-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ldrf-skill-courses-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'ldrf-skill-courses-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/ldrf-skill-courses-site-2.webp', 'Admin sign-in', 1 FROM "portfolio_projects" WHERE "slug" = 'ldrf-skill-courses-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/meera-prakash-admission-crm/', "demo_logins" = '[{"role": "Admin", "login": "admin@meeraprakash.example", "secret": "admin123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'meera-prakash-admission-crm';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'meera-prakash-admission-crm');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/meera-prakash-admission-crm-1.webp', 'Public website home', 0 FROM "portfolio_projects" WHERE "slug" = 'meera-prakash-admission-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/meera-prakash-admission-crm-2.webp', 'CRM dashboard', 1 FROM "portfolio_projects" WHERE "slug" = 'meera-prakash-admission-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/meera-prakash-admission-crm-3.webp', 'Leads list', 2 FROM "portfolio_projects" WHERE "slug" = 'meera-prakash-admission-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/meera-prakash-admission-crm-4.webp', 'Lead detail with payments', 3 FROM "portfolio_projects" WHERE "slug" = 'meera-prakash-admission-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/meera-prakash-admission-crm-5.webp', 'Students and admissions', 4 FROM "portfolio_projects" WHERE "slug" = 'meera-prakash-admission-crm';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/radhe-homes-website/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'radhe-homes-website';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'radhe-homes-website');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/radhe-homes-website-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'radhe-homes-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/radhe-homes-website-2.webp', 'Projects', 1 FROM "portfolio_projects" WHERE "slug" = 'radhe-homes-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/radhe-homes-website-3.webp', 'Admin sign-in', 2 FROM "portfolio_projects" WHERE "slug" = 'radhe-homes-website';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/safar-ai-travel-assistant/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'safar-ai-travel-assistant';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'safar-ai-travel-assistant');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/safar-ai-travel-assistant-1.webp', 'Operations overview', 0 FROM "portfolio_projects" WHERE "slug" = 'safar-ai-travel-assistant';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/safar-ai-travel-assistant-2.webp', 'Multilingual AI inbox', 1 FROM "portfolio_projects" WHERE "slug" = 'safar-ai-travel-assistant';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/safar-ai-travel-assistant-3.webp', 'Journey builder itinerary', 2 FROM "portfolio_projects" WHERE "slug" = 'safar-ai-travel-assistant';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/safar-ai-travel-assistant-4.webp', 'Automation rules', 3 FROM "portfolio_projects" WHERE "slug" = 'safar-ai-travel-assistant';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/sellerhub-poster-listing-tool/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'sellerhub-poster-listing-tool';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'sellerhub-poster-listing-tool');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sellerhub-poster-listing-tool-1.webp', 'Seller dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'sellerhub-poster-listing-tool';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sellerhub-poster-listing-tool-2.webp', 'Product catalogue', 1 FROM "portfolio_projects" WHERE "slug" = 'sellerhub-poster-listing-tool';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sellerhub-poster-listing-tool-3.webp', 'AI poster designer with generated copy', 2 FROM "portfolio_projects" WHERE "slug" = 'sellerhub-poster-listing-tool';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sellerhub-poster-listing-tool-4.webp', 'Social post scheduler', 3 FROM "portfolio_projects" WHERE "slug" = 'sellerhub-poster-listing-tool';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sellerhub-poster-listing-tool-5.webp', 'Marketplace listings', 4 FROM "portfolio_projects" WHERE "slug" = 'sellerhub-poster-listing-tool';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/sengol-university-website/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'sengol-university-website';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'sengol-university-website');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sengol-university-website-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'sengol-university-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sengol-university-website-2.webp', 'Programme school page', 1 FROM "portfolio_projects" WHERE "slug" = 'sengol-university-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sengol-university-website-3.webp', 'Application status tracker', 2 FROM "portfolio_projects" WHERE "slug" = 'sengol-university-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sengol-university-website-4.webp', 'Pay Now form', 3 FROM "portfolio_projects" WHERE "slug" = 'sengol-university-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/sengol-university-website-5.webp', 'Payment simulated screen', 4 FROM "portfolio_projects" WHERE "slug" = 'sengol-university-website';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/shera-travels-booking-crm/', "demo_logins" = '[{"role": "Admin", "login": "admin", "secret": "admin123"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'shera-travels-booking-crm';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'shera-travels-booking-crm');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-booking-crm-1.webp', 'Public booking website', 0 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-booking-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-booking-crm-2.webp', 'CRM agency overview', 1 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-booking-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-booking-crm-3.webp', 'Leads pipeline', 2 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-booking-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-booking-crm-4.webp', 'Bookings and revenue', 3 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-booking-crm';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-booking-crm-5.webp', 'Day-wise itinerary editor', 4 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-booking-crm';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/shera-travels-website/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'shera-travels-website';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'shera-travels-website');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-website-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-website-2.webp', 'All tours', 1 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-website-3.webp', 'Tour package detail', 2 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-website-4.webp', 'Destinations', 3 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/shera-travels-website-5.webp', 'Kashmir landing page after a quote request', 4 FROM "portfolio_projects" WHERE "slug" = 'shera-travels-website';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/slotnova-visa-appointments/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'slotnova-visa-appointments';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'slotnova-visa-appointments');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/slotnova-visa-appointments-1.webp', 'Dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'slotnova-visa-appointments';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/slotnova-visa-appointments-2.webp', 'Applicants', 1 FROM "portfolio_projects" WHERE "slug" = 'slotnova-visa-appointments';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/slotnova-visa-appointments-3.webp', 'Slot monitoring (simulation)', 2 FROM "portfolio_projects" WHERE "slug" = 'slotnova-visa-appointments';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/slotnova-visa-appointments-4.webp', 'Confirmed bookings', 3 FROM "portfolio_projects" WHERE "slug" = 'slotnova-visa-appointments';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/slotnova-visa-appointments-5.webp', 'Reports', 4 FROM "portfolio_projects" WHERE "slug" = 'slotnova-visa-appointments';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/softgress-agency-site/', "demo_logins" = '[{"role": "CRM owner", "login": "admin@softgress.demo", "secret": "demo1234"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'softgress-agency-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'softgress-agency-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/softgress-agency-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'softgress-agency-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/softgress-agency-site-2.webp', 'Services', 1 FROM "portfolio_projects" WHERE "slug" = 'softgress-agency-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/softgress-agency-site-3.webp', 'CRM lead inbox', 2 FROM "portfolio_projects" WHERE "slug" = 'softgress-agency-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/softgress-agency-site-4.webp', 'Lead detail with AI summary, tasks and activity', 3 FROM "portfolio_projects" WHERE "slug" = 'softgress-agency-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/softgress-agency-site-5.webp', 'Pipeline board', 4 FROM "portfolio_projects" WHERE "slug" = 'softgress-agency-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/soil-distribution-management/', "demo_logins" = '[{"role": "Super Admin", "login": "admin@soil.demo", "secret": "demo1234"}, {"role": "District Admin", "login": "patna@soil.demo", "secret": "any password"}, {"role": "Marketing Executive", "login": "ravi.me@soil.demo", "secret": "any password"}, {"role": "Accountant", "login": "accounts@soil.demo", "secret": "any password"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'soil-distribution-management';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'soil-distribution-management');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-distribution-management-1.webp', 'Distribution dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'soil-distribution-management';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-distribution-management-2.webp', 'Distributor and retailer customers', 1 FROM "portfolio_projects" WHERE "slug" = 'soil-distribution-management';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-distribution-management-3.webp', 'GST invoices with payment status', 2 FROM "portfolio_projects" WHERE "slug" = 'soil-distribution-management';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-distribution-management-4.webp', 'Inventory with low-stock alerts', 3 FROM "portfolio_projects" WHERE "slug" = 'soil-distribution-management';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-distribution-management-5.webp', 'Executives and area-wise roles', 4 FROM "portfolio_projects" WHERE "slug" = 'soil-distribution-management';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/soil-organic-site/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'soil-organic-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'soil-organic-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-organic-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'soil-organic-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-organic-site-2.webp', 'About', 1 FROM "portfolio_projects" WHERE "slug" = 'soil-organic-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/soil-organic-site-3.webp', 'Gallery', 2 FROM "portfolio_projects" WHERE "slug" = 'soil-organic-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/structure-square-website/', "demo_logins" = '[{"role": "Admin", "login": "/admin/login (password only)", "secret": "ssquare-demo"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'structure-square-website';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'structure-square-website');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/structure-square-website-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'structure-square-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/structure-square-website-2.webp', 'Interior design service', 1 FROM "portfolio_projects" WHERE "slug" = 'structure-square-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/structure-square-website-3.webp', 'Portfolio', 2 FROM "portfolio_projects" WHERE "slug" = 'structure-square-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/structure-square-website-4.webp', 'Admin dashboard', 3 FROM "portfolio_projects" WHERE "slug" = 'structure-square-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/structure-square-website-5.webp', 'Leads', 4 FROM "portfolio_projects" WHERE "slug" = 'structure-square-website';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/swamitra-foundation-website/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'swamitra-foundation-website';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'swamitra-foundation-website');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/swamitra-foundation-website-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'swamitra-foundation-website';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/swamitra-foundation-website-2.webp', 'About', 1 FROM "portfolio_projects" WHERE "slug" = 'swamitra-foundation-website';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/textile-donation-certificates/', "demo_logins" = '[{"role": "Admin", "login": "(password only)", "secret": "jtrf@2026"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'textile-donation-certificates';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'textile-donation-certificates');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/textile-donation-certificates-1.webp', 'Home page', 0 FROM "portfolio_projects" WHERE "slug" = 'textile-donation-certificates';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/textile-donation-certificates-2.webp', 'Donation registration form', 1 FROM "portfolio_projects" WHERE "slug" = 'textile-donation-certificates';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/textile-donation-certificates-3.webp', 'Stamped certificate with QR', 2 FROM "portfolio_projects" WHERE "slug" = 'textile-donation-certificates';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/textile-donation-certificates-4.webp', 'Admin dashboard', 3 FROM "portfolio_projects" WHERE "slug" = 'textile-donation-certificates';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/textile-donation-certificates-5.webp', 'Donations register', 4 FROM "portfolio_projects" WHERE "slug" = 'textile-donation-certificates';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/vidya-education-group-site/', "demo_logins" = '[]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'vidya-education-group-site';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'vidya-education-group-site');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/vidya-education-group-site-1.webp', 'Home', 0 FROM "portfolio_projects" WHERE "slug" = 'vidya-education-group-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/vidya-education-group-site-2.webp', 'Coaching', 1 FROM "portfolio_projects" WHERE "slug" = 'vidya-education-group-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/vidya-education-group-site-3.webp', 'Library wings', 2 FROM "portfolio_projects" WHERE "slug" = 'vidya-education-group-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/vidya-education-group-site-4.webp', 'Admission counselling form', 3 FROM "portfolio_projects" WHERE "slug" = 'vidya-education-group-site';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/vidya-education-group-site-5.webp', 'Student dashboard', 4 FROM "portfolio_projects" WHERE "slug" = 'vidya-education-group-site';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/visa-recruitment-manager/', "demo_logins" = '[{"role": "Admin", "login": "admin", "secret": "admin123 (any non-empty username and password work, as in the original)"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'visa-recruitment-manager';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'visa-recruitment-manager');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/visa-recruitment-manager-1.webp', 'Dashboard', 0 FROM "portfolio_projects" WHERE "slug" = 'visa-recruitment-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/visa-recruitment-manager-2.webp', 'Clients and applications', 1 FROM "portfolio_projects" WHERE "slug" = 'visa-recruitment-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/visa-recruitment-manager-3.webp', 'Agencies / foreign offices', 2 FROM "portfolio_projects" WHERE "slug" = 'visa-recruitment-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/visa-recruitment-manager-4.webp', 'Payments', 3 FROM "portfolio_projects" WHERE "slug" = 'visa-recruitment-manager';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/visa-recruitment-manager-5.webp', 'Reports', 4 FROM "portfolio_projects" WHERE "slug" = 'visa-recruitment-manager';
--> statement-breakpoint
UPDATE "portfolio_projects" SET "demo_url" = '/demos/zavtoo-ro-service-platform/', "demo_logins" = '[{"role": "Customer (app at /app/)", "login": "customer@zavtoo.demo", "secret": "demo1234"}, {"role": "Technician (/technician/)", "login": "tech@zavtoo.demo", "secret": "demo1234"}, {"role": "Admin (/admin/)", "login": "admin@zavtoo.demo", "secret": "demo1234"}]'::jsonb, "demo_status" = 'live', "embeddable" = true, "published" = true, "updated_at" = now() WHERE "slug" = 'zavtoo-ro-service-platform';
--> statement-breakpoint
DELETE FROM "portfolio_media" WHERE "src" IS NOT NULL AND "project_id" = (SELECT "id" FROM "portfolio_projects" WHERE "slug" = 'zavtoo-ro-service-platform');
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/zavtoo-ro-service-platform-1.webp', 'Storefront home page', 0 FROM "portfolio_projects" WHERE "slug" = 'zavtoo-ro-service-platform';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/zavtoo-ro-service-platform-2.webp', 'Shop with purifiers, commercial RO and spares', 1 FROM "portfolio_projects" WHERE "slug" = 'zavtoo-ro-service-platform';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/zavtoo-ro-service-platform-3.webp', 'Customer app home with an active service visit', 2 FROM "portfolio_projects" WHERE "slug" = 'zavtoo-ro-service-platform';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/zavtoo-ro-service-platform-4.webp', 'Booking a technician visit', 3 FROM "portfolio_projects" WHERE "slug" = 'zavtoo-ro-service-platform';
--> statement-breakpoint
INSERT INTO "portfolio_media" ("project_id", "content_type", "src", "caption", "sort_order") SELECT "id", 'image/webp', '/work-shots/zavtoo-ro-service-platform-5.webp', 'Admin service jobs and dispatch', 4 FROM "portfolio_projects" WHERE "slug" = 'zavtoo-ro-service-platform';
