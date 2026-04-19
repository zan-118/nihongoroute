/**
 * @file page.tsx
 * @description Halaman detail panduan tata bahasa (Grammar Detail). 
 * Menampilkan konten artikel tata bahasa menggunakan Portable Text.
 * @module GrammarDetailPage
 */

// ======================
// IMPORTS
// ======================
import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Home, Library, BookOpen, Activity, BookText } from "lucide-react";
import TTSReader from "@/components/TTSReader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ======================
// CONFIG / CONSTANTS
// ======================
const articleQuery = `*[_type == "grammar_article" && slug.current == $slug][0] { title, content }`;

/**
 * Konfigurasi Pemetaan Portable Text untuk Detail Tata Bahasa.
 */
const ptComponents = {
  types: {
    exampleSentence: ({ value }: any) => (
      <Card className="bg-cyber-surface p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border-white/5 my-8 md:my-10 neo-card shadow-none group hover:border-cyber-neon/40 transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute -left-4 -top-4 text-5xl md:text-6xl font-black italic text-white/[0.01] pointer-events-none uppercase">CTH</div>
        <div className="flex-1 relative z-10 w-full">
          <p className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-cyber-neon transition-colors duration-500 font-japanese leading-relaxed drop-shadow-xl">
            {value.jp}
          </p>
          <div className="flex items-center gap-3 md:gap-4">
             <div className="h-0.5 w-4 md:w-6 bg-cyber-neon/40 rounded-full" />
             <p className="text-slate-400 text-xs md:text-sm font-medium tracking-wide">
               {value.id}
             </p>
          </div>
        </div>
        <div className="shrink-0 relative z-10 self-end sm:self-center mt-2 sm:mt-0">
          <TTSReader text={value.jp} minimal={true} />
        </div>
      </Card>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl md:text-3xl font-black text-white mt-12 md:mt-16 mb-6 md:mb-8 uppercase tracking-tight flex items-center gap-3 md:gap-4 group">
        <span className="w-1.5 md:w-2 h-6 md:h-8 bg-cyber-neon rounded-full neo-card" />
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg md:text-xl font-black text-cyber-neon mt-8 md:mt-10 mb-3 md:mb-4 uppercase tracking-widest">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 md:mb-6 text-slate-400 text-base md:text-lg leading-relaxed font-medium">
        {children}
      </p>
    ),
  },
};

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

  // ======================
  // DATABASE OPERATIONS
  // ======================
  const article = await client.fetch(articleQuery, { slug });
  if (!article) notFound();

  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full bg-cyber-bg px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-24">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,238,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-10">
        <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/dashboard" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <Home size={14} /> Beranda
          </Link>
          <span className="text-white/10">/</span>
          <Link href="/library" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <Library size={14} /> Pustaka
          </Link>
          <span className="text-white/10">/</span>
          <Link href="/library/grammar" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
            <BookOpen size={14} /> Tata Bahasa
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-cyber-neon flex items-center gap-1.5 md:gap-2 drop-shadow-[0_0_8px_rgba(0,238,255,0.5)] truncate max-w-[150px] md:max-w-none">
            {article.title}
          </span>
        </nav>

        <header className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
             <Activity size={16} className="text-cyber-neon animate-pulse md:w-5 md:h-5" />
             <span className="text-cyber-neon font-bold text-[10px] md:text-xs uppercase tracking-widest">Panduan Sintaksis</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight drop-shadow-xl">
            {article.title}
          </h1>
          <div className="h-1.5 md:h-2 w-24 md:w-32 bg-cyber-neon mt-8 md:mt-10 rounded-full neo-card shadow-[0_0_20px_rgba(0,238,255,0.4)]" />
        </header>

        <section className="prose prose-invert max-w-none mb-16 md:mb-20 relative">
          {/* Decorative Side Badge */}
          <div className="hidden lg:block absolute -left-24 top-0 h-full">
             <div className="sticky top-40 flex flex-col items-center gap-6">
                <Card className="w-12 h-12 rounded-full bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
                   <BookText size={20} className="text-cyber-neon" />
                </Card>
                <div className="w-0.5 h-40 bg-gradient-to-b from-cyber-neon/30 to-transparent" />
             </div>
          </div>
          <PortableText value={article.content} components={ptComponents} />
        </section>

        <footer className="pt-10 md:pt-12 border-t border-white/10 flex justify-center">
          <Link href="/library/grammar">
            <Button variant="ghost" className="w-full sm:w-auto px-8 py-6 md:px-10 md:py-8 h-auto text-[11px] md:text-xs font-bold uppercase tracking-widest rounded-2xl bg-black/40 border-white/5 neo-card shadow-none hover:bg-cyber-neon hover:text-black transition-all gap-3 group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" /> KEMBALI KE PANDUAN
            </Button>
          </Link>
        </footer>
      </div>
    </main>
  );
}
