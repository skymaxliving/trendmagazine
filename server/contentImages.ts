/**
 * In-body article images — magazine style.
 * Extracts relevant photos from the original article page (gallery), with an
 * Unsplash fallback, and inserts them as <figure> blocks between paragraphs.
 * Images are embedded directly into the content HTML (crawlable, no schema change).
 */
import { isImageUrl, absolutize, decodeEntities } from "./originalImage";
import { searchUnsplashPhotos } from "./imageService";

function normalizeKey(url: string): string {
  return url.split("?")[0].toLowerCase();
}

const JUNK =
  /logo|icon|avatar|sprite|pixel|1x1|placeholder|blank|spacer|ad[-_/.]|advert|banner|button|emoji|favicon|gravatar|doubleclick|analytics|tracking|badge|widget|share|social/i;

/** Extract relevant content images from the original article page. */
export async function extractContentImages(
  articleUrl: string,
  exclude: string | null,
  max = 3
): Promise<string[]> {
  try {
    const res = await fetch(articleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TrendMagazine/1.0; +https://trendmagazine.cz)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) return [];
    const html = await res.text();

    const found: string[] = [];
    const seen = new Set<string>();
    if (exclude) seen.add(normalizeKey(exclude));

    const imgRe = /<img\b[^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = imgRe.exec(html)) !== null && found.length < max) {
      const tag = m[0];
      const src = (tag.match(/\b(?:data-src|data-original|data-lazy-src|src)=["']([^"']+)["']/i) || [])[1];
      if (!src) continue;

      const abs = absolutize(decodeEntities(src.trim()), articleUrl);
      if (!isImageUrl(abs)) continue;
      const low = abs.toLowerCase();
      if (JUNK.test(low)) continue;
      if (/\.svg(\?|$)/.test(low)) continue;
      if (low.startsWith("data:")) continue;

      // Size filter via width/height attributes when present
      const w = parseInt((tag.match(/\bwidth=["']?(\d+)/i) || [])[1] || "0", 10);
      const h = parseInt((tag.match(/\bheight=["']?(\d+)/i) || [])[1] || "0", 10);
      if ((w && w < 300) || (h && h < 200)) continue;

      const key = normalizeKey(abs);
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(abs);
    }
    return found;
  } catch {
    return [];
  }
}

function figureHtml(url: string): string {
  return `<figure class="article-figure"><img src="${url}" alt="" loading="lazy" /></figure>`;
}

/** Insert <figure> images between paragraphs of the content HTML. */
export function insertImages(content: string, images: string[]): string {
  if (!images.length) return content;
  const paraCount = (content.match(/<\/p>/gi) || []).length;
  if (paraCount < 4) return content;

  const interval = Math.max(2, Math.floor(paraCount / (images.length + 1)));
  const parts = content.split(/(<\/p>)/i); // keep the </p> delimiters
  let result = "";
  let para = 0;
  let imgI = 0;

  for (const part of parts) {
    result += part;
    if (/<\/p>/i.test(part)) {
      para++;
      // don't place after the final paragraph
      if (imgI < images.length && para % interval === 0 && para < paraCount) {
        result += figureHtml(images[imgI]);
        imgI++;
      }
    }
  }
  return result;
}

/**
 * Enrich article content with in-body images: real gallery photos first,
 * then Unsplash fallback. Short articles (<4 paragraphs) are left untouched.
 */
export async function enrichContentWithImages(opts: {
  content: string;
  originalUrl: string;
  heroImage: string | null;
  tags: string | null;
}): Promise<string> {
  const { content, originalUrl, heroImage, tags } = opts;
  const paraCount = (content.match(/<\/p>/gi) || []).length;
  if (paraCount < 4) return content;

  const desired = paraCount >= 7 ? 3 : 2;

  let images = await extractContentImages(originalUrl, heroImage, desired);

  if (images.length < desired) {
    const query =
      (tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(" ") || "magazine";
    const extra = await searchUnsplashPhotos(query, desired - images.length);
    const seen = new Set([heroImage, ...images].filter(Boolean).map((u) => normalizeKey(u as string)));
    for (const u of extra) {
      if (!seen.has(normalizeKey(u))) {
        images.push(u);
        seen.add(normalizeKey(u));
      }
    }
  }

  return insertImages(content, images.slice(0, desired));
}
