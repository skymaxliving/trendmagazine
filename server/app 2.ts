/**
 * Express app factory — shared by the local dev server (server/_core/index.ts)
 * and the Vercel serverless function (api/index.ts).
 *
 * Intentionally does NOT import Vite or static-serving (those are dev/standalone
 * only) so the serverless bundle stays lean and free of devDependencies.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // OAuth callback (legacy Manus; to be replaced by Auth.js)
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  return app;
}
