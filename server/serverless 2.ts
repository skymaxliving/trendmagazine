/**
 * Serverless entry — bundled by esbuild into api/index.js at build time.
 * Default export is the Express app (callable as a Vercel handler).
 */
import { createApp } from "./app";

export default createApp();
