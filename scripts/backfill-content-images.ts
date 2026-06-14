/**
 * Backfill in-body images for existing articles that don't have any yet.
 * Run: pnpm exec tsx --env-file=.env.local scripts/backfill-content-images.ts
 * Optional: LIMIT=3 to test on the first N.
 */
import postgres from "postgres";
import { enrichContentWithImages } from "../server/contentImages";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL required");
  process.exit(1);
}
const sql = postgres(DATABASE_URL, { prepare: false });

const limit = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;

// Reprocess ALL articles: strip any existing (possibly bad) figures, then
// re-insert only strictly-validated real images.
const rows = await sql<
  { id: number; content: string; image: string | null; originalUrl: string; tags: string | null }[]
>`
  SELECT id, content, image, "originalUrl", tags FROM articles
  WHERE status = 'published'
    AND content IS NOT NULL
    AND "originalUrl" IS NOT NULL
  ORDER BY id
  ${limit ? sql`LIMIT ${limit}` : sql``}
`;
console.log(`[backfill-imgs] ${rows.length} článků k přegenerování${limit ? ` (limit ${limit})` : ""}...`);

const stripFigures = (html: string) =>
  html.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "").replace(/\s{3,}/g, " ");

let updated = 0;
let skipped = 0;
let idx = 0;
const CONCURRENCY = 5;

async function worker() {
  while (idx < rows.length) {
    const r = rows[idx++];
    try {
      const base = stripFigures(r.content);
      const enriched = await enrichContentWithImages({
        content: base,
        originalUrl: r.originalUrl,
        heroImage: r.image,
        tags: r.tags,
      });
      if (enriched !== r.content) {
        await sql`UPDATE articles SET content = ${enriched} WHERE id = ${r.id}`;
        updated++;
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
    if ((updated + skipped) % 20 === 0) {
      console.log(`  …${updated + skipped}/${rows.length} (obohaceno ${updated})`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`[backfill-imgs] HOTOVO — obohaceno ${updated}, beze změny ${skipped}`);
await sql.end();
process.exit(0);
