/*
 * TrendMagazine.cz – Hero Carousel Component
 * Design: "Steel & Ink"
 * Desktop: auto-rotating with fade + slide transition, arrows
 * Mobile: simple horizontal swipe (no opacity/fade), full-width edge-to-edge
 */
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Auto-rotate every 6 seconds (desktop only)
  useEffect(() => {
    if (paused || isMobile) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused, isMobile]);

  // Desktop touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  // Mobile: scroll snap to update current index
  const handleMobileScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollLeft = el.scrollLeft;
    const width = el.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== current && index >= 0 && index < articles.length) {
      setCurrent(index);
    }
  };

  const article = articles[current];
  if (!article) return null;

  // Desktop animation variants (slide + fade)
  const desktopVariants = {
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

  /* ─── Mobile: horizontal scroll snap, no animations ─── */
  if (isMobile) {
    return (
      <div className="relative -mx-4 sm:mx-0">
        {/* Scrollable container */}
        <div
          ref={scrollRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {articles.map((art, index) => (
            <Link
              key={art.id}
              href={`/clanek/${art.slug}`}
              className="snap-center shrink-0 w-full relative no-underline block"
            >
              <div className="relative aspect-[3/4]">
                <img
                  src={art.image}
                  alt={art.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-10">
                  <span
                    className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white rounded-sm mb-2"
                    style={{ backgroundColor: art.category.color }}
                  >
                    {art.category.name}
                  </span>
                  <h2 className="text-xl font-serif font-bold text-white leading-tight mb-2">
                    {art.title}
                  </h2>
                  <div className="flex items-center gap-3 text-white/60 text-[11px]">
                    <span>{art.author}</span>
                    <span>{formatDate(art.date)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {art.readTime} min
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {articles.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Desktop: animated carousel with arrows ─── */
  return (
    <div
      className="relative overflow-hidden rounded-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[16/9] lg:aspect-[21/9]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={article.id}
            custom={direction}
            variants={desktopVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={article.image}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={current === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

            <Link href={`/clanek/${article.slug}`} className="no-underline group block absolute inset-0">
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 lg:p-12 lg:pb-12 pr-16 pl-16">
                <span
                  className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white rounded-sm mb-3"
                  style={{ backgroundColor: article.category.color }}
                >
                  {article.category.name}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight mb-3 group-hover:underline decoration-2 underline-offset-4">
                  {article.title}
                </h2>
                <p className="text-white/80 text-base max-w-2xl leading-relaxed mb-3 line-clamp-2">
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
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/40 hover:bg-black/60 active:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors z-20 cursor-pointer"
        aria-label="Předchozí článek"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/40 hover:bg-black/60 active:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors z-20 cursor-pointer"
        aria-label="Další článek"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {articles.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(index); }}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Přejít na článek ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
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
