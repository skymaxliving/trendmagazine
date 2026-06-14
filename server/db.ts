import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, articles, categories, sources } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

// ─── User Queries ───

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Category Queries ───

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ─── Article Queries ───

/** Article with joined category data, matching the frontend Article interface */
export interface ArticleWithCategory {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  videoUrl: string | null;
  author: string;
  readTime: number;
  tags: string | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  publishedAt: Date | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
  };
}

/**
 * Get published articles with category data, ordered by date.
 * Supports pagination and optional category filter.
 */
export async function getArticles(options?: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
  status?: "draft" | "published" | "archived";
  featured?: boolean;
}): Promise<ArticleWithCategory[]> {
  const db = await getDb();
  if (!db) return [];

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const status = options?.status ?? "published";

  let query = db
    .select({
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
      categoryColor: categories.color,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.status, status))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

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
      id: row.categorySlug, // Use slug as ID to match frontend
      name: row.categoryName,
      slug: row.categorySlug,
      description: row.categoryDescription,
      color: row.categoryColor,
    },
  }));
}

/**
 * Get articles filtered by category slug
 */
export async function getArticlesByCategory(
  categorySlug: string,
  limit = 20,
  offset = 0
): Promise<ArticleWithCategory[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
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
      categoryColor: categories.color,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.status, "published"), eq(categories.slug, categorySlug)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

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
      color: row.categoryColor,
    },
  }));
}

/**
 * Get published articles that contain a given tag (comma-separated `tags`).
 */
export async function getArticlesByTag(
  tag: string,
  limit = 20,
  offset = 0
): Promise<ArticleWithCategory[]> {
  const db = await getDb();
  if (!db) return [];

  // Match the tag as a whole list item: wrap both sides with ", " and compare.
  const escaped = tag.trim().replace(/[%_\\]/g, "\\$&");
  const pattern = `%, ${escaped}, %`;

  const rows = await db
    .select({
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
      categoryColor: categories.color,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(
        eq(articles.status, "published"),
        sql`(', ' || ${articles.tags} || ', ') ILIKE ${pattern}`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

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
      color: row.categoryColor,
    },
  }));
}

/**
 * Get a single article by slug with full content
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithCategory | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select({
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
      categoryColor: categories.color,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

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
      color: row.categoryColor,
    },
  };
}

/**
 * Get featured articles for the hero carousel
 */
export async function getFeaturedArticles(limit = 5): Promise<ArticleWithCategory[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
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
      categoryColor: categories.color,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.status, "published"), eq(articles.featured, true)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

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
      color: row.categoryColor,
    },
  }));
}

// ─── Admin Queries ───

/**
 * Get all articles for admin panel (includes drafts)
 */
export async function getAdminArticles(options?: {
  status?: "draft" | "published" | "archived";
  limit?: number;
  offset?: number;
}): Promise<ArticleWithCategory[]> {
  const db = await getDb();
  if (!db) return [];

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const conditions = options?.status
    ? eq(articles.status, options.status)
    : undefined;

  const rows = await db
    .select({
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
      categoryColor: categories.color,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(conditions)
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

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
      color: row.categoryColor,
    },
  }));
}

/**
 * Update article status (publish, archive, etc.)
 */
export async function updateArticleStatus(
  articleId: number,
  status: "draft" | "published" | "archived"
) {
  const db = await getDb();
  if (!db) return;

  const updateData: Record<string, unknown> = { status };
  if (status === "published") {
    updateData.publishedAt = new Date();
  }

  await db.update(articles).set(updateData).where(eq(articles.id, articleId));
}

/**
 * Toggle article featured status
 */
export async function toggleArticleFeatured(articleId: number, featured: boolean) {
  const db = await getDb();
  if (!db) return;

  await db.update(articles).set({ featured }).where(eq(articles.id, articleId));
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(articles).where(eq(articles.id, articleId));
}

/**
 * Get all sources for admin
 */
export async function getAllSources() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: sources.id,
      name: sources.name,
      url: sources.url,
      rssUrl: sources.rssUrl,
      categoryId: sources.categoryId,
      language: sources.language,
      isActive: sources.isActive,
      lastScrapedAt: sources.lastScrapedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(sources)
    .leftJoin(categories, eq(sources.categoryId, categories.id))
    .orderBy(sources.name);
}

/**
 * Get article count by status
 */
export async function getArticleCounts() {
  const db = await getDb();
  if (!db) return { total: 0, published: 0, draft: 0, archived: 0 };

  const result = await db
    .select({
      status: articles.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(articles)
    .groupBy(articles.status);

  const counts = { total: 0, published: 0, draft: 0, archived: 0 };
  for (const row of result) {
    counts[row.status] = Number(row.count);
    counts.total += Number(row.count);
  }

  return counts;
}

// ─── Article Update ───

/**
 * Update article fields (for admin editing)
 */
export async function updateArticle(
  articleId: number,
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    author?: string;
    readTime?: number;
    tags?: string;
    categoryId?: number;
  }
) {
  const db = await getDb();
  if (!db) return;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.readTime !== undefined) updateData.readTime = data.readTime;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  if (Object.keys(updateData).length === 0) return;

  await db.update(articles).set(updateData).where(eq(articles.id, articleId));
}

/**
 * Get a single article by ID (for admin editing)
 */
export async function getArticleById(articleId: number) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}

// ─── Source CRUD ───

/**
 * Create a new source
 */
export async function createSource(data: {
  name: string;
  url: string;
  rssUrl?: string;
  categoryId: number;
  language?: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(sources).values({
    name: data.name,
    url: data.url,
    rssUrl: data.rssUrl || null,
    categoryId: data.categoryId,
    language: data.language || "en",
    isActive: true,
  });
}

/**
 * Update an existing source
 */
export async function updateSource(
  sourceId: number,
  data: {
    name?: string;
    url?: string;
    rssUrl?: string;
    categoryId?: number;
    language?: string;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.rssUrl !== undefined) updateData.rssUrl = data.rssUrl;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  if (Object.keys(updateData).length === 0) return;

  await db.update(sources).set(updateData).where(eq(sources.id, sourceId));
}

/**
 * Delete a source
 */
export async function deleteSource(sourceId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(sources).where(eq(sources.id, sourceId));
}
