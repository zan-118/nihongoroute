/**
 * @file page.tsx
 * @description Halaman latihan Kanji menggunakan sistem Flashcard.
 * Menarik data karakter Kanji dari Sanity CMS berdasarkan kategori level.
 * @module KanjiFlashcardPage
 */

// ======================
// IMPORTS
// ======================
import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
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
 * Komponen KanjiFlashcardPage: Mengambil data dan merender sistem flashcard khusus Kanji.
 * 
 * @returns {JSX.Element} Antarmuka flashcard Kanji.
 */
export default async function KanjiFlashcardPage({ params }: PageProps) {
  const { categoryId } = await params;

  // ======================
  // DATABASE OPERATIONS
  // ======================
  const kanjiQuery = `*[_type == "kanji" && showInFlashcard != false && course_category->slug.current == $categoryId] {
    _id, "word": character, meaning, onyomi, kunyomi, examples
  }`;
  const cards = await client.fetch(kanjiQuery, { categoryId });

  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full px-4 md:px-8 relative overflow-hidden flex flex-col flex-1 mt-4 md:mt-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        <nav className="mb-6 md:mb-8 italic">
          <Button
            variant="outline"
            asChild
            className="h-auto text-purple-400 text-[10px] md:text-xs font-black uppercase tracking-widest border-purple-500/20 hover:border-purple-500 hover:bg-purple-500/5 transition-all"
          >
            <Link href={`/courses/${categoryId}`}>← Kembali ke Materi</Link>
          </Button>
        </nav>

        <header className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Latihan{" "}
            <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              Kanji
            </span>
          </h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-mono uppercase tracking-widest mt-2 md:mt-3 flex items-center justify-center md:justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />{" "}
            Database Terintegrasi: {cards.length} Karakter Dimuat
          </p>
        </header>

        {cards.length > 0 ? (
          <FlashcardMaster cards={cards} type="kanji" />
        ) : (
          <Card className="text-white bg-red-500/10 border border-red-500/30 p-8 md:p-10 rounded-[2rem] text-center shadow-2xl">
            <span className="text-4xl md:text-5xl mb-4 block">📡</span>
            <p className="font-black uppercase italic tracking-tighter text-lg md:text-xl text-red-400">
              Data Kanji Kosong
            </p>
            <p className="text-xs text-white/60 mt-3 max-w-xs mx-auto leading-relaxed">
              Pastikan Anda sudah memasukkan karakter ke database (Sanity),
              memilih kategori <strong>"Kanji"</strong>, dan mengatur levelnya
              ke <strong>{categoryId.toUpperCase()}</strong>.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
