CREATE TABLE "project_todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"stage" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"comment" text,
	"completed_at" timestamp,
	"completed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "stage" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "stage" SET DEFAULT 'initiation';--> statement-breakpoint
DROP TYPE "public"."project_stage";