/*
 * TrendMagazine.cz – Sidebar Component
 * Design: "Steel & Ink" – trending articles, categories, social links, ad slots
 */
import { Link } from "wouter";
import { articles, categories, formatDate } from "@/lib/data";
import { TrendingUp, ExternalLink } from "lucide-react";
import AdSlot from "./AdSlot";

export default function Sidebar() {
  const trending = articles.slice(0, 5);

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
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  {formatDate(article.date)}
                </span>
              </div>
            </Link>
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
