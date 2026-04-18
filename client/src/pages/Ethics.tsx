/*
 * TrendMagazine.cz – Etický kodex
 * Transparentnost ohledně AI obsahu, zdrojů a redakčních standardů
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Ethics() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary no-underline">Hlavní stránka</Link>
            <span className="mx-2">/</span>
            <span>Etický kodex</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Etický kodex redakce
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Jak pracujeme s obsahem a technologiemi</p>

          <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground">

            <h2>Naše závazky vůči čtenářům</h2>
            <p>
              TrendMagazine.cz se zavazuje k transparentnímu a etickému přístupu k tvorbě a publikaci obsahu.
              Tento etický kodex stanovuje principy, kterými se řídí naše redakční práce, a informuje čtenáře
              o tom, jak obsah vzniká.
            </p>

            <h2>Využití umělé inteligence</h2>
            <p>
              TrendMagazine.cz otevřeně přiznává, že při tvorbě obsahu využívá technologie umělé inteligence.
              AI nástroje nám pomáhají zejména s překladem zahraničních zdrojů do češtiny, adaptací obsahu
              pro české čtenáře a generováním ilustračních obrázků.
            </p>
            <p>
              Každý článek zpracovaný s pomocí AI prochází lidskou redakční kontrolou. Redakce ověřuje
              faktickou správnost, upravuje styl a zajišťuje, aby obsah byl relevantní a srozumitelný
              pro české publikum. AI je nástroj, nikoliv autor – za obsah vždy odpovídá redakce.
            </p>

            <h2>Práce se zdroji</h2>
            <p>
              Při tvorbě obsahu čerpáme z ověřených zahraničních a domácích zdrojů. U každého článku
              uvádíme původní zdroje informací. Respektujeme autorská práva a při zpracování zahraničních
              článků vytváříme originální české texty inspirované původními zdroji, nikoliv jejich doslovné
              kopie.
            </p>

            <h2>Oddělení redakce a obchodu</h2>
            <p>
              Redakční obsah TrendMagazine.cz je tvořen nezávisle na komerčních zájmech. Komerční partnerství,
              affiliate spolupráce ani reklamní příjmy nemají vliv na redakční rozhodování o tom, jaké články
              publikujeme a jak je hodnotíme.
            </p>
            <p>
              Veškerý komerční obsah (sponzorované články, PR materiály, affiliate odkazy) je vždy jasně
              a viditelně označen, aby čtenář mohl snadno rozlišit redakční a komerční obsah.
            </p>

            <h2>Opravy a aktualizace</h2>
            <p>
              Pokud zjistíme chybu v publikovaném článku, provedeme opravu a transparentně o ní informujeme.
              U opravených článků uvádíme datum a charakter provedené opravy. Pokud se domníváte, že některý
              z našich článků obsahuje nepřesnost, kontaktujte nás na adrese redakce@trendmagazine.cz.
            </p>

            <h2>Ochrana soukromí osob</h2>
            <p>
              Při publikaci obsahu respektujeme soukromí fyzických osob. Nezveřejňujeme osobní údaje bez
              souhlasu dotčených osob, s výjimkou veřejně činných osob v souvislosti s jejich veřejnou
              činností, a to v souladu s platnými právními předpisy.
            </p>

            <h2>Kontakt</h2>
            <p>
              Pokud máte dotazy, připomínky nebo podněty k našemu etickému kodexu nebo redakční práci,
              neváhejte nás kontaktovat na adrese: <strong>redakce@trendmagazine.cz</strong>
            </p>

          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
