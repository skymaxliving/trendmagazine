/**
 * Article Scraper Engine
 * 
 * Fetches articles from configured sources via RSS feeds or web scraping.
 * Each article is then passed to the AI pipeline for translation/rewriting.
 */
import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { articles, sources, categories } from "../drizzle/schema";
import { rewriteArticle } from "./aiPipeline";
import { getArticleImage } from "./imageService";
import { imageFromRssItem, fetchOgImage } from "./originalImage";
import { enrichContentWithImages } from "./contentImages";
import { eq, and, isNotNull } from "drizzle-orm";

// Simple XML parser for RSS feeds (no external dependency needed)
function parseRSSItems(xml: string): Array<{
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  rawXml: string;
}> {
  const items: Array<{ title: string; link: string; description: string; pubDate?: string; rawXml: string }> = [];
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
        pubDate: pubDate || undefined,
        rawXml: itemXml,
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200)
    .replace(/^-|-$/g, "");
}

/**
 * Fetch articles from a single RSS source
 */
async function fetchRSSArticles(source: {
  id: number;
  name: string;
  rssUrl: string;
  categoryId: number | null;
  language: string;
}): Promise<Array<{
  title: string;
  excerpt: string;
  originalUrl: string;
  sourceId: number;
  categoryId: number | null;
  pubDate?: string;
  image: string | null;
}>> {
  try {
    console.log(`[Scraper] Fetching RSS from ${source.name}: ${source.rssUrl}`);
    const response = await fetch(source.rssUrl, {
      headers: {
        "User-Agent": "TrendMagazine/1.0 (https://trendmagazine.cz)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(15000),
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
      image: imageFromRssItem(item.rawXml),
    }));
  } catch (error) {
    console.error(`[Scraper] Error fetching ${source.name}:`, error);
    return [];
  }
}

/**
 * Check if an article with this original URL already exists
 */
async function articleExists(originalUrl: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // If no DB, skip

  const result = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.originalUrl, originalUrl))
    .limit(1);

  return result.length > 0;
}

/**
 * Save a processed article to the database
 */
async function saveArticle(article: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  readTime: number;
  tags: string;
  categoryId: number;
  sourceId: number;
  originalUrl: string;
  originalTitle: string;
  status: "draft" | "published";
  publishedAt: Date | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Ensure slug is unique by appending a random suffix if needed
  let slug = article.slug;
  const existingSlug = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);

  if (existingSlug.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await db.insert(articles).values({
    ...article,
    slug,
    image: article.image || null,
    featured: false,
  });

  console.log(`[Scraper] Saved article: ${article.title.slice(0, 60)}...`);
}

/**
 * Main scraping function: fetches from all active RSS sources,
 * translates/rewrites via AI, and saves to database.
 */
export async function runScraper(options?: {
  maxArticlesPerSource?: number;
  autoPublish?: boolean;
  onlySourceIds?: number[];
}): Promise<{ total: number; saved: number; errors: number }> {
  const maxPerSource = options?.maxArticlesPerSource ?? 3;
  const autoPublish = options?.autoPublish ?? false;

  const db = await getDb();
  if (!db) {
    console.error("[Scraper] Database not available");
    return { total: 0, saved: 0, errors: 0 };
  }

  console.log("[Scraper] Starting scrape run...");

  // Get all active sources with RSS feeds
  let activeSources = await db
    .select()
    .from(sources)
    .where(and(eq(sources.isActive, true), isNotNull(sources.rssUrl)));

  // Optional: limit to specific source IDs (e.g. newly added sources)
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
        language: source.language,
      });

      for (const raw of rawArticles.slice(0, maxPerSource)) {
        total++;

        // Skip if already exists
        if (await articleExists(raw.originalUrl)) {
          console.log(`[Scraper] Skipping duplicate: ${raw.title.slice(0, 50)}...`);
          continue;
        }

        try {
          // AI rewrite and translate to Czech
          const rewritten = await rewriteArticle({
            title: raw.title,
            excerpt: raw.excerpt,
            sourceLanguage: source.language,
            sourceName: source.name,
          });

          if (!rewritten) {
            console.warn(`[Scraper] AI rewrite failed for: ${raw.title.slice(0, 50)}...`);
            errors++;
            continue;
          }

          const slug = generateSlug(rewritten.title);
          const publishedAt = raw.pubDate ? new Date(raw.pubDate) : new Date();

          // Image strategy: original publisher image first (RSS media → og:image),
          // then Unsplash topical fallback. No automatic AI generation — that is
          // an on-demand admin action ("replace image").
          let imageUrl: string | null = raw.image ?? null;
          if (!imageUrl) {
            try {
              imageUrl = await fetchOgImage(raw.originalUrl);
            } catch {
              /* ignore */
            }
          }
          if (!imageUrl) {
            try {
              imageUrl = await getArticleImage({
                title: rewritten.title,
                excerpt: rewritten.excerpt,
                tags: rewritten.tags,
              });
            } catch (imgErr) {
              console.warn(`[Scraper] Image fallback failed for: ${rewritten.title.slice(0, 50)}...`, imgErr);
            }
          }

          // Enrich body with in-text images (real gallery photos → Unsplash)
          let finalContent = rewritten.content;
          try {
            finalContent = await enrichContentWithImages({
              content: rewritten.content,
              originalUrl: raw.originalUrl,
              heroImage: imageUrl,
              tags: rewritten.tags,
            });
          } catch {
            /* keep plain content on failure */
          }

          await saveArticle({
            slug,
            title: rewritten.title,
            excerpt: rewritten.excerpt,
            content: finalContent,
            image: imageUrl || undefined,
            author: "Redakce TM",
            readTime: rewritten.readTime,
            tags: rewritten.tags,
            categoryId: raw.categoryId || 1,
            sourceId: raw.sourceId,
            originalUrl: raw.originalUrl,
            originalTitle: raw.title,
            status: autoPublish ? "published" : "draft",
            publishedAt: autoPublish ? publishedAt : null,
          });

          saved++;
        } catch (err) {
          console.error(`[Scraper] Error processing article: ${raw.title.slice(0, 50)}...`, err);
          errors++;
        }
      }

      // Update last scraped timestamp
      await db
        .update(sources)
        .set({ lastScrapedAt: new Date() })
        .where(eq(sources.id, source.id));
    } catch (err) {
      console.error(`[Scraper] Error with source ${source.name}:`, err);
      errors++;
    }
  }

  console.log(`[Scraper] Complete: ${total} found, ${saved} saved, ${errors} errors`);
  return { total, saved, errors };
}
