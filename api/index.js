// server/app.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/adminAuth.ts
import { SignJWT, jwtVerify } from "jose";
var COOKIE = "tm_admin";
var MAX_AGE_MS = 1e3 * 60 * 60 * 24 * 30;
function secret() {
  return new TextEncoder().encode(
    process.env.ADMIN_PASSWORD || "dev-admin-secret-change-me"
  );
}
async function signToken() {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret());
}
function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
var ADMIN_USER = {
  id: 0,
  openId: "admin",
  name: "Admin",
  email: process.env.ADMIN_EMAIL ?? "",
  loginMethod: "password",
  role: "admin",
  createdAt: /* @__PURE__ */ new Date(),
  updatedAt: /* @__PURE__ */ new Date(),
  lastSignedIn: /* @__PURE__ */ new Date()
};
async function getAdminUser(req) {
  try {
    const token = readCookie(req.headers.cookie, COOKIE);
    if (!token) return null;
    await jwtVerify(token, secret());
    return ADMIN_USER;
  } catch {
    return null;
  }
}
function registerAdminAuthRoutes(app) {
  const secureCookie = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  app.post("/api/admin/login", async (req, res) => {
    const password = req.body?.password ?? "";
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (!expected) {
      res.status(500).json({ ok: false, error: "ADMIN_PASSWORD not configured" });
      return;
    }
    if (password !== expected) {
      res.status(401).json({ ok: false, error: "\u0160patn\xE9 heslo" });
      return;
    }
    const token = await signToken();
    res.cookie(COOKIE, token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_MS
    });
    res.json({ ok: true });
  });
  app.post("/api/admin/logout", (_req, res) => {
    res.clearCookie(COOKIE, { path: "/" });
    res.json({ ok: true });
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_DEFAULT_MODEL ?? "claude-haiku-4-5-20251001"
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
  "archived"
]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var categories = pgTable("categories", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var sources = pgTable("sources", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var articles = pgTable("articles", {
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
  image: varchar("image", { length: 1e3 }),
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
  originalUrl: varchar("originalUrl", { length: 1e3 }),
  /** Original article title (before translation) */
  originalTitle: varchar("originalTitle", { length: 500 }),
  /** Article status */
  status: articleStatusEnum("status").default("draft").notNull(),
  /** Publication date */
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}
async function getCategoryBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getArticles(options) {
  const db = await getDb();
  if (!db) return [];
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const status = options?.status ?? "published";
  let query = db.select({
    id: articles.id,
    slug: articles.slug,
    title: articles.title,
    excerpt: articles.excerpt,
    content: articles.content,
    image: articles.image,
    videoUrl: articles.videoUrl,
    author: articles.author,
    readTime: articles.readTime,
    tags: articles.tags,
    featured: articles.featured,
    status: articles.status,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
    categoryId: categories.id,
    categoryName: categories.name,
    categorySlug: categories.slug,
    categoryDescription: categories.description,
    categoryColor: categories.color
  }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(eq(articles.status, status)).orderBy(desc(articles.publishedAt)).limit(limit).offset(offset);
  const rows = await query;
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    videoUrl: row.videoUrl,
    author: row.author,
    readTime: row.readTime,
    tags: row.tags,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    category: {
      id: row.categorySlug,
      // Use slug as ID to match frontend
      name: row.categoryName,
      slug: row.categorySlug,
      description: row.categoryDescription,
      color: row.categoryColor
    }
  }));
}
async function getArticlesByCategory(categorySlug, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: articles.id,
    slug: articles.slug,
    title: articles.title,
    excerpt: articles.excerpt,
    content: articles.content,
    image: articles.image,
    videoUrl: articles.videoUrl,
    author: articles.author,
    readTime: articles.readTime,
    tags: articles.tags,
    featured: articles.featured,
    status: articles.status,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
    categoryId: categories.id,
    categoryName: categories.name,
    categorySlug: categories.slug,
    categoryDescription: categories.description,
    categoryColor: categories.color
  }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(and(eq(articles.status, "published"), eq(categories.slug, categorySlug))).orderBy(desc(articles.publishedAt)).limit(limit).offset(offset);
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    videoUrl: row.videoUrl,
    author: row.author,
    readTime: row.readTime,
    tags: row.tags,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    category: {
      id: row.categorySlug,
      name: row.categoryName,
      slug: row.categorySlug,
      description: row.categoryDescription,
      color: row.categoryColor
    }
  }));
}
async function getArticleBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    id: articles.id,
    slug: articles.slug,
    title: articles.title,
    excerpt: articles.excerpt,
    content: articles.content,
    image: articles.image,
    videoUrl: articles.videoUrl,
    author: articles.author,
    readTime: articles.readTime,
    tags: articles.tags,
    featured: articles.featured,
    status: articles.status,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
    categoryId: categories.id,
    categoryName: categories.name,
    categorySlug: categories.slug,
    categoryDescription: categories.description,
    categoryColor: categories.color
  }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(eq(articles.slug, slug)).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    videoUrl: row.videoUrl,
    author: row.author,
    readTime: row.readTime,
    tags: row.tags,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    category: {
      id: row.categorySlug,
      name: row.categoryName,
      slug: row.categorySlug,
      description: row.categoryDescription,
      color: row.categoryColor
    }
  };
}
async function getFeaturedArticles(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: articles.id,
    slug: articles.slug,
    title: articles.title,
    excerpt: articles.excerpt,
    content: articles.content,
    image: articles.image,
    videoUrl: articles.videoUrl,
    author: articles.author,
    readTime: articles.readTime,
    tags: articles.tags,
    featured: articles.featured,
    status: articles.status,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
    categoryId: categories.id,
    categoryName: categories.name,
    categorySlug: categories.slug,
    categoryDescription: categories.description,
    categoryColor: categories.color
  }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(and(eq(articles.status, "published"), eq(articles.featured, true))).orderBy(desc(articles.publishedAt)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    videoUrl: row.videoUrl,
    author: row.author,
    readTime: row.readTime,
    tags: row.tags,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    category: {
      id: row.categorySlug,
      name: row.categoryName,
      slug: row.categorySlug,
      description: row.categoryDescription,
      color: row.categoryColor
    }
  }));
}
async function getAdminArticles(options) {
  const db = await getDb();
  if (!db) return [];
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const conditions = options?.status ? eq(articles.status, options.status) : void 0;
  const rows = await db.select({
    id: articles.id,
    slug: articles.slug,
    title: articles.title,
    excerpt: articles.excerpt,
    content: articles.content,
    image: articles.image,
    videoUrl: articles.videoUrl,
    author: articles.author,
    readTime: articles.readTime,
    tags: articles.tags,
    featured: articles.featured,
    status: articles.status,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
    categoryId: categories.id,
    categoryName: categories.name,
    categorySlug: categories.slug,
    categoryDescription: categories.description,
    categoryColor: categories.color
  }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(conditions).orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    videoUrl: row.videoUrl,
    author: row.author,
    readTime: row.readTime,
    tags: row.tags,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    category: {
      id: row.categorySlug,
      name: row.categoryName,
      slug: row.categorySlug,
      description: row.categoryDescription,
      color: row.categoryColor
    }
  }));
}
async function updateArticleStatus(articleId, status) {
  const db = await getDb();
  if (!db) return;
  const updateData = { status };
  if (status === "published") {
    updateData.publishedAt = /* @__PURE__ */ new Date();
  }
  await db.update(articles).set(updateData).where(eq(articles.id, articleId));
}
async function toggleArticleFeatured(articleId, featured) {
  const db = await getDb();
  if (!db) return;
  await db.update(articles).set({ featured }).where(eq(articles.id, articleId));
}
async function deleteArticle(articleId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, articleId));
}
async function getAllSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: sources.id,
    name: sources.name,
    url: sources.url,
    rssUrl: sources.rssUrl,
    categoryId: sources.categoryId,
    language: sources.language,
    isActive: sources.isActive,
    lastScrapedAt: sources.lastScrapedAt,
    categoryName: categories.name,
    categorySlug: categories.slug
  }).from(sources).leftJoin(categories, eq(sources.categoryId, categories.id)).orderBy(sources.name);
}
async function getArticleCounts() {
  const db = await getDb();
  if (!db) return { total: 0, published: 0, draft: 0, archived: 0 };
  const result = await db.select({
    status: articles.status,
    count: sql`COUNT(*)`
  }).from(articles).groupBy(articles.status);
  const counts = { total: 0, published: 0, draft: 0, archived: 0 };
  for (const row of result) {
    counts[row.status] = Number(row.count);
    counts.total += Number(row.count);
  }
  return counts;
}
async function updateArticle(articleId, data) {
  const db = await getDb();
  if (!db) return;
  const updateData = {};
  if (data.title !== void 0) updateData.title = data.title;
  if (data.excerpt !== void 0) updateData.excerpt = data.excerpt;
  if (data.content !== void 0) updateData.content = data.content;
  if (data.image !== void 0) updateData.image = data.image;
  if (data.author !== void 0) updateData.author = data.author;
  if (data.readTime !== void 0) updateData.readTime = data.readTime;
  if (data.tags !== void 0) updateData.tags = data.tags;
  if (data.categoryId !== void 0) updateData.categoryId = data.categoryId;
  if (Object.keys(updateData).length === 0) return;
  await db.update(articles).set(updateData).where(eq(articles.id, articleId));
}
async function getArticleById(articleId) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
  return rows.length > 0 ? rows[0] : null;
}
async function createSource(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sources).values({
    name: data.name,
    url: data.url,
    rssUrl: data.rssUrl || null,
    categoryId: data.categoryId,
    language: data.language || "en",
    isActive: true
  });
}
async function updateSource(sourceId, data) {
  const db = await getDb();
  if (!db) return;
  const updateData = {};
  if (data.name !== void 0) updateData.name = data.name;
  if (data.url !== void 0) updateData.url = data.url;
  if (data.rssUrl !== void 0) updateData.rssUrl = data.rssUrl;
  if (data.categoryId !== void 0) updateData.categoryId = data.categoryId;
  if (data.language !== void 0) updateData.language = data.language;
  if (data.isActive !== void 0) updateData.isActive = data.isActive;
  if (Object.keys(updateData).length === 0) return;
  await db.update(sources).set(updateData).where(eq(sources.id, sourceId));
}
async function deleteSource(sourceId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sources).where(eq(sources.id, sourceId));
}

