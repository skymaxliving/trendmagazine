/**
 * Add SEO-niche categories (Krimi, Filmy & Seriály) + sources. Idempotent.
 * Run: pnpm exec tsx --env-file=.env.local scripts/add-sources-2.ts
 */
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL required"); process.exit(1); }
const sql = postgres(DATABASE_URL, { prepare: false });

const newCategories = [
  { slug: "krimi", name: "Krimi & True Crime", description: "Kriminální případy, soudní dramata a true crime ze světa", color: "#7F1D1D", sortOrder: 12 },
  { slug: "filmy", name: "Filmy & Seriály", description: "Novinky ze streamingu, filmů a seriálů — Netflix, Disney+, premiéry a recenze", color: "#4338CA", sortOrder: 13 },
];

const newSources = [
  { name: "Law & Crime", rss: "https://lawandcrime.com/feed/", cat: "krimi" },
  { name: "CrimeOnline", rss: "https://www.crimeonline.com/feed/", cat: "krimi" },
  { name: "Oxygen True Crime", rss: "https://www.oxygen.com/rss.xml", cat: "krimi" },
  { name: "Collider", rss: "https://collider.com/feed/", cat: "filmy" },
  { name: "ScreenRant", rss: "https://screenrant.com/feed/", cat: "filmy" },
  { name: "SlashFilm", rss: "https://www.slashfilm.com/feed/", cat: "filmy" },
  { name: "Deadline", rss: "https://deadline.com/feed/", cat: "filmy" },
];

for (const c of newCategories) {
  await sql`
    INSERT INTO categories (slug, name, description, color, "sortOrder")
    VALUES (${c.slug}, ${c.name}, ${c.description}, ${c.color}, ${c.sortOrder})
    ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name, description = EXCLUDED.description,
          color = EXCLUDED.color, "sortOrder" = EXCLUDED."sortOrder"
  `;
  console.log(`✓ kategorie ${c.name}`);
}

const cats = await sql`SELECT id, slug FROM categories`;
const catMap = Object.fromEntries(cats.map((r) => [r.slug, r.id]));
const existing = new Set((await sql`SELECT name FROM sources`).map((r) => r.name));

const addedIds: number[] = [];
for (const s of newSources) {
  if (existing.has(s.name)) { console.log(`– ${s.name} (existuje)`); continue; }
  const url = new URL(s.rss).origin;
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO sources (name, url, "rssUrl", "categoryId", language, "isActive")
    VALUES (${s.name}, ${url}, ${s.rss}, ${catMap[s.cat]}, 'en', true)
    RETURNING id
  `;
  addedIds.push(row.id);
  console.log(`✓ zdroj ${s.name} → ${s.cat} (id ${row.id})`);
}

console.log(`\n✅ Nové source IDs: [${addedIds.join(", ")}]`);
await sql.end();
process.exit(0);
