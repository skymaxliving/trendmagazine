/**
 * Server-rendered SEO: injects per-page meta tags, Open Graph, Twitter cards,
 * Schema.org JSON-LD and crawlable content into the SPA shell. Crucial because
 * Seznam.cz (big in CZ) does not reliably render JavaScript — crawlers get real
 * HTML, while JS visitors still get the React app (createRoot clears #root).
 */

export const SITE = (process.env.SITE_URL || "https://trendmagazine.cz").replace(/\/+$/, "");
const NAME = "TrendMagazine.cz";

type ArticleLike = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  author?: string;
  tags?: string | null;
  publishedAt: Date | null;
  createdAt?: Date;
  category?: { name: string; slug: string } | null;
};

type CategoryLike = { slug: string; name: string; description: string | null };

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function stripTags(s: string | null | undefined): string {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}
function iso(d: Date | null | undefined): string | undefined {
  try {
    return d ? new Date(d).toISOString() : undefined;
  } catch {
    return undefined;
  }
}

function headTags(o: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
}): string {
  const t = esc(o.title);
  const d = esc(clip(o.description, 160));
  const url = esc(o.url);
  const img = o.image ? esc(o.image) : "";
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${o.type || "website"}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:locale" content="cs_CZ" />`,
    img ? `<meta property="og:image" content="${img}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    img ? `<meta name="twitter:image" content="${img}" />` : "",
    o.publishedTime ? `<meta property="article:published_time" content="${o.publishedTime}" />` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
}

/** Replace the static head SEO tags and inject crawlable body content. */
function inject(shell: string, headHtml: string, rootHtml: string): string {
  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/i, "");
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "");
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, "");
  html = html.replace(/<\/head>/i, `    ${headHtml}\n  </head>`);
  if (rootHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`);
  }
  return html;
}

function articleJsonLd(a: ArticleLike, url: string): string {
  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: clip(a.title, 110),
    image: a.image ? [a.image] : undefined,
    datePublished: iso(a.publishedAt) || iso(a.createdAt),
    dateModified: iso(a.createdAt) || iso(a.publishedAt),
    author: { "@type": "Organization", name: a.author || "Redakce TM" },
    publisher: {
      "@type": "Organization",
      name: NAME,
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.ico` },
    },
    description: clip(stripTags(a.excerpt), 200),
    articleBody: stripTags(a.content),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "cs-CZ",
  };
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

export function renderArticle(shell: string, a: ArticleLike): string {
  const url = `${SITE}/clanek/${a.slug}`;
  const desc = stripTags(a.excerpt) || stripTags(a.content) || a.title;
  const head =
    headTags({
      title: `${a.title} | ${NAME}`,
      description: desc,
      url,
      image: a.image,
      type: "article",
      publishedTime: iso(a.publishedAt),
    }) +
    "\n    " +
    articleJsonLd(a, url);
  const root = `<article><h1>${esc(a.title)}</h1>${
    a.image ? `<img src="${esc(a.image)}" alt="${esc(a.title)}" />` : ""
  }${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ""}${a.content || ""}${
    a.category ? `<p>Rubrika: <a href="${SITE}/kategorie/${a.category.slug}">${esc(a.category.name)}</a></p>` : ""
  }</article>`;
  return inject(shell, head, root);
}

export function renderCategory(shell: string, c: CategoryLike, articles: ArticleLike[]): string {
  const url = `${SITE}/kategorie/${c.slug}`;
  const head = headTags({
    title: `${c.name} – aktuální zprávy | ${NAME}`,
    description: c.description || `Nejnovější články v rubrice ${c.name} na ${NAME}.`,
    url,
  });
  const list = articles
    .map(
      (a) =>
        `<li><a href="${SITE}/clanek/${a.slug}">${esc(a.title)}</a>${
          a.excerpt ? ` – ${esc(clip(stripTags(a.excerpt), 120))}` : ""
        }</li>`
    )
    .join("");
  const root = `<section><h1>${esc(c.name)}</h1><p>${esc(c.description || "")}</p><ul>${list}</ul></section>`;
  return inject(shell, head, root);
}

export function renderHome(shell: string, articles: ArticleLike[]): string {
  const head = headTags({
    title: `${NAME} – Český magazín: svět, business, technologie, sport`,
    description:
      "Aktuální zprávy a články v češtině: svět, business, akcie a krypto, AI a technologie, auta, sport, zdraví a celebrity. TrendMagazine.cz.",
    url: SITE,
  });
  const list = articles
    .slice(0, 30)
    .map((a) => `<li><a href="${SITE}/clanek/${a.slug}">${esc(a.title)}</a></li>`)
    .join("");
  const root = `<section><h1>${NAME}</h1><p>Aktuální zprávy a články v češtině.</p><ul>${list}</ul></section>`;
  return inject(shell, head, root);
}

export function buildSitemap(
  articles: { slug: string; lastmod?: string }[],
  categories: { slug: string }[]
): string {
  const urls: string[] = [];
  const push = (loc: string, lastmod?: string, priority?: string) =>
    urls.push(
      `<url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}${
        priority ? `<priority>${priority}</priority>` : ""
      }</url>`
    );
  push(SITE, undefined, "1.0");
  for (const c of categories) push(`${SITE}/kategorie/${c.slug}`, undefined, "0.7");
  for (const a of articles) push(`${SITE}/clanek/${a.slug}`, a.lastmod, "0.8");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
    ""
  )}</urlset>`;
}

export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`;
}
