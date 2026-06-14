/*
 * TrendMagazine.cz – InfoBar Component
 * Compact info strip between hero carousel and featured articles
 * Contains: Czech name day, horoscope link, CZK exchange rates (CNB API)
 * Design: "Steel & Ink" – subtle, editorial, matching the magazine aesthetic
 */
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

/* ─── Czech Name Days (official calendar) ─── */
const NAME_DAYS: Record<string, string> = {
  "1-1": "Nový rok",
  "1-2": "Karina",
  "1-3": "Radmila",
  "1-4": "Diana",
  "1-5": "Dalimil",
  "1-6": "Tři králové",
  "1-7": "Vilma",
  "1-8": "Čestmír",
  "1-9": "Vladan",
  "1-10": "Břetislav",
  "1-11": "Bohdana",
  "1-12": "Pravoslav",
  "1-13": "Edita",
  "1-14": "Radovan",
  "1-15": "Alice",
  "1-16": "Ctirad",
  "1-17": "Drahoslav",
  "1-18": "Vladislav",
  "1-19": "Doubravka",
  "1-20": "Ilona",
  "1-21": "Běla",
  "1-22": "Slavomír",
  "1-23": "Zdeněk",
  "1-24": "Milena",
  "1-25": "Miloš",
  "1-26": "Zora",
  "1-27": "Ingrid",
  "1-28": "Otýlie",
  "1-29": "Zdislava",
  "1-30": "Robin",
  "1-31": "Marika",
  "2-1": "Hynek",
  "2-2": "Nela",
  "2-3": "Blažej",
  "2-4": "Jarmila",
  "2-5": "Dobromila",
  "2-6": "Vanda",
  "2-7": "Veronika",
  "2-8": "Milada",
  "2-9": "Apolena",
  "2-10": "Mojmír",
  "2-11": "Božena",
  "2-12": "Slavěna",
  "2-13": "Věnceslav",
  "2-14": "Valentýn",
  "2-15": "Jiřina",
  "2-16": "Ljuba",
  "2-17": "Miloslava",
  "2-18": "Gizela",
  "2-19": "Patrik",
  "2-20": "Oldřich",
  "2-21": "Lenka",
  "2-22": "Petr",
  "2-23": "Svatopluk",
  "2-24": "Matěj",
  "2-25": "Liliana",
  "2-26": "Dorota",
  "2-27": "Alexandr",
  "2-28": "Lumír",
  "2-29": "Horymír",
  "3-1": "Bedřich",
  "3-2": "Anežka",
  "3-3": "Kamil",
  "3-4": "Stela",
  "3-5": "Kazimír",
  "3-6": "Miroslav",
  "3-7": "Tomáš",
  "3-8": "Gabriela",
  "3-9": "Františka",
  "3-10": "Viktorie",
  "3-11": "Anděla",
  "3-12": "Řehoř",
  "3-13": "Růžena",
  "3-14": "Rút, Matylda",
  "3-15": "Ida",
  "3-16": "Elena, Herbert",
  "3-17": "Vlastimil",
  "3-18": "Eduard",
  "3-19": "Josef",
  "3-20": "Světlana",
  "3-21": "Radek",
  "3-22": "Leona",
  "3-23": "Ivona",
  "3-24": "Gabriel",
  "3-25": "Marián",
  "3-26": "Emanuel",
  "3-27": "Dita",
  "3-28": "Soňa",
  "3-29": "Taťána",
  "3-30": "Arnošt",
  "3-31": "Kvido",
  "4-1": "Hugo",
  "4-2": "Erika",
  "4-3": "Richard",
  "4-4": "Ivana",
  "4-5": "Miroslava",
  "4-6": "Vendula",
  "4-7": "Heřman",
  "4-8": "Ema",
  "4-9": "Dušan",
  "4-10": "Darja",
  "4-11": "Izabela",
  "4-12": "Julius",
  "4-13": "Aleš",
  "4-14": "Vincenc",
  "4-15": "Anastázie",
  "4-16": "Irena",
  "4-17": "Rudolf",
  "4-18": "Valérie",
  "4-19": "Rostislav",
  "4-20": "Marcela",
  "4-21": "Alexandra",
  "4-22": "Evženie",
  "4-23": "Vojtěch",
  "4-24": "Jiří",
  "4-25": "Marek",
  "4-26": "Oto",
  "4-27": "Jaroslav",
  "4-28": "Vlastislav",
  "4-29": "Robert",
  "4-30": "Blahoslav",
  "5-1": "Svátek práce",
  "5-2": "Zikmund",
  "5-3": "Alexej",
  "5-4": "Květoslav",
  "5-5": "Klaudie",
  "5-6": "Radoslav",
  "5-7": "Stanislav",
  "5-8": "Den vítězství",
  "5-9": "Ctibor",
  "5-10": "Blažena",
  "5-11": "Svatava",
  "5-12": "Pankrác",
  "5-13": "Servác",
  "5-14": "Bonifác",
  "5-15": "Žofie",
  "5-16": "Přemysl",
  "5-17": "Aneta",
  "5-18": "Nataša",
  "5-19": "Ivo",
  "5-20": "Zbyšek",
  "5-21": "Monika",
  "5-22": "Emil",
  "5-23": "Vladimír",
  "5-24": "Jana",
  "5-25": "Viola",
  "5-26": "Filip",
  "5-27": "Valdemar",
  "5-28": "Vilém",
  "5-29": "Maxmilián",
  "5-30": "Ferdinand",
  "5-31": "Kamila",
  "6-1": "Laura",
  "6-2": "Jarmil",
  "6-3": "Tamara",
  "6-4": "Dalibor",
  "6-5": "Dobroslav",
  "6-6": "Norbert",
  "6-7": "Iveta",
  "6-8": "Medard",
  "6-9": "Stanislava",
  "6-10": "Gita",
  "6-11": "Bruno",
  "6-12": "Antonie",
  "6-13": "Antonín",
  "6-14": "Roland",
  "6-15": "Vít",
  "6-16": "Zbyněk",
  "6-17": "Adolf",
  "6-18": "Milan",
  "6-19": "Leoš",
  "6-20": "Květa",
  "6-21": "Alois",
  "6-22": "Pavla",
  "6-23": "Zdeňka",
  "6-24": "Jan",
  "6-25": "Ivan",
  "6-26": "Adriana",
  "6-27": "Ladislav",
  "6-28": "Lubomír",
  "6-29": "Petr a Pavel",
  "6-30": "Šárka",
  "7-1": "Jaroslava",
  "7-2": "Patricie",
  "7-3": "Radomír",
  "7-4": "Prokop",
  "7-5": "Cyril a Metoděj",
  "7-6": "Den M. J. Husa",
  "7-7": "Bohuslava",
  "7-8": "Nora",
  "7-9": "Drahoslava",
  "7-10": "Libuše, Amálie",
  "7-11": "Olga",
  "7-12": "Bořek",
  "7-13": "Markéta",
  "7-14": "Karolína",
  "7-15": "Jindřich",
  "7-16": "Luboš",
  "7-17": "Martina",
  "7-18": "Drahomíra",
  "7-19": "Čeněk",
  "7-20": "Ilja",
  "7-21": "Vítězslav",
  "7-22": "Magdaléna",
  "7-23": "Libor",
  "7-24": "Kristýna",
  "7-25": "Jakub",
  "7-26": "Anna",
  "7-27": "Věroslav",
  "7-28": "Viktor",
  "7-29": "Marta",
  "7-30": "Bořivoj",
  "7-31": "Ignác",
  "8-1": "Oskar",
  "8-2": "Gustav",
  "8-3": "Miluše",
  "8-4": "Dominik",
  "8-5": "Kristián",
  "8-6": "Oldřiška",
  "8-7": "Lada",
  "8-8": "Soběslav",
  "8-9": "Roman",
  "8-10": "Vavřinec",
  "8-11": "Zuzana",
  "8-12": "Klára",
  "8-13": "Alena",
  "8-14": "Alan",
  "8-15": "Hana",
  "8-16": "Jáchym",
  "8-17": "Petra",
  "8-18": "Helena",
  "8-19": "Ludvík",
  "8-20": "Bernard",
  "8-21": "Johana",
  "8-22": "Bohuslav",
  "8-23": "Sandra",
  "8-24": "Bartoloměj",
  "8-25": "Radim",
  "8-26": "Luděk",
  "8-27": "Otakar",
  "8-28": "Augustýn",
  "8-29": "Evelína",
  "8-30": "Vladěna",
  "8-31": "Pavlína",
  "9-1": "Linda, Samuel",
  "9-2": "Adéla",
  "9-3": "Bronislav",
  "9-4": "Jindřiška",
  "9-5": "Boris",
  "9-6": "Boleslav",
  "9-7": "Regína",
  "9-8": "Mariana",
  "9-9": "Daniela",
  "9-10": "Irma",
  "9-11": "Denisa",
  "9-12": "Marie",
  "9-13": "Lubor",
  "9-14": "Radka",
  "9-15": "Jolana",
  "9-16": "Ludmila",
  "9-17": "Naděžda",
  "9-18": "Kryštof",
  "9-19": "Zita",
  "9-20": "Oleg",
  "9-21": "Matouš",
  "9-22": "Darina",
  "9-23": "Berta",
  "9-24": "Jaromír",
  "9-25": "Zlata",
  "9-26": "Andrea",
  "9-27": "Jonáš",
  "9-28": "Václav",
  "9-29": "Michal",
  "9-30": "Jeroným",
  "10-1": "Igor",
  "10-2": "Olívie, Oliver",
  "10-3": "Bohumil",
  "10-4": "František",
  "10-5": "Eliška",
  "10-6": "Hanuš",
  "10-7": "Justýna",
  "10-8": "Věra",
  "10-9": "Štefan, Sára",
  "10-10": "Marina",
  "10-11": "Andrej",
  "10-12": "Marcel",
  "10-13": "Renáta",
  "10-14": "Agáta",
  "10-15": "Tereza",
  "10-16": "Havel",
  "10-17": "Hedvika",
  "10-18": "Lukáš",
  "10-19": "Michala",
  "10-20": "Vendelín",
  "10-21": "Brigita",
  "10-22": "Sabina",
  "10-23": "Teodor",
  "10-24": "Nina",
  "10-25": "Beáta",
  "10-26": "Erik",
  "10-27": "Šarlota, Zoe",
  "10-28": "Den vzniku ČSR",
  "10-29": "Silvie",
  "10-30": "Tadeáš",
  "10-31": "Štěpánka",
  "11-1": "Felix",
  "11-2": "Památka zesnulých",
  "11-3": "Hubert",
  "11-4": "Karel",
  "11-5": "Miriam",
  "11-6": "Liběna",
  "11-7": "Saskie",
  "11-8": "Bohumír",
  "11-9": "Bohdan",
  "11-10": "Evžen",
  "11-11": "Martin",
  "11-12": "Benedikt",
  "11-13": "Tibor",
  "11-14": "Sáva",
  "11-15": "Leopold",
  "11-16": "Otmar",
  "11-17": "Mahulena",
  "11-18": "Romana",
  "11-19": "Alžběta",
  "11-20": "Nikola",
  "11-21": "Albert",
  "11-22": "Cecílie",
  "11-23": "Klement",
  "11-24": "Emílie",
  "11-25": "Kateřina",
  "11-26": "Artur",
  "11-27": "Xenie",
  "11-28": "René",
  "11-29": "Zina",
  "11-30": "Ondřej",
  "12-1": "Iva",
  "12-2": "Blanka",
  "12-3": "Svatoslav",
  "12-4": "Barbora",
  "12-5": "Jitka",
  "12-6": "Mikuláš",
  "12-7": "Ambrož",
  "12-8": "Květoslava",
  "12-9": "Vratislav",
  "12-10": "Julie",
  "12-11": "Dana",
  "12-12": "Simona",
  "12-13": "Lucie",
  "12-14": "Lýdie",
  "12-15": "Radana",
  "12-16": "Albína",
  "12-17": "Daniel",
  "12-18": "Miloslav",
  "12-19": "Ester",
  "12-20": "Dagmar",
  "12-21": "Natálie",
  "12-22": "Šimon",
  "12-23": "Vlasta",
  "12-24": "Adam a Eva",
  "12-25": "1. svátek vánoční",
  "12-26": "Štěpán",
  "12-27": "Žaneta",
  "12-28": "Bohumila",
  "12-29": "Judita",
  "12-30": "David",
  "12-31": "Silvestr",
};

