/*
 * TrendMagazine.cz – Article Card Component
 * Design: "Steel & Ink" – steel accent bar, serif titles, warm tones
 * Variants: featured (large), standard, compact (sidebar)
 * Supports video articles with play icon overlay
 */
import { Link } from "wouter";
import { type Article, formatDate } from "@/lib/data";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  variant?: "featured" | "standard" | "compact" | "hero";
}

/* Video play badge overlay */
function VideoPlayBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };
  const iconClasses = {
    sm: "w-3 h-3 ml-0.5",
    md: "w-4 h-4 ml-0.5",
    lg: "w-5 h-5 ml-0.5",
  };
  return (
    <div className={`absolute top-3 left-3 z-10 ${sizeClasses[size]} bg-red-600 rounded-full flex items-center justify-center shadow-lg`}>
      <svg className={`${iconClasses[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

export default function ArticleCard({ article, variant = "standard" }: ArticleCardProps) {
  const isVideo = !!article.videoUrl;

  if (variant === "hero") {
    return (
      <Link href={`/clanek/${article.slug}`} className="no-underline group">
        <article className="relative overflow-hidden rounded-sm aspect-[16/9] lg:aspect-[21/9]">
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="eager"
          />
          {isVideo && <VideoPlayBadge size="lg" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <span
              className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded-sm mb-3"
              style={{ backgroundColor: article.category.color }}
            >
              {isVideo ? `▶ ${article.category.name}` : article.category.name}
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
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/clanek/${article.slug}`} className="no-underline group">
        <article className="article-card flex flex-col sm:flex-row gap-5 py-5 border-b border-border/60">
          <div className="relative sm:w-2/5 overflow-hidden rounded-sm aspect-[16/10] sm:aspect-auto">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isVideo && <VideoPlayBadge size="md" />}
          </div>
          <div className="sm:w-3/5 flex flex-col justify-center">
            <span
              className="inline-block w-fit px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white rounded-sm mb-2"
              style={{ backgroundColor: article.category.color }}
            >
              {isVideo ? `▶ ${article.category.name}` : article.category.name}
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2 hidden sm:block">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <span className="font-medium text-foreground/70">{article.author}</span>
              <span>{formatDate(article.date)}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {article.readTime} min
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/clanek/${article.slug}`} className="no-underline group">
        <article className="category-accent py-3 border-b border-border/40 last:border-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isVideo ? `▶ ${article.category.name}` : article.category.name}
          </span>
          <h4 className="text-sm font-serif font-bold text-foreground leading-snug mt-1 group-hover:text-primary transition-colors">
            {article.title}
          </h4>
          <span className="text-xs text-muted-foreground mt-1 block">{formatDate(article.date)}</span>
        </article>
      </Link>
    );
  }

  // Standard variant
  return (
    <Link href={`/clanek/${article.slug}`} className="no-underline group">
      <article className="article-card overflow-hidden rounded-sm border border-border/40 bg-card hover:shadow-md transition-shadow duration-300">
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isVideo && <VideoPlayBadge size="md" />}
        </div>
        <div className="p-4">
          <span
            className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white rounded-sm mb-2"
            style={{ backgroundColor: article.category.color }}
          >
            {isVideo ? `▶ ${article.category.name}` : article.category.name}
          </span>
          <h3 className="text-base font-serif font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span>{article.author}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
