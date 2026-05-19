"use client";

import React from "react";
import { Sparkles, Trophy } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface ReviewCompletionStateProps {
  mode: "srs" | "quick";
  onBack: () => void;
}

/**
 * Tampilan saat sesi review selesai atau tidak ada kartu yang perlu direview.
 */
export function ReviewCompletionState({ mode, onBack }: ReviewCompletionStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
      <EmptyState 
        icon={mode === "srs" ? Sparkles : Trophy}
        title={mode === "srs" ? "Review Selesai!" : "Latihan Selesai!"}
        description={mode === "srs" 
          ? "Keren! Semua materi hari ini sudah kamu review. Terus semangat belajarnya ya!" 
          : "Sesi latihan cepat selesai! Terus asah kemampuan bahasamu biar makin jago."}
        actionText="Kembali ke Beranda"
        onClick={onBack}
      />
    </div>
  );
}
