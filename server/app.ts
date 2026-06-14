/**
 * Express app factory — shared by the local dev server (server/_core/index.ts)
 * and the Vercel serverless function (api/index.ts / server/serverless.ts).
 *
 * When `htmlShell` is provided (production serverless), page routes are
 * server-rendered with SEO meta + crawlable content. Otherwise (dev) Vite
 * serves the HTML and only the API + sitemap/robots routes are active.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAdminAuthRoutes } from "./adminAuth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import {
  getArticleBySlug,
  getCategoryBySlug,
  getArticlesByCategory,
  getArticles,
  getAllCategories,
} from "./db";
import {
  renderArticle,
  renderCategory,
  renderHome,
  buildSitemap,
  robotsTxt,
} from "./seo";

export function createApp(opts?: { htmlShell?: string }) {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Admin password gate
  registerAdminAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  // robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(robotsTxt());
  });

  // sitemap.xml (dynamic, from the database)
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [articles, categories] = await Promise.all([
        getArticles({ status: "published", limit: 1000 }),
        getAllCategories(),
      ]);
      const xml = buildSitemap(
        articles.map((a) => ({
          slug: a.slug,
          lastmod: (a.publishedAt ?? a.createdAt)?.toISOString?.(),
        })),
        categories.map((c) => ({ slug: c.slug }))
      );
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );
      res.type("application/xml").send(xml);
    } catch {
      res.status(500).send("");
    }
  });

  // Server-rendered SEO pages (production serverless only)
  const shell = opts?.htmlShell;
  if (shell) {
    const HTML_CACHE = "public, s-maxage=300, stale-while-revalidate=600";

    app.get("/clanek/:slug", async (req, res) => {
      try {
        const a = await getArticleBySlug(req.params.slug);
        if (!a) {
          res.status(404).type("html").send(shell);
          return;
        }
        res.setHeader("Cache-Control", HTML_CACHE);
        res.type("html").send(renderArticle(shell, a));
      } catch {
        res.type("html").send(shell);
      }
    });

    app.get("/kategorie/:slug", async (req, res) => {
      try {
        const c = await getCategoryBySlug(req.params.slug);
        if (!c) {
          res.status(404).type("html").send(shell);
          return;
        }
        const arts = await getArticlesByCategory(req.params.slug, 30, 0);
        res.setHeader("Cache-Control", HTML_CACHE);
        res.type("html").send(renderCategory(shell, c, arts));
      } catch {
        res.type("html").send(shell);
      }
    });

    app.get("/", async (_req, res) => {
      try {
        const arts = await getArticles({ status: "published", limit: 30 });
        res.setHeader("Cache-Control", HTML_CACHE);
        res.type("html").send(renderHome(shell, arts));
      } catch {
        res.type("html").send(shell);
      }
    });

    // SPA fallback for all other non-API routes (/admin, /o-nas, ...)
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.type("html").send(shell);
    });
  }

  return app;
}
