/*
 * TrendMagazine.cz – Article Detail Page
 * Design: "Warm Authority" – reading-focused layout with progress bar
 * SEO: Schema.org Article structured data, Open Graph
 */
import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { getArticleBySlug, formatDate, articles } from "@/lib/data";
import { Clock, ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";

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
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "TrendMagazine.cz",
      logo: {
        "@type": "ImageObject",
        url: "https://trendmagazine.cz/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://trendmagazine.cz/clanek/${article.slug}`,
    },
  };

  // Related articles (same category, excluding current)
  const related = articles
    .filter((a) => a.category.id === article.category.id && a.id !== article.id)
    .slice(0, 3);

  // Sample article body content
  const articleBody = `
    <p>${article.excerpt}</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <h2>Hlavní zjištění</h2>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    <h2>Co to znamená pro budoucnost</h2>
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
    <blockquote>„Toto je zásadní moment pro celý sektor. Očekáváme, že v příštích měsících uvidíme další významné změny." – expert z oboru</blockquote>
    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
  `;

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
        {/* Article header */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mt-6"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors no-underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Hlavní stránka
            </Link>
            <span>/</span>
            <Link
              href={`/kategorie/${article.category.slug}`}
              className="hover:text-primary transition-colors no-underline"
            >
              {article.category.name}
            </Link>
          </div>

          {/* Title */}
          <span
            className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded-sm mb-4"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-5">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            <span className="font-medium text-foreground">{article.author}</span>
            <span>{formatDate(article.date)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTime} min čtení
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-primary/5" title="Sdílet">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-[#1877F2] transition-colors rounded-sm hover:bg-[#1877F2]/5" title="Facebook">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-[#1DA1F2] transition-colors rounded-sm hover:bg-[#1DA1F2]/5" title="Twitter">
                <Twitter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Hero image */}
        <section className="container mb-8">
          <div className="overflow-hidden rounded-sm aspect-[16/9] lg:aspect-[21/9]">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* Article body + sidebar */}
        <section className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              {/* Article content */}
              <article
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold
                  prose-p:text-foreground/80 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary prose-blockquote:text-foreground/70 prose-blockquote:italic prose-blockquote:font-serif
                  prose-strong:text-foreground
                  mb-8"
                dangerouslySetInnerHTML={{ __html: articleBody }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* In-article ad */}
              <AdSlot position="in-article" className="my-8" />

              {/* Related articles */}
              {related.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-serif font-bold text-foreground">Mohlo by vás zajímat</h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {related.map((a) => (
                      <Link key={a.id} href={`/clanek/${a.slug}`} className="no-underline group">
                        <article className="article-card overflow-hidden rounded-sm border border-border/40 bg-card hover:shadow-md transition-shadow">
                          <div className="overflow-hidden aspect-[16/10]">
                            <img src={a.image} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {a.title}
                            </h4>
                            <span className="text-xs text-muted-foreground mt-1 block">{formatDate(a.date)}</span>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
