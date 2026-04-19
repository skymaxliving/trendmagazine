/*
 * TrendMagazine.cz – Footer Component
 * Design: "Steel & Ink" – dark steel background, warm béžový text
 * 5 columns: Brand | Kategorie 1 | Kategorie 2 | Informace | Sociální sítě
 */
import { Link } from "wouter";
import { categories } from "@/lib/data";

function SocialIcon({ type }: { type: string }) {
  switch (type) {
    case "facebook":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      );
    case "x":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
}

const socialLinks = [
  { type: "facebook", label: "Facebook", href: "#" },
  { type: "instagram", label: "Instagram", href: "#" },
  { type: "x", label: "X (Twitter)", href: "#" },
  { type: "linkedin", label: "LinkedIn", href: "#" },
  { type: "youtube", label: "YouTube", href: "#" },
];

const midpoint = Math.ceil(categories.length / 2);

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] text-white/80 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-lg font-serif font-bold tracking-tight leading-none text-white">
                <span>TREND</span>
                <span className="w-[1.5px] h-4 bg-[#EF4444] rounded-full" />
                <span>MAGAZINE</span>
              </div>
              <p className="text-[8px] uppercase tracking-[0.25em] text-white/35 font-medium mt-1">
                Fakta · Trendy · Perspektiva
              </p>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Nezávislý český online magazín přinášející aktuální zprávy, analýzy a trendy ze světa businessu, technologií a životního stylu.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.type}
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center rounded-sm bg-white/8 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-200"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon type={social.type} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kategorie</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, midpoint).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/kategorie/${cat.slug}`}
                    className="text-sm text-white/50 hover:text-white transition-colors no-underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 lg:invisible">Kategorie</h4>
            <ul className="space-y-2.5">
              {categories.slice(midpoint).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/kategorie/${cat.slug}`}
                    className="text-sm text-white/50 hover:text-white transition-colors no-underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informace */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Informace</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/o-nas" className="text-sm text-white/50 hover:text-white transition-colors no-underline">
                  O portálu / Impressum
                </Link>
              </li>
              <li>
                <Link href="/eticky-kodex" className="text-sm text-white/50 hover:text-white transition-colors no-underline">
                  Etický kodex redakce
                </Link>
              </li>
              <li>
                <Link href="/ochrana-soukromi" className="text-sm text-white/50 hover:text-white transition-colors no-underline">
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link href="/podminky-uziti" className="text-sm text-white/50 hover:text-white transition-colors no-underline">
                  Podmínky užití
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-white/50 hover:text-white transition-colors no-underline">
                  Zásady cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kontakt</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-white/50">
                <span className="text-white/70 font-medium">Redakce:</span><br />
                redakce@trendmagazine.cz
              </li>
              <li className="text-sm text-white/50">
                <span className="text-white/70 font-medium">Inzerce:</span><br />
                obchod@trendmagazine.cz
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            &copy; {new Date().getFullYear()} TrendMagazine.cz. Všechna práva vyhrazena.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/35">
            <Link href="/ochrana-soukromi" className="hover:text-white/60 transition-colors no-underline">
              Ochrana soukromí
            </Link>
            <Link href="/podminky-uziti" className="hover:text-white/60 transition-colors no-underline">
              Podmínky užití
            </Link>
            <Link href="/eticky-kodex" className="hover:text-white/60 transition-colors no-underline">
              Etický kodex
            </Link>
            <Link href="/o-nas" className="hover:text-white/60 transition-colors no-underline">
              Impressum
            </Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors no-underline">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
