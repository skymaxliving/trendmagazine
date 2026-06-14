/**
 * Vercel serverless entry. The Express app handles all /api/* routes
 * (see vercel.json rewrites). Static client is served from dist/public.
 */
import { createApp } from "../server/app";

export default createApp();
