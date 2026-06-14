/**
 * Add new categories (Sport, Modelky) and their RSS sources.
 * Idempotent. Run: pnpm exec tsx --env-file=.env.local scripts/add-sources.ts
 */
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL required"); process.exit(1); }
const sql = postgres(DATABASE_URL, { prepare: false });

const newCategories = [
  { slug: "sport", name: "Sport", description: "Basketbal, americký fotbal, baseball a další sport ze zámoří", color: "#1D4ED8", sortOrder: 10 },
  { slug: "beauty", name: "Beauty & Fashion", description: "Krása, móda, modelky a lifestyle", color: "#BE185D", sortOrder: 11 },
];

const newSources = [
  // Sport
  { name: "CBS Sports NBA", rss: "https://www.cbssports.com/rss/headlines/nba/", cat: "sport" },
  { name: "CBS Sports NFL", rss: "https://www.cbssports.com/rss/headlines/nfl/", cat: "sport" },
  { name: "CBS Sports MLB", rss: "https://www.cbssports.com/rss/headlines/mlb/", cat: "sport" },
  { name: "Yardbarker NBA", rss: "https://www.yardbarker.com/rss/sport/1", cat: "sport" },
  { name: "Yardbarker MLB", rss: "https://www.yardbarker.com/rss/sport/3", cat: "sport" },
  // Modelky
  { name: "Maxim", rss: "https://www.maxim.com/feed/", cat: "beauty" },
];

console.log("🌱 Kategorie...");
for (const c of newCategories) {
  await sql`
    INSERT INTO categories (slug, name, description, color, "sortOrder")
    VALUES (${c.slug}, ${c.name}, ${c.description}, ${c.color}, ${c.sortOrder})
    ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name, description = EXCLUDED.description,
          color = EXCLUDED.color, "sortOrder" = EXCLUDED."sortOrder"
  `;
  console.log(`  ✓ ${c.name}`);
}

const cats = await sql`SELECT id, slug FROM categories`;
const catMap = Object.fromEntries(cats.map((r) => [r.slug, r.id]));
const existing = new Set((await sql`SELECT name FROM sources`).map((r) => r.name));

console.log("🌱 Zdroje...");
const addedIds: number[] = [];
for (const s of newSources) {
  if (existing.has(s.name)) { console.log(`  – ${s.name} (už existuje)`); continue; }
  const url = new URL(s.rss).origin;
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO sources (name, url, "rssUrl", "categoryId", language, "isActive")
    VALUES (${s.name}, ${url}, ${s.rss}, ${catMap[s.cat]}, 'en', true)
    RETURNING id
  `;
  addedIds.push(row.id);
  console.log(`  ✓ ${s.name} → ${s.cat} (id ${row.id})`);
}

console.log(`\n✅ Hotovo. Nové source IDs: [${addedIds.join(", ")}]`);
await sql.end();
process.exit(0);
