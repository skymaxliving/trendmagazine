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

const rows = await sql<
  { id: number; content: string; image: string | null; originalUrl: string; tags: string | null }[]
>`
  SELECT id, content, image, "originalUrl", tags FROM articles
  WHERE status = 'published'
    AND content IS NOT NULL
    AND "originalUrl" IS NOT NULL
    AND content NOT ILIKE '%<figure%'
  ORDER BY id
  ${limit ? sql`LIMIT ${limit}` : sql``}
`;
console.log(`[backfill-imgs] ${rows.length} článků k obohacení${limit ? ` (limit ${limit})` : ""}...`);

let updated = 0;
let skipped = 0;
let idx = 0;
const CONCURRENCY = 5;

async function worker() {
  while (idx < rows.length) {
    const r = rows[idx++];
    try {
      const enriched = await enrichContentWithImages({
        content: r.content,
        originalUrl: r.originalUrl,
        heroImage: r.image,
        tags: r.tags,
      });
      if (enriched !== r.content && enriched.includes("<figure")) {
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
