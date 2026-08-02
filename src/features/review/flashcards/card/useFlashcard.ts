/**
 * @file useFlashcard.ts
 * @description Custom hook managing theme styling (primary/secondary color themes) and 3D flipping state for flashcards.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { useState, useCallback } from "react";
import { FlashcardProps } from "./types";

// ==========================================
// Main Custom Hook
// ==========================================
/**
 * Manage flashcard state and theme styles.
 * 
 * @param props - Hook configuration.
 * @param props.type - Card type (kanji or vocab).
 * @param props.onFlip - Callback triggered on card flip.
 * @returns State and handlers for card rendering and interaction.
 */
export function useFlashcard({ type, onFlip }: Pick<FlashcardProps, 'type' | 'onFlip'>) {
 // ==========================================
 // STATUS & STATE & HOOKS
 // ==========================================
 /** State to control visibility of writing canvas modal */
 const [showWritingModal, setShowWritingModal] = useState(false);

 /** Check if card type is kanji */
 const isKanji = type === "kanji";
 
 // Set theme classes based on card type.
 const themeColor = isKanji ? "text-secondary" : "text-primary";
 const themeBorder = isKanji ? "border-secondary/30" : "border-primary/30";
 const themeShadow = isKanji
 ? "shadow-md dark:shadow-[0_0_14px_hsl(var(--secondary)/0.08)]"
 : "shadow-md dark:shadow-[0_0_14px_hsl(var(--primary)/0.08)]";
 const glowClass = isKanji
 ? "drop-shadow-sm dark:drop-shadow-[0_0_8px_hsl(var(--secondary)/0.35)]"
 : "drop-shadow-sm dark:drop-shadow-[0_0_8px_hsl(var(--primary)/0.35)]";

 /** Grouped theme properties for child components */
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
 /** Trigger flip callback on card click */
 const handleClick = useCallback(() => {
 onFlip();
 }, [onFlip]);

 /** Open writing modal and stop click propagation to prevent card flip */
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