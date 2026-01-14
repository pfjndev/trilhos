ALTER TABLE "routes" RENAME COLUMN "position" TO "points";--> statement-breakpoint
ALTER TABLE "routes" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "totalDistance" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "duration" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;