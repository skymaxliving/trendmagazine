/*
 * TrendMagazine.cz – Header Component
 * Design: "Steel & Ink" – dark steel primary, warm béžové bg, serif headings
 * Features: Logo, navigation with categories, mobile menu, search
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { categories } from "@/lib/data";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="container flex items-center justify-between h-10 text-xs text-muted-foreground border-b border-border/50">
        <div className="flex items-center gap-4">
          <span>{new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Nezávislý český magazín</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          {/* Icon – mobile & desktop */}
          <div className="w-10 h-10 rounded-sm bg-[#1E293B] flex items-center justify-center sm:hidden">
            <div className="flex items-center gap-px">
              <span className="text-sm font-serif font-bold text-white leading-none">T</span>
              <span className="w-[1px] h-3.5 bg-[#EF4444] rounded-full" />
              <span className="text-sm font-serif font-bold text-white leading-none">M</span>
            </div>
          </div>
          {/* Full logo – desktop */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-[22px] font-serif font-bold tracking-tight leading-none text-[#1E293B]">
              <span>TREND</span>
              <span className="w-[2px] h-5 bg-[#DC2626] rounded-full" />
              <span>MAGAZINE</span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#1E293B]/45 font-medium mt-1">
              Fakta · Trendy · Perspektiva
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {categories.slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              href={`/kategorie/${cat.slug}`}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-sm no-underline
                ${location === `/kategorie/${cat.slug}`
                  ? "text-primary bg-primary/5"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
            >
              {cat.name}
            </Link>
          ))}
          <div className="relative group">
            <button className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary flex items-center gap-1 transition-colors">
              Více <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {categories.slice(7).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategorie/${cat.slug}`}
                  className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 no-underline transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-foreground/60 hover:text-primary transition-colors"
            aria-label="Hledat"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground/60 hover:text-primary transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="container py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hledat články..."
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-border"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategorie/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-sm no-underline transition-colors
                    ${location === `/kategorie/${cat.slug}`
                      ? "text-primary bg-primary/5"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
