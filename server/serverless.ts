/**
 * Serverless entry — bundled by esbuild into api/index.js at build time.
 * Default export is the Express app (callable as a Vercel handler).
 * The built SPA shell is inlined (esbuild --loader:.html=text) so page
 * routes can be server-rendered with SEO meta + crawlable content.
 */
import { createApp } from "./app";
// Built by vite, renamed to app-shell.html, then inlined as a string by esbuild.
import htmlShell from "../dist/public/app-shell.html";

export default createApp({ htmlShell });
