"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import TTSReader from "./TTSReader";
import XPPop from "./XPPop";
// Pastikan ini diimpor jika kamu menggunakannya di file yang sama
import { updateProgressOnReview } from "@/lib/progress";

export default function FlashcardMaster({
  cards,
  type = "vocab",
}: {
  cards: any[];
  type?: "vocab" | "kanji";
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [isClient, setIsClient] = useState(false); // Mencegah Hydration Error

  const { progress, updateProgress } = useProgress();

  // ✨ KUNCI: Gunakan identifier unik untuk deck ini (bisa berdasarkan level/type)
  const sessionKey = `nihongo_session_${type}_${cards.length > 0 ? cards[0]?.level?.code || "general" : "general"}`;

  useEffect(() => {
    setIsClient(true);
    // Muat index terakhir jika ada
    const savedIndex = localStorage.getItem(sessionKey);
    if (savedIndex !== null) {
      const parsedIndex = parseInt(savedIndex, 10);
      // Pastikan index valid dan belum selesai semua
      if (!isNaN(parsedIndex) && parsedIndex < cards.length) {
        setCurrentIndex(parsedIndex);
      }
    }
  }, [sessionKey, cards.length]);

  if (!isClient || !cards || cards.length === 0) return null;

  const card = cards[currentIndex];

  const getStrokeImageUrl = (char: string) => {
    const code = char.charCodeAt(0).toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  };

  const handleAnswer = (correct: boolean) => {
    const cardId = card._id || card.id;

    // Update Daily Quests & Stats
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
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setDirection(0);
        // ✨ Simpan index baru ke LocalStorage
        localStorage.setItem(sessionKey, nextIndex.toString());
      } else {
        // Jika selesai, bersihkan memori sesi agar besok bisa mulai dari 0 lagi
        localStorage.removeItem(sessionKey);

        const basePath = window.location.pathname.replace(
          /\/(flashcards|kanji)$/,
          "",
        );
        window.location.href = basePath || "/jlpt";
      }
    }, 200);
  };

  // Jika tidak ada kartu tersisa atau index melebihi batas (fallback)
  if (!card) {
    return (
      <div className="text-center text-white/50 p-8">
        Sesi selesai atau data kartu tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto relative perspective-1000">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-end mb-3 px-2">
        <span className="text-[#0ef] font-mono text-[10px] tracking-[0.2em] uppercase font-black">
          [System.Review]
        </span>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-white font-bold text-sm">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-white/40 text-xs">
            {String(cards.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#15171a] h-1.5 rounded-full mb-10 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
        <motion.div
          className={`h-full ${
            type === "kanji"
              ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
              : "bg-[#0ef] shadow-[0_0_15px_rgba(0,255,239,0.8)]"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          transition={{ ease: "circOut", duration: 0.5 }}
        />
      </div>

      {/* Kartu Utama */}
      <div className="relative aspect-[4/5] md:aspect-square w-full">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
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
              ${
                isFlipped
                  ? "bg-[#1a1c20] border-[#0ef]/30 shadow-[0_0_40px_rgba(0,255,239,0.1)]"
                  : "bg-[#1e2024] border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02)] hover:border-white/10"
              }`}
            onClick={() => {
              if (!isFlipped) {
                sounds?.playPop();
                setIsFlipped(true);
              }
            }}
          >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

            {!isFlipped ? (
              <div className="text-center relative z-10 w-full">
                <div className="absolute -top-16 left-0 right-0 flex justify-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 bg-[#1e2024] px-4 py-1 rounded-full border border-white/5">
                    Tebak Bacaan
                  </span>
                </div>
                <h2
                  className={`${
                    card.word.length > 5
                      ? "text-5xl md:text-6xl"
                      : "text-7xl md:text-9xl"
                  } font-black text-white tracking-tighter drop-shadow-2xl`}
                >
                  {card.word}
                </h2>
              </div>
            ) : (
              <div className="text-center w-full flex flex-col items-center relative z-10">
                {type === "kanji" && (
                  <div className="mb-6 relative group">
                    <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-28 h-28 md:w-32 md:h-32 bg-white rounded-3xl p-3 shadow-inner flex items-center justify-center border-[3px] border-white/10">
                      <img
                        src={getStrokeImageUrl(card.word[0])}
                        alt="Stroke Order"
                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6 w-full flex flex-col items-center justify-center">
                  <p className="text-[#0ef] font-mono font-bold text-sm md:text-base tracking-[0.2em] uppercase mb-1">
                    {card.furigana || card.romaji}
                  </p>
                  <h2
                    className={`${type === "kanji" ? "text-5xl" : "text-6xl md:text-7xl"} font-black text-white tracking-tighter drop-shadow-lg`}
                  >
                    {card.word}
                  </h2>
                </div>

                <div className="w-full mb-6 py-4 px-6 bg-green-500/10 rounded-2xl border-l-4 border-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="font-mono text-4xl font-black text-green-500">
                      JP
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-green-400 uppercase tracking-tight relative z-10">
                    {card.meaning}
                  </h3>
                </div>

                {/* Detail: Onyomi & Kunyomi */}
                {type === "kanji" && (card.kanjiDetails || card.details) && (
                  <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="bg-[#15171a] p-3 rounded-xl border border-white/5 text-left shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                      <span className="text-[9px] text-blue-400 block font-black uppercase tracking-widest mb-1 border-l-2 border-blue-500 pl-2">
                        Onyomi
                      </span>
                      <span className="text-white text-sm md:text-base font-bold font-japanese tracking-tight">
                        {/* Support field baru dan field lama */}
                        {card.kanjiDetails?.onyomi ||
                          card.details?.onyomi ||
                          "-"}
                      </span>
                    </div>
                    <div className="bg-[#15171a] p-3 rounded-xl border border-white/5 text-left shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                      <span className="text-[9px] text-orange-400 block font-black uppercase tracking-widest mb-1 border-l-2 border-orange-500 pl-2">
                        Kunyomi
                      </span>
                      <span className="text-white text-sm md:text-base font-bold font-japanese tracking-tight">
                        {/* Support field baru dan field lama */}
                        {card.kanjiDetails?.kunyomi ||
                          card.details?.kunyomi ||
                          "-"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-auto">
                  <TTSReader text={card.word} minimal={false} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="grid grid-cols-2 gap-5 mt-8"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(false);
              }}
              className="group relative p-5 md:p-6 bg-[#1e2024] rounded-3xl border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.02)] active:translate-y-1 transition-all"
            >
              <div className="absolute inset-0 rounded-3xl bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Lupa ❌
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(true);
              }}
              className="group relative p-5 md:p-6 bg-[#1e2024] rounded-3xl border border-green-500/20 text-green-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03),0_0_15px_rgba(34,197,94,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.02)] active:translate-y-1 transition-all"
            >
              <div className="absolute inset-0 rounded-3xl bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Ingat ✅
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
