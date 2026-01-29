ALTER TABLE "income_expenditure" ADD COLUMN "isArchived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "income_expenditure" ADD COLUMN "archivedAt" timestamp;