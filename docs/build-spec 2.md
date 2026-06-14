# Build spec — trendmagazine

Řídicí dokument migrace. **Adaptujeme existující repo** (`client/server/shared`), neděláme scaffold od nuly ani přestavbu do monorepa. Kód už existuje a běžel na Manusu — úkol je odpojit Manus a přemigrovat infru. Manus vrstva je izolovaná v `server/_core/`, `shared/_core/` a `vite-plugin-manus-runtime`.

## 1. Produkt

Automatizovaný český magazín. RSS (EN) → AI přepis/překlad do CZ → obrázek → **auto-publikace** → web. Monetizace AdSense. 8 kategorií.

## 2. Datový model (port z `schema.ts`, mysql2 → pg)

Tabulky: `users`, `categories`, `sources`, `articles`.

**articles** (klíčová): `id` (serial PK), `slug` (unique), `title`, `excerpt`, `content` (HTML), `image`, `videoUrl?`, `author` (default „Redakce TM"), `readTime` (int 1–30), `tags` (CSV), `featured` (bool), `categoryId` (FK), `sourceId` (FK, nullable), `originalUrl` (dedup klíč), `originalTitle`, `status` (`draft|published|archived`), `publishedAt`, `createdAt`, `updatedAt`.

**sources**: `name`, `url`, `rssUrl`, `categoryId`, `language`, `isActive`, `scrapeIntervalMinutes`, `lastScrapedAt`.

**Migrace mysql→pg:** `mysqlTable`→`pgTable`, auto-increment→`serial`/`identity`, `mysqlEnum`→`pgEnum` (status), `datetime`→`timestamp`, hlídat délky `varchar`. Po portu vygenerovat Drizzle migrace a nasadit do Neon (`trendmagazine_prod`).

## 3. AI pipeline (port z `aiPipeline.ts` + `llm.ts`)

`rewriteArticle(input)` → JSON `{ title, excerpt, content, tags, readTime, imageDecision }`.

- **Odpojit Manus Forge** (`forge.manus.im`, `gemini-2.5-flash`) → **Anthropic SDK**, model **`claude-haiku-4-5-20251001`**, structured/JSON output.
- System prompt zachovat: NE 1:1 překlad, profesionální česká žurnalistika, „Zdroj: …", SEO český titulek, perex 1–2 věty, 3–6 HTML odstavců (`<p>/<h3>/<strong>/<em>`), české tagy, readTime (clamp 1–30, default 5).
- **Náklady:** krátké přepisy, ~10 čl./den → jednotky $/měsíc. Limit `maxArticlesPerSource=3`.

## 4. Strategie obrázků (port z `imageService.ts`, řeší „Tesla→truck")

Rozšířit `rewriteArticle` o `imageDecision`: `use_original | search_unsplash | generate` + krátké zdůvodnění. AI hodnotí relevanci **původního obrázku článku** (og:image / RSS `media:content` — Bloomberg, TMZ, Variety ho mají).

Pořadí výběru v `imageService`:
1. **`use_original`** — když je původní foto relevantní (zejm. veřejné osoby, reálné události). Uložit URL nebo kopii do **R2** (`trendmagazine-files`).
2. **`search_unsplash`** — topický fallback dle tagů (Unsplash free, hotlink `regular` 1080px).
3. **`generate`** — poslední možnost. **Editorial/abstraktní** prompt, NE doslovné objekty (jinak se opakuje záměna Tesla→truck). Volitelně lze úplně vypnout kvůli ceně. Uložit do R2.

Odpojit `imageGeneration.ts`/`storage.ts` z Manus Forge → R2 přes `@aws-sdk/client-s3` (R2 je S3-kompatibilní; endpoint/klíče v `.env.local`).

## 5. Kategorie + RSS zdroje (seed)

8 kategorií (slug · název): `svet`·Svět, `business`·Business & Finance, `akcie`·Akcie/Krypto/Komodity, `technologie`·AI & Technologie, `auta`·Auta, `stavebnictvi`·Stavebnictví & Architektura, `zdravi`·Zdraví & Fitness, `celebrity`·Celebrity & Entertainment. (+ volitelně `cestovani`·Cestování.)

65 ověřených feedů — kompletní seznam v `RSS Feedy pro TrendMagazine.cz — Finální seznam.md` (Manus export). Seed script naplní `sources` z tohoto seznamu. Příklady: Svět → BBC `https://feeds.bbci.co.uk/news/world/rss.xml`, Guardian `https://www.theguardian.com/world/rss`; Business → Bloomberg `https://feeds.bloomberg.com/markets/news.rss`, FT `https://www.ft.com/rss/home`; Tech → TechCrunch `https://techcrunch.com/feed/`, Verge `https://www.theverge.com/rss/index.xml`; Auta → Motor1, Electrek; Krypto → CoinDesk `https://www.coindesk.com/arc/outboundfeeds/rss/`.

**Denní objem:** 8–12 článků (1–2/kategorie). **Plný text:** RSS dává jen perex → pro delší článek scrape originálu (Readability) — volitelné, jinak přepis z titulku+perexu.

## 6. Scraper + publikace (GitHub Actions, zdarma)

`scripts/scraper-standalone.mjs` (dnes placeholder — dotáhnout) sdílí pipeline kód ze `server/` (po odpojení Manusu):
1. fetch RSS (parser z `scraper.ts`), 2. dedup přes `originalUrl`, 3. Anthropic přepis, 4. výběr obrázku, 5. POST hotových CZ článků na `POST /api/admin/articles` (status `published` — plně auto).

`scripts/publish-articles.mjs` — POST s `Authorization: Bearer ${INGEST_TOKEN}`.

`.github/workflows/scrape-articles.yml` — cron **každých 6–12 h** (`workflow_dispatch` pro ruční spuštění). Secrets: `ANTHROPIC_API_KEY`, `UNSPLASH_ACCESS_KEY`, `SITE_URL`, `INGEST_TOKEN`, R2 klíče. (Nahrazuje stará `MANUS_*`.)

## 7. Frontend + admin (už v `client/` — zachovat)

Frontend (`client/src`) zůstává. `wouter` routy: `/`, `/kategorie/:slug`, `/clanek/:slug`, `/admin`, právní stránky. Komponenty (`Home/Article/Category/Header/Footer/HeroCarousel/ArticleCard/AdSlot/InfoBar/Sidebar` + `Privacy/Terms/Cookies/Ethics/About/CookieConsent`) ponechat; měnit jen tam, kde volaly Manus `_core` (auth, runtime). Design „Warm Authority" (serif nadpisy, zelené akcenty).

Admin: tři taby (Articles / Sources / Scraper-trigger), `adminProcedure` chráněné mutace. Ingest endpoint `/api/admin/articles` chránit `INGEST_TOKEN` (ne user login).

## 8. Auth (Step 3): Manus OAuth → Auth.js v5

`sdk.ts` (Manus OAuth, `OAUTH_SERVER_URL`/`OWNER_OPEN_ID`) → Auth.js v5 (Express adapter). Pro start 1 admin účet (Mattův e-mail) + role check. Bez sdíleného SSO.

## 9. SEO + monetizace (Step pozdější)

Open Graph + Schema.org (Article rich snippets), sitemap, `robots.txt`. `AdSlot` připravené pro Google AdSense — neaktivovat reálné ID bez schválení. (Detaily v `navrh_automatizace_v3.md`.)

## 10. Deploy

Vercel (web + tRPC serverless), Neon (DB), Cloudflare (DNS zóna `trendmagazine.cz` už existuje → připojit doménu k Vercel projektu, SSL auto), R2 (obrázky). Env na Vercelu: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `UNSPLASH_ACCESS_KEY`, R2 klíče, Auth.js secrets, `INGEST_TOKEN`.

**Ověření odpojení Manusu:** `grep -r "forge.manus.im\|MANUS_" .` musí být po migraci prázdné. Jediný scheduler = GitHub Actions.
