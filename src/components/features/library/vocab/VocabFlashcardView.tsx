"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { VocabItem } from "./types";

interface VocabFlashcardViewProps {
  vocabList: VocabItem[];
  onBack: () => void;
}

/**
 * Tampilan sesi latihan flashcard untuk kosakata.
 */
export function VocabFlashcardView({ vocabList, onBack }: VocabFlashcardViewProps) {
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
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full mt-10 px-4 flex-1 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl text-xs md:text-xs font-bold uppercase tracking-widest neo-card bg-muted border-border hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <ArrowLeft size={18} /> Kembali
        </Button>
      </div>
      <FlashcardMaster cards={flashcardData} />
    </div>
  );
}
