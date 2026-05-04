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
import { ChevronLeft, Home, Library, BookOpen, Activity, BookText, FileText, Lightbulb } from "lucide-react";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SanityImage from "@/components/ui/SanityImage";
import * as wanakana from "wanakana";
import { splitFurigana } from "@/lib/furigana";

// ======================
// CONFIG / CONSTANTS
// ======================
const articleQuery = `*[_type == "grammar_article" && slug.current == $slug][0] { 
  title, 
  formation,
  notes,
  content[] {
    ...,
    _type == "image" => {
      ...,
      asset-> {
        _id,
        metadata {
          lqip,
          dimensions
        }
      }
    }
  } 
}`;

/**
 * Konfigurasi Pemetaan Portable Text untuk Detail Tata Bahasa.
 */
const ptComponents = {
  types: {
    exampleSentence: ({ value }: { value: { jp: string; furigana?: string; id: string } }) => {
      if (!value) return null;
      const isRomaji = value.furigana && /^[a-zA-Z\s.,?!'-]+$/.test(value.furigana);
      
      return (
        <div className="my-8 p-6 md:p-10 bg-card border border-border rounded-[2rem] md:rounded-[3rem] shadow-sm hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <FileText size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col gap-3">
            <div className="text-xl md:text-3xl font-black text-foreground font-japanese leading-relaxed tracking-tight">
               {(() => {
                 const hiraReading = isRomaji ? wanakana.toHiragana(value.furigana || "") : (value.furigana || "");
                 // Strip spaces/dots for sentence splitting robustness
                 return splitFurigana(value.jp || "", hiraReading.replace(/[\s.]/g, "")).map((chunk, i) => (
                    chunk.furi ? (
                      <ruby key={i}>
                        {chunk.text}
                        <rt className="text-[10px] md:text-xs text-primary/80 font-bold tracking-[0.1em] not-italic mb-1">
                           {chunk.furi}
                        </rt>
                      </ruby>
                    ) : (
                      <span key={i}>{chunk.text}</span>
                    )
                 ));
               })()}
            </div>
            <p className="text-[10px] md:text-sm font-bold text-muted-foreground/40 uppercase tracking-[0.1em] group-hover:text-muted-foreground transition-colors leading-relaxed">
               {isRomaji ? value.furigana : (value.furigana ? wanakana.toRomaji(value.furigana) : "")}
            </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-border/50">
               <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 block mb-2">Arti Kalimat</span>
                  <p className="text-sm md:text-lg font-medium text-muted-foreground leading-relaxed italic">
                     &quot;{value.id}&quot;
                  </p>
               </div>
               <div className="shrink-0 flex items-center gap-3">
                  <div className="neo-inset p-2 rounded-2xl bg-muted/30 group-hover:shadow-none transition-all">
                    <TTSReader text={value.jp} minimal={true} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: (props: any) => <SanityImage {...props} />,
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl md:text-3xl font-black text-foreground mt-12 md:mt-16 mb-6 md:mb-8 uppercase tracking-tight flex items-center gap-3 md:gap-4 group">
        <span className="w-1.5 md:w-2 h-6 md:h-8 bg-primary rounded-full neo-card shadow-sm" />
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-lg md:text-xl font-black text-primary mt-8 md:mt-10 mb-3 md:mb-4 uppercase tracking-widest">
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 md:mb-6 text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
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
    <main className="w-full bg-background px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-24 transition-colors duration-300">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,238,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-10">
        <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
            <Home size={14} /> Beranda
          </Link>
          <span className="text-border">/</span>
          <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
            <Library size={14} /> Pustaka
          </Link>
          <span className="text-border">/</span>
          <Link href="/library/grammar" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
            <BookOpen size={14} /> Tata Bahasa
          </Link>
          <span className="text-border">/</span>
          <span className="text-primary flex items-center gap-1.5 md:gap-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,238,255,0.5)] truncate max-w-[150px] md:max-w-none">
            {article.title}
          </span>
        </nav>

        <header className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
             <Activity size={16} className="text-primary animate-pulse md:w-5 md:h-5" />
             <span className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest">Cara Pakai Pola Kalimat</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-none tracking-tight drop-shadow-sm dark:drop-shadow-xl">
            {article.title}
          </h1>
          <div className="h-1.5 md:h-2 w-24 md:w-32 bg-primary mt-8 md:mt-10 rounded-full neo-card shadow-lg" />
        </header>

        {(article.formation || article.notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {article.formation && (
              <div className="p-6 md:p-8 bg-primary/5 border border-primary/20 rounded-[2rem] neo-inset shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
                  <BookText size={80} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-3">Rumus (Formation)</span>
                <p className="text-xl md:text-2xl font-black text-foreground font-japanese leading-relaxed">
                  {article.formation}
                </p>
              </div>
            )}
            {article.notes && (
              <div className="p-6 md:p-8 bg-muted/30 border border-border rounded-[2rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
                  <Lightbulb size={80} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3">Catatan (Notes)</span>
                <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
                  {article.notes}
                </p>
              </div>
            )}
          </div>
        )}

        <section className="prose prose-slate dark:prose-invert max-w-none mb-16 md:mb-20 relative">
          {/* Decorative Side Badge */}
          <div className="hidden lg:block absolute -left-24 top-0 h-full">
             <div className="sticky top-40 flex flex-col items-center gap-6">
                <Card className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center neo-inset shadow-none">
                   <BookText size={20} className="text-primary" />
                </Card>
                <div className="w-0.5 h-40 bg-gradient-to-b from-primary/30 to-transparent" />
             </div>
          </div>
          <PortableText value={article.content} components={ptComponents} />
        </section>

        <footer className="pt-10 md:pt-12 border-t border-border dark:border-white/10 flex justify-center">
          <Link href="/library/grammar">
            <Button variant="ghost" className="w-full sm:w-auto px-8 py-6 md:px-10 md:py-8 h-auto text-[11px] md:text-xs font-bold uppercase tracking-widest rounded-2xl bg-muted/50 dark:bg-black/40 border border-border dark:border-white/5 neo-card shadow-none hover:bg-primary hover:text-white dark:hover:text-black transition-all gap-3 group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" /> Kembali ke Panduan
            </Button>
          </Link>
        </footer>
      </div>
    </main>
  );
}
