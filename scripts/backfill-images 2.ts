/**
 * Backfill original (og:image) images for articles that have none.
 * Run: pnpm exec tsx --env-file=.env.local scripts/backfill-images.ts
 */
import postgres from "postgres";
import { fetchOgImage } from "../server/originalImage";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL required");
  process.exit(1);
}
const sql = postgres(DATABASE_URL, { prepare: false });

const CONCURRENCY = 8;

const rows = await sql<{ id: number; originalUrl: string }[]>`
  SELECT id, "originalUrl" FROM articles
  WHERE image IS NULL AND "originalUrl" IS NOT NULL
  ORDER BY id
`;
console.log(`[backfill] ${rows.length} článků bez obrázku k doplnění...`);

let updated = 0;
let missed = 0;
let idx = 0;

async function worker() {
  while (idx < rows.length) {
    const row = rows[idx++];
    const img = await fetchOgImage(row.originalUrl);
    if (img) {
      await sql`UPDATE articles SET image = ${img} WHERE id = ${row.id}`;
      updated++;
    } else {
      missed++;
    }
    if ((updated + missed) % 20 === 0) {
      console.log(`  …${updated + missed}/${rows.length} (nalezeno ${updated})`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`[backfill] HOTOVO — doplněno ${updated}, bez og:image ${missed}`);
await sql.end();
process.exit(0);
