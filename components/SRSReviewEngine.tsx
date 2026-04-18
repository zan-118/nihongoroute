"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState, createNewCardState } from "@/lib/srs";
import Flashcard from "./Flashcard";
import { motion, AnimatePresence } from "framer-motion";

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

  // 1. Tambahkan tipe <FlashcardType[]> di sini
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  useEffect(() => {
    // 2. Ubah kondisi menjadi cards.length > 0
    if (cards && cards.length > 0) {
      // Algoritma Fisher-Yates Shuffle
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

  // ... (Sisa kode ke bawah sama persis seperti yang Anda buat)
  const handleAnswer = (correct: boolean) => {
    // Hanya update memori jika dalam Mode Tes (Tinjauan)
    if (studyMode === "test") {
      const cardId = currentCard._id;
      const currentState = progress.srs[cardId] || createNewCardState();
      const newState = updateCardState(currentState, correct);

      updateProgress(progress.xp + (correct ? 10 : 2), {
        ...progress.srs,
        [cardId]: newState,
      });
    }

    // Navigasi ke kartu berikutnya
    goToNext();
  };

  const goToNext = () => {
    // 1. Tentukan arah animasi
    setDirection(1);
    setIsFlipped(false);

    // 2. Langsung ubah index (Tanpa setTimeout!)
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

      // Langsung ubah index
      setCurrentIndex((prev) => prev - 1);
    }
  };
  return (
    <section className="w-full max-w-xl mx-auto px-4">
      {/* HEADER: Pemilihan Mode */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-cyber-neon font-mono text-[10px] tracking-[0.2em] uppercase font-black">
            {studyMode === "free"
              ? "[Mode_Belajar_Bebas]"
              : "[Mode_Tinjauan_Pintar]"}
          </span>
          <div className="flex bg-cyber-bg p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setStudyMode("free")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${studyMode === "free" ? "bg-white/10 text-white" : "text-white/30"}`}
            >
              Latihan
            </button>
            <button
              onClick={() => setStudyMode("test")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${studyMode === "test" ? "bg-cyber-neon text-black" : "text-white/30"}`}
            >
              Tes Hafalan
            </button>
          </div>
        </div>

        {/* Info Bantuan untuk User Awam */}
        <p className="text-white/40 text-[11px] leading-relaxed italic">
          {studyMode === "free"
            ? "Gunakan mode ini untuk mengulang kartu sesukamu tanpa memengaruhi level hafalan."
            : "Gunakan mode ini untuk menguji ingatanmu. Algoritma akan mengatur jadwal ulang secara otomatis."}
        </p>
      </header>

      {/* FLASHCARD COMPONENT */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: direction * 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 100, opacity: 0 }}
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
      <div className="mt-8 space-y-6">
        {!isFlipped ? (
          /* Navigasi Manual di Depan */
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="p-4 rounded-2xl bg-cyber-surface border border-white/5 text-white disabled:opacity-20"
            >
              ←
            </button>
            <div className="text-white/20 font-mono text-xs">
              KARTU {currentIndex + 1} / {shuffledCards.length}
            </div>
            <button
              onClick={goToNext}
              className="p-4 rounded-2xl bg-cyber-surface border border-white/5 text-white"
            >
              →
            </button>
          </div>
        ) : (
          /* Tombol Evaluasi (Hanya muncul jika sudah di-flip) */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => handleAnswer(false)}
              className="p-6 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-400 font-black uppercase tracking-widest text-xs"
            >
              Masih Lupa
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="p-6 bg-green-500/10 border border-green-500/30 rounded-3xl text-green-400 font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(34,197,94,0.1)]"
            >
              Sudah Ingat
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
