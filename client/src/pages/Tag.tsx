/*
 * TrendMagazine.cz – Tag Page
 * Lists articles that carry a given tag, with "load more" pagination.
 */
import { useParams } from "wouter";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useArticlesByTag } from "@/hooks/useArticles";
import { motion } from "framer-motion";
import { Loader2, Tag as TagIcon } from "lucide-react";

const MAX_LIMIT = 50;

export default function Tag() {
  const { tag: rawTag } = useParams<{ tag: string }>();
  const tag = decodeURIComponent(rawTag || "");
  const [limit, setLimit] = useState(12);
  const { articles, isLoading } = useArticlesByTag(tag, limit);

  useEffect(() => {
    setLimit(12);
  }, [tag]);

  const canLoadMore = articles.length >= limit && limit < MAX_LIMIT;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Tag header */}
        <section className="border-b border-border">
          <div className="container py-8">
            <div className="flex items-center gap-3">
              <TagIcon className="w-6 h-6 text-accent" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                #{tag}
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 ml-9">
              Články označené tagem „{tag}".
            </p>
          </div>
        </section>

        {/* Content + Sidebar */}
        <section className="container mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index, duration: 0.4 }}
                      >
                        <ArticleCard article={article} variant="standard" />
                      </motion.div>
                    ))}
                  </div>
                  {articles.length === 0 && (
                    <p className="text-muted-foreground text-center py-12">
                      K tomuto tagu zatím nejsou žádné články.
                    </p>
                  )}
                  {canLoadMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setLimit((l) => Math.min(l + 12, MAX_LIMIT))}
                        className="px-6 py-2.5 rounded-sm border border-border bg-card text-sm font-semibold text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
                      >
                        Načíst další články
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="lg:w-1/3">
              <div className="lg:sticky lg:top-32">
                <Sidebar />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
