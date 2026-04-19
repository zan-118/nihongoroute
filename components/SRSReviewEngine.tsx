/**
 * LOKASI FILE: components/SRSReviewEngine.tsx
 * KONSEP: Cyber-Dark Neumorphic (Review HUD)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState, createNewCardState } from "@/lib/srs";
import Flashcard from "./Flashcard";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, X, ShieldCheck } from "lucide-react";

export interface FlashcardType {
  _id: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
}

export default function SRSReviewEngine({ cards }: { cards: FlashcardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [studyMode, setStudyMode] = useState<"free" | "test">("free");
  const [isClient, setIsClient] = useState(false);

  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  useEffect(() => {
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

  if (!isClient || shuffledCards.length === 0) return null;

  const currentCard = shuffledCards[currentIndex];

  const handleAnswer = (correct: boolean) => {
    if (studyMode === "test") {
      const cardId = currentCard._id;
      const currentState = progress.srs[cardId] || createNewCardState();
      const newState = updateCardState(currentState, correct);

      updateProgress(progress.xp + (correct ? 10 : 2), {
        ...progress.srs,
        [cardId]: newState,
      });
    }

    goToNext();
  };

  const goToNext = () => {
    setDirection(1);
    setIsFlipped(false);

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (studyMode === "test") {
      router.push("/dashboard");
    } else {
      setCurrentIndex(0);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      {/* HEADER: Pemilihan Mode */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <Card className="w-10 h-10 rounded-xl bg-red-500/10 border-red-500/20 flex items-center justify-center neo-inset shadow-none">
                <BrainCircuit size={20} className="text-red-500" />
             </Card>
             <Badge
                variant="outline"
                className="text-red-500 font-black text-[10px] tracking-[0.3em] uppercase bg-red-500/5 px-4 py-1.5 rounded-xl border-red-500/20 neo-inset h-auto"
              >
                {studyMode === "free" ? "Free Training" : "SRS Intel Review"}
              </Badge>
          </div>

          <Card className="flex bg-black/40 p-1.5 rounded-2xl border-white/5 neo-inset shadow-none w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => setStudyMode("free")}
              className={`flex-1 sm:flex-initial px-6 py-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studyMode === "free" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Belajar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStudyMode("test")}
              className={`flex-1 sm:flex-initial px-6 py-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studyMode === "test" ? "bg-red-500 text-black shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              Uji SRS
            </Button>
          </Card>
        </div>

        <Card className="bg-black/20 border-white/5 p-5 rounded-[2rem] neo-inset shadow-none border-dashed">
          <p className="text-slate-400 text-[11px] leading-relaxed italic flex items-start gap-4 font-medium">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-red-500 opacity-60" />
            {studyMode === "free"
              ? "Ulangi materi tanpa batas untuk memperkuat pondasi memori visual dan auditori."
              : "Setiap jawaban akan dianalisis oleh algoritma SRS untuk menentukan interval review berikutnya."}
          </p>
        </Card>
      </header>

      {/* FLASHCARD COMPONENT */}
      <div className="relative mb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: direction * 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -direction * 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Flashcard
              word={currentCard.word}
              meaning={currentCard.meaning}
              furigana={currentCard.furigana}
              romaji={currentCard.romaji}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CONTROLS */}
      <footer className="min-h-[100px]">
        {!isFlipped ? (
          <div className="flex justify-between items-center gap-6">
            <Button
              variant="ghost"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="w-20 h-20 rounded-[2rem] bg-black/40 border border-white/5 text-slate-400 disabled:opacity-10 neo-inset transition-all hover:bg-black/60 hover:text-white"
            >
              <ArrowLeft size={24} />
            </Button>
            <div className="text-slate-600 font-mono text-[11px] font-black tracking-[0.4em] uppercase text-center flex flex-col gap-1">
              <span className="text-white/40 italic">Data_Point</span>
              <span className="text-white text-lg">0{currentIndex + 1} <span className="text-white/10 mx-1">/</span> 0{shuffledCards.length}</span>
            </div>
            <Button
              variant="ghost"
              onClick={goToNext}
              className="w-20 h-20 rounded-[2rem] bg-black/40 border border-white/5 text-slate-400 neo-inset transition-all hover:bg-black/60 hover:text-white"
            >
              <ArrowRight size={24} />
            </Button>
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
              className="h-auto py-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-red-500 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs neo-card hover:bg-red-500 hover:text-black transition-all group"
            >
              <X size={18} className="mr-2 group-hover:scale-125 transition-transform" /> Masih Lupa
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAnswer(true)}
              className="h-auto py-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs neo-card hover:bg-emerald-500 hover:text-black transition-all group shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <Check size={18} className="mr-2 group-hover:scale-125 transition-transform" /> Sudah Ingat
            </Button>
          </motion.div>
        )}
      </footer>
    </section>
  );
}
