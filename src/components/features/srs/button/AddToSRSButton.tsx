"use client";

/**
 * @file AddToSRSButton.tsx
 * @description Komponen visual tombol ikon tambah SRS (Add to SRS Star Button).
 * Menampilkan ikon bintang bergradasi emas PWA premium jika kosakata tersebut sudah tersimpan di dalam memori ulasan SRS.
 */

// ======================
// IMPOR
// ======================
import { useAddToSRS } from "./useAddToSRS";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ======================
// ANTARMUKA & TIPE
// ======================
/**
 * Props for AddToSRSButton.
 */
interface AddToSRSButtonProps {
  /** Unique identifier of word. */
  wordId: string;
  /** Optional CSS class names. */
  className?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Button to add word to SRS.
 * Shows active star if added, clickable star if not.
 */
export function AddToSRSButton({ wordId, className }: AddToSRSButtonProps) {
  const { isLoaded, isAdded, handleAdd } = useAddToSRS(wordId);

  // Show skeleton while loading SRS status
  if (!isLoaded) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn(
          "h-10 w-10 rounded-xl bg-card/20  border-border opacity-50",
          className
        )}
        aria-label="Memuat status SRS..."
      >
        <span className="size-4 animate-pulse bg-muted rounded-full" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={isAdded ? undefined : handleAdd}
      disabled={isAdded}
      className={cn(
        "h-10 w-10 rounded-xl transition-all duration-300 ",
        isAdded
          ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgb(var(--primary-rgb)/0.35)] cursor-default"
          : "bg-card/40 border-border hover:border-primary/50 text-muted-foreground hover:text-primary hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(var(--foreground-rgb),0.05)]",
        className
      )}
      aria-label={isAdded ? "Sudah ditambahkan ke SRS" : "Tambahkan ke SRS"}
      title={isAdded ? "Sudah ditambahkan ke SRS" : "Tambahkan ke SRS"}
    >
      {/* Show star with checkmark overlay if added, empty star if not */}
      {isAdded ? (
        <div className="relative flex items-center justify-center">
          <Star className="size-5 fill-primary text-primary filter drop-shadow-[0_0_2px_rgb(var(--primary-rgb)/0.5)] animate-[scaleIn_0.3s_ease-out]" />
          <Check className="size-2.5 absolute text-background font-black stroke-[3]" />
        </div>
      ) : (
        <Star className="size-5 transition-transform duration-300 group-hover:scale-110" />
      )}
    </Button>
  );
}