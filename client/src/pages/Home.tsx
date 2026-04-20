/*
 * TrendMagazine.cz – Homepage
 * Hero carousel + mobile compact list + featured grid + category sections + sidebar
 * Mobile: compact horizontal cards (image left, text right) like Seznam Zprávy
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
  // Next 3 non-featured for featured grid (desktop only)
  const featuredArticles = articles.filter(a => !a.featured).slice(0, 3);
  // Next batch for latest section
  const latestArticles = articles.filter(a => !a.featured).slice(3, 9);
  // All non-hero articles for mobile compact list
  const mobileArticles = articles.filter(a => !a.featured).slice(0, 12);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Carousel – same width as content, centered */}
        <section className="container mt-4 sm:mt-6 mb-4 sm:mb-8 overflow-hidden">
          <HeroCarousel articles={heroArticles} />
        </section>

        {/* ===== MOBILE COMPACT LIST (visible only on mobile) ===== */}
        <section className="sm:hidden px-4 mb-6">
          {/* Section heading */}
          <div className="flex items-center gap-3 mb-4 pt-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Nejnovější</h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Compact horizontal article cards */}
          <div className="divide-y divide-border/60">
            {mobileArticles.map((article, index) => (
              <MobileCompactCard key={article.id} article={article} index={index} />
            ))}
          </div>

          {/* Ad slot between sections on mobile */}
          <div className="mt-5">
            <AdSlot position="header" />
          </div>

          {/* Mobile category sections */}
          {categories.slice(0, 6).map((category) => {
            const catArticles = getArticlesByCategory(category.slug);
            if (catArticles.length === 0) return null;
            return (
              <div key={category.id} className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">{category.name}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="divide-y divide-border/60">
                  {catArticles.slice(0, 3).map((article, index) => (
                    <MobileCompactCard key={article.id} article={article} index={index} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* ===== DESKTOP LAYOUT (hidden on mobile) ===== */}
        <div className="hidden sm:block">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ===== Mobile Compact Card Component ===== */
/* Small image left, title + time + author right – like Seznam Zprávy */
import { Link } from "wouter";
import { type Article, formatDate } from "@/lib/data";
import { Clock } from "lucide-react";

function MobileCompactCard({ article, index }: { article: Article; index: number }) {
  const isVideo = !!article.videoUrl;

  return (
    <Link href={`/clanek/${article.slug}`} className="no-underline">
      <motion.article
        className="flex gap-3.5 py-3.5 items-start"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
      >
        {/* Thumbnail */}
        <div className="relative w-28 min-w-[7rem] aspect-[4/3] rounded overflow-hidden bg-muted flex-shrink-0">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isVideo && (
            <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white ml-px" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[15px] font-serif font-bold text-foreground leading-snug line-clamp-3 mb-1.5">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(article.date)}
            </span>
            <span className="text-border">·</span>
            <span className="font-medium text-foreground/60 uppercase tracking-wide text-[10px]">
              {article.category.name}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
