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
import { Sparkles, Trophy } from "@/components/ui/icons";
import EmptyState from "@/components/ui/EmptyState";

// ======================
// ANTARMUKA & TIPE
// ======================
/**
 * Props for ReviewCompletionState.
 */
interface ReviewCompletionStateProps {
  /** Review mode. Controls icon and text. */
  mode: "srs" | "quick";
  /** Callback. Runs when user clicks back button. */
  onBack: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Review completion screen.
 * Shows success message and navigation button.
 */
export function ReviewCompletionState({ mode, onBack }: ReviewCompletionStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
      {/* Render empty state with dynamic content based on mode */}
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