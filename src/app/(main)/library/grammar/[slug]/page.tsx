/**
 * @file page.tsx
 * @description Halaman detail panduan tata bahasa (Grammar Detail). 
 * Menampilkan konten artikel tata bahasa menggunakan Portable Text.
 * @module GrammarDetailPage
 */

// ======================
// IMPORTS
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Home, Library, BookOpen, BookText, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ======================
// METADATA
// ======================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const article = await getLibraryItemBySlug("grammar", decodedSlug);

  if (!article) {
    return {
      title: "Grammar Tidak Ditemukan | NihongoRoute",
      description: "Halaman panduan tata bahasa Jepang yang Anda cari tidak tersedia atau telah dipindahkan.",
    };
  }

  return {
    title: `Belajar Grammar ${article.title} | NihongoRoute`,
    description: article.notes 
      ? article.notes.slice(0, 150) + "..."
      : `Pelajari rumus dan cara penggunaan tata bahasa ${article.title} secara mendalam beserta contoh kalimatnya.`,
  };
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen GrammarDetailPage: Mengambil data artikel dan merender konten.
 * 
 * @returns {JSX.Element} Halaman detail tata bahasa.
 */
export default async function GrammarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // ======================
  // DATABASE OPERATIONS
  // ======================
  const article = await getLibraryItemBySlug("grammar", decodedSlug);
  if (!article) notFound();


  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full bg-background px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-success/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-16">
        <nav className="mb-10 md:mb-16 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
          <Link href="/dashboard" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Home size={14} className="group-hover:scale-110 transition-transform" /> Beranda
          </Link>
          <span className="opacity-20">/</span>
          <Link href="/library" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <Library size={14} className="group-hover:scale-110 transition-transform" /> Pustaka
          </Link>
          <span className="opacity-20">/</span>
          <Link href="/library/grammar" className="hover:text-primary transition-all flex items-center gap-1.5 md:gap-2 group">
            <BookOpen size={14} className="group-hover:scale-110 transition-transform" /> Tata Bahasa
          </Link>
          <span className="opacity-20">/</span>
          <span className="text-primary flex items-center gap-1.5 md:gap-2 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] truncate max-w-[150px] md:max-w-none">
            {article.title}
          </span>
        </nav>

        <header className="mb-16 md:mb-24 relative">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
             <span className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">Modul Pembelajaran</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tighter drop-shadow-2xl mb-8">
            {article.title.split('').map((char: string, i: number) => (
              <span key={i} className="inline-block hover:text-primary transition-colors duration-300">
                {char}
              </span>
            ))}
          </h1>
          <div className="h-2 w-32 md:w-48 bg-gradient-to-r from-primary to-success rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]" />
        </header>

        {(article.formation || article.notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 md:mb-24">
            {article.formation && (
              <Card className="p-8 md:p-10 bg-primary/5 backdrop-blur-xl border-primary/20 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none">
                  <BookText size={120} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block mb-6 opacity-60">Struktur (Formation)</span>
                <p className="text-2xl md:text-3xl font-black text-foreground font-japanese leading-relaxed tracking-tight drop-shadow-[0_0_15px_rgba(var(--foreground-rgb),0.1)]">
                  {article.formation}
                </p>
              </Card>
            )}
            {article.notes && (
              <Card className="p-8 md:p-10 bg-background/[0.02] backdrop-blur-xl border-border rounded-[2.5rem] relative overflow-hidden group hover:border-border transition-all duration-500">
                 <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none">
                  <Lightbulb size={120} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-6 opacity-60">Catatan Utama</span>
                <p className="text-sm md:text-lg font-medium text-muted-foreground/80 leading-relaxed tracking-wide">
                  {article.notes}
                </p>
              </Card>
            )}
          </div>
        )}

        <section className="prose prose-slate dark:prose-invert max-w-none mb-24 md:mb-32 relative">
          {/* Decorative Side Track */}
          <div className="hidden lg:block absolute -left-28 top-0 h-full">
             <div className="sticky top-40 flex flex-col items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                   <BookText size={20} className="text-primary" />
                </div>
                <div className="w-px h-64 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
             </div>
          </div>
          <div className="space-y-12 md:space-y-16">
            {/* Grammar examples rendered as plain text */}
            {article.examples && article.examples.length > 0 && (
              <div className="space-y-6">
                {article.examples.map((ex: any, i: number) => (
                  <div key={i} className="border border-border rounded-2xl p-6 space-y-2">
                    <p className="text-xl font-japanese font-bold text-foreground">{ex.jp}</p>
                    {ex.furigana && <p className="text-sm text-muted-foreground">{ex.furigana}</p>}
                    <p className="text-sm text-muted-foreground italic">{ex.id}</p>
                  </div>
                ))}
              </div>
            )}
            {article.notes && (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {article.notes.split("\n").filter(Boolean).map((line: string, i: number) => (
                  <p key={i} className="text-base leading-relaxed text-foreground/80">{line}</p>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="pt-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/library/grammar" className="w-full md:w-auto">
            <Button variant="ghost" className="w-full px-10 py-8 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-background/[0.03] border border-border hover:bg-background/10 hover:border-primary/30 transition-all gap-4 group shadow-xl">
              <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> Kembali ke Daftar Tata Bahasa
            </Button>
          </Link>

          <Button className="w-full md:w-auto px-12 py-8 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] active:scale-95">
             Tandai Selesai & Lanjut
          </Button>
        </footer>
      </div>
    </main>
  );
}
