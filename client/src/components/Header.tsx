/*
 * TrendMagazine.cz – Header Component
 * Design: "Steel & Ink" – dark steel primary, warm béžové bg, serif headings
 * Features: Logo, navigation, mobile menu, search, date & weather
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { categories } from "@/lib/data";
import {
  Menu, X, Search, ChevronDown,
  CloudSun, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Thermometer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Weather Hook ─── */
interface WeatherData { temperature: number; weatherCode: number; }

function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.42&current=temperature_2m,weather_code&timezone=Europe%2FPrague")
      .then(r => r.json())
      .then(d => {
        if (d?.current) setWeather({ temperature: Math.round(d.current.temperature_2m), weatherCode: d.current.weather_code });
      })
      .catch(() => {});
  }, []);
  return weather;
}

function getWeatherIcon(code: number) {
  if (code === 0) return <Sun className="w-3.5 h-3.5" />;
  if (code <= 3) return <CloudSun className="w-3.5 h-3.5" />;
  if (code <= 48) return <Cloud className="w-3.5 h-3.5" />;
  if (code <= 57) return <CloudDrizzle className="w-3.5 h-3.5" />;
  if (code <= 67) return <CloudRain className="w-3.5 h-3.5" />;
  if (code <= 77) return <CloudSnow className="w-3.5 h-3.5" />;
  if (code <= 82) return <CloudRain className="w-3.5 h-3.5" />;
  if (code <= 86) return <CloudSnow className="w-3.5 h-3.5" />;
  if (code <= 99) return <CloudLightning className="w-3.5 h-3.5" />;
  return <Thermometer className="w-3.5 h-3.5" />;
}

function getWeatherLabel(code: number): string {
  if (code === 0) return "Jasno";
  if (code <= 3) return "Polojasno";
  if (code <= 48) return "Zataženo";
  if (code <= 57) return "Mrholení";
  if (code <= 67) return "Déšť";
  if (code <= 77) return "Sněžení";
  if (code <= 82) return "Přeháňky";
  if (code <= 86) return "Sněhové přeháňky";
  if (code <= 99) return "Bouřka";
  return "";
}

function formatCzechDate(): string {
  return new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ─── Main Header ─── */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();
  const weather = useWeather();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar – date & weather */}
      <div className="bg-[#1E293B] text-white/80">
        <div className="container flex items-center justify-between h-8 text-[11px] tracking-wide">
          <div className="flex items-center gap-1.5">
            <span className="uppercase font-medium">{formatCzechDate()}</span>
          </div>
          <div className="flex items-center gap-4">
            {weather && (
              <div className="flex items-center gap-1.5">
                {getWeatherIcon(weather.weatherCode)}
                <span className="font-medium">Praha {weather.temperature}°C</span>
                <span className="hidden sm:inline text-white/50">·</span>
                <span className="hidden sm:inline text-white/60">{getWeatherLabel(weather.weatherCode)}</span>
              </div>
            )}
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/60">Nezávislý český magazín</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center justify-between py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          {/* Logo icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-[#1E293B] flex items-center justify-center shrink-0">
            <div className="flex items-center gap-px">
              <span className="text-xs sm:text-sm font-serif font-bold text-white leading-none">T</span>
              <span className="w-[1px] h-3 sm:h-3.5 bg-[#EF4444] rounded-full" />
              <span className="text-xs sm:text-sm font-serif font-bold text-white leading-none">M</span>
            </div>
          </div>
          {/* Full name – always visible */}
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[15px] sm:text-[22px] font-serif font-bold tracking-tight leading-none text-[#1E293B]">
              <span>TREND</span>
              <span className="w-[1.5px] sm:w-[2px] h-3.5 sm:h-5 bg-[#DC2626] rounded-full" />
              <span>MAGAZINE</span>
            </div>
            <p className="text-[7px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#1E293B]/45 font-medium mt-0.5 sm:mt-1">
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
        <div className="flex items-center gap-1.5 sm:gap-2">
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
