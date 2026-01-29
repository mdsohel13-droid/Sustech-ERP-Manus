CREATE TYPE "public"."crm_activity_type" AS ENUM('call', 'email', 'meeting', 'task', 'note');--> statement-breakpoint
CREATE TYPE "public"."crm_lead_source" AS ENUM('website', 'referral', 'social_media', 'cold_call', 'email_campaign', 'trade_show', 'partner', 'other');--> statement-breakpoint
CREATE TYPE "public"."crm_lead_status" AS ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."crm_opportunity_stage" AS ENUM('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "crm_activity_type" NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text,
	"leadId" integer,
	"customerId" integer,
	"opportunityId" integer,
	"dueDate" timestamp,
	"completedAt" timestamp,
	"isCompleted" boolean DEFAULT false,
	"assignedTo" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"company" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"source" "crm_lead_source" DEFAULT 'website',
	"status" "crm_lead_status" DEFAULT 'new' NOT NULL,
	"estimatedValue" numeric(15, 2),
	"lastContactDate" timestamp,
	"nextFollowUp" timestamp,
	"assignedTo" integer,
	"notes" text,
	"isArchived" boolean DEFAULT false,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"customerId" integer,
	"leadId" integer,
	"stage" "crm_opportunity_stage" DEFAULT 'prospecting' NOT NULL,
	"amount" numeric(15, 2),
	"probability" integer DEFAULT 10,
	"expectedCloseDate" date,
	"actualCloseDate" date,
	"ownerId" integer,
	"description" text,
	"isArchived" boolean DEFAULT false,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"dueDate" timestamp,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'pending',
	"leadId" integer,
	"customerId" integer,
	"opportunityId" integer,
	"assignedTo" integer,
	"completedAt" timestamp,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
