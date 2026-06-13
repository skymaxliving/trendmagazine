CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(300) NOT NULL,
	"title" varchar(500) NOT NULL,
	"excerpt" text,
	"content" text,
	"image" varchar(1000),
	"videoUrl" varchar(500),
	"author" varchar(200) DEFAULT 'Redakce TM' NOT NULL,
	"readTime" integer DEFAULT 5 NOT NULL,
	"tags" text,
	"featured" boolean DEFAULT false NOT NULL,
	"categoryId" integer NOT NULL,
	"sourceId" integer,
	"originalUrl" varchar(1000),
	"originalTitle" varchar(500),
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT '#1E293B' NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"url" varchar(500) NOT NULL,
	"rssUrl" varchar(500),
	"categoryId" integer,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"articleSelector" varchar(500),
	"titleSelector" varchar(500),
	"contentSelector" varchar(500),
	"scrapeIntervalMinutes" integer DEFAULT 120 NOT NULL,
	"lastScrapedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
