"use client";

import React, { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";

import Link from "next/link";
import { Zap, RotateCw, ChevronLeft, BrainCircuit } from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export default function QuickQuizPage() {
  const { loading } = useUIStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };

  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (loading) return;

    const fetchRandomCards = async () => {
      try {
        setIsFetching(true);
        
        // Ambil semua ID kartu di SRS
        const allItemIds = Object.keys(progress.srs);

        if (allItemIds.length === 0) {
          setCards([]);
          return;
        }

        // Acak dan ambil maksimal 10 ID
        const shuffledIds = [...allItemIds].sort(() => Math.random() - 0.5).slice(0, 10);

        // Fetch data dari Sanity
        const query = `*[_id in $ids] {
          _id,
          "word": coalesce(jisho, word),
          meaning,
          romaji,
          furigana,
          category,
          kanjiDetails
        }`;

        const data = await client.fetch<MasterCardData[]>(query, { ids: shuffledIds });
        setCards(data);
      } catch (error) {
        console.error("Gagal menarik data Quick Quiz:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchRandomCards();
  }, [loading, progress.srs]);

  if (loading || isFetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Menyiapkan Tantangan Cepat...
        </p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <Card className="bg-card p-8 md:p-12 rounded-2xl border border-border shadow-2xl text-center max-w-md w-full relative overflow-hidden">
          <BrainCircuit size={64} className="mx-auto text-primary mb-6" />
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">
            Koleksi Masih <span className="text-primary">Kosong</span>
          </h1>
          <p className="text-muted-foreground mb-8 text-sm font-medium">
            Anda belum memiliki kosakata di daftar hafalan. Pelajari materi baru dulu yuk!
          </p>
          <Button asChild className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest rounded-xl">
            <Link href="/courses">Lihat Materi</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
        <header className="flex justify-between items-center mb-10">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest bg-muted/50 h-auto px-4 py-2.5 rounded-xl border border-border">
            <Link href="/dashboard">
              <ChevronLeft size={14} className="mr-2" /> Batal
            </Link>
          </Button>
          <Badge variant="outline" className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto">
            <Zap size={16} />
            <span>Quick Quiz (1 Menit)</span>
          </Badge>
        </header>

        <FlashcardMaster
          key={cards[0]?._id}
          cards={cards}
          type={cards[0]?.category === "kanji" ? "kanji" : "vocab"}
          mode="ujian"
          isFixedMode={true}
        />
      </div>
    </div>
  );
}
