CREATE TYPE "public"."active_stage" AS ENUM('initiate', 'plan', 'execute', 'monitor', 'close');--> statement-breakpoint
CREATE TYPE "public"."project_health" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_type_v2" AS ENUM('strategic', 'improvement', 'operational');--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "portfolio" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "program" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_template" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_status" "project_status" DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "active_stage" "active_stage" DEFAULT 'initiate';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "health" "project_health" DEFAULT 'green';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_type_v2" "project_type_v2" DEFAULT 'operational';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "duration_days" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "progress_percentage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "total_tasks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "late_tasks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "issues_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_manager" varchar(255);