// app/review/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { client } from "@/sanity/lib/client";
import { useSRS } from "@/hooks/useSRS";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BrainCircuit, Check, X, RotateCw, Trophy } from "lucide-react";
import TTSReader from "@/components/TTSReader";

interface ReviewCard {
  _id: string;
  word: string;
  meaning: string;
  romaji: string;
  furigana?: string;
}

export default function DailyReviewPage() {
  const { isLoaded, getDueItems, reviewWord } = useSRS();

  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Gunakan useRef agar fetch ke Sanity HANYA terjadi 1 kali per sesi
  const hasFetched = useRef(false);

  useEffect(() => {
    // Jika belum load atau sudah pernah fetch, abaikan
    if (!isLoaded || hasFetched.current) return;

    const dueItems = getDueItems();

    if (dueItems.length === 0) {
      setIsLoading(false);
      hasFetched.current = true;
      return;
    }

    const fetchCards = async () => {
      try {
        const ids = dueItems.map((item) => item.wordId);
        const query = `*[_id in $ids] {
          _id,
          "word": coalesce(jisho, word),
          meaning,
          romaji,
          furigana
        }`;

        const data = await client.fetch(query, { ids });

        const shuffled = data.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        hasFetched.current = true; // Kunci agar tidak fetch ulang
      } catch (error) {
        console.error("Gagal menarik data dari Sanity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]); // Hapus getDueItems dari dependency array

  const handleAnswer = (isCorrect: boolean) => {
    const currentCardId = cards[currentIndex]._id;

    reviewWord(currentCardId, isCorrect);

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4">
        <RotateCw className="text-purple-500 animate-spin mb-4" size={40} />
        <p className="text-white/50 font-mono uppercase tracking-widest text-sm animate-pulse">
          Sinkronisasi Memori...
        </p>
      </main>
    );
  }

  if (cards.length === 0 && !isFinished) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4">
        <div className="bg-cyber-surface p-12 rounded-[3rem] border border-white/5 shadow-2xl text-center max-w-md">
          <BrainCircuit
            size={80}
            className="mx-auto text-purple-500/50 mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          />
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">
            All Caught <span className="text-purple-400">Up!</span>
          </h1>
          <p className="text-[#c4cfde]/70 mb-8 leading-relaxed text-sm">
            Otak Anda sedang beristirahat. Tidak ada kosakata yang perlu
            di-review saat ini. Jelajahi materi baru dan tambahkan kartu untuk
            dipelajari!
          </p>
          <Link
            href="/courses"
            className="inline-block bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all"
          >
            Explore Courses
          </Link>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cyber-bg px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-cyber-surface p-12 rounded-[3rem] border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] text-center max-w-md"
        >
          <Trophy
            size={80}
            className="mx-auto text-amber-400 mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
          />
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">
            Review <span className="text-amber-400">Complete</span>
          </h1>
          <p className="text-[#c4cfde]/70 mb-8 font-mono text-sm">
            Total Direview:{" "}
            <span className="text-white font-bold">{cards.length} Kartu</span>
          </p>
          <Link
            href="/courses"
            className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all"
          >
            Back to Hub
          </Link>
        </motion.div>
      </main>
    );
  }

  const activeCard = cards[currentIndex];

  // Safety check tambahan jika kartu tidak ditemukan (meskipun seharusnya tidak terjadi lagi)
  if (!activeCard) return null;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-cyber-bg flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-cyber-bg to-cyber-bg pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full flex justify-between items-center mb-8">
        <Link
          href="/courses"
          className="text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
        >
          ← Keluar
        </Link>
        <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <BrainCircuit size={14} />
          Daily Review: {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl perspective-1000">
        <motion.div
          layout
          className="bg-cyber-surface min-h-[400px] flex flex-col rounded-[3rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="flex-1 flex flex-col justify-center items-center p-12 text-center relative border-b border-white/5">
            <span className="text-6xl md:text-8xl font-black text-white font-japanese tracking-wider drop-shadow-lg mb-4">
              {activeCard.word}
            </span>
            {isFlipped && activeCard.furigana && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg text-purple-400 tracking-widest font-medium"
              >
                {activeCard.furigana}
              </motion.span>
            )}

            <div className="absolute top-6 right-6">
              {isFlipped && <TTSReader text={activeCard.word} minimal={true} />}
            </div>
          </div>

          <div className="bg-cyber-bg/50 p-8 min-h-[160px] flex flex-col justify-center">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-inner"
              >
                Show Answer
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center"
              >
                <div className="text-center mb-8">
                  <p className="text-2xl font-bold text-white mb-2">
                    {activeCard.meaning}
                  </p>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">
                    {activeCard.romaji}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex flex-col items-center justify-center py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl transition-all group"
                  >
                    <X
                      className="text-red-500 mb-1 group-hover:scale-125 transition-transform"
                      size={24}
                    />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                      Lupa (Ulangi Besok)
                    </span>
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex flex-col items-center justify-center py-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-2xl transition-all group"
                  >
                    <Check
                      className="text-green-500 mb-1 group-hover:scale-125 transition-transform"
                      size={24}
                    />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                      Ingat (Naik Level)
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
