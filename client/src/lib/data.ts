// TrendMagazine.cz – Article Data Model & Sample Content
// Design: "Warm Authority" – deep green, warm cream, amber accents

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: Category;
  image: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
  slug: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  { id: "svet", name: "Svět", slug: "svet", description: "Aktuální zprávy ze světa", color: "#1B4332" },
  { id: "business", name: "Business", slug: "business", description: "Podnikání, ekonomika a finance", color: "#B8860B" },
  { id: "akcie", name: "Akciové trhy", slug: "akcie", description: "Investice, burzy a akciové trhy", color: "#2D5016" },
  { id: "technologie", name: "AI & Technologie", slug: "technologie", description: "Umělá inteligence, inovace a tech novinky", color: "#0E7490" },
  { id: "auta", name: "Auta & Mobilita", slug: "auta", description: "Automobilový průmysl a budoucnost dopravy", color: "#4A5568" },
  { id: "stavebnictvi", name: "Stavebnictví", slug: "stavebnictvi", description: "Moderní stavebnictví a bydlení", color: "#92400E" },
  { id: "zdravi", name: "Zdraví & Fitness", slug: "zdravi", description: "Zdravý životní styl, cvičení a výživa", color: "#059669" },
  { id: "celebrity", name: "Celebrity & Influenceři", slug: "celebrity", description: "Ze světa celebrit a influencerů", color: "#7C3AED" },
];

export const getCategoryBySlug = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);

// Sample articles for demonstration
export const articles: Article[] = [
  {
    id: "1",
    title: "Evropská ekonomika překvapuje: Růst HDP překonal očekávání analytiků",
    excerpt: "Nejnovější data Eurostatu ukazují, že evropská ekonomika roste rychleji, než se čekalo. Hlavním tahounem jsou technologické firmy a zelená energetika.",
    category: categories[0],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/hero-main-FMvrhhhaE9XLj823kLHMre.webp",
    author: "Redakce TM",
    date: "2026-04-18",
    readTime: 5,
    tags: ["ekonomika", "EU", "HDP"],
    slug: "evropska-ekonomika-prekvapuje",
    featured: true,
  },
  {
    id: "2",
    title: "OpenAI představilo GPT-5: Co přináší nová generace umělé inteligence",
    excerpt: "Nový model GPT-5 slibuje revoluci v oblasti zpracování přirozeného jazyka. Přinášíme přehled klíčových vylepšení a jejich dopad na byznys.",
    category: categories[3],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/hero-tech-4qLP5nhSMeEykXxFxvkz7W.webp",
    author: "Martin Novák",
    date: "2026-04-17",
    readTime: 7,
    tags: ["AI", "OpenAI", "GPT-5"],
    slug: "openai-predstavilo-gpt5",
    featured: true,
  },
  {
    id: "3",
    title: "Tesla odhalila nový Model Q: Elektromobil za cenu běžného auta",
    excerpt: "Elon Musk představil dlouho očekávaný cenově dostupný elektromobil. Model Q by měl stát pod 25 000 dolarů a změnit pravidla hry na trhu.",
    category: categories[4],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/hero-auto-jLypGMWR3UE735Uo7Rd4Kq.webp",
    author: "Petr Svoboda",
    date: "2026-04-17",
    readTime: 6,
    tags: ["Tesla", "elektromobily", "Elon Musk"],
    slug: "tesla-odhalila-model-q",
  },
  {
    id: "4",
    title: "Jak intermitentní půst mění přístup ke zdraví: Věda vs. mýty",
    excerpt: "Intermitentní půst je jedním z nejdiskutovanějších trendů v oblasti zdraví. Co říká nejnovější vědecký výzkum a jak ho správně praktikovat?",
    category: categories[6],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/hero-health-ZAWs6Cm4nkgNe9LR84WdEV.webp",
    author: "Dr. Jana Králová",
    date: "2026-04-16",
    readTime: 8,
    tags: ["zdraví", "půst", "výživa"],
    slug: "intermitentni-pust-veda-vs-myty",
  },
  {
    id: "5",
    title: "Warren Buffett varuje: Trhy jsou přehřáté, investoři by měli být opatrní",
    excerpt: "Legendární investor Warren Buffett na výroční schůzi Berkshire Hathaway upozornil na rizika současného býčího trhu a doporučil defenzivní strategii.",
    category: categories[2],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/hero-business-QFUYk2CcszWGFUN4xcSFNq.webp",
    author: "Tomáš Dvořák",
    date: "2026-04-16",
    readTime: 6,
    tags: ["investice", "Buffett", "akcie"],
    slug: "warren-buffett-varuje-trhy",
  },
  {
    id: "6",
    title: "Modulární stavby jsou budoucnost: Proč se o nich mluví stále více",
    excerpt: "Modulární a prefabrikované stavby zažívají boom. Jsou rychlejší, ekologičtější a často i levnější než tradiční výstavba. Podíváme se na nejnovější trendy.",
    category: categories[5],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    author: "Ing. Karel Procházka",
    date: "2026-04-15",
    readTime: 7,
    tags: ["stavebnictví", "modulární domy", "inovace"],
    slug: "modularni-stavby-budoucnost",
  },
  {
    id: "7",
    title: "Největší influencer skandál roku: Co se skutečně stalo?",
    excerpt: "Sociální sítě žijí kontroverzí kolem jednoho z největších evropských influencerů. Přinášíme chronologický přehled událostí a reakce komunity.",
    category: categories[7],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    author: "Lucie Marková",
    date: "2026-04-15",
    readTime: 4,
    tags: ["influenceři", "sociální sítě", "skandál"],
    slug: "nejvetsi-influencer-skandal-roku",
  },
  {
    id: "8",
    title: "S&P 500 dosáhl nového rekordu: Které sektory táhnou trh vzhůru",
    excerpt: "Americký akciový index S&P 500 překonal historické maximum. Analyzujeme, které sektory a společnosti stojí za tímto růstem.",
    category: categories[2],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    author: "Tomáš Dvořák",
    date: "2026-04-14",
    readTime: 5,
    tags: ["S&P 500", "akcie", "rekord"],
    slug: "sp500-novy-rekord",
  },
  {
    id: "9",
    title: "Apple pracuje na revolučním AI čipu: Co víme o projektu Atlas",
    excerpt: "Podle zdrojů blízkých společnosti Apple vyvíjí vlastní AI procesor, který by mohl změnit budoucnost osobních počítačů a mobilních zařízení.",
    category: categories[3],
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
    author: "Martin Novák",
    date: "2026-04-14",
    readTime: 6,
    tags: ["Apple", "AI", "čipy"],
    slug: "apple-ai-cip-projekt-atlas",
  },
  {
    id: "10",
    title: "Startupová scéna v Praze: 5 firem, které letos změní trh",
    excerpt: "Praha se stává jedním z nejdynamičtějších startupových hubů ve střední Evropě. Představujeme pět nejslibnějších českých startupů roku 2026.",
    category: categories[1],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    author: "Eva Černá",
    date: "2026-04-13",
    readTime: 8,
    tags: ["startupy", "Praha", "podnikání"],
    slug: "startupova-scena-praha-2026",
  },
];

export const getArticlesByCategory = (slug: string): Article[] =>
  articles.filter((a) => a.category.slug === slug);

export const getFeaturedArticles = (): Article[] =>
  articles.filter((a) => a.featured);

export const getLatestArticles = (count: number = 10): Article[] =>
  [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count);

export const getArticleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
