"use client";

/**
 * @file VocabHeader.tsx
 * @description Komponen tajuk untuk halaman Pustaka Kosakata (Vocabulary Library).
 * Menampilkan judul halaman, statistik jumlah kata yang ditemukan, serta tombol latihan interaktif.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Book } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Props for the VocabHeader component.
 */
interface VocabHeaderProps {
  /** Total number of vocabulary items currently loaded or filtered. */
  totalItems: number;
  /** Callback function triggered when the practice button is clicked. */
  onPracticeClick: () => void;
  /** Flag to disable the practice button when no items are available or during loading. */
  isPracticeDisabled: boolean;
}

// ==========================================
// KOMPONEN UTAMA: VocabHeader
// ==========================================
/**
 * Header component for the Vocabulary Library.
 * Renders page title, total vocabulary count, and a practice button.
 * 
 * @param props - Component properties.
 * @returns React element representing the header section.
 */
export function VocabHeader({ totalItems, onPracticeClick, isPracticeDisabled }: VocabHeaderProps) {
  return (
    <header className="mb-10 md:mb-16 font-sans">
      {/* Responsive layout: stacks vertically on mobile, aligns horizontally on larger screens */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 border-b border-border pb-6 md:pb-12">
        {/* Sisi Kiri: Judul Halaman */}
        <div className="flex items-center gap-5 md:gap-6">
          {/* Icon container with custom neo-inset styling */}
          <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-lg bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
            <Book size={28} className="text-primary md:w-8 md:h-8" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-none mb-2">
              Pusat <span className="text-primary">Kosakata</span>
            </h1>
            <span className="text-xs md:text-xs text-muted-foreground font-medium tracking-tight uppercase tracking-widest">
              Perkaya perbendaharaan kata bahasa Jepangmu.
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Statistik Jumlah & Aksi Latihan Pintas */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
          {/* Counter showing total vocabulary items */}
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Ditemukan</span>
            <span className="text-xs md:text-xs font-black text-foreground">{totalItems} Kata</span>
          </div>
          {/* Action button to start practice session for current page items */}
          <Button
            onClick={onPracticeClick}
            disabled={isPracticeDisabled}
            className="h-auto py-4 px-6 md:py-5 md:px-8 rounded-xl md:rounded-lg bg-primary hover:bg-foreground text-primary-foreground font-black uppercase tracking-widest transition-all shadow-lg border-none text-xs md:text-sm disabled:opacity-50"
          >
            Latih Halaman Ini
          </Button>
        </div>
      </div>
    </header>
  );
}