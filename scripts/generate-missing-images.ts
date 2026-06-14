/**
 * Generate AI (Gemini) images for articles that have no image, store on R2.
 * Run: pnpm exec tsx --env-file=.env.local scripts/generate-missing-images.ts
 * Optional: LIMIT=3 to only do the first N (for testing).
 */
import postgres from "postgres";
import { generateArticleImage } from "../server/imageGen";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL required");
  process.exit(1);
}
const sql = postgres(DATABASE_URL, { prepare: false });

const limit = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;

const rows = await sql<{ id: number; title: string; excerpt: string | null }[]>`
  SELECT id, title, excerpt FROM articles
  WHERE image IS NULL
  ORDER BY id
  ${limit ? sql`LIMIT ${limit}` : sql``}
`;
console.log(`[gen] ${rows.length} článků bez obrázku${limit ? ` (limit ${limit})` : ""}...`);

let done = 0;
let failed = 0;
for (const r of rows) {
  const url = await generateArticleImage({ title: r.title, excerpt: r.excerpt ?? undefined });
  if (url) {
    await sql`UPDATE articles SET image = ${url} WHERE id = ${r.id}`;
    done++;
    console.log(`  ✓ #${r.id} ${r.title.slice(0, 50)}`);
  } else {
    failed++;
    console.log(`  ✗ #${r.id} (generování selhalo)`);
  }
}

console.log(`[gen] HOTOVO — vygenerováno ${done}, selhalo ${failed}`);
await sql.end();
process.exit(0);
