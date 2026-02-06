CREATE TYPE "public"."approval_status" AS ENUM('pending_approval', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_record_type" AS ENUM('ar_payment', 'ap_payment');--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"journal_entry_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"debit_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"credit_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_type" "payment_record_type" NOT NULL,
	"reference_id" integer NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'BDT' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"reference_number" varchar(100),
	"bank_account" varchar(100),
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "ap_approval_status" "approval_status" DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "ap_approved_by" integer;--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "ap_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts_payable" ADD COLUMN "ap_rejection_reason" text;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "approval_status" "approval_status" DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "approved_by" integer;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts_receivable" ADD COLUMN "rejection_reason" text;