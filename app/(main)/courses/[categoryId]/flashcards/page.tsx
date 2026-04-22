/**
 * @file page.tsx
 * @description Halaman latihan kosakata menggunakan sistem Flashcard.
 * Menarik data kosakata dan verba dari Sanity CMS berdasarkan kategori level.
 * @module VocabFlashcardPage
 */

// ======================
// IMPORTS
// ======================
import FlashcardMaster from "@/components/FlashcardMaster";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
 * Komponen VocabFlashcardPage: Mengambil data dan merender sistem flashcard.
 * 
 * @returns {JSX.Element} Antarmuka flashcard kosakata.
 */
export default async function VocabFlashcardPage({ params }: PageProps) {
  const { categoryId } = await params;

  // ======================
  // DATABASE OPERATIONS
  // ======================
  const query = `{
    "vocab": *[_type == "vocab" && showInFlashcard != false && course_category->slug.current == $categoryId] { _id, word, meaning, romaji, furigana },
    "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->slug.current == $categoryId] { _id, "word": jisho, meaning, romaji, furigana }
  }`;
  const data = await client.fetch(query, { categoryId });
  const cards = [...(data.vocab || []), ...(data.verbs || [])].sort(() => Math.random() - 0.5);

  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full px-4 md:px-8 relative overflow-hidden flex flex-col flex-1 mt-4 md:mt-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        <nav className="mb-6 md:mb-8 italic">
          <Button
            variant="outline"
            asChild
            className="h-auto text-cyan-400 text-[10px] md:text-xs font-black uppercase tracking-widest border-cyan-400/20 hover:border-cyan-400 hover:bg-cyan-400/5 transition-all"
          >
            <Link href={`/courses/${categoryId}`}>← Kembali ke Materi</Link>
          </Button>
        </nav>

        <header className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Latihan{" "}
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              Kosakata
            </span>
          </h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-mono uppercase tracking-widest mt-2 md:mt-3">
            Database Terintegrasi: {cards.length} Kartu Dimuat
          </p>
        </header>

        {cards.length > 0 ? (
          <FlashcardMaster 
            cards={cards} 
            type="vocab" 
            mode="latihan" 
            isFixedMode={true} 
          />
        ) : (
          <div className="text-white bg-red-500/10 border border-red-500/30 p-8 md:p-10 rounded-[2rem] text-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <span className="text-4xl md:text-5xl mb-4 block">📡</span>
            <p className="font-black uppercase italic tracking-tighter text-lg md:text-xl text-red-400">
              Data Kosong
            </p>
            <p className="text-xs text-white/60 mt-3 max-w-xs mx-auto leading-relaxed">
              Pastikan Anda sudah memasukkan kosakata di database (Sanity) untuk
              level <strong>{categoryId.toUpperCase()}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
