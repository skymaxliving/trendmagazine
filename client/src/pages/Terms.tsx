/*
 * TrendMagazine.cz – Podmínky užití
 * Kompletní VOP pro online magazín s affiliate links a AI obsahem
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary no-underline">Hlavní stránka</Link>
            <span className="mx-2">/</span>
            <span>Podmínky užití</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Podmínky užití
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Poslední aktualizace: 18. dubna 2026</p>

          <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground">

            <h2>1. Úvodní ustanovení</h2>
            <p>
              Tyto podmínky užití (dále jen „Podmínky") upravují pravidla pro používání internetového portálu
              TrendMagazine.cz (dále jen „Portál"), který je provozován společností uvedenou na stránce
              <a href="/o-nas">O nás</a> (dále jen „Provozovatel"). Přístupem na Portál a jeho používáním
              vyjadřujete souhlas s těmito Podmínkami. Pokud s Podmínkami nesouhlasíte, Portál prosím nepoužívejte.
            </p>

            <h2>2. Charakter obsahu</h2>
            <p>
              Portál TrendMagazine.cz je online magazín zaměřený na zpravodajství, analýzy a komentáře z oblastí
              ekonomiky, technologií, businessu, zdraví, životního stylu a dalších témat. Obsah publikovaný na
              Portálu má informativní a edukativní charakter.
            </p>
            <p>
              <strong>Obsah Portálu nepředstavuje odborné poradenství.</strong> Zejména články z oblasti financí,
              investic a akciových trhů nepředstavují investiční doporučení ve smyslu zákona č. 256/2004 Sb.,
              o podnikání na kapitálovém trhu. Před jakýmkoliv investičním rozhodnutím doporučujeme konzultaci
              s licencovaným finančním poradcem.
            </p>
            <p>
              Články z oblasti zdraví a fitness nepředstavují lékařské poradenství. Vždy se poraďte se svým
              lékařem před zahájením jakéhokoli cvičebního programu nebo změnou stravovacích návyků.
            </p>

            <h2>3. Zpracování a původ obsahu</h2>
            <p>
              Část obsahu publikovaného na Portálu je vytvářena s využitím technologií umělé inteligence (AI),
              a to zejména pro účely překladu, adaptace a zpracování zahraničních zdrojů do českého jazyka.
              Veškerý takto zpracovaný obsah prochází redakční kontrolou. Provozovatel se snaží zajistit
              přesnost a aktuálnost publikovaných informací, avšak nemůže garantovat jejich úplnost a bezchybnost.
            </p>
            <p>
              Provozovatel vždy uvádí zdroje, ze kterých čerpá, a respektuje autorská práva třetích stran.
              Pokud se domníváte, že jakýkoliv obsah na Portálu porušuje vaše autorská práva, kontaktujte nás
              neprodleně na adrese redakce@trendmagazine.cz.
            </p>

            <h2>4. Komerční obsah a affiliate odkazy</h2>
            <p>
              Portál může obsahovat komerční sdělení, sponzorované články a affiliate odkazy. Veškerý komerční
              obsah je v souladu se zákonem č. 40/1995 Sb., o regulaci reklamy, jasně označen. Konkrétně:
            </p>
            <p>
              <strong>Affiliate odkazy</strong> – některé články mohou obsahovat odkazy na produkty nebo služby
              třetích stran, za jejichž zprostředkování může Provozovatel obdržet provizi. Tyto odkazy jsou
              označeny poznámkou „Komerční sdělení" nebo „Affiliate odkaz". Přítomnost affiliate odkazů nemá
              vliv na redakční nezávislost obsahu.
            </p>
            <p>
              <strong>Sponzorované články</strong> – články vytvořené ve spolupráci s komerčními partnery jsou
              vždy jasně označeny štítkem „Sponzorovaný obsah", „Komerční sdělení" nebo „PR článek".
            </p>
            <p>
              <strong>Zobrazovaná reklama</strong> – na Portálu jsou zobrazovány reklamní bannery prostřednictvím
              služby Google AdSense a případně dalších reklamních sítí. Tyto reklamy jsou jasně odděleny od
              redakčního obsahu.
            </p>

            <h2>5. Autorská práva a duševní vlastnictví</h2>
            <p>
              Veškerý obsah publikovaný na Portálu (texty, fotografie, grafika, loga, design) je chráněn
              autorským právem dle zákona č. 121/2000 Sb., autorský zákon, a dalších příslušných právních
              předpisů. Bez předchozího písemného souhlasu Provozovatele je zakázáno obsah Portálu kopírovat,
              reprodukovat, distribuovat nebo jinak šířit, s výjimkou zákonných licencí (např. citace
              v přiměřeném rozsahu s uvedením zdroje).
            </p>
            <p>
              Pro sdílení článků na sociálních sítích využívejte prosím funkce sdílení dostupné u každého článku.
            </p>

            <h2>6. Odpovědnost za obsah</h2>
            <p>
              Provozovatel vynakládá přiměřené úsilí k zajištění přesnosti a aktuálnosti publikovaného obsahu.
              Provozovatel však nenese odpovědnost za případné škody vzniklé v důsledku použití informací
              publikovaných na Portálu, zejména v oblasti investičních rozhodnutí, zdravotních doporučení
              nebo jiných odborných rad.
            </p>
            <p>
              Portál může obsahovat odkazy na webové stránky třetích stran. Provozovatel nenese odpovědnost
              za obsah, dostupnost ani bezpečnost těchto externích stránek.
            </p>

            <h2>7. Právo na odpověď a dodatečné sdělení</h2>
            <p>
              V souladu s judikaturou Ústavního soudu ČR (nález sp. zn. II. ÚS 2216/18) Provozovatel
              respektuje právo na odpověď a právo na dodatečné sdělení analogicky k zákonu č. 46/2000 Sb.,
              o právech a povinnostech při vydávání periodického tisku (tiskový zákon). Žádosti o uveřejnění
              odpovědi nebo dodatečného sdělení zasílejte na adresu: redakce@trendmagazine.cz.
            </p>
            <p>
              Odpovědnou osobou za obsah Portálu (šéfredaktor) je osoba uvedená na stránce <a href="/o-nas">O nás</a>.
            </p>

            <h2>8. Uživatelský obsah a komentáře</h2>
            <p>
              Pokud Portál umožňuje přidávání komentářů nebo jiného uživatelského obsahu, uživatel odpovídá
              za to, že jím přidaný obsah neporušuje právní předpisy České republiky, práva třetích osob
              ani dobré mravy. Provozovatel si vyhrazuje právo bez předchozího upozornění odstranit obsah,
              který je v rozporu s těmito Podmínkami nebo právními předpisy.
            </p>

            <h2>9. Omezení odpovědnosti</h2>
            <p>
              Provozovatel negarantuje nepřetržitou dostupnost Portálu a nenese odpovědnost za případné
              výpadky, technické problémy nebo ztrátu dat. Portál je poskytován „tak, jak je" (as is)
              bez jakýchkoli záruk, výslovných či implicitních.
            </p>

            <h2>10. Rozhodné právo a řešení sporů</h2>
            <p>
              Tyto Podmínky se řídí právním řádem České republiky. Případné spory budou řešeny příslušnými
              soudy České republiky. Pro spotřebitele: subjektem mimosoudního řešení spotřebitelských sporů
              je Česká obchodní inspekce (ČOI), Štěpánská 567/15, 120 00 Praha 2,
              web: <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer">www.coi.cz</a>.
            </p>

            <h2>11. Změny podmínek</h2>
            <p>
              Provozovatel si vyhrazuje právo tyto Podmínky kdykoli změnit. Aktuální verze Podmínek je vždy
              dostupná na této stránce. Pokračováním v používání Portálu po zveřejnění změn vyjadřujete
              souhlas s aktualizovanými Podmínkami.
            </p>

          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