// server/_core/llm.ts
import Anthropic from "@anthropic-ai/sdk";
var DEFAULT_MAX_TOKENS = 8192;
var _client = null;
function getClient() {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: ENV.anthropicApiKey });
  }
  return _client;
}
function contentToText(content) {
  const parts = Array.isArray(content) ? content : [content];
  return parts.map((part) => {
    if (typeof part === "string") return part;
    if (part.type === "text") return part.text;
    if (part.type === "image_url") return part.image_url.url;
    if (part.type === "file_url") return part.file_url.url;
    return "";
  }).filter(Boolean).join("\n");
}
function resolveJsonSchema(params) {
  const rf = params.responseFormat || params.response_format;
  if (rf && rf.type === "json_schema" && rf.json_schema?.schema) {
    return rf.json_schema;
  }
  return params.outputSchema || params.output_schema;
}
async function invokeLLM(params) {
  const client = getClient();
  const systemParts = [];
  const messages = [];
  for (const msg of params.messages) {
    const text2 = contentToText(msg.content);
    if (msg.role === "system") {
      systemParts.push(text2);
    } else if (msg.role === "assistant") {
      messages.push({ role: "assistant", content: text2 });
    } else {
      messages.push({ role: "user", content: text2 });
    }
  }
  if (messages.length === 0) {
    messages.push({ role: "user", content: " " });
  }
  const maxTokens = params.max_tokens ?? params.maxTokens ?? DEFAULT_MAX_TOKENS;
  const jsonSchema = resolveJsonSchema(params);
  const request = {
    model: ENV.anthropicModel,
    max_tokens: maxTokens,
    messages
  };
  if (systemParts.length > 0) {
    request.system = systemParts.join("\n\n");
  }
  if (jsonSchema) {
    request.tools = [
      {
        name: jsonSchema.name,
        description: "Return the result strictly matching the provided schema.",
        input_schema: jsonSchema.schema
      }
    ];
    request.tool_choice = { type: "tool", name: jsonSchema.name };
  }
  const response = await client.messages.create(request);
  let content = "";
  if (jsonSchema) {
    const toolUse = response.content.find(
      (b) => b.type === "tool_use"
    );
    content = toolUse ? JSON.stringify(toolUse.input) : "";
  } else {
    content = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  }
  return {
    id: response.id,
    created: Math.floor(Date.now() / 1e3),
    model: response.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: response.stop_reason ?? null
      }
    ],
    usage: response.usage ? {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens
    } : void 0
  };
}

