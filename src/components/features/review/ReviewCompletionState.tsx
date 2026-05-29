"use client";

/**
 * @file ReviewCompletionState.tsx
 * @description Komponen visual layar selesai ulasan (Review Completion State).
 * Menampilkan ilustrasi lencana/piala, ucapan selamat bertema Bahasa Indonesia premium, serta tombol navigasi kembali ke beranda.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { Sparkles, Trophy } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

// ======================
// ANTARMUKA & TIPE
// ======================
interface ReviewCompletionStateProps {
  mode: "srs" | "quick";
  onBack: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
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
