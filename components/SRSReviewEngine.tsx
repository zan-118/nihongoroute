/**
 * @file SRSReviewEngine.tsx
 * @description Mesin sesi ulasan SRS murni.
 * Setiap jawaban dievaluasi oleh algoritma untuk menentukan interval review berikutnya.
 * Dilengkapi dengan pintasan keyboard untuk efisiensi desktop.
 * @module SRSReviewEngine
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState, createNewCardState } from "@/lib/srs";
import Flashcard from "./Flashcard";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X, ShieldCheck } from "lucide-react";

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

export default function SRSReviewEngine({ cards }: { cards: FlashcardType[] }) {
  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  useEffect(() => {
    // Pengacakan urutan kartu (Fisher-Yates) agar ulasan tidak monoton
    if (cards && cards.length > 0) {
      const shuffled = [...cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledCards(shuffled);
    }
    setIsClient(true);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];

  // ======================
  // HELPER FUNCTIONS
  // ======================

  const goToNext = useCallback(() => {
    setDirection(1);
    setIsFlipped(false);

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Sesi selesai, kembali ke dasbor
      router.push("/dashboard");
    }
  }, [currentIndex, shuffledCards.length, router]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;

      const cardId = currentCard._id;
      const currentState = progress.srs[cardId] || createNewCardState();
      const newState = updateCardState(currentState, correct);

      // Berikan XP lebih besar untuk jawaban benar
      updateProgress(progress.xp + (correct ? 10 : 2), {
        ...progress.srs,
        [cardId]: newState,
      });

      goToNext();
    },
    [currentCard, progress, updateProgress, goToNext],
  );

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // ======================
  // KEYBOARD SHORTCUTS
  // ======================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      if (!isFlipped) {
        // Jika belum dibalik, Spasi atau Enter untuk membalik
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleFlip();
        }
      } else {
        // Jika sudah dibalik, 1/Kiri untuk Lupa, 2/Kanan untuk Ingat
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleAnswer(false);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAnswer(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, toggleFlip, handleAnswer]);

  if (!isClient || shuffledCards.length === 0) return null;

  // ======================
  // RENDER
  // ======================
  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      {/* HEADER: Mode SRS Aktif */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex items-center gap-3">
          <Card className="w-10 h-10 rounded-xl bg-red-500/10 border-red-500/20 flex items-center justify-center neo-inset shadow-none">
            <BrainCircuit size={20} className="text-red-500" />
          </Card>
          <div>
            <Badge
              variant="outline"
              className="text-red-500 font-black text-[10px] tracking-[0.3em] uppercase bg-red-500/5 px-4 py-1.5 rounded-xl border-red-500/20 neo-inset h-auto"
            >
              SRS Intel Review
            </Badge>
            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
              Evaluasi Algoritma Memori
            </p>
          </div>
        </div>

        <Card className="bg-red-500/5 border-red-500/10 p-4 rounded-[1.5rem] neo-inset shadow-none border-dashed">
          <p className="text-red-400/80 text-[11px] leading-relaxed italic flex items-center gap-3 font-medium">
            <ShieldCheck size={16} className="shrink-0 text-red-500" />
            Setiap jawaban menentukan jadwal kemunculan kartu ini di masa depan.
            Jawab dengan jujur.
          </p>
        </Card>
      </header>

      {/* AREA KARTU */}
      <div
        className="relative mb-10"
        onClick={!isFlipped ? toggleFlip : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: direction * 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -direction * 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={!isFlipped ? "cursor-pointer" : ""}
          >
            <Flashcard
              word={currentCard.word}
              meaning={currentCard.meaning}
              furigana={currentCard.furigana}
              romaji={currentCard.romaji}
              isFlipped={isFlipped}
              onFlip={toggleFlip}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* KONTROL BAWAH */}
      <footer className="min-h-[100px]">
        {!isFlipped ? (
          <div className="flex flex-col items-center gap-6">
            <div className="text-slate-600 font-mono text-[11px] font-black tracking-[0.4em] uppercase text-center flex flex-col gap-1">
              <span className="text-white/40 italic">Kartu Tersisa</span>
              <span className="text-white text-lg">
                {currentIndex + 1} <span className="text-white/10 mx-1">/</span>{" "}
                {shuffledCards.length}
              </span>
            </div>

            <div className="hidden md:flex justify-center mt-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-black/40 px-4 py-2 rounded-xl neo-inset border border-white/5">
                Tekan <kbd className="font-mono text-red-400">Spasi</kbd> untuk
                melihat jawaban
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-5"
          >
            <Button
              variant="ghost"
              onClick={() => handleAnswer(false)}
              className="relative h-auto py-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-red-500 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs neo-card hover:bg-red-500 hover:text-black transition-all group overflow-hidden"
            >
              <div className="relative z-10 flex items-center">
                <X
                  size={18}
                  className="mr-2 group-hover:scale-125 transition-transform"
                />{" "}
                Masih Lupa
              </div>
              <kbd className="hidden md:inline-block absolute top-4 left-4 bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono text-[9px]">
                1
              </kbd>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleAnswer(true)}
              className="relative h-auto py-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs neo-card hover:bg-emerald-500 hover:text-black transition-all group shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden"
            >
              <div className="relative z-10 flex items-center">
                <Check
                  size={18}
                  className="mr-2 group-hover:scale-125 transition-transform"
                />{" "}
                Sudah Ingat
              </div>
              <kbd className="hidden md:inline-block absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono text-[9px]">
                2
              </kbd>
            </Button>
          </motion.div>
        )}
      </footer>
    </section>
  );
}
