"use client";

import React, { useState, useEffect, useRef } from "react";
import { client } from "@/sanity/lib/client";
import { useProgress } from "@/context/UserProgressContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { BrainCircuit, RotateCw, Trophy } from "lucide-react";
import FlashcardMaster, { MasterCardData } from "@/components/FlashcardMaster";

export default function DailyReviewPage() {
  const { progress, loading } = useProgress();

  const [dueCards, setDueCards] = useState<MasterCardData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (loading || hasFetched.current) return;

    const fetchDueCards = async () => {
      try {
        const now = Date.now();
        const dueItemIds = Object.entries(progress.srs)
          .filter(([_, state]) => state.nextReview <= now)
          .map(([id]) => id);

        if (dueItemIds.length === 0) {
          setIsFetching(false);
          hasFetched.current = true;
          return;
        }

        const query = `*[_id in $ids] {
          _id,
          "word": coalesce(jisho, word),
          meaning,
          romaji,
          furigana,
          category,
          kanjiDetails
        }`;

        const data = await client.fetch(query, { ids: dueItemIds });
        const shuffled = data.sort(() => Math.random() - 0.5);
        setDueCards(shuffled);
        hasFetched.current = true;
      } catch (error) {
        console.error("Gagal menarik data review dari Sanity:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchDueCards();
  }, [loading, progress.srs]);

  if (loading || isFetching) {
    return (
      // DIUBAH: div biasa, memanfaatkan space-y-4 dari flex.
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-cyan-400 animate-spin mb-4" size={40} />
        <p className="text-white/50 font-mono uppercase tracking-widest text-sm animate-pulse">
          Sinkronisasi Memori...
        </p>
      </div>
    );
  }

  if (dueCards.length === 0 && !isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <div className="bg-cyber-surface p-12 rounded-[3rem] border border-white/5 shadow-2xl text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

          <BrainCircuit
            size={80}
            className="mx-auto text-cyan-400 mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          />
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4 relative z-10">
            Semua <span className="text-cyan-400">Tuntas!</span>
          </h1>
          <p className="text-[#c4cfde]/70 mb-8 leading-relaxed text-sm relative z-10">
            Otak Anda sedang beristirahat. Tidak ada kosakata yang perlu diulang
            saat ini. Jelajahi materi baru untuk menambah hafalan!
          </p>
          <Link
            href="/courses"
            className="inline-block bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all relative z-10 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            Lihat Materi
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished || dueCards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-cyber-surface p-12 rounded-[3rem] border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] text-center max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
          <Trophy
            size={80}
            className="mx-auto text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]"
          />
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4 relative z-10">
            Review <span className="text-emerald-400">Selesai</span>
          </h1>
          <p className="text-[#c4cfde]/70 mb-8 font-mono text-sm relative z-10">
            Anda telah menyelesaikan jadwal hari ini.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all relative z-10"
          >
            Kembali ke Area Belajar
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    // DIUBAH: pt-24 dihilangkan. Menggunakan flex-1 untuk memastikan layar penuh.
    <div className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-cyber-bg to-cyber-bg pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
        <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <Link
            href="/dashboard"
            className="text-white/40 hover:text-white transition-colors text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/10"
          >
            ← Keluar Sesi
          </Link>
          <div className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <BrainCircuit size={16} />
            <span className="hidden sm:block">Hafalan Aktif Hari Ini</span>
            <span className="block sm:hidden">Hafalan</span>
          </div>
        </header>

        <FlashcardMaster
          key={dueCards[0]?._id}
          cards={dueCards}
          type={dueCards[0]?.category === "kanji" ? "kanji" : "vocab"}
        />
      </div>
    </div>
  );
}
