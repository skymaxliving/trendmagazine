/**
 * Article data hooks — fetches from tRPC API with fallback to static data.
 * This ensures the site always shows content even when the database is empty.
 */
import { trpc } from "@/lib/trpc";
import {
  articles as staticArticles,
  categories as staticCategories,
  getArticlesByCategory as getStaticArticlesByCategory,
  type Article,
  type Category,
} from "@/lib/data";

/** Convert a DB article (from tRPC) to the frontend Article interface */
function dbToArticle(dbArticle: any): Article {
  return {
    id: String(dbArticle.id),
    title: dbArticle.title,
    excerpt: dbArticle.excerpt || "",
    content: dbArticle.content || undefined,
    category: dbArticle.category
      ? {
          id: dbArticle.category.slug || dbArticle.category.id,
          name: dbArticle.category.name,
          slug: dbArticle.category.slug,
          description: dbArticle.category.description || "",
          color: dbArticle.category.color,
        }
      : staticCategories[0],
    image: dbArticle.image || "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=1600&q=90",
    videoUrl: dbArticle.videoUrl || undefined,
    author: dbArticle.author || "Redakce TM",
    date: dbArticle.publishedAt
      ? new Date(dbArticle.publishedAt).toISOString().split("T")[0]
      : dbArticle.createdAt
      ? new Date(dbArticle.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    readTime: dbArticle.readTime || 5,
    tags: dbArticle.tags ? dbArticle.tags.split(",").map((t: string) => t.trim()) : [],
    slug: dbArticle.slug,
    featured: dbArticle.featured || false,
  };
}

/** Hook: Get all published articles for the homepage */
export function useHomepageArticles() {
  const { data: dbArticles, isLoading, error } = trpc.articles.list.useQuery(
    { limit: 30, offset: 0 },
    { retry: 1, staleTime: 60_000 }
  );

  // If we have DB articles, use them; otherwise fall back to static
  const articles: Article[] =
    dbArticles && dbArticles.length > 0
      ? dbArticles.map(dbToArticle)
      : staticArticles;

  // Hero always shows the 5 newest articles (sorted by publishedAt desc from API)
  const effectiveHero = articles.slice(0, 5).map((a) => ({ ...a, featured: true }));

  const nonHero = articles.filter((a) => !effectiveHero.find((h) => h.id === a.id));
  const featuredGrid = nonHero.slice(0, 3);
  const latestArticles = nonHero.slice(3, 9);
  const mobileArticles = nonHero.slice(0, 12);

  return {
    heroArticles: effectiveHero,
    featuredGrid,
    latestArticles,
    mobileArticles,
    allArticles: articles,
    isLoading,
    isFromDb: !!(dbArticles && dbArticles.length > 0),
    error,
  };
}

/** Hook: Get articles by category (limit grows for "load more" pagination) */
export function useCategoryArticles(categorySlug: string, limit = 20) {
  const { data: dbArticles, isLoading, error } = trpc.articles.byCategory.useQuery(
    { categorySlug, limit, offset: 0 },
    { retry: 1, staleTime: 60_000 }
  );

  const articles: Article[] =
    dbArticles && dbArticles.length > 0
      ? dbArticles.map(dbToArticle)
      : getStaticArticlesByCategory(categorySlug);

  return { articles, isLoading, error };
}

/** Hook: Get all categories */
export function useCategories() {
  const { data: dbCategories, isLoading } = trpc.categories.list.useQuery(
    undefined,
    { retry: 1, staleTime: 300_000 }
  );

  const categories: Category[] =
    dbCategories && dbCategories.length > 0
      ? dbCategories.map((c: any) => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          color: c.color,
        }))
      : staticCategories;

  return { categories, isLoading };
}

/** Hook: Get a single article by slug */
export function useArticle(slug: string) {
  const { data: dbArticle, isLoading, error } = trpc.articles.bySlug.useQuery(
    { slug },
    { retry: 1, staleTime: 60_000 }
  );

  const article: Article | null = dbArticle
    ? dbToArticle(dbArticle)
    : null;

  return { article, isLoading, error };
}

/** Hook: Get articles for a specific category section on homepage */
export function useCategorySectionArticles(categorySlug: string) {
  const { data: dbArticles } = trpc.articles.byCategory.useQuery(
    { categorySlug, limit: 4, offset: 0 },
    { retry: 1, staleTime: 60_000 }
  );

  const articles: Article[] =
    dbArticles && dbArticles.length > 0
      ? dbArticles.map(dbToArticle)
      : getStaticArticlesByCategory(categorySlug);

  return articles;
}
