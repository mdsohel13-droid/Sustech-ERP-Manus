ALTER TABLE "sales_products" ALTER COLUMN "category" SET DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "sales_products" ALTER COLUMN "category" DROP NOT NULL;