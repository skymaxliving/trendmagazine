/*
 * TrendMagazine.cz – Ochrana osobních údajů (GDPR)
 * Kompletní privacy policy v souladu s GDPR a českým právem
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary no-underline">Hlavní stránka</Link>
            <span className="mx-2">/</span>
            <span>Ochrana osobních údajů</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Zásady ochrany osobních údajů
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Poslední aktualizace: 18. dubna 2026</p>

          <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground">

            <h2>1. Správce osobních údajů</h2>
            <p>
              Správcem osobních údajů je provozovatel portálu TrendMagazine.cz (dále jen „Správce").
              Kontaktní údaje Správce naleznete na stránce <a href="/o-nas">O nás</a>.
            </p>
            <p>
              V případě jakýchkoliv dotazů ohledně zpracování vašich osobních údajů nás můžete kontaktovat
              na e-mailové adrese: <strong>redakce@trendmagazine.cz</strong>
            </p>

            <h2>2. Jaké osobní údaje zpracováváme</h2>
            <p>
              V rámci provozu portálu TrendMagazine.cz zpracováváme následující kategorie osobních údajů:
            </p>
            <table>
              <thead>
                <tr><th>Kategorie údajů</th><th>Příklady</th><th>Účel</th></tr>
              </thead>
              <tbody>
                <tr><td>Technické údaje</td><td>IP adresa, typ prohlížeče, operační systém, rozlišení obrazovky</td><td>Zajištění funkčnosti webu, bezpečnost</td></tr>
                <tr><td>Údaje z cookies</td><td>Analytické a marketingové identifikátory</td><td>Analýza návštěvnosti, personalizace reklam (pouze se souhlasem)</td></tr>
                <tr><td>Kontaktní údaje</td><td>E-mailová adresa</td><td>Zasílání newsletteru (pouze se souhlasem)</td></tr>
                <tr><td>Údaje z formulářů</td><td>Jméno, e-mail, obsah zprávy</td><td>Komunikace s čtenáři</td></tr>
              </tbody>
            </table>

            <h2>3. Právní základ zpracování</h2>
            <p>
              Osobní údaje zpracováváme na základě následujících právních titulů v souladu s čl. 6 odst. 1 Nařízení
              Evropského parlamentu a Rady (EU) 2016/679 (GDPR):
            </p>
            <p>
              <strong>Oprávněný zájem Správce</strong> (čl. 6 odst. 1 písm. f) GDPR) – zajištění funkčnosti a bezpečnosti
              webu, ochrana před zneužitím, vedení interní statistiky návštěvnosti.
            </p>
            <p>
              <strong>Souhlas subjektu údajů</strong> (čl. 6 odst. 1 písm. a) GDPR) – zasílání newsletteru, ukládání
              analytických a marketingových cookies, personalizace obsahu a reklam.
            </p>
            <p>
              <strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b) GDPR) – v případě, že s námi uzavřete smluvní vztah
              (např. předplatné, inzerce).
            </p>

            <h2>4. Příjemci osobních údajů</h2>
            <p>
              Vaše osobní údaje mohou být předány následujícím kategoriím příjemců, a to výhradně v rozsahu nezbytném
              pro naplnění výše uvedených účelů:
            </p>
            <p>
              <strong>Poskytovatelé analytických služeb</strong> – Google Analytics (Google Ireland Limited, Gordon House,
              Barrow Street, Dublin 4, Irsko). Zpracování probíhá na základě vašeho souhlasu s analytickými cookies.
            </p>
            <p>
              <strong>Poskytovatelé reklamních služeb</strong> – Google AdSense a případní další reklamní partneři.
              Zpracování probíhá výhradně na základě vašeho souhlasu s marketingovými cookies.
            </p>
            <p>
              <strong>Poskytovatel hostingu</strong> – Cloudflare, Inc. (101 Townsend St, San Francisco, CA 94107, USA).
              Předávání údajů do USA probíhá na základě standardních smluvních doložek dle čl. 46 odst. 2 písm. c) GDPR.
            </p>
            <p>
              <strong>Poskytovatel e-mailových služeb</strong> – pro rozesílání newsletteru. Konkrétní poskytovatel je
              uveden v aktuální verzi tohoto dokumentu.
            </p>

            <h2>5. Předávání údajů do třetích zemí</h2>
            <p>
              Některé z výše uvedených příjemců sídlí mimo Evropský hospodářský prostor (EHP), zejména v USA.
              Předávání osobních údajů do těchto zemí probíhá na základě rozhodnutí Evropské komise o odpovídající
              úrovni ochrany (EU-U.S. Data Privacy Framework) nebo na základě standardních smluvních doložek
              schválených Evropskou komisí.
            </p>

            <h2>6. Doba uchování osobních údajů</h2>
            <p>
              Osobní údaje uchováváme pouze po dobu nezbytnou k naplnění účelů, pro které byly shromážděny.
              Technické údaje (logy) uchováváme maximálně po dobu 14 dnů. Údaje z newsletteru uchováváme po dobu
              trvání vašeho souhlasu, nejdéle však 3 roky od posledního aktivního projevu zájmu. Údaje z kontaktních
              formulářů uchováváme po dobu 1 roku od posledního kontaktu.
            </p>

            <h2>7. Vaše práva</h2>
            <p>
              V souvislosti se zpracováním vašich osobních údajů máte následující práva:
            </p>
            <p>
              <strong>Právo na přístup</strong> (čl. 15 GDPR) – máte právo získat potvrzení, zda jsou vaše osobní údaje
              zpracovávány, a pokud ano, získat k nim přístup.
            </p>
            <p>
              <strong>Právo na opravu</strong> (čl. 16 GDPR) – máte právo požadovat opravu nepřesných osobních údajů.
            </p>
            <p>
              <strong>Právo na výmaz</strong> (čl. 17 GDPR) – máte právo požadovat vymazání svých osobních údajů
              („právo být zapomenut"), pokud pro jejich zpracování již neexistuje právní důvod.
            </p>
            <p>
              <strong>Právo na omezení zpracování</strong> (čl. 18 GDPR) – máte právo požadovat omezení zpracování
              vašich osobních údajů.
            </p>
            <p>
              <strong>Právo na přenositelnost</strong> (čl. 20 GDPR) – máte právo získat své osobní údaje ve strukturovaném,
              běžně používaném a strojově čitelném formátu.
            </p>
            <p>
              <strong>Právo vznést námitku</strong> (čl. 21 GDPR) – máte právo vznést námitku proti zpracování osobních
              údajů, které je založeno na oprávněném zájmu Správce.
            </p>
            <p>
              <strong>Právo odvolat souhlas</strong> – souhlas se zpracováním osobních údajů můžete kdykoli odvolat,
              aniž by tím byla dotčena zákonnost zpracování před jeho odvoláním.
            </p>
            <p>
              <strong>Právo podat stížnost</strong> – máte právo podat stížnost u dozorového úřadu, kterým je Úřad
              pro ochranu osobních údajů (ÚOOÚ), Pplk. Sochora 27, 170 00 Praha 7,
              e-mail: posta@uoou.gov.cz, web: <a href="https://www.uoou.gov.cz" target="_blank" rel="noopener noreferrer">www.uoou.gov.cz</a>.
            </p>

            <h2>8. Zabezpečení osobních údajů</h2>
            <p>
              Přijali jsme vhodná technická a organizační opatření k zabezpečení vašich osobních údajů. Web je
              provozován na zabezpečeném protokolu HTTPS s šifrováním TLS. Přístup k osobním údajům je omezen
              pouze na oprávněné osoby.
            </p>

            <h2>9. Automatizované rozhodování</h2>
            <p>
              Při zpracování vašich osobních údajů nedochází k automatizovanému rozhodování ani profilování
              ve smyslu čl. 22 GDPR, které by mělo právní účinky nebo by se vás obdobným způsobem významně dotýkalo.
            </p>

            <h2>10. Změny těchto zásad</h2>
            <p>
              Tyto zásady ochrany osobních údajů mohou být průběžně aktualizovány. O podstatných změnách vás
              budeme informovat prostřednictvím oznámení na webových stránkách. Doporučujeme tyto zásady
              pravidelně kontrolovat.
            </p>

          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