function getTodayNameDay(): string {
  const now = new Date();
  const key = `${now.getMonth() + 1}-${now.getDate()}`;
  return NAME_DAYS[key] || "";
}

/* ─── Exchange Rate Hook (Frankfurter API) ─── */
interface ExchangeRates {
  eurCzk: number | null;
  usdCzk: number | null;
  date: string;
}

function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>({ eurCzk: null, usdCzk: null, date: "" });

  useEffect(() => {
    Promise.all([
      fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=CZK").then(r => r.json()),
      fetch("https://api.frankfurter.dev/v1/latest?from=USD&to=CZK").then(r => r.json()),
    ])
      .then(([eurData, usdData]) => {
        const eurCzk = eurData?.rates?.CZK ?? null;
        const usdCzk = usdData?.rates?.CZK ?? null;
        const date = eurData?.date ?? "";
        let formattedDate = date;
        if (date) {
          try {
            formattedDate = new Date(date).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
          } catch { /* keep raw */ }
        }
        setRates({ eurCzk, usdCzk, date: formattedDate });
      })
      .catch(() => {});
  }, []);

  return rates;
}

/* ─── Bitcoin Price Hook (CoinGecko API) ─── */
interface BtcData {
  price: number | null;
  change24h: number | null;
}

function useBitcoinPrice() {
  const [btc, setBtc] = useState<BtcData>({ price: null, change24h: null });

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true")
      .then(r => r.json())
      .then(data => {
        setBtc({
          price: data?.bitcoin?.usd ?? null,
          change24h: data?.bitcoin?.usd_24h_change ?? null,
        });
      })
      .catch(() => {});
  }, []);

  return btc;
}

