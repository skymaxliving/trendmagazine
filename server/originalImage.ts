/**
 * Original article image extraction.
 *
 * Strategy: prefer the publisher's own image — first from RSS media tags
 * (media:content / media:thumbnail / enclosure), then the article page's
 * og:image / twitter:image. These are the images publishers expose for
 * sharing/previews, so hotlinking them is the lowest-risk, most relevant
 * option for an aggregator. We only store the URL (no copy).
 */

/** Extract an image URL from a single RSS <item> XML blob, if present. */
export function imageFromRssItem(itemXml: string): string | null {
  // <media:content url="..."> or <media:thumbnail url="...">
  const media = itemXml.match(
    /<media:(?:content|thumbnail)[^>]*\burl=["']([^"']+)["']/i
  );
  if (media && isImageUrl(media[1])) return decodeEntities(media[1]);

  // <enclosure url="..." type="image/..."> (type may come before or after url)
  const enclosure = itemXml.match(/<enclosure\b[^>]*>/i)?.[0];
  if (enclosure && /type=["']image\//i.test(enclosure)) {
    const url = enclosure.match(/\burl=["']([^"']+)["']/i);
    if (url) return decodeEntities(url[1]);
  }

  // <image><url>...</url></image> (RSS) — rare at item level
  const img = itemXml.match(/<image[^>]*>[\s\S]*?<url>([\s\S]*?)<\/url>/i);
  if (img && isImageUrl(img[1])) return decodeEntities(img[1].trim());

  return null;
}

/** Fetch an article page and read its og:image / twitter:image. */
export async function fetchOgImage(articleUrl: string): Promise<string | null> {
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
    if (!res.ok) return null;

    // Only read the <head> portion to keep it light.
    const html = (await res.text()).slice(0, 200_000);

    const candidates = [
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];

    for (const re of candidates) {
      const m = html.match(re);
      if (m && m[1]) {
        const candidate = absolutize(decodeEntities(m[1].trim()), articleUrl);
        if (isImageUrl(candidate)) return candidate;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Best original image: RSS media first, then og:image fetch. */
export async function getOriginalImage(
  itemXml: string,
  articleUrl: string
): Promise<string | null> {
  const fromRss = imageFromRssItem(itemXml);
  if (fromRss) return fromRss;
  return fetchOgImage(articleUrl);
}

export function isImageUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  const u = url.toLowerCase();
  // Reject video players / embeds (e.g. a video article's og:image may be an
  // embed link, not a real image) and obvious non-image media.
  if (
    /youtube\.com\/(embed|watch)|youtu\.be|vimeo\.com|\/embed\/|player\.|\.mp4(\?|$)|\.m3u8(\?|$)/.test(u)
  ) {
    return false;
  }
  return true;
}

export function absolutize(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}
