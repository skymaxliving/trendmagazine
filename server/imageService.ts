/**
 * Image Service for Articles — topical fallback only.
 *
 * Primary image is the publisher's original (see server/originalImage.ts).
 * This module is the fallback when no original is available: it searches
 * Unsplash by topic. AI generation is intentionally NOT here — that is an
 * on-demand admin action (see server/imageGen.ts + the admin "replace image").
 */
const UNSPLASH_API_URL = "https://api.unsplash.com";

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  alt_description: string | null;
}

/**
 * Search Unsplash for a relevant photo based on keywords
 */
async function searchUnsplash(query: string): Promise<string | null> {
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
        "Accept-Version": "v1",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[ImageService] Unsplash search failed: ${response.status}`);
      return null;
    }

    const data = await response.json() as { results: UnsplashPhoto[] };
    
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      // Use the regular size (1080px wide) — good balance of quality and speed
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

/**
 * Extract search keywords from article title and tags
 * Converts Czech title to English-friendly search terms
 */
function extractSearchKeywords(title: string, tags: string): string {
  // Use tags first (they're more keyword-like), then title words
  const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
  
  if (tagList.length > 0) {
    // Take first 2-3 tags as search query
    return tagList.slice(0, 3).join(" ");
  }
  
  // Fallback to title — take key nouns
  return title.slice(0, 80);
}

/**
 * Get an image for an article — tries Unsplash first, then AI generation
 */
export async function getArticleImage(article: {
  title: string;
  excerpt: string;
  tags: string;
}): Promise<string | null> {
  const keywords = extractSearchKeywords(article.title, article.tags);
  const unsplashUrl = await searchUnsplash(keywords);
  if (unsplashUrl) return unsplashUrl;
  console.warn(`[ImageService] No fallback image for: "${article.title.slice(0, 50)}..."`);
  return null;
}

/** Fetch up to `count` topical Unsplash photos (for in-body images). */
export async function searchUnsplashPhotos(query: string, count: number): Promise<string[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey || count < 1) return [];
  try {
    const searchUrl = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=${Math.min(count, 5)}&orientation=landscape&content_filter=high`;
    const response = await fetch(searchUrl, {
      headers: { Authorization: `Client-ID ${apiKey}`, "Accept-Version": "v1" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: { urls?: { regular?: string } }[] };
    return (data.results || [])
      .map((p) => p.urls?.regular)
      .filter((u): u is string => !!u);
  } catch {
    return [];
  }
}
