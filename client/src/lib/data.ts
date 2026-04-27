// TrendMagazine.cz – Article Data Model & Sample Content
// Design: "Steel & Ink" – dark steel primary, warm béžové bg, serif headings

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: Category;
  image: string;
  videoUrl?: string; // YouTube or video URL for video articles
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
  { id: "svet", name: "Svět", slug: "svet", description: "Aktuální zprávy ze světa", color: "#1E293B" },
  { id: "business", name: "Business", slug: "business", description: "Podnikání, ekonomika a finance", color: "#92400E" },
  { id: "akcie", name: "Akciové trhy", slug: "akcie", description: "Investice, burzy a akciové trhy", color: "#334155" },
  { id: "technologie", name: "AI & Technologie", slug: "technologie", description: "Umělá inteligence, inovace a tech novinky", color: "#0F766E" },
  { id: "auta", name: "Auta & Mobilita", slug: "auta", description: "Automobilový průmysl a budoucnost dopravy", color: "#475569" },
  { id: "stavebnictvi", name: "Stavebnictví", slug: "stavebnictvi", description: "Moderní stavebnictví a bydlení", color: "#78350F" },
  { id: "zdravi", name: "Zdraví & Fitness", slug: "zdravi", description: "Zdravý životní styl, cvičení a výživa", color: "#166534" },
  { id: "celebrity", name: "Celebrity & Influenceři", slug: "celebrity", description: "Ze světa celebrit a influencerů", color: "#7E22CE" },
  { id: "cestovani", name: "Cestování", slug: "cestovani", description: "Destinace, tipy na výlety a cestovatelský lifestyle", color: "#0369A1" },
];

export const getCategoryBySlug = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);

