/*
 * TrendMagazine.cz – Homepage
 * Portal hierarchy: serious business/finance core up top, lighter content
 * (celebrity/models/sport) kept tasteful "on the side". Category blocks link
 * through to full category pages. Powered by tRPC with static fallback.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import HeroCarousel from "@/components/HeroCarousel";
import InfoBar from "@/components/InfoBar";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { useHomepageArticles, useCategories, useCategorySectionArticles } from "@/hooks/useArticles";
import { type Article, type Category, formatDateTime } from "@/lib/data";

/** Serious core (brand identity) shown as big blocks, in this order. */
const SERIOUS = ["business", "akcie", "svet", "technologie"];
/** Lighter, high-click content — present but tasteful ("on the side"). */
const LIGHT = ["celebrity", "modelky", "sport"];

export default function Home() {
  const {
    heroArticles,
    featuredGrid,
    latestArticles,
    mobileArticles,
  } = useHomepageArticles();

  const { categories } = useCategories();

  const bySlug = (s: string) => categories.find((c) => c.slug === s);
  const serious = SERIOUS.map(bySlug).filter(Boolean) as Category[];
  const light = LIGHT.map(bySlug).filter(Boolean) as Category[];
  const rest = categories.filter(
    (c) => !SERIOUS.includes(c.slug) && !LIGHT.includes(c.slug)
  );
  const mobileOrder = [...serious, ...light, ...rest];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Carousel */}
        <section className="container mt-4 sm:mt-6 mb-4 sm:mb-8 overflow-hidden">
          <HeroCarousel articles={heroArticles} />
        </section>

        {/* Markets / info bar (desktop) */}
        <InfoBar />

        {/* ===== MOBILE COMPACT LIST ===== */}
        <section className="sm:hidden px-4 mb-6">
          <div className="flex items-center gap-3 mb-4 pt-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Nejnovější</h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="divide-y divide-border/60">
            {mobileArticles.map((article, index) => (
              <MobileCompactCard key={article.id} article={article} index={index} />
            ))}
          </div>

          <div className="mt-5">
            <AdSlot position="header" />
          </div>

          {mobileOrder.map((category) => (
            <MobileCategorySection key={category.id} category={category} />
          ))}
        </section>

        {/* ===== DESKTOP LAYOUT ===== */}
        <div className="hidden sm:block">
          <div className="container mb-6">
            <AdSlot position="header" />
          </div>

          {/* Top stories grid */}
          <section className="container mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredGrid.map((article) => (
                <ArticleCard key={article.id} article={article} variant="standard" />
              ))}
            </motion.div>
          </section>

          {/* Main + Sidebar */}
          <section className="container">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                {/* Latest */}
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

                {/* Serious core blocks */}
                {serious.map((category) => (
                  <DesktopCategorySection key={category.id} category={category} />
                ))}

                <AdSlot position="in-article" className="my-8" />

                {/* Lighter content — tasteful strip */}
                <LightStrip categories={light} />

                {/* Remaining categories */}
                {rest.map((category) => (
                  <DesktopCategorySection key={category.id} category={category} />
                ))}
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/3">
                <div className="lg:sticky lg:top-32">
                  <Sidebar />
                </div>
              </div>
            </div>
          </section>

          <div className="container my-8">
            <AdSlot position="footer" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ===== "Zobrazit celou rubriku" link ===== */
function CategoryHeader({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-6 rounded-full" style={{ backgroundColor: category.color }} />
      <h2 className="text-xl font-serif font-bold text-foreground">{category.name}</h2>
      <div className="flex-1 h-px bg-border" />
      <Link
        href={`/kategorie/${category.slug}`}
        className="text-xs font-semibold uppercase tracking-wider text-primary/80 hover:text-primary flex items-center gap-1 no-underline whitespace-nowrap"
      >
        Celá rubrika <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ===== Desktop category section (4 articles + view-all) ===== */
function DesktopCategorySection({ category }: { category: Category }) {
  const catArticles = useCategorySectionArticles(category.slug);
  if (catArticles.length === 0) return null;

  return (
    <div className="mb-10">
      <CategoryHeader category={category} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {catArticles.slice(0, 4).map((article) => (
          <ArticleCard key={article.id} article={article} variant="standard" />
        ))}
      </div>
    </div>
  );
}

/* ===== Lighter content strip (celebrity / models / sport) ===== */
function LightStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="mb-10 bg-card/40 border border-border/40 rounded-md p-5">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles className="w-4 h-4 text-accent" />
        <h2 className="text-base font-bold uppercase tracking-widest text-foreground/70">Lehčí čtení</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2">
        {categories.map((category) => (
          <LightColumn key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

function LightColumn({ category }: { category: Category }) {
  const articles = useCategorySectionArticles(category.slug);
  if (articles.length === 0) return null;
  return (
    <div>
      <Link
        href={`/kategorie/${category.slug}`}
        className="flex items-center justify-between mb-3 no-underline group"
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: category.color }}>
          {category.name}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
      </Link>
      <div className="divide-y divide-border/50">
        {articles.slice(0, 3).map((article, index) => (
          <MobileCompactCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}

/* ===== Mobile category section (3 articles + view-all) ===== */
function MobileCategorySection({ category }: { category: Category }) {
  const catArticles = useCategorySectionArticles(category.slug);
  if (catArticles.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-5 rounded-full" style={{ backgroundColor: category.color }} />
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">{category.name}</h2>
        <div className="flex-1 h-px bg-border" />
        <Link
          href={`/kategorie/${category.slug}`}
          className="text-[11px] font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-0.5 no-underline whitespace-nowrap"
        >
          Vše <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {catArticles.slice(0, 3).map((article, index) => (
          <MobileCompactCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}

/* ===== Mobile compact card (small image left, title right) ===== */
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
        <div className="relative w-28 min-w-[7rem] aspect-[4/3] rounded overflow-hidden bg-muted flex-shrink-0">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
          {isVideo && (
            <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white ml-px" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[15px] font-serif font-bold text-foreground leading-snug line-clamp-3 mb-1.5">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground/70">
              <Calendar className="w-3 h-3 text-primary/60" />
              {formatDateTime(article.date)}
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
