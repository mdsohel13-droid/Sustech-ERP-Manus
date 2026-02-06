CREATE TYPE "public"."abc_class" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."lot_quality" AS ENUM('accepted', 'quarantine', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."rfq_response_status" AS ENUM('received', 'evaluated', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."rfq_status" AS ENUM('draft', 'sent', 'responses_received', 'evaluated', 'closed');--> statement-breakpoint
CREATE TYPE "public"."rfq_type" AS ENUM('standard', 'emergency', 'framework');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'picked', 'packed', 'shipped', 'in_transit', 'delivered', 'exception');--> statement-breakpoint
CREATE TYPE "public"."shipment_type" AS ENUM('inbound', 'outbound', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."warehouse_type" AS ENUM('hq', 'project_site', 'distribution', 'returns');--> statement-breakpoint
CREATE TYPE "public"."xyz_class" AS ENUM('X', 'Y', 'Z');--> statement-breakpoint
CREATE TABLE "inventory_lots" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"lot_number" varchar(100) NOT NULL,
	"serial_number" varchar(100),
	"quantity" numeric(15, 4) NOT NULL,
	"manufacture_date" date,
	"expiry_date" date,
	"supplier_batch_number" varchar(100),
	"quality_status" "lot_quality" DEFAULT 'accepted',
	"location_in_warehouse" varchar(200),
	"purchase_receipt_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" integer NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"unit_of_measure" varchar(50),
	"estimated_unit_price" numeric(15, 2),
	"specifications" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"response_date" date NOT NULL,
	"validity_days" integer,
	"total_quoted_value" numeric(15, 2),
	"currency" varchar(10) DEFAULT 'BDT',
	"payment_terms" varchar(200),
	"delivery_days" integer,
	"notes" text,
	"status" "rfq_response_status" DEFAULT 'received',
	"evaluation_score" numeric(5, 2),
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_number" varchar(50) NOT NULL,
	"rfq_type" "rfq_type" DEFAULT 'standard',
	"status" "rfq_status" DEFAULT 'draft',
	"title" varchar(500) NOT NULL,
	"description" text,
	"required_delivery_date" date,
	"total_estimated_value" numeric(15, 2),
	"currency" varchar(10) DEFAULT 'BDT',
	"notes" text,
	"closing_date" date,
	"is_archived" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rfqs_rfq_number_unique" UNIQUE("rfq_number")
);
--> statement-breakpoint
CREATE TABLE "scm_audit_trail" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"data_snapshot" text NOT NULL,
	"data_hash" varchar(64) NOT NULL,
	"previous_hash" varchar(64),
	"performed_by" integer,
	"performed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"weight_kg" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_id" integer NOT NULL,
	"tracking_event" varchar(200) NOT NULL,
	"event_location" varchar(500),
	"event_timestamp" timestamp NOT NULL,
	"event_description" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_number" varchar(50) NOT NULL,
	"shipment_type" "shipment_type" NOT NULL,
	"source_warehouse_id" integer,
	"destination_warehouse_id" integer,
	"customer_id" integer,
	"vendor_id" integer,
	"purchase_order_id" integer,
	"sales_order_id" integer,
	"shipment_date" date NOT NULL,
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"status" "shipment_status" DEFAULT 'pending',
	"logistics_provider" varchar(200),
	"tracking_number" varchar(200),
	"freight_cost" numeric(15, 2) DEFAULT '0',
	"insurance_cost" numeric(15, 2) DEFAULT '0',
	"total_weight_kg" numeric(10, 2),
	"notes" text,
	"is_archived" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_shipment_number_unique" UNIQUE("shipment_number")
);
--> statement-breakpoint
CREATE TABLE "supplier_risk_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"risk_score" numeric(5, 2) NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"on_time_delivery_rate" numeric(5, 2),
	"quality_score" numeric(5, 2),
	"price_competitiveness" numeric(5, 2),
	"responsiveness" numeric(5, 2),
	"compliance_score" numeric(5, 2),
	"assessment_date" date NOT NULL,
	"notes" text,
	"assessed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_response_id" integer NOT NULL,
	"rfq_line_id" integer NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"line_total" numeric(15, 2),
	"delivery_days" integer,
	"quality_guarantee" text,
	"payment_terms" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
