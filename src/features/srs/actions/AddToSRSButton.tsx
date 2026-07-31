"use client";

/**
 * @file AddToSRSButton.tsx
 * @description Modul terpadu tombol aksi tambah SRS (Unified SRS Action Seam).
 * Memiliki selector atomik useSRSStore tanpa re-render berlebih, serta mendukung varian "star" dan "action".
 */

// ======================
// IMPOR
// ======================
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Check, Star } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useSRSStore } from "@/store/useSRSStore";
import { cn } from "@/lib/utils";

// ======================
// ANTARMUKA & TIPE
// ======================
export interface AddToSRSButtonProps {
  /** Identifier unik kosakata/kanji. */
  wordId: string;
  /** Varian tampilan: "star" (ikon bintang bergradasi) atau "action" (tombol aksi dengan tooltip). Default: "star". */
  variant?: "star" | "action";
  /** Opsional CSS class nama. */
  className?: string;
}

// ======================
// HOOK ATOMIK INTERNAL
// ======================
/**
 * Hook atomik internal untuk mendeteksi & menambahkan kata ke SRS.
 * Hanya membaca srs[wordId] untuk mencegah re-render akibat perubahan state user/xp tak relevan.
 */
export function useAddToSRSInternal(wordId: string) {
  const addToSRS = useSRSStore((state) => state.addToSRS);
  const isItemInSRS = useSRSStore((state) => Boolean(state.srs && state.srs[wordId]));

  const [isAdded, setIsAdded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true);
      if (isItemInSRS) {
        setIsAdded(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isItemInSRS]);

  const handleAdd = useCallback(() => {
    addToSRS(wordId);
    setIsAdded(true);
  }, [addToSRS, wordId]);

  return { isLoaded, isAdded, handleAdd };
}

// ======================
// KOMPONEN UTAMA
// ======================
/**
 * Tombol terpadu untuk menambah kata/kanji ke Spaced Repetition System.
 */
export function AddToSRSButton({
  wordId,
  variant = "star",
  className,
}: AddToSRSButtonProps) {
  const { isLoaded, isAdded, handleAdd } = useAddToSRSInternal(wordId);

  if (!isLoaded) {
    if (variant === "action") {
      return <div className={cn("size-10 animate-pulse bg-background/5 rounded-xl", className)} />;
    }
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn("h-10 w-10 rounded-xl bg-card/20 border-border opacity-50", className)}
        aria-label="Memuat status SRS..."
      >
        <span className="size-4 animate-pulse bg-muted rounded-full" />
      </Button>
    );
  }

  if (variant === "action") {
    if (isAdded) {
      return (
        <button
          type="button"
          disabled
          aria-label="Tersimpan di Hafalan"
          className={cn(
            "p-3 bg-success/10 border border-success/30 text-success rounded-xl transition-all cursor-default flex items-center justify-center relative group shadow-inner",
            className
          )}
        >
          <Check size={18} />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-popover text-xs font-bold px-3 py-1 rounded-lg border border-success/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            Tersimpan di Hafalan
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label="Mulai Hafalkan Kata Ini"
        className={cn(
          "p-3 bg-card border border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all flex items-center justify-center active:scale-90 relative group",
          className
        )}
      >
        <Plus size={18} />
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-popover text-xs font-bold px-3 py-1 rounded-lg border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-primary z-10">
          Mulai Hafalkan Kata Ini
        </span>
      </button>
    );
  }

  // Variant "star" (Default)
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={isAdded ? undefined : handleAdd}
      disabled={isAdded}
      className={cn(
        "h-10 w-10 rounded-xl transition-all duration-300",
        isAdded
          ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgb(var(--primary-rgb)/0.35)] cursor-default"
          : "bg-card/40 border-border hover:border-primary/50 text-muted-foreground hover:text-primary hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(var(--foreground-rgb),0.05)]",
        className
      )}
      aria-label={isAdded ? "Sudah ditambahkan ke SRS" : "Tambahkan ke SRS"}
      title={isAdded ? "Sudah ditambahkan ke SRS" : "Tambahkan ke SRS"}
    >
      {isAdded ? (
        <div className="relative flex items-center justify-center">
          <Star className="size-5 fill-primary text-primary filter drop-shadow-[0_0_2px_rgb(var(--primary-rgb)/0.5)] animate-[scaleIn_0.3s_ease-out]" />
          <Check className="size-2.5 absolute text-background font-black stroke-3" />
        </div>
      ) : (
        <Star className="size-5 transition-transform duration-300 group-hover:scale-110" />
      )}
    </Button>
  );
}

// Default export untuk backward compatibility
export default AddToSRSButton;