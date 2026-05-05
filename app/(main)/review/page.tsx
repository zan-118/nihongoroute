/**
 * @file app/(main)/review/page.tsx
 * @description Pusat Latihan & Hafalan (Review Hub).
 * Menggabungkan SRS Review harian dan Quick Practice dalam satu antarmuka.
 * @module ReviewPage
 */

"use client";

import React, { useState, useMemo } from "react";
import { client } from "@/sanity/lib/client";

import { 
  BrainCircuit, 
  RotateCw, 
  Trophy, 
  ChevronLeft, 
  Zap, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { offlineCache } from "@/lib/offlineCache";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

type SessionMode = "srs" | "quick" | null;

export default function ReviewPage() {
  const { loading } = useUIStore();
  const { srs } = useSRSStore();

  const [mode, setMode] = useState<SessionMode>(null);
  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Hitung jumlah kartu yang jatuh tempo (due)
  const dueItemIds = useMemo(() => {
    const now = Date.now();
    return Object.entries(srs || {})
      .filter(([, state]) => state.nextReview <= now)
      .map(([id]) => id);
  }, [srs]);

  const allItemIds = useMemo(() => Object.keys(srs || {}), [srs]);

  const startSession = async (selectedMode: SessionMode) => {
    if (!selectedMode) return;
    
    try {
      setIsFetching(true);
      setMode(selectedMode);
      setIsFinished(false);

      let targetIds: string[] = [];
      
      if (selectedMode === "srs") {
        targetIds = dueItemIds;
      } else {
        // Quick mode: ambil 10 kartu acak dari koleksi
        targetIds = [...allItemIds].sort(() => Math.random() - 0.5).slice(0, 10);
      }

      if (targetIds.length === 0) {
        setCards([]);
        setIsFetching(false);
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
        data = await client.fetch<MasterCardData[]>(query, { ids: targetIds });
        offlineCache.saveCards(data);
      } catch (cmsError) {
        console.warn("CMS Offline, menggunakan cache lokal...");
        data = offlineCache.getCards(targetIds);
        if (data.length > 0) {
          toast.info("Mode Offline Aktif");
        } else {
          throw cmsError;
        }
      }
      
      setCards(data.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Gagal memulai sesi:", error);
      toast.error("Gagal memuat kartu");
      setMode(null);
    } finally {
      setIsFetching(false);
    }
  };

  // ======================
  // RENDER LOGIC
  // ======================

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Sinkronisasi data...
        </p>
      </div>
    );
  }

  // Tampilan Pemilihan Mode
  if (!mode) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-12 flex flex-col">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight italic">
            Pusat <span className="text-primary">Hafalan</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl font-medium leading-relaxed">
            Pilih metode latihanmu hari ini. Fokus pada kartu yang sudah waktunya diulang, 
            atau lakukan tantangan cepat untuk menyegarkan ingatan.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1: SRS Review */}
          <Card 
            onClick={() => dueItemIds.length > 0 && startSession("srs")}
            className={`group relative p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden cursor-pointer ${
              dueItemIds.length > 0 
              ? "border-primary/20 bg-card/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5" 
              : "border-border bg-muted/20 opacity-80"
            }`}
          >
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 ${dueItemIds.length > 0 ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"}`}>
                  <BrainCircuit className={dueItemIds.length > 0 ? "text-primary" : "text-muted-foreground"} size={28} />
                </div>
                <Badge variant="outline" className={dueItemIds.length > 0 ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted text-muted-foreground"}>
                  {dueItemIds.length} Kartu Menunggu
                </Badge>
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Hafalan Harian</h2>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Ulangi kosakata yang sudah masuk masa tenggang (SRS) untuk memindahkan ingatan ke memori jangka panjang.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-primary font-black uppercase tracking-widest text-[10px]">
                {dueItemIds.length > 0 ? "Mulai Review" : "Semua Sudah Dihafal"} <ArrowRight size={14} />
              </div>
            </div>
          </Card>

          {/* Mode 2: Quick Practice */}
          <Card 
            onClick={() => allItemIds.length > 0 && startSession("quick")}
            className={`group relative p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden cursor-pointer ${
              allItemIds.length > 0 
              ? "border-amber-500/20 bg-card/50 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5" 
              : "border-border bg-muted/20 opacity-80"
            }`}
          >
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 ${allItemIds.length > 0 ? "bg-amber-500/10 border border-amber-500/20" : "bg-muted border border-border"}`}>
                  <Zap className={allItemIds.length > 0 ? "text-amber-500" : "text-muted-foreground"} size={28} />
                </div>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Random Challenge
                </Badge>
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Latihan Cepat</h2>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Sesi singkat 10 kartu acak dari seluruh koleksimu. Cocok untuk mengisi waktu luang kapan saja.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-amber-500 font-black uppercase tracking-widest text-[10px]">
                {allItemIds.length > 0 ? "Gas Sekarang" : "Koleksi Masih Kosong"} <ArrowRight size={14} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Tampilan Loading Kartu
  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Menyiapkan sesi {mode === "srs" ? "Hafalan" : "Kilat"}...
        </p>
      </div>
    );
  }

  // Tampilan Selesai atau Kosong
  if (cards.length === 0 || isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <EmptyState 
          icon={mode === "srs" ? Sparkles : Trophy}
          title={mode === "srs" ? "Ingatan Terjaga!" : "Latihan Selesai"}
          description={mode === "srs" 
            ? "Kamu sudah menyelesaikan semua review yang jatuh tempo. Ingatanmu masih sangat tajam!" 
            : "Bagus! Kamu baru saja menyelesaikan sesi latihan cepat. Mau coba sesi lainnya?"}
          actionText="Kembali ke Menu"
          onClick={() => setMode(null)}
        />
      </div>
    );
  }

  // Sesi Flashcard Aktif
  return (
    <div className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
        <header className="flex justify-between items-center mb-10">
          <Button
            onClick={() => setMode(null)}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest bg-muted/50 h-auto px-4 py-2.5 rounded-xl border border-border"
          >
            <ChevronLeft size={14} className="mr-2" /> Batal
          </Button>
          <Badge
            variant="outline"
            className={`${mode === 'srs' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'} px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto`}
          >
            {mode === 'srs' ? <BrainCircuit size={16} /> : <Zap size={16} />}
            <span>{mode === 'srs' ? 'SRS Review' : 'Quick Practice'}</span>
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
