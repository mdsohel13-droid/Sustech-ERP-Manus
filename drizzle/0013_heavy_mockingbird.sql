ALTER TABLE "accounts_payable" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "archived_by" integer;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "archived_by" integer;--> statement-breakpoint
ALTER TABLE "income_expenditure" ADD COLUMN "archivedBy" integer;