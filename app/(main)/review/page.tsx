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

import Link from "next/link";
import { BrainCircuit, RotateCw, Trophy, ChevronLeft } from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { offlineCache } from "@/lib/offlineCache";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

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
  const { loading } = useUIStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };

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
        
        const dueItemIds = Object.entries(progress.srs)
          .filter(([, state]) => state.nextReview <= now)
          .map(([id]) => id);

        if (dueItemIds.length === 0) {
          setDueCards([]);
          return;
        }

        let data: MasterCardData[] = [];
        try {
          const query = `*[_id in $ids] {
            _id,
            "word": coalesce(jisho, word),
            meaning,
            romaji,
            furigana,
            category,
            kanjiDetails
          }`;
          data = await client.fetch<MasterCardData[]>(query, { ids: dueItemIds });
          
          // Simpan ke cache untuk penggunaan offline nanti
          offlineCache.saveCards(data);
        } catch (cmsError) {
          console.warn("CMS Offline, mencoba mengambil dari cache lokal...");
          data = offlineCache.getCards(dueItemIds);
          
          if (data.length > 0) {
            toast.info("Mode Offline Aktif", {
              description: "Menggunakan data yang tersimpan di perangkat Anda."
            });
          } else {
            throw cmsError;
          }
        }
        
        const shuffled = data.sort(() => Math.random() - 0.5);
        setDueCards(shuffled);
      } catch (error) {
        console.error("Gagal menarik data review:", error);
        toast.error("Koneksi Bermasalah", {
          description: "Gagal memuat kartu. Pastikan Anda online setidaknya sekali untuk menyimpan data."
        });
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 transition-colors duration-300">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Jemput ingatan dulu...
        </p>
      </div>
    );
  }

  // LAYAR 2: Antrean Kosong (Istirahat)
  if (dueCards.length === 0 && !isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <EmptyState 
          icon={Sparkles}
          title="Ingatanmu Luar Biasa!"
          description="Belum ada hafalan yang perlu diulang untuk saat ini. Semuanya masih segar di ingatan! Mau coba pelajari materi baru?"
          actionText="Lihat Materi"
          actionHref="/courses"
        />
      </div>
    );
  }

  // LAYAR 3: Status Selesai Belajar
  if (isFinished || dueCards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <EmptyState 
          icon={Trophy}
          title="Review Selesai"
          description="Kamu berhasil menyelesaikan semua review hari ini. Mantap! Terus pertahankan streak belajarmu."
          actionText="Kembali ke Dashboard"
          actionHref="/dashboard"
        />
      </div>
    );
  }

  // LAYAR UTAMA: UI Flashcard
  return (
    <div className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center transition-colors duration-300">
      <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
        <header className="flex justify-between items-center mb-10">
          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest bg-muted/50 dark:bg-white/[0.03] h-auto px-4 py-2.5 rounded-xl border border-border dark:border-white/[0.08]"
          >
            <Link href="/dashboard">
              <ChevronLeft size={14} className="mr-2" /> Keluar Sesi
            </Link>
          </Button>
          <Badge
            variant="outline"
            className="bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto"
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
