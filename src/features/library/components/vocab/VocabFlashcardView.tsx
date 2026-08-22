"use client";

/**
 * @file VocabFlashcardView.tsx
 * @description Komponen pembungkus (wrapper) latihan Kartu Memori (Flashcard) untuk daftar kosakata pustaka.
 * Melakukan pemetaan properti VocabItem ke format FlashcardData dan merender komponen FlashcardMaster.
 */

// IMPOR UTAMA

import React from "react";
import { ArrowLeft } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import FlashcardMaster from "@/features/review/flashcards/master/FlashcardMaster";
import { VocabItem } from "./types";

// ANTARMUKA & TIPE DATA

/**
 * Props for VocabFlashcardView component.
 */
interface VocabFlashcardViewProps {
 /** List of vocabulary items to study. */
 vocabList: VocabItem[];
 /** Callback triggered when back button clicked. */
 onBack: () => void;
}

// KOMPONEN UTAMA: VocabFlashcardView

/**
 * Component for vocabulary flashcard study session.
 * Maps vocabulary items to flashcard format and renders master flashcard interface.
 * 
 * @param props Component properties.
 * @returns React element.
 */
export function VocabFlashcardView({ vocabList, onBack }: VocabFlashcardViewProps) {
 // Map VocabItem structure to FlashcardMaster compatible schema.
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
 className="flex items-center justify-center gap-3 px-8 py-6 rounded-lg text-xs md:text-xs font-black uppercase tracking-widest neo-card bg-muted border-border hover:bg-primary hover:text-primary-foreground transition-all"
 >
 <ArrowLeft size={18} /> Kembali
 </Button>
 </div>
 
 {/* Mesin Sesi Latihan Flashcard */}
 <FlashcardMaster cards={flashcardData} />
 </div>
 );
}