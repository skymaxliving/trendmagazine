/*
 * TrendMagazine.cz – O nás / Impressum
 * Povinné identifikační údaje provozovatele + redakční info
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary no-underline">Hlavní stránka</Link>
            <span className="mx-2">/</span>
            <span>O nás</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            O portálu TrendMagazine.cz
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Impressum a redakční informace</p>

          <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground">

            <h2>O TrendMagazine</h2>
            <p>
              TrendMagazine.cz je nezávislý český online magazín zaměřený na aktuální trendy ze světa ekonomiky,
              technologií, businessu, zdraví a životního stylu. Naším posláním je přinášet českým čtenářům
              kvalitní, srozumitelné a aktuální informace ze zahraničních i domácích zdrojů.
            </p>
            <p>
              Redakce TrendMagazine využívá při zpracování obsahu moderní technologie včetně umělé inteligence,
              která pomáhá s překladem a adaptací zahraničních zdrojů. Veškerý obsah prochází redakční kontrolou
              a je upravován tak, aby byl relevantní pro české čtenáře.
            </p>

            <h2>Provozovatel portálu</h2>
            <div className="bg-secondary/50 p-6 rounded-sm not-prose mb-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 font-semibold text-foreground w-1/3">Název společnosti</td>
                    <td className="py-2.5 text-foreground/80">SkyForce s.r.o.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 font-semibold text-foreground">Sídlo</td>
                    <td className="py-2.5 text-foreground/80">Sokolovská 1333/45, Poruba, 708 00 Ostrava</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 font-semibold text-foreground">IČO</td>
                    <td className="py-2.5 text-foreground/80">240 41 017</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 font-semibold text-foreground">Zápis v rejstříku</td>
                    <td className="py-2.5 text-foreground/80">Společnost je zapsána v obchodním rejstříku vedeném u Krajského soudu v Ostravě, oddíl C, vložka 101811</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 font-semibold text-foreground">E-mail</td>
                    <td className="py-2.5 text-foreground/80">redakce@trendmagazine.cz</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-foreground">Telefon</td>
                    <td className="py-2.5 text-foreground/80">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Redakce</h2>
            <div className="bg-secondary/50 p-6 rounded-sm not-prose mb-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 font-semibold text-foreground w-1/3">Šéfredaktor</td>
                    <td className="py-2.5 text-foreground/80">Matěj Vantuch</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-foreground">Kontakt na redakci</td>
                    <td className="py-2.5 text-foreground/80">redakce@trendmagazine.cz</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Redakční zásady</h2>
            <p>
              <strong>Nezávislost</strong> – Redakční obsah TrendMagazine.cz je tvořen nezávisle na komerčních
              partnerech. Sponzorované články a komerční sdělení jsou vždy jasně označeny a odděleny od
              redakčního obsahu.
            </p>
            <p>
              <strong>Transparentnost</strong> – Při zpracování obsahu využíváme technologie umělé inteligence
              pro překlad a adaptaci zahraničních zdrojů. Tuto skutečnost transparentně uvádíme. Veškerý obsah
              prochází lidskou redakční kontrolou.
            </p>
            <p>
              <strong>Přesnost</strong> – Usilujeme o maximální přesnost a aktuálnost publikovaných informací.
              V případě zjištění chyby provádíme opravu a informujeme o ní čtenáře.
            </p>
            <p>
              <strong>Právo na odpověď</strong> – Respektujeme právo dotčených osob na odpověď a dodatečné
              sdělení. Žádosti zasílejte na adresu redakce@trendmagazine.cz.
            </p>

            <h2>Komerční spolupráce</h2>
            <p>
              TrendMagazine.cz nabízí následující formy komerční spolupráce:
            </p>
            <p>
              <strong>Zobrazovaná reklama</strong> – reklamní bannery prostřednictvím Google AdSense a přímých
              partnerství. Reklamy jsou jasně odděleny od redakčního obsahu.
            </p>
            <p>
              <strong>Affiliate partnerství</strong> – některé články obsahují affiliate odkazy na produkty
              a služby třetích stran. Tyto odkazy jsou vždy označeny. Provize z affiliate programů nemá vliv
              na redakční hodnocení.
            </p>
            <p>
              <strong>Sponzorovaný obsah</strong> – PR články a sponzorované materiály jsou vždy jasně označeny
              štítkem „Komerční sdělení" nebo „Sponzorovaný obsah".
            </p>
            <p>
              Pro nabídky komerční spolupráce nás kontaktujte na adrese: <strong>obchod@trendmagazine.cz</strong>
            </p>

            <h2>Mimosoudní řešení sporů</h2>
            <p>
              V souladu se zákonem č. 634/1992 Sb., o ochraně spotřebitele, informujeme, že subjektem
              mimosoudního řešení spotřebitelských sporů je Česká obchodní inspekce (ČOI), se sídlem
              Štěpánská 567/15, 120 00 Praha 2, IČO: 000 20 869, internetová adresa:{" "}
              <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer">www.coi.cz</a>.
              Platformu pro řešení sporů on-line naleznete na adrese:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                ec.europa.eu/consumers/odr
              </a>.
            </p>

          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
