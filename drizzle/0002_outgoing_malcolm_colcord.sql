CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'return', 'damage', 'opening_stock');--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"transaction_type" "inventory_transaction_type" NOT NULL,
	"quantity" numeric(15, 2) NOT NULL,
	"previous_quantity" numeric(15, 2),
	"new_quantity" numeric(15, 2),
	"reference_type" varchar(50),
	"reference_id" integer,
	"notes" text,
	"performed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"quantity" numeric(15, 2) DEFAULT '0' NOT NULL,
	"reserved_quantity" numeric(15, 2) DEFAULT '0',
	"min_stock_level" numeric(15, 2),
	"max_stock_level" numeric(15, 2),
	"reorder_point" numeric(15, 2),
	"last_stock_check" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"contact_person" varchar(255),
	"contact_phone" varchar(50),
	"is_default" integer DEFAULT 0,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
