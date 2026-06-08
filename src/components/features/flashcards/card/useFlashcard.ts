/**
 * @file useFlashcard.ts
 * @description Hook kustom untuk mengelola visualisasi tema (warna primer/sekunder sistem) dan fungsi flipping 3D di kartu flashcard.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useCallback } from "react";
import { FlashcardProps } from "./types";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook khusus pengendali interaksi kartu flashcard.
 * 
 * @returns State modal coretan, context tema kartu, dan handler flip/draw.
 */
export function useFlashcard({ type, onFlip }: Pick<FlashcardProps, 'type' | 'onFlip'>) {
  // ==========================================
  // STATUS & STATE & HOOKS
  // ==========================================
  const [showWritingModal, setShowWritingModal] = useState(false);

  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-secondary" : "text-primary";
  const themeBorder = isKanji ? "border-secondary/30" : "border-primary/30";
  const themeShadow = isKanji 
    ? "shadow-lg dark:shadow-[0_0_30px_rgb(var(--secondary-rgb)/0.1)]" 
    : "shadow-lg dark:shadow-[0_0_30px_rgb(var(--primary-rgb)/0.1)]";
  const glowClass = isKanji 
    ? "drop-shadow-sm dark:drop-shadow-[0_0_15px_rgb(var(--secondary-rgb)/0.5)]" 
    : "drop-shadow-sm dark:drop-shadow-[0_0_15px_rgb(var(--primary-rgb)/0.5)]";

  const themeContext = {
    isKanji,
    themeColor,
    themeBorder,
    themeShadow,
    glowClass,
  };

  // ==========================================
  // METODE PENGENDALI UTAMA (HANDLERS)
  // ==========================================
  const handleClick = useCallback(() => {
    onFlip();
  }, [onFlip]);

  const handleDrawClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWritingModal(true);
  }, []);

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
  return {
    showWritingModal,
    setShowWritingModal,
    themeContext,
    handleClick,
    handleDrawClick,
  };
}
