"use client";

/**
 * @file VocabFlashcardView.tsx
 * @description Komponen pembungkus (wrapper) latihan Kartu Memori (Flashcard) untuk daftar kosakata pustaka.
 * Melakukan pemetaan properti VocabItem ke format FlashcardData dan merender komponen FlashcardMaster.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { VocabItem } from "./types";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface VocabFlashcardViewProps {
  vocabList: VocabItem[];
  onBack: () => void;
}

// ==========================================
// KOMPONEN UTAMA: VocabFlashcardView
// ==========================================
/**
 * Komponen penayang sesi latihan flashcards kosakata.
 * 
 * @param {VocabFlashcardViewProps} props Properti komponen flashcard view kosakata.
 */
export function VocabFlashcardView({ vocabList, onBack }: VocabFlashcardViewProps) {
  // Memetakan struktur VocabItem dari Pustaka ke skema data yang kompatibel dengan FlashcardMaster
  const flashcardData = vocabList.map((item) => ({
    id: item.id,
    word: item.word,
    meaning: item.meaning || "",
    furigana: item.furigana,
    romaji: item.romaji,
    jlpt_level: "library",
    mnemonic: item.mnemonic,
    related_kanji: item.related_kanji,
  }));

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full mt-10 px-4 flex-1 pb-24 font-sans">
      {/* Header Aksi Kembali */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl text-xs md:text-xs font-black uppercase tracking-widest neo-card bg-muted border-border hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <ArrowLeft size={18} /> Kembali
        </Button>
      </div>
      
      {/* Mesin Sesi Latihan Flashcard */}
      <FlashcardMaster cards={flashcardData} />
    </div>
  );
}

