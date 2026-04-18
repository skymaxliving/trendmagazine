/*
 * TrendMagazine.cz – Footer Component
 * Design: "Warm Authority" – deep green background, warm cream text
 */
import { Link } from "wouter";
import { categories } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[#1B4332] text-white/80 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-base">TM</span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white leading-none">TrendMagazine</h3>
                <p className="text-[10px] tracking-widest uppercase text-white/50 mt-0.5">.cz</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Nezávislý český online magazín přinášející aktuální zprávy, analýzy a trendy ze světa businessu, technologií a životního stylu.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kategorie</h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/kategorie/${cat.slug}`}
                    className="text-sm text-white/60 hover:text-white transition-colors no-underline"
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
            <ul className="space-y-2">
              <li>
                <Link href="/o-nas" className="text-sm text-white/60 hover:text-white transition-colors no-underline">
                  O portálu / Impressum
                </Link>
              </li>
              <li>
                <Link href="/eticky-kodex" className="text-sm text-white/60 hover:text-white transition-colors no-underline">
                  Etický kodex redakce
                </Link>
              </li>
              <li>
                <Link href="/ochrana-soukromi" className="text-sm text-white/60 hover:text-white transition-colors no-underline">
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link href="/podminky-uziti" className="text-sm text-white/60 hover:text-white transition-colors no-underline">
                  Podmínky užití
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-white/60 hover:text-white transition-colors no-underline">
                  Zásady cookies
                </Link>
              </li>
              {categories.slice(6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/kategorie/${cat.slug}`}
                    className="text-sm text-white/60 hover:text-white transition-colors no-underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-sm text-white/60 mb-3">
              Přihlaste se k odběru a dostávejte nejlepší články přímo do schránky.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Váš email"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-sm text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-sm transition-colors"
              >
                Odebírat
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} TrendMagazine.cz. Všechna práva vyhrazena.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
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
