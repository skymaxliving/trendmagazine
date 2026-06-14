/**
 * On-demand AI image generation via Google Gemini ("nano banana"),
 * stored on Cloudflare R2. Used by the admin "replace image" action
 * and the generate-missing-images script. NOT used by the scraper
 * (which prefers the publisher's original image).
 */
import { storagePut } from "./storage";

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type InlinePart = { inlineData?: { mimeType?: string; data?: string } };

function buildPrompt(title: string, excerpt?: string): string {
  return [
    `Editorial hero image for a Czech news/magazine article titled: "${title}".`,
    excerpt ? `Context: ${excerpt.slice(0, 240)}.` : "",
    "Photorealistic, tasteful editorial magazine style, 16:9 landscape composition.",
    "Relevant to the topic. No text, no captions, no watermark, no logos, no real identifiable faces.",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Generate an editorial image for an article, upload to R2, return its URL.
 * Returns null on failure (caller decides fallback).
 */
export async function generateArticleImage(opts: {
  title: string;
  excerpt?: string;
}): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");

  try {
    const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(opts.title, opts.excerpt) }] }],
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[imageGen] Gemini ${res.status}: ${detail.slice(0, 200)}`);
      return null;
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: InlinePart[] } }>;
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img?.inlineData?.data) {
      console.error("[imageGen] No image in Gemini response");
      return null;
    }

    const mime = img.inlineData.mimeType || "image/png";
    const ext = mime.split("/")[1] || "png";
    const buf = Buffer.from(img.inlineData.data, "base64");
    const key = `generated/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

    const { url } = await storagePut(key, buf, mime);
    console.log(`[imageGen] Generated → ${url}`);
    return url;
  } catch (err) {
    console.error("[imageGen] Error:", err);
    return null;
  }
}
