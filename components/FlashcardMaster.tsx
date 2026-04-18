"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy } from "lucide-react";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import XPPop from "./XPPop";
import { updateProgressOnReview } from "@/lib/progress";
import Flashcard from "./Flashcard";

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

  const themeShadow =
    type === "kanji"
      ? "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
      : "shadow-[0_0_15px_rgba(34,211,238,0.3)]";
  const themeBgColor = type === "kanji" ? "bg-purple-500" : "bg-cyan-400";

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

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-cyber-surface p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl text-center max-w-md mx-auto my-auto relative overflow-hidden"
      >
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${themeBgColor} opacity-50`}
        />

        <div className="w-20 h-20 mx-auto bg-[#0a0c10] rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-inner">
          <Trophy
            size={32}
            className="text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          />
        </div>

        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
          Sesi Selesai!
        </h2>
        <p className="text-slate-200 text-xs sm:text-sm mb-8">
          Kamu telah meninjau {cards.length} kartu hari ini.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-3xl font-black text-emerald-400">
              {sessionStats.known}
            </span>
            <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest mt-1">
              Sudah Hafal
            </span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-3xl font-black text-red-400">
              {sessionStats.learning}
            </span>
            <span className="text-[9px] font-bold text-red-400/60 uppercase tracking-widest mt-1">
              Masih Lupa
            </span>
          </div>
        </div>

        <div className="bg-[#0a0c10] py-4 rounded-2xl border border-white/5 mb-8 flex justify-center items-center gap-3 shadow-inner">
          <span className="text-xl">⚡</span>
          <span className="text-white font-mono font-bold text-sm">
            +{sessionStats.xpGained} XP Diperoleh
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRestart}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest transition-colors text-[10px] sm:text-xs border border-white/10"
          >
            <RotateCcw size={16} /> Ulangi Sesi Ini
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-4 text-slate-300 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
          >
            Kembali ke Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto relative perspective-1000">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      <header className="flex flex-col gap-4 mb-8 max-w-xl mx-auto">
        <div className="flex justify-between items-center bg-cyber-bg p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <button
            onClick={() => {
              setStudyMode("latihan");
              setIsFlipped(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
              studyMode === "latihan"
                ? "bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            📚 Pemanasan
          </button>
          <button
            onClick={() => {
              setStudyMode("ujian");
              setIsFlipped(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
              studyMode === "ujian"
                ? `${themeBgColor} text-black ${themeShadow}`
                : "text-white/30 hover:text-white/50"
            }`}
          >
            🎯 Uji Hafalan
          </button>
        </div>

        <div className="flex justify-between items-center px-2">
          <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">
            {studyMode === "latihan"
              ? "Bebas Bolak-Balik Kartu"
              : "Dapatkan XP & Rekam Memori"}
          </p>
          <div className="text-white/50 font-mono text-xs md:text-sm font-bold bg-white/5 px-3 py-1 rounded-lg">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      </header>

      {/* KARTU DIPERBESAR (max-w-2xl agar lebih lebar di desktop) */}
      <div className="relative w-full mb-8">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{
              x: direction === 1 ? 300 : direction === -1 ? -300 : 0,
              opacity: 0,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{
              x: direction === 1 ? -300 : direction === -1 ? 300 : 0,
              opacity: 0,
            }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
          >
            <Flashcard
              word={card.word}
              meaning={card.meaning}
              furigana={card.furigana}
              romaji={card.romaji}
              kanjiDetails={card.kanjiDetails || card.details}
              isFlipped={isFlipped}
              onFlip={() => {
                // KONDISI KHUSUS MODE UJIAN
                // Jika sedang mode ujian dan kartu sudah dibalik, hentikan eksekusi (Kunci kartu)
                if (studyMode === "ujian" && isFlipped) return;

                sounds?.playPop();

                if (studyMode === "ujian") {
                  setIsFlipped(true); // Hanya bisa dibalik 1 kali ke jawaban
                } else {
                  setIsFlipped((prev) => !prev); // Bisa dibolak-balik berkali-kali
                }
              }}
              type={type}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-20 max-w-xl mx-auto">
        {studyMode === "latihan" ? (
          <div className="flex justify-between gap-4">
            <button
              onClick={() => handleNav(-1)}
              disabled={currentIndex === 0}
              className="flex-1 p-4 md:p-5 bg-cyber-surface rounded-2xl border border-white/5 font-black uppercase text-[10px] md:text-xs text-white/50 disabled:opacity-20 hover:bg-white/5 transition-all"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => handleNav(1)}
              disabled={currentIndex === cards.length - 1}
              className="flex-1 p-4 md:p-5 bg-cyber-surface rounded-2xl border border-white/5 font-black uppercase text-[10px] md:text-xs text-white/80 hover:bg-white/10 transition-all shadow-neumorphic"
            >
              Selanjutnya →
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {isFlipped && (
              <motion.nav
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="grid grid-cols-2 gap-4 md:gap-5"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(false);
                  }}
                  className="p-4 md:p-5 bg-cyber-surface rounded-2xl border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-neumorphic active:translate-y-1 hover:bg-red-500/5 transition-colors"
                >
                  Masih Lupa ❌
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(true);
                  }}
                  className="p-4 md:p-5 bg-cyber-surface rounded-2xl border border-green-500/20 text-green-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[0_0_15px_rgba(34,197,94,0.1)] active:translate-y-1 hover:bg-green-500/5 transition-colors"
                >
                  Sudah Hafal ✅
                </button>
              </motion.nav>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
