/**
 * AI Pipeline for Article Translation & Rewriting
 * 
 * Takes raw article data (title, excerpt) from foreign sources
 * and uses LLM to create original Czech versions.
 */
import { invokeLLM } from "./_core/llm";

interface RawArticle {
  title: string;
  excerpt: string;
  sourceLanguage: string;
  sourceName: string;
}

interface RewrittenArticle {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  readTime: number;
}

/**
 * Rewrite and translate an article to Czech using AI.
 * Creates an original version, not a direct translation.
 */
export async function rewriteArticle(raw: RawArticle): Promise<RewrittenArticle | null> {
  try {
    const systemPrompt = `Jsi profesionální český novinář a redaktor online magazínu TrendMagazine.cz. 
Tvým úkolem je přepsat zahraniční zprávy do češtiny jako originální článek.

PRAVIDLA:
- NIKDY nekopíruj text 1:1, vždy přepiš vlastními slovy
- Piš profesionálním, ale čtivým novinářským stylem
- Používej české reálie a kontext kde je to vhodné
- Na konci článku uveď zdroj: "Zdroj: [název zdroje]"
- Titulek musí být chytlavý a SEO-friendly v češtině
- Excerpt (perex) musí být 1-2 věty shrnující článek
- Obsah článku by měl mít 3-6 odstavců
- Piš v HTML formátu (používej <p>, <h3>, <strong>, <em>)
- Přidej relevantní tagy (česky, oddělené čárkou)
- Odhadni čas čtení v minutách

Odpověz POUZE validním JSON objektem v tomto formátu:
{
  "title": "Český titulek článku",
  "excerpt": "Krátký perex v 1-2 větách",
  "content": "<p>HTML obsah článku...</p>",
  "tags": "tag1, tag2, tag3",
  "readTime": 5
}`;

    const userPrompt = `Přepiš tento článek z ${raw.sourceName} (${raw.sourceLanguage}) do češtiny jako originální článek pro TrendMagazine.cz:

TITULEK: ${raw.title}

POPIS: ${raw.excerpt}

Vytvoř kompletní český článek s titulkem, perexem, obsahem (3-6 odstavců v HTML), tagy a odhadem čtení.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rewritten_article",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Czech article title" },
              excerpt: { type: "string", description: "Short 1-2 sentence excerpt in Czech" },
              content: { type: "string", description: "Full article content in HTML format" },
              tags: { type: "string", description: "Comma-separated tags in Czech" },
              readTime: { type: "integer", description: "Estimated read time in minutes" },
            },
            required: ["title", "excerpt", "content", "tags", "readTime"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.error("[AI Pipeline] Empty response from LLM");
      return null;
    }

    const parsed = JSON.parse(content) as RewrittenArticle;

    // Validate the response
    if (!parsed.title || !parsed.excerpt || !parsed.content) {
      console.error("[AI Pipeline] Invalid response structure:", parsed);
      return null;
    }

    // Ensure readTime is reasonable
    if (!parsed.readTime || parsed.readTime < 1) parsed.readTime = 5;
    if (parsed.readTime > 30) parsed.readTime = 15;

    console.log(`[AI Pipeline] Rewritten: "${parsed.title.slice(0, 60)}..." (${parsed.readTime} min)`);

    return parsed;
  } catch (error) {
    console.error("[AI Pipeline] Error rewriting article:", error);
    return null;
  }
}

/**
 * Generate an image prompt for article hero image (for future use with image generation)
 */
export async function generateImagePrompt(title: string, excerpt: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Generate a concise image prompt (max 100 words) for a professional news article hero image. The image should be photorealistic, editorial style. Respond with ONLY the prompt text, nothing else.",
        },
        {
          role: "user",
          content: `Article title: ${title}\nExcerpt: ${excerpt}`,
        },
      ],
    });

    return response.choices?.[0]?.message?.content as string || "Professional editorial news photograph";
  } catch {
    return "Professional editorial news photograph";
  }
}
