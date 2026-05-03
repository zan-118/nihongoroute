/**
 * @file page.tsx
 * @description Halaman Mode Survival untuk latihan kecepatan mengingat kosakata.
 * Mengharuskan minimal 4 kosakata agar sistem pengacakan opsi dapat berfungsi.
 * @module SurvivalPage
 */

// ======================
// IMPORTS
// ======================
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import SurvivalMode from "@/components/features/games/SurvivalMode";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ======================
// TYPES
// ======================
interface PageProps {
  params: Promise<{ categoryId: string }>;
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen SurvivalPage: Mengambil data dan merender sistem permainan survival.
 * 
 * @returns {JSX.Element} Antarmuka permainan survival.
 */
export default async function SurvivalPage({ params }: PageProps) {
  const { categoryId } = await params;

  // ======================
  // DATABASE OPERATIONS
  // ======================
  const query = `{
    "vocab": *[_type == "vocab" && showInFlashcard != false && course_category->slug.current == $categoryId] {
      _id, word, meaning, romaji, furigana, category
    },
    "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->slug.current == $categoryId] {
      _id, "word": jisho, meaning, romaji, furigana, "category": "verb"
    }
  }`;

  const data = await client.fetch(query, { categoryId });
  const cards = [...(data.vocab || []), ...(data.verbs || [])];

  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full flex-1 flex flex-col overflow-hidden bg-background transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/15 via-background to-background pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0 opacity-50" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 flex flex-col pt-8 px-4 md:px-8">
        <header className="mb-8 flex justify-between items-center border-b border-border pb-6">
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2 text-red-600 dark:text-red-400/60 hover:text-white dark:hover:text-red-400 text-[10px] sm:text-xs uppercase tracking-widest font-black transition-colors border-red-500/10 hover:border-red-500/50 hover:bg-red-500"
          >
            <Link href={`/courses/${categoryId}`}>
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Keluar Sesi</span>
              <span className="inline sm:hidden">Keluar</span>
            </Link>
          </Button>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
              Level {categoryId.toUpperCase()}
            </span>
          </div>
        </header>

        {cards.length >= 4 ? (
          <SurvivalMode cards={cards} />
        ) : (
          <Card className="text-foreground bg-red-500/10 border border-red-500/30 p-10 md:p-16 rounded-[2.5rem] text-center shadow-2xl max-w-lg mx-auto my-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-6 text-4xl shadow-inner">
              ⚠️
            </div>
            <p className="font-black text-2xl md:text-3xl uppercase italic tracking-tighter text-red-600 dark:text-red-500 mb-4 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              Data Tidak Cukup
            </p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium px-4">
              Mode Survival membutuhkan minimal 4 kosakata terpublikasi di level{" "}
              <strong className="text-foreground">
                &quot;{categoryId.toUpperCase()}&quot;
              </strong>{" "}
              agar sistem pengacakan opsi bisa bekerja. Saat ini sistem hanya
              mendeteksi {cards.length} kartu aktif.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
