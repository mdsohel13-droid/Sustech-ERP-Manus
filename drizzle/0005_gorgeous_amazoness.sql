CREATE TYPE "public"."financial_account_subtype" AS ENUM('cash', 'bank', 'deposits', 'accounts_receivable', 'inventory', 'fixed_assets', 'accounts_payable', 'wages_payable', 'taxes_payable', 'provisions', 'other_payable', 'common_stock', 'retained_earnings', 'sales_revenue', 'service_revenue', 'cost_of_goods_sold', 'operating_expenses', 'other');--> statement-breakpoint
CREATE TYPE "public"."financial_account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'expense');--> statement-breakpoint
CREATE TABLE "financial_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_type" "financial_account_type" NOT NULL,
	"account_subtype" "financial_account_subtype" NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financial_accounts_account_code_unique" UNIQUE("account_code")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"entry_date" date NOT NULL,
	"description" text NOT NULL,
	"reference" varchar(100),
	"debit_account_id" integer NOT NULL,
	"credit_account_id" integer NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"is_posted" boolean DEFAULT false NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entries_entry_number_unique" UNIQUE("entry_number")
);