/* ─── Stock Ticker Item ─── */
interface StockItem {
  symbol: string;
  price: number;
  changePct: number;
  isIndex?: boolean;
}

/* Hardcoded recent market data – indicative, refreshed via build/deploy.
   (BTC above is live via CoinGecko; live indices need a keyed API — later.) */
const STOCK_DATA: StockItem[] = [
  { symbol: "S&P 500", price: 6352.4, changePct: 0.42, isIndex: true },
  { symbol: "NASDAQ", price: 20815.7, changePct: 0.61, isIndex: true },
  { symbol: "AAPL", price: 270.23, changePct: 3.74 },
  { symbol: "TSLA", price: 400.62, changePct: 14.81 },
  { symbol: "GOOGL", price: 341.68, changePct: 7.70 },
  { symbol: "NVDA", price: 201.68, changePct: 6.92 },
];

function TickerItem({ symbol, price, changePct, isIndex }: StockItem) {
  const isUp = changePct >= 0;
  const colorClass = isUp ? "text-[#22c55e]" : "text-[#ef4444]";
  const arrow = isUp ? "▲" : "▼";
  const value = isIndex
    ? price.toLocaleString("cs-CZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : `$${price.toFixed(2)}`;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[11px] font-sans text-white/50 tracking-wider font-medium">{symbol}</span>
      <span className="font-mono font-semibold text-white text-[13px] tabular-nums">{value}</span>
      <span className={`font-mono text-[11px] tabular-nums font-semibold ${colorClass}`}>
        {arrow} {Math.abs(changePct).toFixed(2)}%
      </span>
    </div>
  );
}

