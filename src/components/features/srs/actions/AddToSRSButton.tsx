"use client";

/**
 * @file AddToSRSButton.tsx
 * @description Komponen visual tombol aksi cepat tambah SRS (Add to SRS Action Button).
 * Menampilkan status apakah kosakata tertentu telah tersimpan di dalam hafalan SRS pengguna.
 */

// ======================
// IMPOR
// ======================
import { Plus, Check } from "lucide-react";
import { useAddToSRS } from "../button/useAddToSRS";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Button component to add word to SRS.
 * Displays status and triggers add action.
 * 
 * @param props - Component properties.
 * @param props.wordId - Unique identifier of word.
 */
export default function AddToSRSButton({ wordId }: { wordId: string }) {
  const { isLoaded, isAdded, handleAdd } = useAddToSRS(wordId);

  // Render skeleton loader during initial status check.
  if (!isLoaded)
    return <div className="size-10 animate-pulse bg-background/5 rounded-xl" />;

  // Render disabled success state if word already added.
  if (isAdded) {
    return (
      <button type="button"
        disabled
        aria-label="Tersimpan di Hafalan"
        className="p-3 bg-success/10 border border-success/30 text-success rounded-xl transition-all cursor-default flex items-center justify-center relative group shadow-inner"
      >
        <Check size={18} />
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-popover text-xs font-bold px-3 py-1 rounded-lg border border-success/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          Tersimpan di Hafalan
        </span>
      </button>
    );
  }

  // Render active button to trigger SRS addition.
  return (
    <button type="button"
      onClick={handleAdd}
      aria-label="Mulai Hafalkan Kata Ini"
      className="p-3 bg-card border border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all flex items-center justify-center active:scale-90 relative group"
    >
      <Plus size={18} />
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-popover text-xs font-bold px-3 py-1 rounded-lg border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-primary z-10">
        Mulai Hafalkan Kata Ini
      </span>
    </button>
  );
}