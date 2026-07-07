/**
 * @file app/(main)/review/ReviewClient.tsx
 * @description Komponen utama Review Hub.
 * @module ReviewClient
 */

"use client";

import React from "react";
import { 
  BrainCircuit, 
  RotateCw, 
  ChevronLeft, 
  Zap, 
} from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/useUIStore";
import { useReviewSession } from "@/components/features/review/hooks/useReviewSession";

// Komponen Domain
import { ReviewModeCard } from "@/components/features/review/ReviewModeCard";
import { ReviewCompletionState } from "@/components/features/review/ReviewCompletionState";

export function ReviewClient() {
  const loading = useUIStore((state) => state.loading);
  const {
    mode,
    setMode,
    cards,
    isFetching,
    isFinished,
    setIsFinished,
    dueCount,
    allCount,
    startSession
  } = useReviewSession(loading);

  // ======================
  // LOGIKA RENDER
  // ======================

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Sinkronisasi data…
        </p>
      </div>
    );
  }

  // Tampilan Pemilihan Mode
  if (!mode) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-12 flex flex-col">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl text-foreground uppercase tracking-tight italic">
            Pusat <span className="text-primary">Latihan</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl font-medium leading-relaxed">
            Pilih metode latihanmu hari ini. Fokus ke kartu yang udah waktunya diulang (SRS), 
            atau lakukan latihan cepat untuk memperkuat daya ingat.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReviewModeCard
            onClick={() => startSession("srs")}
            isEnabled={dueCount > 0}
            icon={BrainCircuit}
            count={dueCount}
            badgeLabel="Item Menunggu"
            title="Tinjauan Berkala"
            description="Ulangi kosakata yang sudah masuk masa tenggang (SRS) untuk memindahkan ingatan ke memori jangka panjang."
            actionLabel="Mulai Tinjauan"
            disabledLabel="Seluruh Materi Terkuasai"
            accentColor="primary"
          />

          <ReviewModeCard
            onClick={() => startSession("quick")}
            isEnabled={allCount > 0}
            icon={Zap}
            badgeLabel="Tantangan Acak"
            title="Latihan Cepat"
            description="Sesi singkat 10 kartu acak dari seluruh koleksimu. Cocok untuk mengisi waktu luang kapan saja."
            actionLabel="Mulai Latihan"
            disabledLabel="Materi Belum Tersedia"
            accentColor="amber"
          />
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
          Menyiapkan sesi {mode === "srs" ? "Review" : "Latihan"}...
        </p>
      </div>
    );
  }

  // Tampilan Selesai atau Kosong
  if (cards.length === 0 || isFinished) {
    return (
      <ReviewCompletionState 
        mode={mode as "srs" | "quick"} 
        onBack={() => setMode(null)} 
      />
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
            <ChevronLeft size={14} className="mr-2" /> Kembali
          </Button>
          <Badge
            variant="outline"
            className={`${mode === 'srs' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-warning/10 border-warning/30 text-warning'} px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto`}
          >
            {mode === 'srs' ? <BrainCircuit size={16} /> : <Zap size={16} />}
            <span>{mode === 'srs' ? 'Review SRS' : 'Latihan Cepat'}</span>
          </Badge>
        </header>

        <FlashcardMaster
          key={cards[0]?.id}
          cards={cards}
          type={cards[0]?.docType === "kanji" ? "kanji" : "vocab"}
          mode="ujian"
          isFixedMode={true}
          onFinish={() => setIsFinished(true)}
        />
      </div>
    </div>
  );
}
