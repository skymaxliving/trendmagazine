/**
 * Seed script (Postgres/Neon): categories + verified RSS sources.
 * Run: node --env-file=.env.local scripts/seed.mjs
 *
 * Idempotent: categories upsert by slug; sources inserted only if the
 * same name does not already exist.
 */
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required (run with: node --env-file=.env.local scripts/seed.mjs)");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

// ─── Categories (match frontend slugs) ───
const categoryRows = [
  { slug: "svet", name: "Svět", description: "Aktuální zprávy ze světa", color: "#1E293B", sortOrder: 1 },
  { slug: "business", name: "Business", description: "Podnikání, ekonomika a finance", color: "#92400E", sortOrder: 2 },
  { slug: "akcie", name: "Akciové trhy", description: "Investice, burzy, krypto a komodity", color: "#334155", sortOrder: 3 },
  { slug: "technologie", name: "AI & Technologie", description: "Umělá inteligence, inovace a tech novinky", color: "#0F766E", sortOrder: 4 },
  { slug: "auta", name: "Auta & Mobilita", description: "Automobilový průmysl a budoucnost dopravy", color: "#475569", sortOrder: 5 },
  { slug: "stavebnictvi", name: "Stavebnictví", description: "Moderní stavebnictví, architektura a bydlení", color: "#78350F", sortOrder: 6 },
  { slug: "zdravi", name: "Zdraví & Fitness", description: "Zdravý životní styl, cvičení a výživa", color: "#166534", sortOrder: 7 },
  { slug: "celebrity", name: "Celebrity & Influenceři", description: "Ze světa celebrit a influencerů", color: "#7E22CE", sortOrder: 8 },
  { slug: "cestovani", name: "Cestování", description: "Destinace, tipy na výlety a cestovatelský lifestyle", color: "#0369A1", sortOrder: 9 },
];

