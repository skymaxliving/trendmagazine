/**
 * Manual full scrape runner.
 * Run: pnpm exec tsx --env-file=.env.local scripts/run-scrape.ts
 */
import { runScraper } from "../server/scraper";

const maxPerSource = Number(process.env.MAX_PER_SOURCE ?? 3);
const autoPublish = process.env.AUTO_PUBLISH !== "false"; // default true
const onlySourceIds = process.env.SOURCE_IDS
  ? process.env.SOURCE_IDS.split(",").map((s) => Number(s.trim())).filter(Boolean)
  : undefined;

console.log(`[run-scrape] start — maxPerSource=${maxPerSource}, autoPublish=${autoPublish}${onlySourceIds ? `, onlySourceIds=[${onlySourceIds}]` : ""}`);
const result = await runScraper({ maxArticlesPerSource: maxPerSource, autoPublish, onlySourceIds });
console.log("[run-scrape] DONE:", JSON.stringify(result));
process.exit(0);
