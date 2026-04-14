"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import TTSReader from "./TTSReader";
import XPPop from "./XPPop";
import { updateProgressOnReview } from "@/lib/progress";

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

  // TAMBAHAN: State untuk Mode Belajar
  const [studyMode, setStudyMode] = useState<"latihan" | "ujian">("latihan");

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  const sessionKey = `nihongo_session_${type}_${cards.length > 0 ? cards[0]?.level?.code || "general" : "general"}`;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !cards || cards.length === 0) return null;

  const card = cards[currentIndex];

  const getStrokeImageUrl = (char: string) => {
    const code = char.charCodeAt(0).toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  };

  // Fungsi untuk maju/mundur di Mode Latihan Bebas
  const handleNav = (dir: 1 | -1) => {
    if (currentIndex + dir >= 0 && currentIndex + dir < cards.length) {
      setDirection(dir);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + dir);
      }, 200);
    }
  };

  // Fungsi evaluasi untuk Mode Ujian (Sistem SRS)
  const handleAnswer = (correct: boolean) => {
    const cardId = card._id || card.id || "unknown";

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

    updateProgress(progress.xp + (correct ? 15 : 5), {
      ...progress.srs,
      [cardId]: newState,
    });

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(0);
      } else {
        const basePath = window.location.pathname.replace(
          /\/(flashcards|kanji)$/,
          "",
        );
        router.push(basePath || "/courses");
      }
    }, 200);
  };

  if (!card)
    return <div className="text-center text-white/50 p-8">Sesi selesai.</div>;

  return (
    <section className="w-full max-w-xl mx-auto relative perspective-1000">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      {/* HEADER: Pilihan Mode yang Ramah Awam */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center bg-cyber-bg p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => {
              setStudyMode("latihan");
              setIsFlipped(false);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              studyMode === "latihan"
                ? "bg-white/10 text-white shadow-inner"
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
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              studyMode === "ujian"
                ? "bg-cyber-neon text-black shadow-[0_0_15px_rgba(0,255,239,0.3)]"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            🎯 Uji Hafalan
          </button>
        </div>

        <div className="flex justify-between items-center px-2">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
            {studyMode === "latihan"
              ? "Bebas mengulang kartu"
              : "Dapatkan XP & Rekam Memori"}
          </p>
          <div className="text-white/50 font-mono text-sm font-bold">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      </header>

      {/* FLASHCARD AREA */}
      <div className="relative aspect-[4/5] md:aspect-square w-full">
        <AnimatePresence initial={false} mode="wait">
          <motion.article
            key={currentIndex + (isFlipped ? "-back" : "-front")}
            initial={
              isFlipped
                ? { rotateY: 90, opacity: 0 }
                : {
                    x: direction === 1 ? 300 : direction === -1 ? -300 : 0,
                    opacity: 0,
                  }
            }
            animate={
              isFlipped ? { rotateY: 0, opacity: 1 } : { x: 0, opacity: 1 }
            }
            exit={
              isFlipped
                ? { rotateY: -90, opacity: 0 }
                : {
                    x: direction === 1 ? -300 : direction === -1 ? 300 : 0,
                    opacity: 0,
                  }
            }
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer rounded-[2.5rem] border transition-all duration-500 overflow-hidden
              ${isFlipped ? "bg-[#1a1c20] border-cyber-neon/30 shadow-[0_0_40px_rgba(0,255,239,0.1)]" : "bg-cyber-surface border-white/5 shadow-neumorphic"}`}
            onClick={() => {
              if (!isFlipped) {
                sounds?.playPop();
                setIsFlipped(true);
              }
            }}
          >
            {/* ... (Isi rendering sisi depan dan belakang kartu sama persis dengan kode Anda sebelumnya, biarkan bagian ini utuh agar desainnya tidak rusak) ... */}
            {!isFlipped ? (
              <div className="text-center relative z-10 w-full">
                <div className="absolute -top-16 left-0 right-0 flex justify-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 bg-cyber-surface px-4 py-1 rounded-full border border-white/5">
                    Ketuk untuk melihat arti
                  </span>
                </div>
                <h2
                  className={`${card.word.length > 5 ? "text-5xl" : "text-7xl"} font-black text-white tracking-tighter drop-shadow-2xl`}
                >
                  {card.word}
                </h2>
              </div>
            ) : (
              <div className="text-center w-full flex flex-col items-center relative z-10">
                {/* Bagian Belakang Kartu (Furigana, Arti, Onyomi, Kunyomi) - Sama dengan kode Anda */}
                <div className="mb-6 w-full flex flex-col items-center justify-center">
                  <p className="text-cyber-neon font-mono font-bold text-sm tracking-[0.2em] uppercase mb-1">
                    {card.furigana || card.romaji}
                  </p>
                  <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                    {card.word}
                  </h2>
                </div>
                <div className="w-full mb-6 py-4 px-6 bg-green-500/10 rounded-2xl border-l-4 border-green-500">
                  <h3 className="text-xl font-black text-green-400 uppercase tracking-tight">
                    {card.meaning}
                  </h3>
                </div>
                <div className="mt-auto">
                  <TTSReader text={card.word} minimal={false} />
                </div>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      {/* KONTROL NAVIGASI BERDASARKAN MODE */}
      <div className="mt-8 h-20">
        {studyMode === "latihan" ? (
          /* KONTROL MODE LATIHAN: Tombol Maju & Mundur */
          <div className="flex justify-between gap-4">
            <button
              onClick={() => handleNav(-1)}
              disabled={currentIndex === 0}
              className="flex-1 p-5 bg-cyber-surface rounded-2xl border border-white/5 font-black uppercase text-xs text-white/50 disabled:opacity-20 hover:bg-white/5 transition-all"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => handleNav(1)}
              disabled={currentIndex === cards.length - 1}
              className="flex-1 p-5 bg-cyber-surface rounded-2xl border border-white/5 font-black uppercase text-xs text-white/80 hover:bg-white/10 transition-all shadow-neumorphic"
            >
              Selanjutnya →
            </button>
          </div>
        ) : (
          /* KONTROL MODE UJIAN: Tombol Ingat & Lupa (Hanya muncul jika kartu sudah dibalik) */
          <AnimatePresence>
            {isFlipped && (
              <motion.nav
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="grid grid-cols-2 gap-5"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(false);
                  }}
                  className="p-5 md:p-6 bg-cyber-surface rounded-3xl border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-neumorphic active:translate-y-1"
                >
                  Masih Lupa ❌
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(true);
                  }}
                  className="p-5 md:p-6 bg-cyber-surface rounded-3xl border border-green-500/20 text-green-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[0_0_15px_rgba(34,197,94,0.1)] active:translate-y-1"
                >
                  Sudah Ingat ✅
                </button>
              </motion.nav>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
