/*
 * TrendMagazine.cz – Category Page
 * Design: "Steel & Ink" – category filtered view with sidebar
 */
import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { getCategoryBySlug, getArticlesByCategory, articles } from "@/lib/data";
import { motion } from "framer-motion";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");
  const categoryArticles = slug ? getArticlesByCategory(slug) : [];

  // If no articles in this category, show all articles as fallback
  const displayArticles = categoryArticles.length > 0 ? categoryArticles : articles;

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Kategorie nenalezena</h1>
          <p className="text-muted-foreground">Požadovaná kategorie neexistuje.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Category header */}
        <section className="border-b border-border">
          <div className="container py-8">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-1.5 h-8 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
                {category.name}
              </h1>
            </div>
            <p className="text-muted-foreground ml-5">{category.description}</p>
          </div>
        </section>

        {/* Content + Sidebar */}
        <section className="container mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayArticles.map((article, index) => (
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
              {displayArticles.length === 0 && (
                <p className="text-muted-foreground text-center py-12">
                  V této kategorii zatím nejsou žádné články.
                </p>
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
