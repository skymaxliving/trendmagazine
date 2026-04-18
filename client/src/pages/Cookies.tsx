/*
 * TrendMagazine.cz – Zásady používání cookies
 * Kompletní cookie policy v souladu s GDPR a českým právem (od 2022 opt-in)
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary no-underline">Hlavní stránka</Link>
            <span className="mx-2">/</span>
            <span>Zásady cookies</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Zásady používání souborů cookies
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Poslední aktualizace: 18. dubna 2026</p>

          <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground">

            <h2>1. Co jsou soubory cookies</h2>
            <p>
              Soubory cookies jsou malé textové soubory, které se ukládají do vašeho zařízení (počítač, tablet,
              mobilní telefon) při návštěvě webových stránek. Cookies umožňují webové stránce zapamatovat si
              vaše preference a zlepšit váš uživatelský zážitek. Cookies samy o sobě neidentifikují konkrétní
              osobu, ale konkrétní zařízení.
            </p>

            <h2>2. Jaké cookies používáme</h2>
            <p>
              Na portálu TrendMagazine.cz používáme následující kategorie cookies:
            </p>

            <h3>2.1 Nezbytné cookies (technické)</h3>
            <p>
              Tyto cookies jsou nezbytné pro základní fungování webové stránky. Bez nich by stránka nemohla
              správně fungovat. Nevyžadují váš souhlas, neboť jsou založeny na oprávněném zájmu Provozovatele
              zajistit funkčnost webu.
            </p>
            <table>
              <thead>
                <tr><th>Název</th><th>Účel</th><th>Doba platnosti</th></tr>
              </thead>
              <tbody>
                <tr><td>cookie_consent</td><td>Uložení vašeho rozhodnutí o cookies</td><td>12 měsíců</td></tr>
                <tr><td>cf_clearance</td><td>Cloudflare bezpečnostní ověření</td><td>30 minut</td></tr>
              </tbody>
            </table>

            <h3>2.2 Analytické cookies</h3>
            <p>
              Analytické cookies nám pomáhají pochopit, jak návštěvníci používají naše stránky. Informace
              jsou shromažďovány anonymně a slouží ke zlepšování obsahu a funkčnosti Portálu.
              <strong> Tyto cookies ukládáme pouze s vaším výslovným souhlasem.</strong>
            </p>
            <table>
              <thead>
                <tr><th>Název</th><th>Poskytovatel</th><th>Účel</th><th>Doba platnosti</th></tr>
              </thead>
              <tbody>
                <tr><td>_ga, _ga_*</td><td>Google Analytics</td><td>Rozlišení unikátních uživatelů, analýza návštěvnosti</td><td>2 roky</td></tr>
                <tr><td>_gid</td><td>Google Analytics</td><td>Rozlišení unikátních uživatelů</td><td>24 hodin</td></tr>
                <tr><td>_gat</td><td>Google Analytics</td><td>Omezení počtu požadavků</td><td>1 minuta</td></tr>
              </tbody>
            </table>

            <h3>2.3 Marketingové cookies</h3>
            <p>
              Marketingové cookies se používají k zobrazování relevantních reklam na základě vašich zájmů.
              Mohou být také použity k omezení počtu zobrazení reklamy a měření účinnosti reklamních kampaní.
              <strong> Tyto cookies ukládáme pouze s vaším výslovným souhlasem.</strong>
            </p>
            <table>
              <thead>
                <tr><th>Název</th><th>Poskytovatel</th><th>Účel</th><th>Doba platnosti</th></tr>
              </thead>
              <tbody>
                <tr><td>__gads, __gpi</td><td>Google AdSense</td><td>Zobrazování personalizovaných reklam</td><td>13 měsíců</td></tr>
                <tr><td>_fbp</td><td>Meta (Facebook)</td><td>Sledování konverzí, remarketing</td><td>3 měsíce</td></tr>
                <tr><td>NID</td><td>Google</td><td>Personalizace reklam v síti Google</td><td>6 měsíců</td></tr>
              </tbody>
            </table>

            <h2>3. Jak spravovat cookies</h2>
            <p>
              Při první návštěvě Portálu se vám zobrazí lišta s informací o cookies, kde můžete zvolit:
            </p>
            <p>
              <strong>Přijmout vše</strong> – souhlasíte s ukládáním všech kategorií cookies.
            </p>
            <p>
              <strong>Odmítnout vše</strong> – budou uloženy pouze nezbytné (technické) cookies.
            </p>
            <p>
              <strong>Nastavení</strong> – můžete individuálně zvolit, které kategorie cookies povolíte.
            </p>
            <p>
              Svůj souhlas můžete kdykoli změnit nebo odvolat kliknutím na odkaz „Nastavení cookies" v patičce
              stránky. Cookies můžete také spravovat přímo v nastavení svého prohlížeče. Návod pro nejpoužívanější
              prohlížeče naleznete na jejich oficiálních stránkách.
            </p>

            <h2>4. Důsledky odmítnutí cookies</h2>
            <p>
              Odmítnutí analytických a marketingových cookies nemá vliv na funkčnost Portálu. Stránky budou
              fungovat správně i bez nich. Jediným důsledkem může být zobrazování méně relevantních reklam.
            </p>

            <h2>5. Další informace</h2>
            <p>
              Podrobné informace o zpracování osobních údajů naleznete v našich{" "}
              <a href="/ochrana-soukromi">Zásadách ochrany osobních údajů</a>. V případě dotazů nás
              kontaktujte na adrese redakce@trendmagazine.cz.
            </p>

          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
