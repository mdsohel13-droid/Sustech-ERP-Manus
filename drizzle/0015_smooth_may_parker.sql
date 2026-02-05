ALTER TABLE "accounts_payable" ADD COLUMN "paidAmount" numeric(15, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "paymentDate" date;--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "paymentMethod" varchar(50);--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "paymentNotes" text;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "paidAmount" numeric(15, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "paymentDate" date;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "paymentMethod" varchar(50);--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "paymentNotes" text;