function BtcTicker({ price, change24h }: BtcData) {
  if (price === null) return null;
  const isUp = (change24h ?? 0) >= 0;
  const colorClass = isUp ? "text-[#22c55e]" : "text-[#ef4444]";
  const arrow = isUp ? "▲" : "▼";

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[11px] font-sans text-amber-400/80 tracking-wider font-medium">BTC</span>
      <span className="font-mono font-semibold text-white text-[13px] tabular-nums">
        ${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </span>
      {change24h !== null && (
        <span className={`font-mono text-[11px] tabular-nums font-semibold ${colorClass}`}>
          {arrow} {Math.abs(change24h).toFixed(2)}%
        </span>
      )}
    </div>
  );
}

/* ─── InfoBar Component ─── */
export default function InfoBar() {
  const nameDay = useMemo(() => getTodayNameDay(), []);
  const rates = useExchangeRates();
  const btc = useBitcoinPrice();

  const handleHoroscopeClick = () => {
    toast("Horoskopy připravujeme", {
      description: "Tato sekce bude brzy k dispozici.",
      duration: 3000,
    });
  };

  return (
    <div className="hidden sm:block mb-3">
      <div className="container">
        <div className="bg-[#0F172A] rounded-md overflow-hidden">
          {/* Top row: Name day + Horoscope + Travel + FX rates */}
          <div className="flex items-center justify-between py-3 px-6 border-b border-white/[0.06]">
            {/* Name Day */}
            <div className="flex items-center gap-2.5">
              <span className="text-white/90 text-sm font-sans tracking-wide">Dnes má svátek:</span>
              <span className="font-serif font-semibold text-white text-[15px]">{nameDay}</span>
            </div>

            <span className="w-px h-3.5 bg-white/15 hidden lg:block" />

            {/* Horoscope Link */}
            <button
              onClick={handleHoroscopeClick}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group hidden md:flex"
            >
              <span className="text-sm font-sans tracking-wide">Co dnes říká váš horoskop</span>
              <span className="text-white/50 group-hover:text-white/90 transition-colors text-sm">→</span>
            </button>

            <span className="w-px h-3.5 bg-white/15 hidden lg:block" />

            {/* Travel Link */}
            <a
              href="/kategorie/cestovani"
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group hidden lg:flex"
            >
              <span className="text-sm font-sans tracking-wide">Kam letos na dovolenou</span>
              <span className="text-white/50 group-hover:text-white/90 transition-colors text-sm">→</span>
            </a>

            <span className="w-px h-3.5 bg-white/15 hidden md:block" />

            {/* Exchange Rates */}
            <div className="flex items-center gap-4">
              {rates.eurCzk !== null ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans text-white/80 tracking-wider uppercase">EUR/CZK</span>
                    <span className="font-mono font-semibold text-white text-[13px] tabular-nums">{rates.eurCzk.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans text-white/80 tracking-wider uppercase">USD/CZK</span>
                    <span className="font-mono font-semibold text-white text-[13px] tabular-nums">{rates.usdCzk?.toFixed(3)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <span>Kurzy…</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: Stock ticker */}
          <div className="flex items-center gap-5 py-2.5 px-6 overflow-x-auto scrollbar-hide">
            <BtcTicker {...btc} />
            <span className="w-px h-3.5 bg-white/10 shrink-0" />
            {STOCK_DATA.map((stock, i) => (
              <div key={stock.symbol} className="flex items-center gap-5">
                <TickerItem {...stock} />
                {i < STOCK_DATA.length - 1 && <span className="w-px h-3.5 bg-white/10 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
