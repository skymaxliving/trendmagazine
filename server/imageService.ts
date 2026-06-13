/**
 * Image Service for Articles
 * 
 * Strategy:
 * 1. Try Unsplash API (free, real photos, relevant to content)
 * 2. Fall back to AI-generated image via Forge ImageService
 * 3. Last resort: return null (article will use category placeholder)
 */
import { generateImage } from "./_core/imageGeneration";
import { ENV } from "./_core/env";

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
 * Generate an AI image for an article
 */
async function generateAIImage(title: string, excerpt: string): Promise<string | null> {
  try {
    const prompt = `Professional editorial news photograph for article: "${title}". ${excerpt.slice(0, 100)}. Photorealistic, high quality, editorial magazine style, no text overlays.`;
    
    const result = await generateImage({ prompt });
    
    if (result.url) {
      console.log(`[ImageService] Generated AI image: ${result.url.slice(0, 80)}...`);
      return result.url;
    }
    
    return null;
  } catch (error) {
    console.warn("[ImageService] AI image generation error:", error);
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
  
  // 1. Try Unsplash
  const unsplashUrl = await searchUnsplash(keywords);
  if (unsplashUrl) {
    return unsplashUrl;
  }
  
  // 2. Fall back to AI generation
  const aiUrl = await generateAIImage(article.title, article.excerpt);
  if (aiUrl) {
    return aiUrl;
  }
  
  // 3. No image available
  console.warn(`[ImageService] No image found for: "${article.title.slice(0, 50)}..."`);
  return null;
}
