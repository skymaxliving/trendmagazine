/*
 * TrendMagazine.cz – Hero Carousel Component
 * Auto-rotating carousel with 3-5 featured articles
 * Manual navigation via dots and arrows
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { type Article, formatDate } from "@/lib/data";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroCarouselProps {
  articles: Article[];
}

export default function HeroCarousel({ articles }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const article = articles[current];
  if (!article) return null;

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : -60,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -60 : 60,
    }),
  };

  return (
    <div
      className="relative overflow-hidden rounded-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide container */}
      <div className="relative aspect-[16/9] lg:aspect-[21/9]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={article.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Link href={`/clanek/${article.slug}`} className="no-underline group block h-full">
              <article className="relative h-full">
                <img
                  src={article.image}
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={current === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
                  <span
                    className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded-sm mb-3"
                    style={{ backgroundColor: article.category.color }}
                  >
                    {article.category.name}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight mb-3 group-hover:underline decoration-2 underline-offset-4">
                    {article.title}
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed mb-3 hidden sm:block">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-white/60 text-xs">
                    <span>{article.author}</span>
                    <span>{formatDate(article.date)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime} min
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => {
          e.preventDefault();
          prev();
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors z-10"
        aria-label="Předchozí článek"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          next();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors z-10"
        aria-label="Další článek"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              goTo(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Přejít na článek ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
          <motion.div
            key={current}
            className="h-full bg-white/60"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}
