# CLAUDE.md — trendmagazine

Tento soubor je persistent kontext pro Claude Code. Načti ho na začátku každé session.

## Co je trendmagazine

Automatizovaný český online magazín. Stahuje anglické články z RSS zdrojů, pomocí AI je přepisuje a překládá do češtiny jako originální obsah (ne 1:1 překlad), doplní relevantní obrázek a **plně automaticky** publikuje. Cíl: důvěryhodný zpravodajský/lifestyle portál s minimální lidskou údržbou, monetizace přes Google AdSense, nepřímá podpora značek Skymax Living / SkyForce.

**Provoz:** SkyForce s.r.o.
**Doména:** trendmagazine.cz (DNS zóna už na Cloudflare)
**Repo:** github.com/skymaxliving/trendmagazine
**Vytvořeno:** 2026-06-13

## Status: MIGRACE z Manus.ai (adaptace existujícího repa)

⚠️ **Tohle NENÍ greenfield.** Repo už obsahuje kompletní, spustitelnou aplikaci exportovanou z Manusu (~131 souborů, struktura `client/server/shared`). **Strukturu zachováváme** — neděláme přestavbu do monorepa. Úkol = **odpojit Manus a přemigrovat infrastrukturu**, ne psát appku znovu.

Vazba na Manus k odstranění:
- `vite-plugin-manus-runtime` (devDep) + adresáře `server/_core/`, `shared/_core/`
- `server/_core/llm.ts` → volá `https://forge.manus.im` (gemini-2.5-flash)
- `server/_core/oauth.ts`, `sdk.ts` → Manus OAuth
- `server/_core/imageGeneration.ts` → Manus Forge ImageService
- `drizzle.config.ts` → `dialect: "mysql"` (+ `mysql2`)

## Tech stack (cílový — po migraci)

| Vrstva | Technologie |
|---|---|
| Frontend | Vite 7 + React 19 (`client/`) |
| Backend | Express 4 + tRPC v11 (`server/`) |
| ORM | Drizzle (schema `drizzle/schema.ts`) |
| Databáze | **Postgres na Neon** (`trendmagazine_prod`, `aws-eu-central-1`) — migrace z MySQL |
| Auth | **Auth.js v5** (Express adapter) — náhrada Manus OAuth, jen admin login |
| AI | **Anthropic SDK**, model **Claude Haiku** (`claude-haiku-4-5-20251001`) — náhrada Forge |
| Úložiště | **Cloudflare R2** (`@aws-sdk/client-s3` už v projektu) — bucket `trendmagazine-files` |
| Hosting (web) | **Vercel** |
| Scheduler | **GitHub Actions** (cron scraper, zdarma) — NE Railway |
| DNS | Cloudflare |
| Package manager | pnpm · Node 22 |
| Styling | Tailwind v4 (už v projektu) |
| Obrázky (externí) | Unsplash API (free) + původní og:image z článku |

## Zakázáno

- ❌ **Next.js** (držíme Vite + Express)
- ❌ **Manus „Forge" / vite-plugin-manus-runtime / `_core` vrstva** — vše odstranit, žádné `forge.manus.im` volání nesmí zůstat
- ❌ **MySQL** (migrujeme na Postgres/Neon)
- ❌ **Vercel KV / Postgres / Blob** (vendor lock-in) · **Edge Runtime** pro API (Node runtime)
- ❌ **SendGrid** (případný email přes Resend) · **Replit, Railway** jako runtime
- ❌ Přestavba do `apps/* + packages/*` monorepa — zachováváme `client/server/shared`
- ❌ Slovo „blockchain" v UI a marketingu

## Klíčové legální / business požadavky

- **GDPR + cookie consent** (CZ/EU čtenáři) — cookie lišta povinná.
- **Google AdSense** — sloty připravené, ale neaktivovat reálné AdSense ID bez schválení Matta.
- **Atribuce zdroje** — každý článek „Zdroj: …" (řeší AI pipeline); přepis musí být skutečně originální.
- **Autorská práva u obrázků** — původní foto jen u veřejných osob/zdrojů, jinak Unsplash; nehotlinkovat plošně cizí news fotky.

## Skutečná struktura repa (zachovat)

```
trendmagazine/
├── client/                 # Vite + React 19 frontend + admin
│   ├── public/
│   └── src/
├── server/                 # Express + tRPC backend
│   ├── _core/              # ⛔ Manus platforma — ODSTRANIT/nahradit
│   ├── db.ts
│   ├── routers.ts
│   ├── storage.ts
│   └── index.ts
├── shared/                 # sdílené typy/konstanty (_core/errors.ts → přesunout)
├── drizzle/                # schema.ts + migrace (mysql → pg)
├── scripts/                # scraper-standalone.mjs, publish-articles.mjs (doplnit)
├── .github/workflows/      # scrape-articles.yml
├── drizzle.config.ts       # dialect: mysql → postgresql
├── package.json
├── CLAUDE.md / docs/build-spec.md / bootstrap.config.json
└── .env.local              # auto-generated (Neon, R2, Anthropic), gitignored
```

## Komunikace s Mattem

- Matt komunikuje česky, kód a docs v angličtině. Jediný vývojář; architektonická rozhodnutí schvaluje předem.
- Ptej se před instalací nových závislostí (cíl: minimalizovat bloat).
- Před commitem `git status` — nikdy necommituj `.env*`/secrets. Conventional commits (`feat:`/`fix:`/`chore:`/`refactor:`/`docs:`).
- One step at a time; před krokem N+1 počkej na potvrzení kroku N.

## Workflow s Claude Code

- Plan mode preferred — plán → schválení → implementace. Po větším kroku: `git status`, diff, čekej na confirm.
- Nikdy autonomně nezakládej branch/CI/CD bez schválení.

## Out of scope (NEDĚLEJ)

- Nativní mobil (Capacitor), platby/předplatné, reálné AdSense ID bez schválení, noví LLM/image vendoři mimo Anthropic+Unsplash, sdílené SSO.

## Useful references

- Auth.js v5 (Express): https://authjs.dev/reference/express
- Drizzle (Postgres): https://orm.drizzle.team/docs/get-started-postgresql
- Anthropic SDK: https://docs.anthropic.com/en/api/client-sdks
- Cloudflare R2 (S3 API): https://developers.cloudflare.com/r2/api/s3/
- Unsplash API: https://unsplash.com/documentation
