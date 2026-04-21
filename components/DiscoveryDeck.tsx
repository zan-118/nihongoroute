/**
 * @file DiscoveryDeck.tsx
 * @description Dek kartu flashcard murni untuk eksplorasi materi baru.
 * Tidak terikat pada algoritma penilaian SRS, sehingga aman dibaca berulang-ulang.
 * @module DiscoveryDeck
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Flashcard from "./Flashcard";
import AddToSRSButton from "./AddToSRSButton"; // Pastikan komponen ini menerima props wordId
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";

// ======================
// TYPES
// ======================
export interface FlashcardType {
  _id: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
}

// ======================
// MAIN EXECUTION
// ======================

export default function DiscoveryDeck({ cards }: { cards: FlashcardType[] }) {
  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const currentCard = cards[currentIndex];

  // ======================
  // HELPER FUNCTIONS
  // ======================

  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // ======================
  // KEYBOARD SHORTCUTS
  // ======================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mencegah trigger jika pengguna sedang mengetik di input text
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      switch (e.key) {
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
        case " ": // Spasi
          e.preventDefault(); // Mencegah halaman scroll ke bawah
          toggleFlip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, toggleFlip]);

  if (!cards || cards.length === 0) return null;

  // ======================
  // RENDER
  // ======================
  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      {/* HEADER: Informasi Mode */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Card className="w-10 h-10 rounded-xl bg-cyan-500/10 border-cyan-500/20 flex items-center justify-center neo-inset shadow-none">
            <Compass size={20} className="text-cyan-400" />
          </Card>
          <div>
            <Badge
              variant="outline"
              className="text-cyan-400 font-black text-[9px] tracking-[0.3em] uppercase bg-cyan-500/5 px-3 py-1 rounded-lg border-cyan-500/20 neo-inset h-auto"
            >
              Mode Eksplorasi
            </Badge>
            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
              Aman dari penalti skor
            </p>
          </div>
        </div>
      </header>

      {/* AREA KARTU */}
      <div className="relative mb-8" onClick={toggleFlip}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: direction * 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -direction * 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="cursor-pointer"
          >
            <Flashcard
              word={currentCard.word}
              meaning={currentCard.meaning}
              furigana={currentCard.furigana}
              romaji={currentCard.romaji}
              isFlipped={isFlipped}
              onFlip={toggleFlip} // Bisa diklik untuk membalik
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* KONTROL NAVIGASI & AKSI */}
      <footer>
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 border border-white/5 text-slate-400 disabled:opacity-20 neo-inset transition-all hover:bg-black/60 hover:text-white shrink-0"
            title="Sebelumnya (Panah Kiri)"
          >
            <ArrowLeft size={24} />
          </Button>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="text-slate-600 font-mono text-[10px] md:text-[11px] font-black tracking-[0.4em] uppercase text-center flex flex-col gap-1">
              <span className="text-white text-base md:text-lg">
                {currentIndex + 1} <span className="text-white/10 mx-1">/</span>{" "}
                {cards.length}
              </span>
            </div>

            {/* Tombol Add to SRS di tengah agar selalu terlihat sebagai Opsi Utama */}
            <div className="w-full flex justify-center">
              <AddToSRSButton wordId={currentCard._id} />
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={goToNext}
            disabled={currentIndex === cards.length - 1}
            className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 border border-white/5 text-slate-400 disabled:opacity-20 neo-inset transition-all hover:bg-black/60 hover:text-white shrink-0"
            title="Selanjutnya (Panah Kanan)"
          >
            <ArrowRight size={24} />
          </Button>
        </div>

        {/* Helper Teks untuk Desktop */}
        <div className="hidden md:flex justify-center mt-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-black/40 px-4 py-2 rounded-xl neo-inset border border-white/5">
            Tekan <kbd className="font-mono text-cyan-400">Spasi</kbd> untuk
            balik, <kbd className="font-mono text-cyan-400">←</kbd>{" "}
            <kbd className="font-mono text-cyan-400">→</kbd> navigasi
          </p>
        </div>
      </footer>
    </section>
  );
}
