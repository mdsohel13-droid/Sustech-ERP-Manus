ALTER TABLE "project_transactions" ADD COLUMN "isArchived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project_transactions" ADD COLUMN "archivedAt" timestamp;--> statement-breakpoint
ALTER TABLE "project_transactions" ADD COLUMN "archivedBy" integer;