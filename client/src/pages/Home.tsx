/*
 * TrendMagazine.cz – Homepage
 * Hero carousel + featured grid + category sections + sidebar
 */
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import HeroCarousel from "@/components/HeroCarousel";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { articles, categories, getArticlesByCategory } from "@/lib/data";

export default function Home() {
  // Top 5 articles for carousel (featured)
  const heroArticles = articles.filter(a => a.featured).slice(0, 5);
  // Next 3 non-featured for featured grid
  const featuredArticles = articles.filter(a => !a.featured).slice(0, 3);
  // Next batch for latest section
  const latestArticles = articles.filter(a => !a.featured).slice(3, 9);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Carousel – full-width on mobile, contained on desktop */}
        <section className="sm:container mt-0 sm:mt-6 mb-6 sm:mb-8">
          <HeroCarousel articles={heroArticles} />
        </section>

        {/* Ad slot - header */}
        <div className="container mb-6">
          <AdSlot position="header" />
        </div>

        {/* Featured Articles Grid */}
        <section className="container mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </motion.div>
        </section>

        {/* Main Content + Sidebar */}
        <section className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="lg:w-2/3">
              {/* Latest Articles */}
              {latestArticles.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Nejnovější články</h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-0">
                    {latestArticles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                      >
                        <ArticleCard article={article} variant="featured" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* In-article ad */}
              <AdSlot position="in-article" className="my-8" />

              {/* Category Sections */}
              {categories.slice(0, 6).map((category) => {
                const catArticles = getArticlesByCategory(category.slug);
                if (catArticles.length === 0) return null;
                return (
                  <div key={category.id} className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className="w-1 h-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h2 className="text-xl font-serif font-bold text-foreground">{category.name}</h2>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {catArticles.slice(0, 2).map((article) => (
                        <ArticleCard key={article.id} article={article} variant="standard" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="lg:sticky lg:top-32">
                <Sidebar />
              </div>
            </div>
          </div>
        </section>

        {/* Footer ad */}
        <div className="container my-8">
          <AdSlot position="footer" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