// server/aiPipeline.ts
async function rewriteArticle(raw) {
  try {
    const systemPrompt = `Jsi profesion\xE1ln\xED \u010Desk\xFD novin\xE1\u0159 a redaktor online magaz\xEDnu TrendMagazine.cz. 
Tv\xFDm \xFAkolem je p\u0159epsat zahrani\u010Dn\xED zpr\xE1vy do \u010De\u0161tiny jako origin\xE1ln\xED \u010Dl\xE1nek.

PRAVIDLA:
- NIKDY nekop\xEDruj text 1:1, v\u017Edy p\u0159epi\u0161 vlastn\xEDmi slovy
- Pi\u0161 profesion\xE1ln\xEDm, ale \u010Dtiv\xFDm novin\xE1\u0159sk\xFDm stylem
- Pou\u017E\xEDvej \u010Desk\xE9 re\xE1lie a kontext kde je to vhodn\xE9
- Na konci \u010Dl\xE1nku uve\u010F zdroj: "Zdroj: [n\xE1zev zdroje]"
- Titulek mus\xED b\xFDt chytlav\xFD a SEO-friendly v \u010De\u0161tin\u011B
- Excerpt (perex) mus\xED b\xFDt 1-2 v\u011Bty shrnuj\xEDc\xED \u010Dl\xE1nek
- Obsah \u010Dl\xE1nku by m\u011Bl m\xEDt 3-6 odstavc\u016F
- Pi\u0161 v HTML form\xE1tu (pou\u017E\xEDvej <p>, <h3>, <strong>, <em>)
- P\u0159idej relevantn\xED tagy (\u010Desky, odd\u011Blen\xE9 \u010D\xE1rkou)
- Odhadni \u010Das \u010Dten\xED v minut\xE1ch

Odpov\u011Bz POUZE validn\xEDm JSON objektem v tomto form\xE1tu:
{
  "title": "\u010Cesk\xFD titulek \u010Dl\xE1nku",
  "excerpt": "Kr\xE1tk\xFD perex v 1-2 v\u011Bt\xE1ch",
  "content": "<p>HTML obsah \u010Dl\xE1nku...</p>",
  "tags": "tag1, tag2, tag3",
  "readTime": 5
}`;
    const userPrompt = `P\u0159epi\u0161 tento \u010Dl\xE1nek z ${raw.sourceName} (${raw.sourceLanguage}) do \u010De\u0161tiny jako origin\xE1ln\xED \u010Dl\xE1nek pro TrendMagazine.cz:

TITULEK: ${raw.title}

POPIS: ${raw.excerpt}

Vytvo\u0159 kompletn\xED \u010Desk\xFD \u010Dl\xE1nek s titulkem, perexem, obsahem (3-6 odstavc\u016F v HTML), tagy a odhadem \u010Dten\xED.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rewritten_article",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Czech article title" },
              excerpt: { type: "string", description: "Short 1-2 sentence excerpt in Czech" },
              content: { type: "string", description: "Full article content in HTML format" },
              tags: { type: "string", description: "Comma-separated tags in Czech" },
              readTime: { type: "integer", description: "Estimated read time in minutes" }
            },
            required: ["title", "excerpt", "content", "tags", "readTime"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.error("[AI Pipeline] Empty response from LLM");
      return null;
    }
    const parsed = JSON.parse(content);
    if (!parsed.title || !parsed.excerpt || !parsed.content) {
      console.error("[AI Pipeline] Invalid response structure:", parsed);
      return null;
    }
    if (!parsed.readTime || parsed.readTime < 1) parsed.readTime = 5;
    if (parsed.readTime > 30) parsed.readTime = 15;
    console.log(`[AI Pipeline] Rewritten: "${parsed.title.slice(0, 60)}..." (${parsed.readTime} min)`);
    return parsed;
  } catch (error) {
    console.error("[AI Pipeline] Error rewriting article:", error);
    return null;
  }
}

// server/imageService.ts
var UNSPLASH_API_URL = "https://api.unsplash.com";
async function searchUnsplash(query) {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) {
    console.log("[ImageService] No Unsplash API key configured, skipping");
    return null;
  }
  try {
    const searchUrl = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`;
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Client-ID ${apiKey}`,
        "Accept-Version": "v1"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      console.warn(`[ImageService] Unsplash search failed: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      const imageUrl = photo.urls.regular;
      console.log(`[ImageService] Found Unsplash photo by ${photo.user.name}: ${imageUrl.slice(0, 80)}...`);
      return imageUrl;
    }
    console.log(`[ImageService] No Unsplash results for: "${query}"`);
    return null;
  } catch (error) {
    console.warn("[ImageService] Unsplash search error:", error);
    return null;
  }
}
function extractSearchKeywords(title, tags) {
  const tagList = tags.split(",").map((t2) => t2.trim()).filter(Boolean);
  if (tagList.length > 0) {
    return tagList.slice(0, 3).join(" ");
  }
  return title.slice(0, 80);
}
async function getArticleImage(article) {
  const keywords = extractSearchKeywords(article.title, article.tags);
  const unsplashUrl = await searchUnsplash(keywords);
  if (unsplashUrl) return unsplashUrl;
  console.warn(`[ImageService] No fallback image for: "${article.title.slice(0, 50)}..."`);
  return null;
}

