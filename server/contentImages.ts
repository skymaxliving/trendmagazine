/**
 * In-body article images — magazine style.
 * Extracts relevant photos from the original article page (gallery), with an
 * Unsplash fallback, and inserts them as <figure> blocks between paragraphs.
 * Images are embedded directly into the content HTML (crawlable, no schema change).
 */
import { isImageUrl, absolutize, decodeEntities } from "./originalImage";

function normalizeKey(url: string): string {
  return url.split("?")[0].toLowerCase();
}

const JUNK =
  /logo|icon|avatar|sprite|pixel|1x1|placeholder|blank|spacer|ad[-_/.]|advert|banner|button|emoji|favicon|gravatar|doubleclick|analytics|tracking|badge|widget|share|social|thumb|/i;

/** Reject small images (related-article thumbnails, etc.) by URL size hints. */
function urlTooSmall(url: string): boolean {
  const w = url.match(/[?&](?:w|width)=(\d+)/i);
  const h = url.match(/[?&](?:h|height)=(\d+)/i);
  if (w && parseInt(w[1], 10) < 600) return true;
  if (h && parseInt(h[1], 10) < 400) return true;
  // path patterns like -310x237 or /150x150/
  const dim = url.match(/[-_/](\d{2,4})x(\d{2,4})(?:[-_./]|$)/);
  if (dim && (parseInt(dim[1], 10) < 500 || parseInt(dim[2], 10) < 320)) return true;
  return false;
}

/** Trim the HTML to the article body (drop trailing "related/recommended" widgets). */
function articleBodyOnly(html: string): string {
  const lower = html.toLowerCase();
  const markers = [
    "you may also",
    "you might also",
    "read more from",
    "more from",
    "related articles",
    "related stories",
    "recommended for you",
    "most popular",
    "most read",
    "up next",
    "trending now",
    "newsletter",
    "sign up",
    "<footer",
  ];
  let cut = html.length;
  for (const mk of markers) {
    const i = lower.indexOf(mk);
    if (i > 3000 && i < cut) cut = i; // only cut well past the article start
  }
  return html.slice(0, cut);
}

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
    const html = articleBodyOnly(await res.text());

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
      if (urlTooSmall(abs)) continue;

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
 * Enrich article content with in-body images — ONLY real photos from the
 * original article's body (large, not related-article thumbnails). If none
 * qualify, the article stays text-only (better than irrelevant stock).
 * Short articles (<4 paragraphs) are left untouched.
 */
export async function enrichContentWithImages(opts: {
  content: string;
  originalUrl: string;
  heroImage: string | null;
  tags: string | null;
}): Promise<string> {
  const { content, originalUrl, heroImage } = opts;
  const paraCount = (content.match(/<\/p>/gi) || []).length;
  if (paraCount < 4) return content;

  const desired = paraCount >= 7 ? 3 : 2;
  const images = await extractContentImages(originalUrl, heroImage, desired);
  return insertImages(content, images.slice(0, desired));
}