// Sample articles for demonstration
export const articles: Article[] = [
  // ─── FEATURED / HERO ───
  {
    id: "1",
    title: "Evropská ekonomika překvapuje: Růst HDP překonal očekávání analytiků",
    excerpt: "Nejnovější data Eurostatu ukazují, že evropská ekonomika roste rychleji, než se čekalo. Hlavním tahounem jsou technologické firmy a zelená energetika.",
    category: categories[0],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-eu-economy-dmZisanirM7Z4UgUM4Sk47.webp",
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
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-gpt5-ai-g6B4zSUkDc59EZ6g9AcoNH.webp",
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
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-tesla-model-q-CxDrYKDhhj5VrBsVhqT5Gi.webp",
    author: "Petr Svoboda",
    date: "2026-04-17",
    readTime: 6,
    tags: ["Tesla", "elektromobily", "Elon Musk"],
    slug: "tesla-odhalila-model-q",
    featured: true,
  },
  {
    id: "4",
    title: "Bitcoin překonal 120 000 dolarů: Co stojí za historickým rally",
    excerpt: "Kryptoměnový trh zažívá nebývalý růst. Bitcoin poprvé v historii překonal hranici 120 tisíc dolarů a analytici očekávají pokračování trendu.",
    category: categories[2],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-bitcoin-rally-jerfggYtdV5eKRBx7Hnr3f.webp",
    author: "Tomáš Dvořák",
    date: "2026-04-17",
    readTime: 6,
    tags: ["Bitcoin", "kryptoměny", "investice"],
    slug: "bitcoin-prekonal-120-tisic",
    featured: true,
  },
  {
    id: "5",
    title: "Santorini, Bali nebo Island? Nejlepší destinace pro léto 2026",
    excerpt: "Připravili jsme přehled nejatraktivnějších letních destinací pro rok 2026. Od řeckých ostrovů přes exotické Bali až po divoký Island.",
    category: categories[8],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-santorini-travel-9JYTrS76UrS8RutLT2zJ2V.webp",
    author: "Kateřina Veselá",
    date: "2026-04-16",
    readTime: 8,
    tags: ["cestování", "léto", "destinace"],
    slug: "nejlepsi-destinace-leto-2026",
    featured: true,
  },

  // ─── BUSINESS ───
  {
    id: "6",
    title: "Startupová scéna v Praze: 5 firem, které letos změní trh",
    excerpt: "Praha se stává jedním z nejdynamičtějších startupových hubů ve střední Evropě. Představujeme pět nejslibnějších českých startupů roku 2026.",
    category: categories[1],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=90",
    author: "Eva Černá",
    date: "2026-04-16",
    readTime: 8,
    tags: ["startupy", "Praha", "podnikání"],
    slug: "startupova-scena-praha-2026",
  },
  {
    id: "7",
    title: "Fed ponechal úrokové sazby beze změny: Co to znamená pro trhy",
    excerpt: "Americká centrální banka rozhodla o zachování úrokových sazeb na současné úrovni. Trhy reagovaly smíšeně, dolar mírně oslabil.",
    category: categories[1],
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1600&q=90",
    author: "Tomáš Dvořák",
    date: "2026-04-15",
    readTime: 5,
    tags: ["Fed", "úrokové sazby", "ekonomika"],
    slug: "fed-ponechal-sazby-beze-zmeny",
  },
  {
    id: "8",
    title: "Česká koruna posiluje: Analytici očekávají pokračování trendu",
    excerpt: "Česká koruna dosáhla nejsilnější úrovně vůči euru za poslední dva roky. ČNB signalizuje opatrný přístup k dalšímu uvolňování měnové politiky.",
    category: categories[1],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-14",
    readTime: 4,
    tags: ["koruna", "ČNB", "měnová politika"],
    slug: "ceska-koruna-posiluje",
  },

  // ─── AKCIOVÉ TRHY ───
  {
    id: "9",
    title: "Warren Buffett varuje: Trhy jsou přehřáté, investoři by měli být opatrní",
    excerpt: "Legendární investor Warren Buffett na výroční schůzi Berkshire Hathaway upozornil na rizika současného býčího trhu a doporučil defenzivní strategii.",
    category: categories[2],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-warren-buffett-7KwnmCbqVqF7cTy2Vn9x8f.webp",
    author: "Tomáš Dvořák",
    date: "2026-04-16",
    readTime: 6,
    tags: ["investice", "Buffett", "akcie"],
    slug: "warren-buffett-varuje-trhy",
  },
  {
    id: "10",
    title: "S&P 500 dosáhl nového rekordu: Které sektory táhnou trh vzhůru",
    excerpt: "Americký akciový index S&P 500 překonal historické maximum. Analyzujeme, které sektory a společnosti stojí za tímto růstem.",
    category: categories[2],
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1600&q=90",
    author: "Tomáš Dvořák",
    date: "2026-04-14",
    readTime: 5,
    tags: ["S&P 500", "akcie", "rekord"],
    slug: "sp500-novy-rekord",
  },
  {
    id: "11",
    title: "Zlato překonalo 3 500 USD za unci: Bezpečný přístav láká investory",
    excerpt: "Cena zlata dosáhla historického maxima. Geopolitická nejistota a obavy z inflace ženou investory do bezpečných aktiv.",
    category: categories[2],
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-13",
    readTime: 5,
    tags: ["zlato", "komodity", "investice"],
    slug: "zlato-prekonalo-3500-usd",
  },

  // ─── AI & TECHNOLOGIE ───
  {
    id: "12",
    title: "Apple pracuje na revolučním AI čipu: Co víme o projektu Atlas",
    excerpt: "Podle zdrojů blízkých společnosti Apple vyvíjí vlastní AI procesor, který by mohl změnit budoucnost osobních počítačů a mobilních zařízení.",
    category: categories[3],
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&q=90",
    author: "Martin Novák",
    date: "2026-04-15",
    readTime: 6,
    tags: ["Apple", "AI", "čipy"],
    slug: "apple-ai-cip-projekt-atlas",
  },
  {
    id: "13",
    title: "EU schválila AI Act: Jak nová regulace změní technologický sektor",
    excerpt: "Evropský parlament definitivně schválil zákon o umělé inteligenci. Firmy budou muset splnit přísné požadavky na transparentnost a bezpečnost AI systémů.",
    category: categories[3],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=90",
    author: "Martin Novák",
    date: "2026-04-13",
    readTime: 7,
    tags: ["EU", "AI Act", "regulace"],
    slug: "eu-schvalila-ai-act",
  },
  {
    id: "14",
    title: "Robotaxi od Waymo expanduje do Evropy: Praha mezi prvními městy",
    excerpt: "Autonomní taxislužba Waymo oznámila plány na expanzi do evropských měst. Praha by se mohla stát jedním z prvních měst, kde služba zahájí provoz.",
    category: categories[3],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-12",
    readTime: 5,
    tags: ["Waymo", "autonomní řízení", "Praha"],
    slug: "robotaxi-waymo-expanduje-do-evropy",
  },

  // ─── AUTA & MOBILITA ───
  {
    id: "15",
    title: "Porsche Macan Electric: Prvních 1 000 km s elektrickým SUV",
    excerpt: "Otestovali jsme nové elektrické Porsche Macan na trase přes Alpy. Dojezd, nabíjení, jízdní vlastnosti — kompletní verdikt po tisíci kilometrech.",
    category: categories[4],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-porsche-macan-3cbxbRVGqvZNwN6v8yxtG2.webp",
    author: "Petr Svoboda",
    date: "2026-04-15",
    readTime: 9,
    tags: ["Porsche", "elektromobily", "test"],
    slug: "porsche-macan-electric-test",
  },
  {
    id: "16",
    title: "Čínské elektromobily zaplavují Evropu: Hrozba nebo příležitost?",
    excerpt: "BYD, NIO a další čínské značky agresivně expandují na evropský trh. Analyzujeme dopady na evropské výrobce a spotřebitele.",
    category: categories[4],
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=90",
    author: "Petr Svoboda",
    date: "2026-04-13",
    readTime: 7,
    tags: ["Čína", "elektromobily", "BYD"],
    slug: "cinske-elektromobily-v-evrope",
  },
  {
    id: "17",
    title: "Vodíkové auto vs. elektromobil: Která technologie zvítězí?",
    excerpt: "Zatímco elektromobily dominují trhu, vodíkové technologie nabírají na síle. Porovnáváme obě řešení z hlediska praktičnosti, nákladů a ekologie.",
    category: categories[4],
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-11",
    readTime: 8,
    tags: ["vodík", "elektromobily", "technologie"],
    slug: "vodikove-auto-vs-elektromobil",
  },

  // ─── STAVEBNICTVÍ ───
  {
    id: "18",
    title: "Modulární stavby jsou budoucnost: Proč se o nich mluví stále více",
    excerpt: "Modulární a prefabrikované stavby zažívají boom. Jsou rychlejší, ekologičtější a často i levnější než tradiční výstavba.",
    category: categories[5],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-modular-construction-TV7KdoX9LxARis2TrWQYne.webp",
    author: "Ing. Karel Procházka",
    date: "2026-04-15",
    readTime: 7,
    tags: ["stavebnictví", "modulární domy", "inovace"],
    slug: "modularni-stavby-budoucnost",
  },
  {
    id: "19",
    title: "Ocelové rámové konstrukce: Revoluce v rezidenčním stavebnictví",
    excerpt: "Light Gauge Steel Framing (LGSF) se prosazuje jako alternativa k tradičním stavebním materiálům. Přinášíme přehled výhod a aktuálních projektů v ČR.",
    category: categories[5],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=90",
    author: "Ing. Karel Procházka",
    date: "2026-04-13",
    readTime: 6,
    tags: ["LGSF", "ocel", "stavebnictví"],
    slug: "ocelove-ramove-konstrukce-revoluce",
  },
  {
    id: "20",
    title: "Dezeen Awards 2026: Nejlepší architektonické projekty roku",
    excerpt: "Prestižní architektonická soutěž Dezeen Awards odhalila nominace pro rok 2026. Mezi finalisty je i jeden český projekt.",
    category: categories[5],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-11",
    readTime: 5,
    tags: ["architektura", "Dezeen", "design"],
    slug: "dezeen-awards-2026",
  },

  // ─── ZDRAVÍ & FITNESS ───
  {
    id: "21",
    title: "Jak intermitentní půst mění přístup ke zdraví: Věda vs. mýty",
    excerpt: "Intermitentní půst je jedním z nejdiskutovanějších trendů v oblasti zdraví. Co říká nejnovější vědecký výzkum a jak ho správně praktikovat?",
    category: categories[6],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-intermittent-fasting-E4vwXTqzfBLazV5M4hR4o7.webp",
    author: "Dr. Jana Králová",
    date: "2026-04-16",
    readTime: 8,
    tags: ["zdraví", "půst", "výživa"],
    slug: "intermitentni-pust-veda-vs-myty",
  },
  {
    id: "22",
    title: "5 ranních návyků, které změní váš den: Vědecky ověřené metody",
    excerpt: "Ranní rutina má zásadní vliv na produktivitu a celkové zdraví. Přinášíme pět návyků podložených vědeckými studiemi, které můžete začít praktikovat hned.",
    category: categories[6],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/health-fitness-QcRyqAecJN4FFCusXeyXx7.webp",
    author: "Dr. Jana Králová",
    date: "2026-04-14",
    readTime: 6,
    tags: ["zdraví", "návyky", "produktivita"],
    slug: "5-rannich-navyku-ktere-zmeni-den",
  },
  {
    id: "23",
    title: "Kreatin: Nejúčinnější doplněk stravy, o kterém byste měli vědět",
    excerpt: "Kreatin je jedním z nejprozkoumanějších suplementů na světě. Nové studie ukazují jeho benefity nejen pro sportovce, ale i pro kognitivní funkce.",
    category: categories[6],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-12",
    readTime: 7,
    tags: ["kreatin", "suplementy", "fitness"],
    slug: "kreatin-nejucinnejsi-doplnek-stravy",
  },

  // ─── CELEBRITY & INFLUENCEŘI ───
  {
    id: "24",
    title: "Největší influencer skandál roku: Co se skutečně stalo?",
    excerpt: "Sociální sítě žijí kontroverzí kolem jednoho z největších evropských influencerů. Přinášíme chronologický přehled událostí a reakce komunity.",
    category: categories[7],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/celebrity-fashion-HawcgiGjdgAz3EMCLuTqPb.webp",
    author: "Lucie Marková",
    date: "2026-04-16",
    readTime: 4,
    tags: ["influenceři", "sociální sítě", "skandál"],
    slug: "nejvetsi-influencer-skandal-roku",
  },
  {
    id: "25",
    title: "Met Gala 2026: Nejodvážnější outfity a překvapení večera",
    excerpt: "Letošní Met Gala opět přinesla módní extravaganci. Od futuristických kreací po klasickou eleganci — přehled nejzajímavějších momentů.",
    category: categories[7],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=90",
    author: "Lucie Marková",
    date: "2026-04-14",
    readTime: 5,
    tags: ["Met Gala", "móda", "celebrity"],
    slug: "met-gala-2026-nejodvaznejsi-outfity",
  },
  {
    id: "26",
    title: "YouTube vs. TikTok: Kdo vyhrává válku o pozornost v roce 2026",
    excerpt: "Boj o dominanci na trhu krátkých videí se přiostřuje. Analyzujeme trendy, čísla a strategie obou platforem.",
    category: categories[7],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-12",
    readTime: 6,
    tags: ["YouTube", "TikTok", "sociální sítě"],
    slug: "youtube-vs-tiktok-2026",
  },

  // ─── CESTOVÁNÍ ───
  {
    id: "27",
    title: "Víkend v Budapešti za 3 000 Kč: Kompletní průvodce pro úsporné cestovatele",
    excerpt: "Budapešť nabízí skvělý poměr ceny a zážitků. Připravili jsme detailní průvodce, jak si užít víkend v maďarské metropoli bez zbytečného utrácení.",
    category: categories[8],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663474784368/jB8WLLBjeR8YxSRq9BnC2p/article-budapest-travel-4uYP72JYQ3Z3SFLGLGW3bh.webp",
    author: "Kateřina Veselá",
    date: "2026-04-15",
    readTime: 10,
    tags: ["Budapešť", "víkendový výlet", "budget"],
    slug: "vikend-v-budapesti-za-3000-kc",
  },
  {
    id: "28",
    title: "Japonsko bez davů: 5 skrytých klenotů mimo turistické trasy",
    excerpt: "Zapomeňte na přeplněné Tokio a Kjóto. Představujeme pět méně známých japonských destinací, které nabízejí autentický zážitek bez front.",
    category: categories[8],
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=90",
    author: "Kateřina Veselá",
    date: "2026-04-13",
    readTime: 8,
    tags: ["Japonsko", "cestování", "tipy"],
    slug: "japonsko-bez-davu-skryte-klenoty",
  },
  {
    id: "29",
    title: "Digitální nomádi v roce 2026: Nejlepší země pro práci na dálku",
    excerpt: "Stále více profesionálů pracuje z exotických destinací. Porovnáváme nejlepší země pro digitální nomády z hlediska víz, nákladů a kvality života.",
    category: categories[8],
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-11",
    readTime: 7,
    tags: ["digitální nomádi", "remote work", "cestování"],
    slug: "digitalni-nomadi-nejlepsi-zeme-2026",
  },

  // ─── SVĚT ───
  {
    id: "30",
    title: "Summit G7 v Itálii: Klíčová témata a očekávané výsledky",
    excerpt: "Lídři sedmi nejvyspělejších ekonomik se scházejí v Apulii. Na programu je AI regulace, klimatická krize a geopolitická bezpečnost.",
    category: categories[0],
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-15",
    readTime: 6,
    tags: ["G7", "diplomacie", "geopolitika"],
    slug: "summit-g7-italie-klicova-temata",
  },
  {
    id: "31",
    title: "Indie předstihla Čínu: Nejlidnatější země světa mění globální ekonomiku",
    excerpt: "Indie se stala nejlidnatější zemí světa a její ekonomický růst překonává očekávání. Analyzujeme dopady na globální obchod a geopolitiku.",
    category: categories[0],
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-13",
    readTime: 7,
    tags: ["Indie", "ekonomika", "demografie"],
    slug: "indie-predstihla-cinu",
  },
  {
    id: "32",
    title: "Arktida se otepluje čtyřikrát rychleji než zbytek planety",
    excerpt: "Nová studie NASA potvrzuje alarmující tempo oteplování Arktidy. Tání ledovců akceleruje a vědci varují před nevratnými změnami.",
    category: categories[0],
    image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1600&q=90",
    author: "Redakce TM",
    date: "2026-04-11",
    readTime: 5,
    tags: ["klima", "Arktida", "NASA"],
    slug: "arktida-se-otepluje-ctyrykrat-rychleji",
  },
  // ─── VIDEO ČLÁNKY ───
  {
    id: "v1",
    title: "Jak Tesla Gigafactory vyrábí 10 000 baterií denně",
    excerpt: "Exkluzivní video z výrobní linky Tesla Gigafactory v Nevadě. Podívejte se, jak vznikají baterie pro elektromobily budoucnosti.",
    category: categories[4],
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1600&q=90",
    videoUrl: "https://www.youtube.com/watch?v=7-4yOx1CnXE",
    author: "Petr Svoboda",
    date: "2026-04-19",
    readTime: 12,
    tags: ["Tesla", "Gigafactory", "video", "baterie"],
    slug: "tesla-gigafactory-vyroba-baterii",
    featured: true,
  },
  {
    id: "v2",
    title: "Dubai 2026: Město budoucnosti očima dronu",
    excerpt: "Úchvatné záběry z dronu nad Dubají — nové mrakodrapy, umělé ostrovy a projekty, které mění tvář města.",
    category: categories[8],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=90",
    videoUrl: "https://www.youtube.com/watch?v=SLaYPmhse30",
    author: "Redakce TM",
    date: "2026-04-18",
    readTime: 8,
    tags: ["Dubai", "architektura", "video", "dron"],
    slug: "dubai-2026-mesto-budoucnosti",
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

/**
 * Returns true if the date string contains a time component (not just a date).
 * Handles ISO 8601 strings like "2026-04-18T14:30:00Z" or "2026-04-18T14:30:00+02:00"
 */
export const hasTime = (dateStr: string): boolean => {
  return /T\d{2}:\d{2}/.test(dateStr);
};

/**
 * Formats date with prominent time display.
 * If the date string includes a time component, returns "26. dubna 2026, 14:30"
 * If date-only, returns "26. dubna 2026"
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (hasTime(dateStr)) {
    const timePart = date.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${datePart}, ${timePart}`;
  }
  return datePart;
};

/**
 * Returns only the time part (e.g. "14:30") if available, otherwise empty string.
 */
export const formatTime = (dateStr: string): string => {
  if (!hasTime(dateStr)) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
