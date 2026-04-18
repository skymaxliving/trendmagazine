import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container flex flex-col items-center justify-center py-20 text-center">
        <span className="text-8xl font-serif font-bold text-border mb-4">404</span>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-3">Stránka nenalezena</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors no-underline"
        >
          Zpět na hlavní stránku
        </Link>
      </main>
      <Footer />
    </div>
  );
}
