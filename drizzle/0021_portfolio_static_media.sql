ALTER TABLE "portfolio_media" ALTER COLUMN "bytes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_media" ADD COLUMN "src" text;