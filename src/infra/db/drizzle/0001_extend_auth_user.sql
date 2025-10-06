CREATE TYPE "public"."report_status" AS ENUM('pending', 'investigating', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."store_staff_role" AS ENUM('owner', 'manager', 'staff');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'store');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reputation_score" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notification_preferences" json DEFAULT '{}'::json NOT NULL;