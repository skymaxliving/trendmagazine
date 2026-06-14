/**
 * Manual full scrape runner.
 * Run: pnpm exec tsx --env-file=.env.local scripts/run-scrape.ts
 */
import { runScraper } from "../server/scraper";

const maxPerSource = Number(process.env.MAX_PER_SOURCE ?? 3);
const autoPublish = process.env.AUTO_PUBLISH !== "false"; // default true

console.log(`[run-scrape] start — maxPerSource=${maxPerSource}, autoPublish=${autoPublish}`);
const result = await runScraper({ maxArticlesPerSource: maxPerSource, autoPublish });
console.log("[run-scrape] DONE:", JSON.stringify(result));
process.exit(0);
