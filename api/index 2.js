// server/app.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
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

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
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
  const activeSources = await db.select().from(sources).where(and2(eq2(sources.isActive, true), isNotNull(sources.rssUrl)));
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
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/app.ts
function createApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  return app;
}

// server/serverless.ts
var serverless_default = createApp();
export {
  serverless_default as default
};