// server/originalImage.ts
function imageFromRssItem(itemXml) {
  const media = itemXml.match(
    /<media:(?:content|thumbnail)[^>]*\burl=["']([^"']+)["']/i
  );
  if (media && isImageUrl(media[1])) return decodeEntities(media[1]);
  const enclosure = itemXml.match(/<enclosure\b[^>]*>/i)?.[0];
  if (enclosure && /type=["']image\//i.test(enclosure)) {
    const url = enclosure.match(/\burl=["']([^"']+)["']/i);
    if (url) return decodeEntities(url[1]);
  }
  const img = itemXml.match(/<image[^>]*>[\s\S]*?<url>([\s\S]*?)<\/url>/i);
  if (img && isImageUrl(img[1])) return decodeEntities(img[1].trim());
  return null;
}
async function fetchOgImage(articleUrl) {
  try {
    const res = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrendMagazine/1.0; +https://trendmagazine.cz)",
        Accept: "text/html,application/xhtml+xml"
      },
      signal: AbortSignal.timeout(12e3),
      redirect: "follow"
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 2e5);
    const candidates = [
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
    ];
    for (const re of candidates) {
      const m = html.match(re);
      if (m && m[1]) {
        return absolutize(decodeEntities(m[1].trim()), articleUrl);
      }
    }
    return null;
  } catch {
    return null;
  }
}
function isImageUrl(url) {
  return /^https?:\/\//i.test(url);
}
function absolutize(url, base) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}
function decodeEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'");
}

