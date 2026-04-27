/*
 * TrendMagazine.cz – Article Detail Page v2.0
 * Design: "Steel & Ink" – premium reading experience
 * Features: Large typography, generous spacing, pull-quotes, stat boxes,
 *           scroll animations, Booking.com affiliate, rich content
 */
import { useParams } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { getArticleBySlug, formatDate, formatDateTime, formatTime, hasTime, articles, type Article as ArticleType } from "@/lib/data";
import { Clock, ArrowLeft, Share2, Facebook, Twitter, Bookmark, TrendingUp, BarChart3, Globe, Zap, Calendar } from "lucide-react";
import { motion, useInView } from "framer-motion";

/* ── YouTube ID extractor ── */
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
  return match ? match[1] : "";
}

/* ── Animated section wrapper ── */
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stat Box Component ── */
function StatBox({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-card border border-border/50 rounded-sm">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground font-serif">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/* ── Pull Quote Component ── */
function PullQuote({ text, author }: { text: string; author?: string }) {
  return (
    <aside className="my-12 mx-0 lg:-mx-8">
      <div className="relative py-8 px-8 lg:px-12 border-l-4 border-primary bg-primary/[0.03]">
        <svg className="absolute top-4 left-4 lg:left-8 w-8 h-8 text-primary/20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
        </svg>
        <p className="text-xl lg:text-2xl font-serif italic text-foreground/90 leading-relaxed pl-8 lg:pl-6">
          {text}
        </p>
        {author && (
          <p className="mt-4 text-sm font-medium text-muted-foreground pl-8 lg:pl-6">— {author}</p>
        )}
      </div>
    </aside>
  );
}

/* ── Booking.com Affiliate Box ── */
function BookingBox() {
  return (
    <div className="my-12 rounded-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#003580] to-[#0057b8] p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-xl font-bold text-white mb-2">Zarezervujte si ubytování</p>
            <p className="text-white/80 text-base leading-relaxed">
              Najděte nejlepší hotely a apartmány pro vaši cestu na Booking.com. Porovnejte ceny a čtěte recenze od skutečných hostů.
            </p>
          </div>
          <a
            href="https://www.booking.com"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 bg-[#febb02] hover:bg-[#ffcc33] text-[#003580] font-bold px-8 py-3.5 rounded-sm text-base transition-colors no-underline whitespace-nowrap"
          >
            Hledat ubytování →
          </a>
        </div>
        <p className="text-white/40 text-xs mt-4">
          Partnerský odkaz – jako člen affiliate programu můžeme získat provizi za rezervace.
        </p>
      </div>
    </div>
  );
}

/* ── Article content generator based on category ── */
function getArticleContent(article: ArticleType) {
  const cat = article.category.id;

  // Category-specific stat boxes
  const statBoxes: Record<string, { stats: { value: string; label: string; icon: React.ReactNode }[] }> = {
    "svet": {
      stats: [
        { value: "195", label: "Zemí ve světě", icon: <Globe className="w-5 h-5" /> },
        { value: "8,1 mld", label: "Světová populace", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "24/7", label: "Zpravodajské pokrytí", icon: <Zap className="w-5 h-5" /> },
      ],
    },
    "business": {
      stats: [
        { value: "+2,4 %", label: "Růst HDP eurozóny", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "3,8 %", label: "Míra nezaměstnanosti ČR", icon: <BarChart3 className="w-5 h-5" /> },
        { value: "25,3", label: "CZK/EUR kurz", icon: <Globe className="w-5 h-5" /> },
      ],
    },
    "akcie": {
      stats: [
        { value: "+18,5 %", label: "S&P 500 YTD", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "5 890", label: "S&P 500 aktuální", icon: <BarChart3 className="w-5 h-5" /> },
        { value: "$120k", label: "Bitcoin ATH", icon: <Zap className="w-5 h-5" /> },
      ],
    },
    "technologie": {
      stats: [
        { value: "$1,8 bil", label: "Globální AI trh 2026", icon: <Zap className="w-5 h-5" /> },
        { value: "+42 %", label: "Růst AI investic r/r", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "3,5 mld", label: "Uživatelů AI nástrojů", icon: <Globe className="w-5 h-5" /> },
      ],
    },
    "auta": {
      stats: [
        { value: "18,7 mil", label: "Prodaných EV v 2025", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "23 %", label: "Podíl EV na trhu", icon: <BarChart3 className="w-5 h-5" /> },
        { value: "680 km", label: "Průměrný dojezd EV", icon: <Zap className="w-5 h-5" /> },
      ],
    },
    "stavebnictvi": {
      stats: [
        { value: "+12 %", label: "Růst modulárních staveb", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "40 %", label: "Úspora času výstavby", icon: <Zap className="w-5 h-5" /> },
        { value: "30 %", label: "Méně stavebního odpadu", icon: <BarChart3 className="w-5 h-5" /> },
      ],
    },
    "zdravi": {
      stats: [
        { value: "150 min", label: "Doporučený pohyb/týden", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "7–9 h", label: "Optimální délka spánku", icon: <Zap className="w-5 h-5" /> },
        { value: "2,5 l", label: "Denní příjem tekutin", icon: <BarChart3 className="w-5 h-5" /> },
      ],
    },
    "celebrity": {
      stats: [
        { value: "4,9 mld", label: "Uživatelů soc. sítí", icon: <Globe className="w-5 h-5" /> },
        { value: "$21 mld", label: "Influencer marketing", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "500 mil", label: "Denních Stories", icon: <Zap className="w-5 h-5" /> },
      ],
    },
    "cestovani": {
      stats: [
        { value: "1,5 mld", label: "Mezinár. turistů 2025", icon: <Globe className="w-5 h-5" /> },
        { value: "+8 %", label: "Růst cestovního ruchu", icon: <TrendingUp className="w-5 h-5" /> },
        { value: "€145", label: "Prům. cena noci v EU", icon: <BarChart3 className="w-5 h-5" /> },
      ],
    },
  };

  // Category-specific pull quotes
  const pullQuotes: Record<string, { text: string; author: string }> = {
    "svet": { text: "Svět se mění rychleji než kdykoli předtím. Klíčem k pochopení budoucnosti je sledovat trendy, které formují přítomnost.", author: "Redakce TrendMagazine" },
    "business": { text: "Úspěšné podnikání v roce 2026 vyžaduje nejen odvahu, ale především schopnost adaptace na neustále se měnící podmínky globální ekonomiky.", author: "Ekonomický analytik" },
    "akcie": { text: "Investování není o předpovídání budoucnosti, ale o přípravě na ni. Diverzifikace a dlouhodobý horizont zůstávají nejlepší strategií.", author: "Investiční stratég" },
    "technologie": { text: "Umělá inteligence není hrozbou pro lidstvo — je to nástroj, který nám umožní řešit problémy, které jsme dosud považovali za neřešitelné.", author: "Tech analytik" },
    "auta": { text: "Elektromobilita není jen trend — je to nevyhnutelná transformace celého automobilového průmyslu, která změní způsob, jakým se pohybujeme.", author: "Automobilový expert" },
    "stavebnictvi": { text: "Budoucnost stavebnictví leží v modulárních a prefabrikovaných řešeních. Ocelové rámové konstrukce nabízejí rychlost, přesnost a udržitelnost.", author: "Ing. Karel Procházka" },
    "zdravi": { text: "Zdraví není jen absence nemoci. Je to stav kompletní fyzické, mentální a sociální pohody, o který je třeba aktivně pečovat každý den.", author: "Dr. Jana Králová" },
    "celebrity": { text: "Sociální sítě demokratizovaly slávu. Dnes může kdokoli s chytrým telefonem a zajímavým obsahem oslovit miliony lidí po celém světě.", author: "Mediální analytik" },
    "cestovani": { text: "Cestování je jediná investice, která vás obohatí, aniž byste museli cokoli prodat. Každá cesta vám otevře novou perspektivu.", author: "Kateřina Veselá, redaktorka" },
  };

  return { stats: statBoxes[cat] || statBoxes["svet"], pullQuote: pullQuotes[cat] || pullQuotes["svet"] };
}

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");
  const [progress, setProgress] = useState(0);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on article change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Článek nenalezen</h1>
          <p className="text-muted-foreground mb-6">Požadovaný článek neexistuje.</p>
          <Link href="/" className="text-primary hover:underline">Zpět na hlavní stránku</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "TrendMagazine.cz",
      logo: { "@type": "ImageObject", url: "https://trendmagazine.cz/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://trendmagazine.cz/clanek/${article.slug}` },
  };

  // Related articles
  const related = articles
    .filter((a) => a.category.id === article.category.id && a.id !== article.id)
    .slice(0, 3);

  // Get category-specific content
  const { stats, pullQuote } = getArticleContent(article);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Reading progress */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <Header />

      <main className="flex-1">
        {/* ── HERO IMAGE / VIDEO (full-width, immersive) ── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full overflow-hidden"
        >
          {article.videoUrl ? (
            /* Video article — embedded YouTube player */
            <div className="relative w-full aspect-[16/9] bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(article.videoUrl)}?rel=0&modestbranding=1`}
                title={article.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            /* Standard image hero */
            <div className="relative w-full aspect-[16/9] lg:aspect-[21/9]">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Breadcrumb on image */}
              <div className="absolute top-6 left-0 right-0 container">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Link href="/" className="hover:text-white transition-colors no-underline flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Hlavní stránka
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/kategorie/${article.category.slug}`}
                    className="hover:text-white transition-colors no-underline"
                  >
                    {article.category.name}
                  </Link>
                </div>
              </div>
              {/* Category + title overlay */}
              <div className="absolute bottom-0 left-0 right-0 container pb-8 lg:pb-12">
                <span
                  className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white rounded-sm mb-5"
                  style={{ backgroundColor: article.category.color }}
                >
                  {article.category.name}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-white leading-[1.15] max-w-4xl drop-shadow-lg">
                  {article.title}
                </h1>
              </div>
            </div>
          )}
          {/* Video article — title below video */}
          {article.videoUrl && (
            <div className="bg-[#1E293B] py-6">
              <div className="container">
                <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                  <Link href="/" className="hover:text-white transition-colors no-underline flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Hlavní stránka
                  </Link>
                  <span>/</span>
                  <Link href={`/kategorie/${article.category.slug}`} className="hover:text-white transition-colors no-underline">
                    {article.category.name}
                  </Link>
                </div>
                <span
                  className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white rounded-sm mb-3"
                  style={{ backgroundColor: article.category.color }}
                >
                  ▶ Video · {article.category.name}
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight max-w-4xl">
                  {article.title}
                </h1>
              </div>
            </div>
          )}
        </motion.section>

        {/* ── ARTICLE META BAR ── */}
        <section className="border-b border-border bg-card/50">
          <div className="container py-5">
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-serif text-lg">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-foreground block">{article.author}</span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-sm border border-border/40">
                <Calendar className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground leading-tight">{formatDateTime(article.date)}</span>
                  {hasTime(article.date) && (
                    <span className="text-[10px] text-muted-foreground leading-tight">čas publikace</span>
                  )}
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" /> {article.readTime} min čtení
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <button className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-primary/5" title="Uložit">
                  <Bookmark className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-primary/5" title="Sdílet">
                  <Share2 className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 text-muted-foreground hover:text-[#1877F2] transition-colors rounded-sm hover:bg-[#1877F2]/5" title="Facebook">
                  <Facebook className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 text-muted-foreground hover:text-[#1DA1F2] transition-colors rounded-sm hover:bg-[#1DA1F2]/5" title="Twitter">
                  <Twitter className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARTICLE BODY + SIDEBAR ── */}
        <section className="container mt-10 lg:mt-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            {/* Main content */}
            <div className="lg:w-2/3">
              {/* Lead paragraph */}
              <AnimatedSection>
                <p className="text-xl lg:text-2xl text-foreground/90 leading-[1.8] font-serif mb-10">
                  {article.excerpt}
                </p>
              </AnimatedSection>

              {/* Stat boxes */}
              <AnimatedSection delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                  {stats.stats.map((stat, i) => (
                    <StatBox key={i} value={stat.value} label={stat.label} icon={stat.icon} />
                  ))}
                </div>
              </AnimatedSection>

              {/* Body text section 1 */}
              <AnimatedSection delay={0.15}>
                <div className="article-body">
                  <p>
                    Situace na globálních trzích se v posledních měsících výrazně proměnila. Analytici z předních
                    finančních institucí poukazují na několik klíčových faktorů, které formují současný vývoj a které
                    budou mít zásadní dopad na ekonomiku v nadcházejících čtvrtletích. Mezi nejvýznamnější patří
                    technologická transformace, geopolitické napětí a měnící se spotřebitelské chování.
                  </p>
                  <p>
                    Podle nejnovějších dat se ukazuje, že tempo změn se zrychluje. Firmy, které dokáží rychle reagovat
                    na nové trendy a přizpůsobit své strategie, získávají výraznou konkurenční výhodu. Naopak ty,
                    které setrvávají u tradičních modelů, čelí rostoucímu tlaku ze strany inovativnějších konkurentů.
                  </p>
                </div>
              </AnimatedSection>

              {/* Pull Quote */}
              <AnimatedSection delay={0.2}>
                <PullQuote text={pullQuote.text} author={pullQuote.author} />
              </AnimatedSection>

              {/* Body text section 2 */}
              <AnimatedSection delay={0.25}>
                <div className="article-body">
                  <h2>Hlavní zjištění a analýza</h2>
                  <p>
                    Detailní analýza dostupných dat odhaluje několik překvapivých trendů. Především je to rostoucí
                    význam udržitelnosti a ESG kritérií při rozhodování investorů i spotřebitelů. Firmy, které
                    integrují principy udržitelného rozvoje do svého podnikání, vykazují v průměru o 15 % vyšší
                    návratnost investic ve srovnání s konkurencí.
                  </p>
                  <p>
                    Dalším významným faktorem je digitalizace. Společnosti, které investovaly do digitální
                    transformace v posledních třech letech, zaznamenaly průměrný nárůst produktivity o 23 %.
                    Tento trend je patrný napříč všemi sektory — od výroby přes služby až po veřejnou správu.
                  </p>
                  <p>
                    Zvláštní pozornost si zaslouží vývoj v oblasti umělé inteligence. Implementace AI řešení
                    přináší nejen úspory nákladů, ale především nové obchodní příležitosti. Podle odhadů
                    poradenské společnosti McKinsey může AI do roku 2030 přidat k globálnímu HDP až 13 bilionů dolarů.
                  </p>
                </div>
              </AnimatedSection>

              {/* Booking.com affiliate for travel articles */}
              {article.category.id === "cestovani" && (
                <AnimatedSection delay={0.3}>
                  <BookingBox />
                </AnimatedSection>
              )}

              {/* Body text section 3 */}
              <AnimatedSection delay={0.3}>
                <div className="article-body">
                  <h2>Co to znamená pro budoucnost</h2>
                  <p>
                    Experti se shodují, že nadcházející období přinese další zásadní změny. Klíčové bude sledovat
                    vývoj regulatorního prostředí, zejména v oblasti technologií a finančních trhů. Evropská unie
                    připravuje řadu nových legislativních opatření, která mohou výrazně ovlivnit podnikatelské
                    prostředí na celém kontinentu.
                  </p>
                  <p>
                    Pro české firmy a investory je důležité sledovat nejen globální trendy, ale také specifika
                    středoevropského regionu. Česká republika si udržuje stabilní ekonomický růst a relativně
                    nízkou nezaměstnanost, což vytváří příznivé podmínky pro podnikání i investice.
                  </p>
                </div>
              </AnimatedSection>

              {/* Highlighted insight box */}
              <AnimatedSection delay={0.35}>
                <div className="my-12 p-8 bg-primary/[0.04] border border-primary/10 rounded-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-foreground mb-2">Klíčový závěr</h3>
                      <p className="text-foreground/80 leading-relaxed text-base">
                        Přestože se ekonomické prostředí stává stále komplexnějším, základní principy úspěchu
                        zůstávají stejné: diverzifikace, dlouhodobé myšlení a schopnost adaptace. Ti, kteří
                        dokáží tyto principy aplikovat v praxi, budou nejlépe připraveni na výzvy i příležitosti,
                        které přinese budoucnost.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Tags */}
              <AnimatedSection delay={0.4}>
                <div className="flex flex-wrap gap-2.5 mb-10 pb-10 border-b border-border">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-sm hover:bg-secondary/80 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </AnimatedSection>

              {/* In-article ad */}
              <AdSlot position="in-article" className="my-10" />

              {/* Related articles */}
              {related.length > 0 && (
                <AnimatedSection delay={0.1}>
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-2xl font-serif font-bold text-foreground">Mohlo by vás zajímat</h2>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {related.map((a) => (
                        <Link key={a.id} href={`/clanek/${a.slug}`} className="no-underline group">
                          <article className="overflow-hidden rounded-sm border border-border/40 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="overflow-hidden aspect-[16/10]">
                              <img
                                src={a.image}
                                alt={a.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <div className="p-4">
                              <span
                                className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white rounded-sm mb-2"
                                style={{ backgroundColor: a.category.color }}
                              >
                                {a.category.name}
                              </span>
                              <h4 className="text-base font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                {a.title}
                              </h4>
                              <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="lg:sticky lg:top-32">
                <Sidebar />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
