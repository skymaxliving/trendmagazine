import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Enums */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories – editorial sections of the magazine.
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  /** Unique slug used in URLs, e.g. "svet", "business", "akcie" */
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  /** Display name, e.g. "Svět", "Business" */
  name: varchar("name", { length: 200 }).notNull(),
  /** Short description for category pages */
  description: text("description"),
  /** Hex color for category badges, e.g. "#1E293B" */
  color: varchar("color", { length: 20 }).default("#1E293B").notNull(),
  /** Sort order for navigation */
  sortOrder: integer("sortOrder").default(0).notNull(),
  /** Whether this category is visible in navigation */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Sources – websites/feeds to scrape articles from.
 */
export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  /** Human-readable name, e.g. "Reuters", "TechCrunch" */
  name: varchar("name", { length: 200 }).notNull(),
  /** Base URL of the source */
  url: varchar("url", { length: 500 }).notNull(),
  /** RSS feed URL if available */
  rssUrl: varchar("rssUrl", { length: 500 }),
  /** Default category ID for articles from this source */
  categoryId: integer("categoryId"),
  /** Language of the source content, e.g. "en", "cs", "de" */
  language: varchar("language", { length: 10 }).default("en").notNull(),
  /** Whether this source is actively being scraped */
  isActive: boolean("isActive").default(true).notNull(),
  /** CSS selector for article links on the source homepage (for scraping) */
  articleSelector: varchar("articleSelector", { length: 500 }),
  /** CSS selector for article title within article page */
  titleSelector: varchar("titleSelector", { length: 500 }),
  /** CSS selector for article content within article page */
  contentSelector: varchar("contentSelector", { length: 500 }),
  /** How often to scrape (in minutes) */
  scrapeIntervalMinutes: integer("scrapeIntervalMinutes").default(120).notNull(),
  /** Last time this source was scraped */
  lastScrapedAt: timestamp("lastScrapedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;

/**
 * Articles – the core content of the magazine.
 */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  /** Unique URL slug */
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  /** Article title in Czech */
  title: varchar("title", { length: 500 }).notNull(),
  /** Short excerpt/summary for cards and previews */
  excerpt: text("excerpt"),
  /** Full article content (HTML or Markdown) */
  content: text("content"),
  /** Hero image URL */
  image: varchar("image", { length: 1000 }),
  /** Optional video URL */
  videoUrl: varchar("videoUrl", { length: 500 }),
  /** Author name */
  author: varchar("author", { length: 200 }).default("Redakce TM").notNull(),
  /** Estimated read time in minutes */
  readTime: integer("readTime").default(5).notNull(),
  /** Comma-separated tags */
  tags: text("tags"),
  /** Whether this article is featured in hero carousel */
  featured: boolean("featured").default(false).notNull(),
  /** Category ID (foreign key) */
  categoryId: integer("categoryId").notNull(),
  /** Source ID if scraped (nullable for manual articles) */
  sourceId: integer("sourceId"),
  /** Original article URL from the source */
  originalUrl: varchar("originalUrl", { length: 1000 }),
  /** Original article title (before translation) */
  originalTitle: varchar("originalTitle", { length: 500 }),
  /** Article status */
  status: articleStatusEnum("status").default("draft").notNull(),
  /** Publication date */
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;
