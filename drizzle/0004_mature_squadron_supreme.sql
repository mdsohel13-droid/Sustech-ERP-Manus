CREATE TYPE "public"."purchase_category" AS ENUM('electronics', 'raw_materials', 'office_supplies', 'equipment', 'services', 'other');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('draft', 'sent', 'confirmed', 'in_transit', 'received', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('active', 'inactive', 'blacklisted');--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) NOT NULL,
	"received_quantity" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"po_number" varchar(50) NOT NULL,
	"vendor_id" integer NOT NULL,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"received_date" date,
	"status" "purchase_order_status" DEFAULT 'draft',
	"category" "purchase_category" DEFAULT 'other',
	"subtotal" numeric(15, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"shipping_cost" numeric(15, 2) DEFAULT '0',
	"discount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) DEFAULT '0',
	"payment_status" varchar(50) DEFAULT 'unpaid',
	"payment_method" varchar(100),
	"notes" text,
	"internal_notes" text,
	"attachments" text,
	"is_archived" boolean DEFAULT false,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"contact_person" varchar(255),
	"tax_id" varchar(100),
	"payment_terms" varchar(100),
	"rating" numeric(3, 2),
	"status" "vendor_status" DEFAULT 'active',
	"notes" text,
	"total_orders" integer DEFAULT 0,
	"total_spent" numeric(15, 2) DEFAULT '0',
	"is_archived" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
