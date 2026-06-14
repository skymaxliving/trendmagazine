/*
 * TrendMagazine.cz – Sidebar Component
 * Trending (most recent), a tasteful Lifestyle rail (celebrity/models/sport),
 * categories and social links. Data from the API (tRPC).
 */
import { Link } from "wouter";
import {
  useCategories,
  useHomepageArticles,
  useCategorySectionArticles,
} from "@/hooks/useArticles";
import { formatDateTime } from "@/lib/data";
import { TrendingUp, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import AdSlot from "./AdSlot";

const LIFESTYLE = [
  { slug: "celebrity", label: "Celebrity" },
  { slug: "modelky", label: "Modelky" },
  { slug: "sport", label: "Sport" },
];

export default function Sidebar() {
  const { categories } = useCategories();
  const { allArticles } = useHomepageArticles();
  const trending = allArticles.slice(0, 5);

  return (
    <aside className="space-y-8">
      {/* Ad slot */}
      <AdSlot position="sidebar" className="hidden lg:block" />

      {/* Trending */}
      <div className="bg-card border border-border/40 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Nejčtenější
          </h3>
        </div>
        <div className="space-y-0">
          {trending.map((article, index) => (
            <Link
              key={article.id}
              href={`/clanek/${article.slug}`}
              className="no-underline group flex gap-3 py-3 border-b border-border/30 last:border-0"
            >
              <span className="text-2xl font-serif font-bold text-border/80 leading-none mt-0.5 w-7 shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="text-sm font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {formatDateTime(article.date)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Lifestyle rail – decent, but on the eyes (celebrity / models / sport) */}
      <div className="bg-card border border-border/40 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Lifestyle
          </h3>
        </div>
        <div className="space-y-5">
          {LIFESTYLE.map((c) => (
            <LifestyleBlock key={c.slug} slug={c.slug} label={c.label} />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card border border-border/40 rounded-sm p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
          Kategorie
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategorie/${cat.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-sm text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors no-underline"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Social / Follow us */}
      <div className="bg-primary rounded-sm p-5 text-primary-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">
          Sledujte nás
        </h3>
        <p className="text-sm text-primary-foreground/70 mb-4 leading-relaxed">
          Buďte v obraze. Sledujte TrendMagazine na sociálních sítích.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Facebook", href: "#" },
            { name: "Instagram", href: "#" },
            { name: "X (Twitter)", href: "#" },
            { name: "LinkedIn", href: "#" },
          ].map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/12 hover:bg-white/20 text-white text-sm font-medium rounded-sm transition-colors no-underline"
            >
              {social.name}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

function LifestyleBlock({ slug, label }: { slug: string; label: string }) {
  const articles = useCategorySectionArticles(slug);
  if (!articles.length) return null;
  const top = articles[0];
  return (
    <div>
      <Link
        href={`/kategorie/${slug}`}
        className="flex items-center justify-between mb-2 no-underline group"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/60 group-hover:text-primary transition-colors">
          {label}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
      </Link>
      <Link
        href={`/clanek/${top.slug}`}
        className="no-underline group flex gap-3 items-start"
      >
        <div className="relative w-20 min-w-[5rem] aspect-[4/3] rounded overflow-hidden bg-muted">
          <img
            src={top.image}
            alt={top.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <h4 className="text-[13px] font-serif font-bold text-foreground leading-snug line-clamp-3 group-hover:text-primary transition-colors">
          {top.title}
        </h4>
      </Link>
    </div>
  );
}
