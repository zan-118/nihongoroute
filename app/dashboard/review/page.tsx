"use client";

import { useProgress } from "@/context/UserProgressContext";
import { client } from "@/sanity/lib/client";
import { vocabByIdsQuery } from "@/lib/queries";
import { useEffect, useState } from "react";
import SRSReviewEngine from "@/components/SRSReviewEngine";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ReviewPage() {
  const { progress, loading } = useProgress();
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function getDueCards() {
      if (loading) return;

      const now = Date.now();
      // Filter ID yang sudah masuk waktu review
      const dueIds = Object.keys(progress.srs).filter(
        (id) => progress.srs[id].nextReview <= now,
      );

      if (dueIds.length > 0) {
        const data = await client.fetch(vocabByIdsQuery, { ids: dueIds });
        setReviewQueue(data);
      }
      setIsFetching(false);
    }

    getDueCards();
  }, [loading, progress.srs]);

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-[#15171a] flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 bg-[#0ef]/20 border border-[#0ef] rounded-xl rotate-45 shadow-[0_0_30px_rgba(0,255,239,0.5)]"
        />
        <p className="mt-8 text-[#0ef] font-mono font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          EXTRACTING MEMORY...
        </p>
      </div>
    );
  }

  // Jika tidak ada kartu
  if (reviewQueue.length === 0) {
    return (
      <div className="min-h-screen bg-[#15171a] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center bg-[#1e2024] p-10 rounded-[3rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <span className="text-5xl">☕</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest italic drop-shadow-md">
            System Clear
          </h1>
          <p className="text-[#c4cfde]/60 mt-3 max-w-xs text-sm">
            Memori sementaramu telah disinkronkan. Tidak ada kosakata yang perlu
            di-review saat ini.
          </p>
          <Link
            href="/jlpt"
            className="mt-8 px-8 py-4 bg-[#0ef] text-[#15171a] font-black rounded-2xl hover:scale-105 hover:bg-white transition-all uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(0,255,239,0.3)]"
          >
            Akses Materi Baru
          </Link>
          <Link
            href="/dashboard"
            className="mt-4 text-[10px] text-white/30 uppercase tracking-widest font-bold hover:text-white transition-colors"
          >
            Kembali ke Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  // Render Engine (jika ada kartu)
  return (
    <div className="min-h-screen px-4 py-12 md:py-20 bg-[#15171a] relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        <header className="mb-8 md:mb-12 flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <p className="text-[#0ef] text-[10px] font-black uppercase tracking-[0.3em] mb-1 drop-shadow-[0_0_5px_rgba(0,255,239,0.5)]">
              Protocol: Active
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic drop-shadow-lg">
              Daily <span className="text-white/40">Review</span>
            </h1>
          </div>
          <div className="bg-[#1e2024] px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <span className="text-[#0ef] font-mono font-bold text-sm">
              {reviewQueue.length}{" "}
              <span className="text-white/30 text-[10px] uppercase tracking-widest ml-1">
                Due
              </span>
            </span>
          </div>
        </header>

        <SRSReviewEngine cards={reviewQueue} />
      </div>
    </div>
  );
}
