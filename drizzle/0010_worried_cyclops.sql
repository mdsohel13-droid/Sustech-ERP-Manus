CREATE TYPE "public"."item_type" AS ENUM('stockable', 'service', 'consumable');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('unmatched', 'partial', 'matched');--> statement-breakpoint
CREATE TYPE "public"."purchase_receipt_status" AS ENUM('draft', 'posted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('active', 'released', 'consumed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."sales_order_status" AS ENUM('draft', 'confirmed', 'reserved', 'partially_shipped', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."scm_ledger_doc_type" AS ENUM('sales_order', 'purchase_receipt', 'adjustment', 'transfer', 'project_consumption', 'opening_balance');--> statement-breakpoint
CREATE TYPE "public"."valuation_method" AS ENUM('fifo', 'average', 'lifo');--> statement-breakpoint
CREATE TYPE "public"."vendor_bill_status" AS ENUM('draft', 'pending_approval', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "project_material_consumption" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"wbs_id" integer,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"valuation_rate" numeric(15, 4) NOT NULL,
	"total_cost" numeric(15, 2) NOT NULL,
	"ledger_entry_id" integer,
	"consumption_date" date NOT NULL,
	"notes" text,
	"performed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_wbs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"wbs_code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"parent_wbs_id" integer,
	"budget_amount" numeric(15, 2) DEFAULT '0',
	"actual_cost" numeric(15, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_receipt_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_receipt_id" integer NOT NULL,
	"purchase_order_item_id" integer,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"qty_ordered" numeric(15, 4) NOT NULL,
	"qty_received" numeric(15, 4) NOT NULL,
	"qty_rejected" numeric(15, 4) DEFAULT '0',
	"valuation_rate" numeric(15, 4) NOT NULL,
	"valuation_amount" numeric(15, 2) NOT NULL,
	"batch_no" varchar(100),
	"serial_no" varchar(100),
	"expiry_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"grn_number" varchar(50) NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"received_date" date NOT NULL,
	"status" "purchase_receipt_status" DEFAULT 'draft',
	"notes" text,
	"received_by" integer,
	"posted_at" timestamp,
	"posted_by" integer,
	"is_archived" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_receipts_grn_number_unique" UNIQUE("grn_number")
);
--> statement-breakpoint
CREATE TABLE "replenishment_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"current_stock" numeric(15, 4) NOT NULL,
	"reorder_point" numeric(15, 4) NOT NULL,
	"suggested_qty" numeric(15, 4) NOT NULL,
	"eoq_calculation" text,
	"status" varchar(50) DEFAULT 'pending',
	"purchase_order_id" integer,
	"notes" text,
	"created_by" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sales_order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"description" text,
	"quantity" numeric(15, 4) NOT NULL,
	"reserved_qty" numeric(15, 4) DEFAULT '0',
	"shipped_qty" numeric(15, 4) DEFAULT '0',
	"unit_price" numeric(15, 2) NOT NULL,
	"discount" numeric(15, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"line_total" numeric(15, 2) NOT NULL,
	"warehouse_id" integer,
	"atp_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"so_number" varchar(50) NOT NULL,
	"customer_id" integer,
	"customer_name" varchar(255) NOT NULL,
	"project_id" integer,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"status" "sales_order_status" DEFAULT 'draft',
	"subtotal" numeric(15, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"discount" numeric(15, 2) DEFAULT '0',
	"shipping_cost" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'BDT',
	"payment_terms" varchar(100),
	"shipping_address" text,
	"billing_address" text,
	"notes" text,
	"internal_notes" text,
	"warehouse_id" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_by" integer,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_orders_so_number_unique" UNIQUE("so_number")
);
--> statement-breakpoint
CREATE TABLE "scm_inventory_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"qty_change" numeric(15, 4) NOT NULL,
	"valuation_rate" numeric(15, 4) NOT NULL,
	"valuation_amount" numeric(15, 2) NOT NULL,
	"batch_no" varchar(100),
	"serial_no" varchar(100),
	"project_id" integer,
	"reference_doc_type" "scm_ledger_doc_type" NOT NULL,
	"reference_doc_id" integer,
	"notes" text,
	"performed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scm_product_extensions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"valuation_method" "valuation_method" DEFAULT 'average',
	"item_type" "item_type" DEFAULT 'stockable',
	"dynamic_attributes" text,
	"linked_expense_account_id" integer,
	"linked_income_account_id" integer,
	"lead_time_days" integer DEFAULT 0,
	"order_cost" numeric(15, 2) DEFAULT '0',
	"holding_cost_percent" numeric(5, 2) DEFAULT '0',
	"annual_demand" numeric(15, 2) DEFAULT '0',
	"safety_stock" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scm_product_extensions_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "stock_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"sales_order_id" integer NOT NULL,
	"sales_order_item_id" integer NOT NULL,
	"reserved_qty" numeric(15, 4) NOT NULL,
	"status" "reservation_status" DEFAULT 'active',
	"reserved_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"released_at" timestamp,
	"released_by" integer,
	"consumed_at" timestamp,
	"notes" text,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "vendor_bill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_bill_id" integer NOT NULL,
	"purchase_receipt_item_id" integer,
	"product_id" integer,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"line_total" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_number" varchar(100) NOT NULL,
	"vendor_id" integer NOT NULL,
	"purchase_order_id" integer,
	"purchase_receipt_id" integer,
	"bill_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" "vendor_bill_status" DEFAULT 'draft',
	"match_status" "match_status" DEFAULT 'unmatched',
	"subtotal" numeric(15, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"discount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'BDT',
	"paid_amount" numeric(15, 2) DEFAULT '0',
	"payment_date" date,
	"payment_reference" varchar(100),
	"notes" text,
	"attachments" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"is_archived" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