// ─── Verified RSS sources (HTTP 200, valid feeds) ───
const sourceRows = [
  // Svět
  { name: "BBC World News", rss: "https://feeds.bbci.co.uk/news/world/rss.xml", cat: "svet" },
  { name: "Al Jazeera", rss: "https://www.aljazeera.com/xml/rss/all.xml", cat: "svet" },
  { name: "NPR World", rss: "https://feeds.npr.org/1004/rss.xml", cat: "svet" },
  { name: "The Guardian World", rss: "https://www.theguardian.com/world/rss", cat: "svet" },
  { name: "France24 English", rss: "https://www.france24.com/en/rss", cat: "svet" },
  { name: "Deutsche Welle", rss: "https://rss.dw.com/rdf/rss-en-all", cat: "svet" },
  { name: "Euronews", rss: "https://www.euronews.com/rss", cat: "svet" },
  { name: "WSJ World News", rss: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", cat: "svet" },
  // Business
  { name: "Bloomberg Markets", rss: "https://feeds.bloomberg.com/markets/news.rss", cat: "business" },
  { name: "WSJ Markets", rss: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", cat: "business" },
  { name: "WSJ Business", rss: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml", cat: "business" },
  { name: "MarketWatch", rss: "https://feeds.marketwatch.com/marketwatch/topstories/", cat: "business" },
  { name: "CNBC", rss: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", cat: "business" },
  { name: "Forbes Innovation", rss: "https://www.forbes.com/innovation/feed2", cat: "business" },
  { name: "Seeking Alpha", rss: "https://seekingalpha.com/market_currents.xml", cat: "business" },
  // Akcie, Krypto & Komodity
  { name: "CoinDesk", rss: "https://www.coindesk.com/arc/outboundfeeds/rss/", cat: "akcie" },
  { name: "OilPrice.com", rss: "https://oilprice.com/rss/main", cat: "akcie" },
  { name: "Investing.com Gold", rss: "https://www.investing.com/rss/news_301.rss", cat: "akcie" },
  { name: "Investing.com Commodities", rss: "https://www.investing.com/rss/news_25.rss", cat: "akcie" },
  { name: "Investing.com Crypto", rss: "https://www.investing.com/rss/news_14.rss", cat: "akcie" },
  // AI & Technologie
  { name: "TechCrunch", rss: "https://techcrunch.com/feed/", cat: "technologie" },
  { name: "The Verge", rss: "https://www.theverge.com/rss/index.xml", cat: "technologie" },
  { name: "MIT Technology Review", rss: "https://www.technologyreview.com/feed/", cat: "technologie" },
  { name: "Wired", rss: "https://www.wired.com/feed/rss", cat: "technologie" },
  { name: "VentureBeat", rss: "https://venturebeat.com/feed/", cat: "technologie" },
  { name: "CNET", rss: "https://www.cnet.com/rss/all/", cat: "technologie" },
  { name: "Ars Technica", rss: "https://feeds.arstechnica.com/arstechnica/index", cat: "technologie" },
  { name: "WSJ Tech", rss: "https://feeds.a.dj.com/rss/RSSWSJD.xml", cat: "technologie" },
  // Auta
  { name: "Motor1", rss: "https://www.motor1.com/rss/news/all/", cat: "auta" },
  { name: "Electrek", rss: "https://electrek.co/feed/", cat: "auta" },
  { name: "Car and Driver", rss: "https://www.caranddriver.com/rss/all.xml/", cat: "auta" },
  { name: "InsideEVs", rss: "https://insideevs.com/rss/news/all/", cat: "auta" },
  { name: "Autocar", rss: "https://www.autocar.co.uk/rss", cat: "auta" },
  { name: "Jalopnik", rss: "https://jalopnik.com/rss", cat: "auta" },
  // Stavebnictví & Architektura
  { name: "Dezeen", rss: "https://www.dezeen.com/feed/", cat: "stavebnictvi" },
  { name: "ArchDaily", rss: "https://www.archdaily.com/feed", cat: "stavebnictvi" },
  { name: "Architectural Digest", rss: "https://www.architecturaldigest.com/feed/rss", cat: "stavebnictvi" },
  { name: "Designboom", rss: "https://www.designboom.com/feed/", cat: "stavebnictvi" },
  { name: "Dwell", rss: "https://www.dwell.com/feed", cat: "stavebnictvi" },
  { name: "Curbed", rss: "https://www.curbed.com/rss/index.xml", cat: "stavebnictvi" },
  // Zdraví & Fitness
  { name: "Healthline", rss: "https://www.healthline.com/rss/health-news", cat: "zdravi" },
  { name: "Men's Health", rss: "https://www.menshealth.com/rss/all.xml/", cat: "zdravi" },
  { name: "Women's Health", rss: "https://www.womenshealthmag.com/rss/all.xml/", cat: "zdravi" },
  { name: "Well+Good", rss: "https://www.wellandgood.com/feed/", cat: "zdravi" },
  { name: "Runner's World", rss: "https://www.runnersworld.com/rss/all.xml/", cat: "zdravi" },
  { name: "Prevention", rss: "https://www.prevention.com/rss/all.xml/", cat: "zdravi" },
  { name: "GQ", rss: "https://www.gq.com/feed/rss", cat: "zdravi" },
  // Celebrity & Entertainment
  { name: "TMZ", rss: "https://www.tmz.com/rss.xml", cat: "celebrity" },
  { name: "E! Online", rss: "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml", cat: "celebrity" },
  { name: "Hollywood Reporter", rss: "https://www.hollywoodreporter.com/feed/", cat: "celebrity" },
  { name: "Variety", rss: "https://variety.com/feed/", cat: "celebrity" },
  { name: "US Magazine", rss: "https://www.usmagazine.com/feed/", cat: "celebrity" },
  // Cestování
  { name: "Skift", rss: "https://skift.com/feed/", cat: "cestovani" },
  { name: "Matador Network", rss: "https://matadornetwork.com/feed/", cat: "cestovani" },
  { name: "Condé Nast Traveler", rss: "https://www.cntraveler.com/feed/rss", cat: "cestovani" },
  { name: "The Points Guy", rss: "https://thepointsguy.com/feed/", cat: "cestovani" },
  { name: "Nomadic Matt", rss: "https://www.nomadicmatt.com/feed/", cat: "cestovani" },
];

async function seed() {
  console.log("🌱 Seeding categories...");
  for (const c of categoryRows) {
    await sql`
      INSERT INTO categories (slug, name, description, color, "sortOrder")
      VALUES (${c.slug}, ${c.name}, ${c.description}, ${c.color}, ${c.sortOrder})
      ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            color = EXCLUDED.color,
            "sortOrder" = EXCLUDED."sortOrder"
    `;
  }
  console.log(`  ✓ ${categoryRows.length} kategorií`);

  // Map category slug → id
  const cats = await sql`SELECT id, slug FROM categories`;
  const catMap = Object.fromEntries(cats.map((r) => [r.slug, r.id]));

  // Existing source names (idempotency)
  const existing = await sql`SELECT name FROM sources`;
  const existingNames = new Set(existing.map((r) => r.name));

  console.log("🌱 Seeding sources...");
  let added = 0;
  for (const s of sourceRows) {
    if (existingNames.has(s.name)) continue;
    const categoryId = catMap[s.cat] ?? null;
    const url = new URL(s.rss).origin;
    await sql`
      INSERT INTO sources (name, url, "rssUrl", "categoryId", language, "isActive")
      VALUES (${s.name}, ${url}, ${s.rss}, ${categoryId}, 'en', true)
    `;
    added++;
  }
  console.log(`  ✓ ${added} nových zdrojů (${sourceRows.length} celkem v seznamu)`);

  console.log("✅ Seed complete!");
  await sql.end();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await sql.end();
  process.exit(1);
});