// server/scraper.ts
import { eq as eq2, and as and2, isNotNull } from "drizzle-orm";
function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const description = extractTag(itemXml, "description");
    const pubDate = extractTag(itemXml, "pubDate");
    if (title && link) {
      items.push({
        title: cleanHtml(title),
        link: link.trim(),
        description: cleanHtml(description || ""),
        pubDate: pubDate || void 0,
        rawXml: itemXml
      });
    }
  }
  return items;
}
function extractTag(xml, tag) {
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}
function cleanHtml(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ").trim();
}
function generateSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 200).replace(/^-|-$/g, "");
}
async function fetchRSSArticles(source) {
  try {
    console.log(`[Scraper] Fetching RSS from ${source.name}: ${source.rssUrl}`);
    const response = await fetch(source.rssUrl, {
      headers: {
        "User-Agent": "TrendMagazine/1.0 (https://trendmagazine.cz)",
        "Accept": "application/rss+xml, application/xml, text/xml"
      },
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      console.warn(`[Scraper] RSS fetch failed for ${source.name}: ${response.status}`);
      return [];
    }
    const xml = await response.text();
    const items = parseRSSItems(xml);
    console.log(`[Scraper] Found ${items.length} items from ${source.name}`);
    return items.slice(0, 5).map((item) => ({
      title: item.title,
      excerpt: item.description.slice(0, 500),
      originalUrl: item.link,
      sourceId: source.id,
      categoryId: source.categoryId,
      pubDate: item.pubDate,
      image: imageFromRssItem(item.rawXml)
    }));
  } catch (error) {
    console.error(`[Scraper] Error fetching ${source.name}:`, error);
    return [];
  }
}
async function articleExists(originalUrl) {
  const db = await getDb();
  if (!db) return true;
  const result = await db.select({ id: articles.id }).from(articles).where(eq2(articles.originalUrl, originalUrl)).limit(1);
  return result.length > 0;
}
async function saveArticle(article) {
  const db = await getDb();
  if (!db) return;
  let slug = article.slug;
  const existingSlug = await db.select({ id: articles.id }).from(articles).where(eq2(articles.slug, slug)).limit(1);
  if (existingSlug.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  await db.insert(articles).values({
    ...article,
    slug,
    image: article.image || null,
    featured: false
  });
  console.log(`[Scraper] Saved article: ${article.title.slice(0, 60)}...`);
}
async function runScraper(options) {
  const maxPerSource = options?.maxArticlesPerSource ?? 3;
  const autoPublish = options?.autoPublish ?? false;
  const db = await getDb();
  if (!db) {
    console.error("[Scraper] Database not available");
    return { total: 0, saved: 0, errors: 0 };
  }
  console.log("[Scraper] Starting scrape run...");
  let activeSources = await db.select().from(sources).where(and2(eq2(sources.isActive, true), isNotNull(sources.rssUrl)));
  if (options?.onlySourceIds?.length) {
    const ids = new Set(options.onlySourceIds);
    activeSources = activeSources.filter((s) => ids.has(s.id));
  }
  console.log(`[Scraper] Found ${activeSources.length} active RSS sources`);
  let total = 0;
  let saved = 0;
  let errors = 0;
  for (const source of activeSources) {
    if (!source.rssUrl) continue;
    try {
      const rawArticles = await fetchRSSArticles({
        id: source.id,
        name: source.name,
        rssUrl: source.rssUrl,
        categoryId: source.categoryId,
        language: source.language
      });
      for (const raw of rawArticles.slice(0, maxPerSource)) {
        total++;
        if (await articleExists(raw.originalUrl)) {
          console.log(`[Scraper] Skipping duplicate: ${raw.title.slice(0, 50)}...`);
          continue;
        }
        try {
          const rewritten = await rewriteArticle({
            title: raw.title,
            excerpt: raw.excerpt,
            sourceLanguage: source.language,
            sourceName: source.name
          });
          if (!rewritten) {
            console.warn(`[Scraper] AI rewrite failed for: ${raw.title.slice(0, 50)}...`);
            errors++;
            continue;
          }
          const slug = generateSlug(rewritten.title);
          const publishedAt = raw.pubDate ? new Date(raw.pubDate) : /* @__PURE__ */ new Date();
          let imageUrl = raw.image ?? null;
          if (!imageUrl) {
            try {
              imageUrl = await fetchOgImage(raw.originalUrl);
            } catch {
            }
          }
          if (!imageUrl) {
            try {
              imageUrl = await getArticleImage({
                title: rewritten.title,
                excerpt: rewritten.excerpt,
                tags: rewritten.tags
              });
            } catch (imgErr) {
              console.warn(`[Scraper] Image fallback failed for: ${rewritten.title.slice(0, 50)}...`, imgErr);
            }
          }
          await saveArticle({
            slug,
            title: rewritten.title,
            excerpt: rewritten.excerpt,
            content: rewritten.content,
            image: imageUrl || void 0,
            author: "Redakce TM",
            readTime: rewritten.readTime,
            tags: rewritten.tags,
            categoryId: raw.categoryId || 1,
            sourceId: raw.sourceId,
            originalUrl: raw.originalUrl,
            originalTitle: raw.title,
            status: autoPublish ? "published" : "draft",
            publishedAt: autoPublish ? publishedAt : null
          });
          saved++;
        } catch (err) {
          console.error(`[Scraper] Error processing article: ${raw.title.slice(0, 50)}...`, err);
          errors++;
        }
      }
      await db.update(sources).set({ lastScrapedAt: /* @__PURE__ */ new Date() }).where(eq2(sources.id, source.id));
    } catch (err) {
      console.error(`[Scraper] Error with source ${source.name}:`, err);
      errors++;
    }
  }
  console.log(`[Scraper] Complete: ${total} found, ${saved} saved, ${errors} errors`);
  return { total, saved, errors };
}

// server/storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
var _s3 = null;
function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? ""
      },
      forcePathStyle: true
    });
  }
  return _s3;
}
function publicBase() {
  return (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");
  if (!publicBase()) throw new Error("R2_PUBLIC_URL is not configured");
  const key = relKey.replace(/^\/+/, "");
  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  await getS3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
  return { key, url: `${publicBase()}/${key}` };
}

// server/imageGen.ts
var MODEL = "gemini-2.5-flash-image";
var ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
function buildPrompt(title, excerpt) {
  return [
    `Editorial hero image for a Czech news/magazine article titled: "${title}".`,
    excerpt ? `Context: ${excerpt.slice(0, 240)}.` : "",
    "Photorealistic, tasteful editorial magazine style, 16:9 landscape composition.",
    "Relevant to the topic. No text, no captions, no watermark, no logos, no real identifiable faces."
  ].filter(Boolean).join(" ");
}
async function generateArticleImage(opts) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");
  try {
    const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(opts.title, opts.excerpt) }] }]
      }),
      signal: AbortSignal.timeout(6e4)
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[imageGen] Gemini ${res.status}: ${detail.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img?.inlineData?.data) {
      console.error("[imageGen] No image in Gemini response");
      return null;
    }
    const mime = img.inlineData.mimeType || "image/png";
    const ext = mime.split("/")[1] || "png";
    const buf = Buffer.from(img.inlineData.data, "base64");
    const key = `generated/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const { url } = await storagePut(key, buf, mime);
    console.log(`[imageGen] Generated \u2192 ${url}`);
    return url;
  } catch (err) {
    console.error("[imageGen] Error:", err);
    return null;
  }
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ─── Public Article Routes ───
  articles: router({
    /** Get published articles with pagination */
    list: publicProcedure.input(
      z2.object({
        limit: z2.number().min(1).max(50).default(20),
        offset: z2.number().min(0).default(0)
      }).optional()
    ).query(async ({ input }) => {
      return getArticles({
        limit: input?.limit ?? 20,
        offset: input?.offset ?? 0,
        status: "published"
      });
    }),
    /** Get a single article by slug */
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return getArticleBySlug(input.slug);
    }),
    /** Get articles by category slug */
    byCategory: publicProcedure.input(
      z2.object({
        categorySlug: z2.string(),
        limit: z2.number().min(1).max(50).default(20),
        offset: z2.number().min(0).default(0)
      })
    ).query(async ({ input }) => {
      return getArticlesByCategory(input.categorySlug, input.limit, input.offset);
    }),
    /** Get featured articles for hero carousel */
    featured: publicProcedure.input(z2.object({ limit: z2.number().min(1).max(10).default(5) }).optional()).query(async ({ input }) => {
      return getFeaturedArticles(input?.limit ?? 5);
    })
  }),
  // ─── Public Category Routes ───
  categories: router({
    /** Get all active categories */
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
    /** Get a single category by slug */
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return getCategoryBySlug(input.slug);
    })
  }),
  // ─── Admin Routes (require admin role) ───
  admin: router({
    /** Get articles for admin panel (includes drafts) */
    articles: adminProcedure.input(
      z2.object({
        status: z2.enum(["draft", "published", "archived"]).optional(),
        limit: z2.number().min(1).max(100).default(50),
        offset: z2.number().min(0).default(0)
      }).optional()
    ).query(async ({ input }) => {
      return getAdminArticles({
        status: input?.status,
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0
      });
    }),
    /** Get article counts by status */
    articleCounts: adminProcedure.query(async () => {
      return getArticleCounts();
    }),
    /** Publish an article */
    publishArticle: adminProcedure.input(z2.object({ articleId: z2.number() })).mutation(async ({ input }) => {
      await updateArticleStatus(input.articleId, "published");
      return { success: true };
    }),
    /** Archive an article */
    archiveArticle: adminProcedure.input(z2.object({ articleId: z2.number() })).mutation(async ({ input }) => {
      await updateArticleStatus(input.articleId, "archived");
      return { success: true };
    }),
    /** Revert article to draft */
    draftArticle: adminProcedure.input(z2.object({ articleId: z2.number() })).mutation(async ({ input }) => {
      await updateArticleStatus(input.articleId, "draft");
      return { success: true };
    }),
    /** Toggle featured status */
    toggleFeatured: adminProcedure.input(z2.object({ articleId: z2.number(), featured: z2.boolean() })).mutation(async ({ input }) => {
      await toggleArticleFeatured(input.articleId, input.featured);
      return { success: true };
    }),
    /** Delete an article */
    deleteArticle: adminProcedure.input(z2.object({ articleId: z2.number() })).mutation(async ({ input }) => {
      await deleteArticle(input.articleId);
      return { success: true };
    }),
    /** Get all sources */
    sources: adminProcedure.query(async () => {
      return getAllSources();
    }),
    /** Get a single article by ID for editing */
    articleById: adminProcedure.input(z2.object({ articleId: z2.number() })).query(async ({ input }) => {
      return getArticleById(input.articleId);
    }),
    /** Update article fields */
    updateArticle: adminProcedure.input(
      z2.object({
        articleId: z2.number(),
        title: z2.string().optional(),
        excerpt: z2.string().optional(),
        content: z2.string().optional(),
        image: z2.string().optional(),
        author: z2.string().optional(),
        readTime: z2.number().optional(),
        tags: z2.string().optional(),
        categoryId: z2.number().optional()
      })
    ).mutation(async ({ input }) => {
      const { articleId, ...data } = input;
      await updateArticle(articleId, data);
      return { success: true };
    }),
    /** Create a new source */
    createSource: adminProcedure.input(
      z2.object({
        name: z2.string().min(1),
        url: z2.string().url(),
        rssUrl: z2.string().optional(),
        categoryId: z2.number(),
        language: z2.string().default("en")
      })
    ).mutation(async ({ input }) => {
      await createSource(input);
      return { success: true };
    }),
    /** Update an existing source */
    updateSource: adminProcedure.input(
      z2.object({
        sourceId: z2.number(),
        name: z2.string().optional(),
        url: z2.string().url().optional(),
        rssUrl: z2.string().optional(),
        categoryId: z2.number().optional(),
        language: z2.string().optional(),
        isActive: z2.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { sourceId, ...data } = input;
      await updateSource(sourceId, data);
      return { success: true };
    }),
    /** Delete a source */
    deleteSource: adminProcedure.input(z2.object({ sourceId: z2.number() })).mutation(async ({ input }) => {
      await deleteSource(input.sourceId);
      return { success: true };
    }),
    /** Trigger a manual scrape run */
    runScraper: adminProcedure.input(
      z2.object({
        maxArticlesPerSource: z2.number().min(1).max(10).default(3),
        autoPublish: z2.boolean().default(false)
      }).optional()
    ).mutation(async ({ input }) => {
      const result = await runScraper({
        maxArticlesPerSource: input?.maxArticlesPerSource ?? 3,
        autoPublish: input?.autoPublish ?? false
      });
      return result;
    }),
    /** Replace an article's image: AI-generate (Gemini), search Unsplash, or set a custom URL. */
    replaceImage: adminProcedure.input(
      z2.object({
        articleId: z2.number(),
        mode: z2.enum(["generate", "unsplash", "url"]),
        customUrl: z2.string().url().optional()
      })
    ).mutation(async ({ input }) => {
      const article = await getArticleById(input.articleId);
      if (!article) {
        return { success: false, error: "\u010Cl\xE1nek nenalezen" };
      }
      let image = null;
      if (input.mode === "url") {
        image = input.customUrl ?? null;
      } else if (input.mode === "unsplash") {
        image = await getArticleImage({
          title: article.title,
          excerpt: article.excerpt ?? "",
          tags: article.tags ?? ""
        });
      } else {
        image = await generateArticleImage({
          title: article.title,
          excerpt: article.excerpt ?? ""
        });
      }
      if (!image) {
        return { success: false, error: "Obr\xE1zek se nepoda\u0159ilo z\xEDskat" };
      }
      await updateArticle(input.articleId, { image });
      return { success: true, image };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await getAdminUser(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/seo.ts
var SITE = (process.env.SITE_URL || "https://trendmagazine.cz").replace(/\/+$/, "");
var NAME = "TrendMagazine.cz";
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stripTags(s) {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function clip(s, n) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}\u2026` : s;
}
function iso(d) {
  try {
    return d ? new Date(d).toISOString() : void 0;
  } catch {
    return void 0;
  }
}
function headTags(o) {
  const t2 = esc(o.title);
  const d = esc(clip(o.description, 160));
  const url = esc(o.url);
  const img = o.image ? esc(o.image) : "";
  return [
    `<title>${t2}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${o.type || "website"}" />`,
    `<meta property="og:title" content="${t2}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:locale" content="cs_CZ" />`,
    img ? `<meta property="og:image" content="${img}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t2}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    img ? `<meta name="twitter:image" content="${img}" />` : "",
    o.publishedTime ? `<meta property="article:published_time" content="${o.publishedTime}" />` : ""
  ].filter(Boolean).join("\n    ");
}
function inject(shell, headHtml, rootHtml) {
  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/i, "");
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "");
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, "");
  html = html.replace(/<\/head>/i, `    ${headHtml}
  </head>`);
  if (rootHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`);
  }
  return html;
}
function articleJsonLd(a, url) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: clip(a.title, 110),
    image: a.image ? [a.image] : void 0,
    datePublished: iso(a.publishedAt) || iso(a.createdAt),
    dateModified: iso(a.createdAt) || iso(a.publishedAt),
    author: { "@type": "Organization", name: a.author || "Redakce TM" },
    publisher: {
      "@type": "Organization",
      name: NAME,
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.ico` }
    },
    description: clip(stripTags(a.excerpt), 200),
    articleBody: stripTags(a.content),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "cs-CZ"
  };
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}
function renderArticle(shell, a) {
  const url = `${SITE}/clanek/${a.slug}`;
  const desc2 = stripTags(a.excerpt) || stripTags(a.content) || a.title;
  const head = headTags({
    title: `${a.title} | ${NAME}`,
    description: desc2,
    url,
    image: a.image,
    type: "article",
    publishedTime: iso(a.publishedAt)
  }) + "\n    " + articleJsonLd(a, url);
  const root = `<article><h1>${esc(a.title)}</h1>${a.image ? `<img src="${esc(a.image)}" alt="${esc(a.title)}" />` : ""}${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ""}${a.content || ""}${a.category ? `<p>Rubrika: <a href="${SITE}/kategorie/${a.category.slug}">${esc(a.category.name)}</a></p>` : ""}</article>`;
  return inject(shell, head, root);
}
function renderCategory(shell, c, articles2) {
  const url = `${SITE}/kategorie/${c.slug}`;
  const head = headTags({
    title: `${c.name} \u2013 aktu\xE1ln\xED zpr\xE1vy | ${NAME}`,
    description: c.description || `Nejnov\u011Bj\u0161\xED \u010Dl\xE1nky v rubrice ${c.name} na ${NAME}.`,
    url
  });
  const list = articles2.map(
    (a) => `<li><a href="${SITE}/clanek/${a.slug}">${esc(a.title)}</a>${a.excerpt ? ` \u2013 ${esc(clip(stripTags(a.excerpt), 120))}` : ""}</li>`
  ).join("");
  const root = `<section><h1>${esc(c.name)}</h1><p>${esc(c.description || "")}</p><ul>${list}</ul></section>`;
  return inject(shell, head, root);
}
function renderHome(shell, articles2) {
  const head = headTags({
    title: `${NAME} \u2013 \u010Cesk\xFD magaz\xEDn: sv\u011Bt, business, technologie, sport`,
    description: "Aktu\xE1ln\xED zpr\xE1vy a \u010Dl\xE1nky v \u010De\u0161tin\u011B: sv\u011Bt, business, akcie a krypto, AI a technologie, auta, sport, zdrav\xED a celebrity. TrendMagazine.cz.",
    url: SITE
  });
  const list = articles2.slice(0, 30).map((a) => `<li><a href="${SITE}/clanek/${a.slug}">${esc(a.title)}</a></li>`).join("");
  const root = `<section><h1>${NAME}</h1><p>Aktu\xE1ln\xED zpr\xE1vy a \u010Dl\xE1nky v \u010De\u0161tin\u011B.</p><ul>${list}</ul></section>`;
  return inject(shell, head, root);
}
function buildSitemap(articles2, categories3) {
  const urls = [];
  const push = (loc, lastmod, priority) => urls.push(
    `<url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}${priority ? `<priority>${priority}</priority>` : ""}</url>`
  );
  push(SITE, void 0, "1.0");
  for (const c of categories3) push(`${SITE}/kategorie/${c.slug}`, void 0, "0.7");
  for (const a of articles2) push(`${SITE}/clanek/${a.slug}`, a.lastmod, "0.8");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
    ""
  )}</urlset>`;
}
function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE}/sitemap.xml
`;
}

// server/app.ts
function createApp(opts) {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  registerAdminAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(robotsTxt());
  });
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [articles2, categories3] = await Promise.all([
        getArticles({ status: "published", limit: 1e3 }),
        getAllCategories()
      ]);
      const xml = buildSitemap(
        articles2.map((a) => ({
          slug: a.slug,
          lastmod: (a.publishedAt ?? a.createdAt)?.toISOString?.()
        })),
        categories3.map((c) => ({ slug: c.slug }))
      );
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );
      res.type("application/xml").send(xml);
    } catch {
      res.status(500).send("");
    }
  });
  const shell = opts?.htmlShell;
  if (shell) {
    const HTML_CACHE = "public, s-maxage=300, stale-while-revalidate=600";
    app.get("/clanek/:slug", async (req, res) => {
      try {
        const a = await getArticleBySlug(req.params.slug);
        if (!a) {
          res.status(404).type("html").send(shell);
          return;
        }
        res.setHeader("Cache-Control", HTML_CACHE);
        res.type("html").send(renderArticle(shell, a));
      } catch {
        res.type("html").send(shell);
      }
    });
    app.get("/kategorie/:slug", async (req, res) => {
      try {
        const c = await getCategoryBySlug(req.params.slug);
        if (!c) {
          res.status(404).type("html").send(shell);
          return;
        }
        const arts = await getArticlesByCategory(req.params.slug, 30, 0);
        res.setHeader("Cache-Control", HTML_CACHE);
        res.type("html").send(renderCategory(shell, c, arts));
      } catch {
        res.type("html").send(shell);
      }
    });
    app.get("/", async (_req, res) => {
      try {
        const arts = await getArticles({ status: "published", limit: 30 });
        res.setHeader("Cache-Control", HTML_CACHE);
        res.type("html").send(renderHome(shell, arts));
      } catch {
        res.type("html").send(shell);
      }
    });
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.type("html").send(shell);
    });
  }
  return app;
}

// dist/public/app-shell.html
var app_shell_default = '<!doctype html>\n<html lang="cs">\n\n  <head>\n    <meta charset="UTF-8" />\n    <meta\n      name="viewport"\n      content="width=device-width, initial-scale=1.0, maximum-scale=1" />\n    <title>TrendMagazine.cz \u2013 V\xE1\u0161 pr\u016Fvodce sv\u011Btem trend\u016F</title>\n    <meta name="description" content="TrendMagazine.cz \u2013 \u010Cesk\xFD online magaz\xEDn o business, technologi\xEDch, ekonomice, zdrav\xED a aktu\xE1ln\xEDm d\u011Bn\xED ve sv\u011Bt\u011B." />\n    <meta name="robots" content="index, follow" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="TrendMagazine.cz" />\n    <meta property="og:title" content="TrendMagazine.cz \u2013 V\xE1\u0161 pr\u016Fvodce sv\u011Btem trend\u016F" />\n    <meta property="og:description" content="\u010Cesk\xFD online magaz\xEDn o business, technologi\xEDch, ekonomice, zdrav\xED a aktu\xE1ln\xEDm d\u011Bn\xED ve sv\u011Bt\u011B." />\n    <meta property="og:locale" content="cs_CZ" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <link rel="canonical" href="https://trendmagazine.cz" />\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />    <script type="module" crossorigin src="/assets/index-uYrh0Ej5.js"></script>\n    <link rel="stylesheet" crossorigin href="/assets/index-CeAFaTty.css">\n  </head>\n\n  <body>\n    <div id="root"></div>\n  </body>\n\n</html>\n';

// server/serverless.ts
var serverless_default = createApp({ htmlShell: app_shell_default });
export {
  serverless_default as default
};
