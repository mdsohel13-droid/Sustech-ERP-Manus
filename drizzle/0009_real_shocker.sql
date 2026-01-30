ALTER TABLE "projects" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "archived_by" integer;