/**
 * LOKASI FILE: components/FlashcardMaster.tsx
 * KONSEP: Mobile-First Neumorphic (Sistem Hafalan)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy, Brain, Flame, Info } from "lucide-react";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import XPPop from "./XPPop";
import { updateProgressOnReview } from "@/lib/progress";
import Flashcard from "./Flashcard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface MasterCardData {
  _id?: string;
  id?: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  level?: { code: string };
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  details?: { onyomi?: string; kunyomi?: string };
  category?: string;
}

export default function FlashcardMaster({
  cards,
  type = "vocab",
}: {
  cards: MasterCardData[];
  type?: "vocab" | "kanji";
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [studyMode, setStudyMode] = useState<"latihan" | "ujian">("latihan");

  const [sessionStats, setSessionStats] = useState({
    known: 0,
    learning: 0,
    xpGained: 0,
  });
  const [isFinished, setIsFinished] = useState(false);

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  // THEME CONFIG
  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-purple-400" : "text-cyber-neon";
  const themeBgColor = isKanji ? "bg-purple-500" : "bg-cyber-neon";
  const themeShadow = isKanji 
    ? "shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
    : "shadow-[0_0_20px_rgba(0,238,255,0.3)]";

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !cards || cards.length === 0) return null;

  const card = cards[currentIndex];

  const handleNav = (dir: 1 | -1) => {
    if (currentIndex + dir >= 0 && currentIndex + dir < cards.length) {
      setDirection(dir);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + dir);
      }, 200);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const cardId = card._id || card.id || "unknown";
    const xpReward = correct ? 15 : 5;

    setSessionStats((prev) => ({
      known: prev.known + (correct ? 1 : 0),
      learning: prev.learning + (correct ? 0 : 1),
      xpGained: prev.xpGained + xpReward,
    }));

    updateProgressOnReview();

    const currentState = progress.srs[cardId] || {
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
    };

    if (correct) {
      sounds?.playSuccess();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 800);
    } else {
      sounds?.playError();
    }

    setDirection(correct ? 1 : -1);
    const newState = updateCardState(currentState, correct);

    updateProgress(progress.xp + xpReward, {
      ...progress.srs,
      [cardId]: newState,
    });

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(0);
      } else {
        setIsFinished(true);
      }
    }, 200);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStats({ known: 0, learning: 0, xpGained: 0 });
  };

  return (
    <section className="w-full max-w-2xl mx-auto relative px-4 md:px-0">
      <Dialog open={isFinished} onOpenChange={setIsFinished}>
        <DialogContent className="max-w-md w-[90%] md:w-full p-0 border-none bg-transparent shadow-none mx-auto">
          <Card className="w-full bg-[#0a0c10] p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 text-center relative overflow-hidden neo-card shadow-none">
            <div className={`absolute top-0 left-0 right-0 h-2 ${themeBgColor} ${themeShadow}`} />

            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-black/40 rounded-2xl md:rounded-[2rem] flex items-center justify-center border border-white/5 mb-6 md:mb-8 neo-inset shadow-none">
              <Trophy
                size={36}
                className="text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] md:w-10 md:h-10"
              />
            </div>

            <DialogHeader>
              <DialogTitle className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 md:mb-4 text-center">
                Sesi Selesai
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-[10px] md:text-xs mb-8 md:mb-10 uppercase font-bold tracking-widest">
              {cards.length} KARTU SELESAI DITINJAU
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-10">
              <Card className="bg-emerald-500/5 border border-emerald-500/20 p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col items-center neo-inset shadow-none">
                <span className="text-3xl md:text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  {sessionStats.known}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mt-2">
                  Sudah Hafal
                </span>
              </Card>
              <Card className="bg-cyber-neon/5 border border-cyber-neon/20 p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col items-center neo-inset shadow-none">
                <span className="text-3xl md:text-4xl font-black text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.3)]">
                  {sessionStats.learning}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-cyber-neon/80 uppercase tracking-widest mt-2">
                  Masih Lupa
                </span>
              </Card>
            </div>

            <Card className="bg-[#121620] py-4 md:py-5 rounded-xl md:rounded-2xl border border-white/5 mb-8 md:mb-10 flex justify-center items-center gap-3 neo-inset shadow-none">
              <Flame size={18} className="text-cyber-neon md:w-5 md:h-5" />
              <span className="text-white font-mono font-black text-base md:text-lg">
                +{sessionStats.xpGained} XP
              </span>
            </Card>

            <div className="flex flex-col gap-3 md:gap-4">
              <Button
                onClick={handleRestart}
                className={`w-full h-auto py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest border-none shadow-[0_0_20px_rgba(0,238,255,0.3)] bg-cyber-neon text-black hover:bg-white transition-all`}
              >
                <RotateCcw size={16} className="mr-2 md:w-4 md:h-4" /> Ulangi Sesi
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="w-full h-auto py-4 md:py-5 text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs border-white/5 neo-card bg-black/20 rounded-xl md:rounded-2xl"
              >
                Keluar
              </Button>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      <header className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-10">
        <Card className="flex justify-between items-center bg-[#121620] p-1.5 rounded-xl md:rounded-2xl border-white/5 neo-inset shadow-none">
          <Button
            variant="ghost"
            onClick={() => {
              setStudyMode("latihan");
              setIsFlipped(false);
            }}
            className={`flex-1 rounded-lg md:rounded-xl h-10 md:h-12 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all ${
              studyMode === "latihan"
                ? "bg-white/10 text-white shadow-none"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Brain size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Pemanasan
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStudyMode("ujian");
              setIsFlipped(false);
            }}
            className={`flex-1 rounded-lg md:rounded-xl h-10 md:h-12 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all ${
              studyMode === "ujian"
                ? `${themeBgColor} text-black ${themeShadow} hover:bg-white`
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Check size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Uji Hafalan
          </Button>
        </Card>

        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 md:gap-3">
              <Badge
                variant="outline"
                className={`${themeColor} text-[9px] md:text-[10px] uppercase tracking-widest font-bold border-white/10 neo-inset h-auto bg-black/40 px-3 py-1 md:px-4 md:py-1.5`}
              >
                {studyMode === "latihan" ? "Mode Santai" : "Mode Ujian"}
              </Badge>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline opacity-80">
                {studyMode === "latihan" ? "Belajar Santai" : "Kumpulkan XP"}
              </span>
            </div>
            <Badge variant="ghost" className="text-white/60 font-mono text-xs md:text-sm font-bold bg-[#121620] px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl border border-white/5 neo-inset h-auto">
              {currentIndex + 1} <span className="opacity-30 mx-1">/</span> {cards.length}
            </Badge>
          </div>
          <Progress
            value={((currentIndex + 1) / cards.length) * 100}
            className="h-1.5 md:h-2 bg-black/40"
            indicatorClassName={`${themeBgColor} shadow-[0_0_10px_rgba(0,238,255,0.5)]`}
          />
        </div>
      </header>

      {/* KARTU UTAMA */}
      <div className="relative w-full mb-8 md:mb-10">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{
              x: direction === 1 ? 200 : direction === -1 ? -200 : 0,
              opacity: 0,
              scale: 0.95,
            }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{
              x: direction === 1 ? -200 : direction === -1 ? 200 : 0,
              opacity: 0,
              scale: 0.95,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Flashcard
              word={card.word}
              meaning={card.meaning}
              furigana={card.furigana}
              romaji={card.romaji}
              kanjiDetails={card.kanjiDetails || card.details}
              isFlipped={isFlipped}
              onFlip={() => {
                if (studyMode === "ujian" && isFlipped) return;
                sounds?.playPop();
                if (studyMode === "ujian") {
                  setIsFlipped(true);
                } else {
                  setIsFlipped((prev) => !prev);
                }
              }}
              type={type}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="min-h-[70px] md:min-h-[80px]">
        {studyMode === "latihan" ? (
          <div className="flex justify-between gap-3 md:gap-5">
            <Button
              variant="ghost"
              onClick={() => handleNav(-1)}
              disabled={currentIndex === 0}
              className="flex-1 h-auto py-5 md:py-6 text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest neo-card bg-[#121620] border-white/5 disabled:opacity-20 rounded-xl md:rounded-2xl"
            >
              Sebelumnya
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNav(1)}
              disabled={currentIndex === cards.length - 1}
              className={`flex-1 h-auto py-5 md:py-6 text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest neo-card bg-[#121620] border-white/5 ${themeColor} disabled:opacity-20 rounded-xl md:rounded-2xl`}
            >
              Selanjutnya
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {isFlipped && (
              <motion.nav
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="grid grid-cols-2 gap-3 md:gap-5"
              >
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(false);
                  }}
                  className="h-auto py-5 md:py-6 border-cyber-neon/30 bg-cyber-neon/5 text-cyber-neon hover:bg-cyber-neon hover:text-black font-bold uppercase tracking-widest text-[9px] md:text-[10px] lg:text-xs rounded-xl md:rounded-2xl neo-card shadow-none transition-all"
                >
                  <X size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Masih Lupa
                </Button>
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(true);
                  }}
                  className="h-auto py-5 md:py-6 border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold uppercase tracking-widest text-[9px] md:text-[10px] lg:text-xs rounded-xl md:rounded-2xl neo-card shadow-none transition-all"
                >
                  <Check size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Sudah Hafal
                </Button>
              </motion.nav>
            )}
            {!isFlipped && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 md:gap-3 text-slate-500 py-4 md:py-6"
              >
                <Info size={14} className="md:w-4 md:h-4" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Ketuk kartu untuk melihat jawaban</span>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
