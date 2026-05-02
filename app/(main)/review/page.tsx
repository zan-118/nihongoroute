/**
 * @file page.tsx
 * @description Halaman Sesi Ulasan Harian (Daily Review).
 * Memindai kartu jatuh tempo (due cards) dan menarik datanya dari Sanity CMS.
 * @module DailyReviewPage
 */

"use client";

// ======================
// IMPORTS
// ======================
import React, { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { motion } from "framer-motion";
import Link from "next/link";
import { BrainCircuit, RotateCw, Trophy, ChevronLeft } from "lucide-react";
import FlashcardMaster from "@/components/FlashcardMaster";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen DailyReviewPage: Mengelola pengambilan data kartu SRS yang jatuh tempo 
 * dan menampilkan antarmuka flashcard.
 * 
 * @returns {JSX.Element} Elemen halaman review harian.
 */
export default function DailyReviewPage() {
  const { progress, loading } = useProgressStore(
    useShallow((state) => ({ progress: state.progress, loading: state.loading }))
  );

  const [dueCards, setDueCards] = useState<MasterCardData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFinished] = useState(false);

  useEffect(() => {
    // ======================
    // DATABASE OPERATIONS
    // ======================
    
    if (loading) return;

    const fetchDueCards = async () => {
      try {
        setIsFetching(true);
        const now = Date.now();
        
        // Filter ID kartu yang sudah waktunya direview
        const dueItemIds = Object.entries(progress.srs)
          .filter(([, state]) => state.nextReview <= now)
          .map(([id]) => id);

        if (dueItemIds.length === 0) {
          setDueCards([]);
          return;
        }

        // Fetch data kartu dari CMS
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
        
        // Acak urutan kartu
        const shuffled = data.sort(() => Math.random() - 0.5);
        
        setDueCards(shuffled);
      } catch (error) {
        console.error("Gagal menarik data review dari Sanity:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchDueCards();
  }, [loading, progress.srs]);

  // ======================
  // RENDER
  // ======================

  // LAYAR 1: Status Sinkronisasi
  if (loading || isFetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-cyber-neon animate-spin mb-4" size={32} />
        <p className="text-slate-500 font-mono uppercase tracking-widest text-[10px] animate-pulse font-bold">
          Jemput ingatan dulu...
        </p>
      </div>
    );
  }

  // LAYAR 2: Antrean Kosong (Istirahat)
  if (dueCards.length === 0 && !isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <Card className="bg-white/[0.02] p-8 md:p-12 rounded-2xl border border-white/[0.08] shadow-2xl text-center max-w-md w-full relative overflow-hidden">
          <BrainCircuit
            size={64}
            className="mx-auto text-cyber-neon mb-6 drop-shadow-[0_0_20px_rgba(0,238,255,0.4)]"
          />
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4 relative z-10">
            Ingatanmu <span className="text-cyber-neon">Luar Biasa!</span>
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed text-sm relative z-10 font-medium">
            Belum ada hafalan yang perlu diulang untuk saat ini. Semuanya masih segar di ingatan! 
            Mau coba pelajari materi baru?
          </p>
          <Button
            asChild
            variant="ghost"
            className="w-full bg-cyber-neon/10 hover:bg-cyber-neon hover:text-black border border-cyber-neon/30 text-cyber-neon font-bold uppercase tracking-widest h-auto py-4 rounded-xl transition-all relative z-10 text-[10px]"
          >
            <Link href="/courses">
              Lihat Materi
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // LAYAR 3: Status Selesai Belajar
  if (isFinished || dueCards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/[0.02] p-8 md:p-12 rounded-2xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] text-center w-full relative overflow-hidden">
            <Trophy
              size={64}
              className="mx-auto text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            />
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4 relative z-10">
              Review <span className="text-emerald-400">Selesai</span>
            </h1>
            <p className="text-slate-500 mb-8 font-medium text-sm relative z-10">
              Kamu berhasil menyelesaikan semua review hari ini. Mantap!
            </p>
            <Button
              asChild
              variant="ghost"
              className="w-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-widest h-auto py-4 rounded-xl transition-all relative z-10 text-[10px]"
            >
              <Link href="/dashboard">
                Kembali ke Area Belajar
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // LAYAR UTAMA: UI Flashcard
  return (
    <div className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
        <header className="flex justify-between items-center mb-10">
          <Button
            asChild
            variant="ghost"
            className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest bg-white/[0.03] h-auto px-4 py-2.5 rounded-xl border border-white/[0.08]"
          >
            <Link href="/dashboard">
              <ChevronLeft size={14} className="mr-2" /> Keluar Sesi
            </Link>
          </Button>
          <Badge
            variant="outline"
            className="bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 h-auto"
          >
            <BrainCircuit size={16} />
            <span>Hafalan Aktif</span>
          </Badge>
        </header>

        <FlashcardMaster
          key={dueCards[0]?._id}
          cards={dueCards}
          type={dueCards[0]?.category === "kanji" ? "kanji" : "vocab"}
          mode="ujian"
          isFixedMode={true}
        />
      </div>
    </div>
  );
}
