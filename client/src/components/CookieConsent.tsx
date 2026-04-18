/*
 * TrendMagazine.cz – Cookie Consent Banner
 * GDPR compliant: opt-in required for analytics & marketing cookies
 * Three options: Accept All, Reject All, Settings
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Settings, Cookie } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = "tm_cookie_consent";
const COOKIE_PREFS_KEY = "tm_cookie_prefs";

function getCookieConsent(): boolean {
  return localStorage.getItem(COOKIE_KEY) === "true";
}

function saveCookieConsent(prefs: CookiePreferences) {
  localStorage.setItem(COOKIE_KEY, "true");
  localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!getCookieConsent()) {
      // Small delay so it doesn't flash immediately
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    saveCookieConsent(allAccepted);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false };
    saveCookieConsent(onlyNecessary);
    setVisible(false);
  };

  const handleSaveSettings = () => {
    saveCookieConsent(prefs);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" />

      {/* Banner */}
      <div className="relative w-full max-w-3xl mx-4 mb-4 bg-card border border-border shadow-xl rounded-sm pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <Cookie className="w-5 h-5 text-primary shrink-0" />
              <h3 className="text-base font-serif font-bold text-foreground">
                Souhlas s cookies
              </h3>
            </div>
            <button
              onClick={handleRejectAll}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Používáme soubory cookies pro zajištění funkčnosti webu, analýzu návštěvnosti a zobrazování
            relevantních reklam. Analytické a marketingové cookies ukládáme pouze s vaším souhlasem.
            Více informací naleznete v našich{" "}
            <Link href="/cookies" className="text-primary hover:underline no-underline">
              Zásadách cookies
            </Link>{" "}
            a{" "}
            <Link href="/ochrana-soukromi" className="text-primary hover:underline no-underline">
              Zásadách ochrany osobních údajů
            </Link>.
          </p>

          {/* Settings panel */}
          {showSettings && (
            <div className="mb-4 p-4 bg-secondary/50 rounded-sm space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">Nezbytné cookies</span>
                  <p className="text-xs text-muted-foreground">Zajišťují základní funkčnost webu</p>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4 accent-primary" />
              </label>
              <div className="border-t border-border/50" />
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-foreground">Analytické cookies</span>
                  <p className="text-xs text-muted-foreground">Pomáhají nám pochopit, jak web používáte</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
              </label>
              <div className="border-t border-border/50" />
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-foreground">Marketingové cookies</span>
                  <p className="text-xs text-muted-foreground">Umožňují zobrazování relevantních reklam</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
            >
              Přijmout vše
            </button>
            <button
              onClick={handleRejectAll}
              className="px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-sm hover:bg-secondary/80 transition-colors"
            >
              Odmítnout vše
            </button>
            {showSettings ? (
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-sm hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1.5"
              >
                Uložit nastavení
              </button>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="px-5 py-2.5 text-muted-foreground text-sm font-medium rounded-sm hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Nastavení
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
