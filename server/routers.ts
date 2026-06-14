import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  getAllCategories,
  getCategoryBySlug,
  getArticles,
  getArticlesByCategory,
  getArticlesByTag,
  getArticleBySlug,
  getFeaturedArticles,
  getAdminArticles,
  updateArticleStatus,
  toggleArticleFeatured,
  deleteArticle,
  getAllSources,
  getArticleCounts,
  updateArticle,
  getArticleById,
  createSource,
  updateSource,
  deleteSource,
} from "./db";
import { runScraper } from "./scraper";
import { generateArticleImage } from "./imageGen";
import { getArticleImage } from "./imageService";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Public Article Routes ───
  articles: router({
    /** Get published articles with pagination */
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        }).optional()
      )
      .query(async ({ input }) => {
        return getArticles({
          limit: input?.limit ?? 20,
          offset: input?.offset ?? 0,
          status: "published",
        });
      }),

    /** Get a single article by slug */
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getArticleBySlug(input.slug);
      }),

    /** Get articles by category slug */
    byCategory: publicProcedure
      .input(
        z.object({
          categorySlug: z.string(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return getArticlesByCategory(input.categorySlug, input.limit, input.offset);
      }),

    /** Get articles by tag */
    byTag: publicProcedure
      .input(
        z.object({
          tag: z.string().min(1),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return getArticlesByTag(input.tag, input.limit, input.offset);
      }),

    /** Get featured articles for hero carousel */
    featured: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(10).default(5) }).optional())
      .query(async ({ input }) => {
        return getFeaturedArticles(input?.limit ?? 5);
      }),
  }),

  // ─── Public Category Routes ───
  categories: router({
    /** Get all active categories */
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),

    /** Get a single category by slug */
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getCategoryBySlug(input.slug);
      }),
  }),

  // ─── Admin Routes (require admin role) ───
  admin: router({
    /** Get articles for admin panel (includes drafts) */
    articles: adminProcedure
      .input(
        z.object({
          status: z.enum(["draft", "published", "archived"]).optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).optional()
      )
      .query(async ({ input }) => {
        return getAdminArticles({
          status: input?.status,
          limit: input?.limit ?? 50,
          offset: input?.offset ?? 0,
        });
      }),

    /** Get article counts by status */
    articleCounts: adminProcedure.query(async () => {
      return getArticleCounts();
    }),

    /** Publish an article */
    publishArticle: adminProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input }) => {
        await updateArticleStatus(input.articleId, "published");
        return { success: true };
      }),

    /** Archive an article */
    archiveArticle: adminProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input }) => {
        await updateArticleStatus(input.articleId, "archived");
        return { success: true };
      }),

    /** Revert article to draft */
    draftArticle: adminProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input }) => {
        await updateArticleStatus(input.articleId, "draft");
        return { success: true };
      }),

    /** Toggle featured status */
    toggleFeatured: adminProcedure
      .input(z.object({ articleId: z.number(), featured: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleArticleFeatured(input.articleId, input.featured);
        return { success: true };
      }),

    /** Delete an article */
    deleteArticle: adminProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteArticle(input.articleId);
        return { success: true };
      }),

    /** Get all sources */
    sources: adminProcedure.query(async () => {
      return getAllSources();
    }),

    /** Get a single article by ID for editing */
    articleById: adminProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return getArticleById(input.articleId);
      }),

    /** Update article fields */
    updateArticle: adminProcedure
      .input(
        z.object({
          articleId: z.number(),
          title: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          image: z.string().optional(),
          author: z.string().optional(),
          readTime: z.number().optional(),
          tags: z.string().optional(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { articleId, ...data } = input;
        await updateArticle(articleId, data);
        return { success: true };
      }),

    /** Create a new source */
    createSource: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          url: z.string().url(),
          rssUrl: z.string().optional(),
          categoryId: z.number(),
          language: z.string().default("en"),
        })
      )
      .mutation(async ({ input }) => {
        await createSource(input);
        return { success: true };
      }),

    /** Update an existing source */
    updateSource: adminProcedure
      .input(
        z.object({
          sourceId: z.number(),
          name: z.string().optional(),
          url: z.string().url().optional(),
          rssUrl: z.string().optional(),
          categoryId: z.number().optional(),
          language: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { sourceId, ...data } = input;
        await updateSource(sourceId, data);
        return { success: true };
      }),

    /** Delete a source */
    deleteSource: adminProcedure
      .input(z.object({ sourceId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSource(input.sourceId);
        return { success: true };
      }),

    /** Trigger a manual scrape run */
    runScraper: adminProcedure
      .input(
        z.object({
          maxArticlesPerSource: z.number().min(1).max(10).default(3),
          autoPublish: z.boolean().default(false),
        }).optional()
      )
      .mutation(async ({ input }) => {
        const result = await runScraper({
          maxArticlesPerSource: input?.maxArticlesPerSource ?? 3,
          autoPublish: input?.autoPublish ?? false,
        });
        return result;
      }),

    /** Replace an article's image: AI-generate (Gemini), search Unsplash, or set a custom URL. */
    replaceImage: adminProcedure
      .input(
        z.object({
          articleId: z.number(),
          mode: z.enum(["generate", "unsplash", "url"]),
          customUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const article = await getArticleById(input.articleId);
        if (!article) {
          return { success: false as const, error: "Článek nenalezen" };
        }

        let image: string | null = null;
        if (input.mode === "url") {
          image = input.customUrl ?? null;
        } else if (input.mode === "unsplash") {
          image = await getArticleImage({
            title: article.title,
            excerpt: article.excerpt ?? "",
            tags: article.tags ?? "",
          });
        } else {
          image = await generateArticleImage({
            title: article.title,
            excerpt: article.excerpt ?? "",
          });
        }

        if (!image) {
          return { success: false as const, error: "Obrázek se nepodařilo získat" };
        }

        await updateArticle(input.articleId, { image });
        return { success: true as const, image };
      }),
  }),
});

export type AppRouter = typeof appRouter;
