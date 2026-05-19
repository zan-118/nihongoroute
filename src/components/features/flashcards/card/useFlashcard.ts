import { useState, useCallback } from "react";
import { FlashcardProps } from "./types";

export function useFlashcard({ type, onFlip }: Pick<FlashcardProps, 'type' | 'onFlip'>) {
  const [showWritingModal, setShowWritingModal] = useState(false);

  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-secondary" : "text-primary";
  const themeBorder = isKanji ? "border-secondary/30" : "border-primary/30";
  const themeShadow = isKanji 
    ? "shadow-lg dark:shadow-[0_0_30px_rgba(var(--secondary-rgb),0.1)]" 
    : "shadow-lg dark:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]";
  const glowClass = isKanji 
    ? "drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(var(--secondary-rgb),0.5)]" 
    : "drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]";

  const themeContext = {
    isKanji,
    themeColor,
    themeBorder,
    themeShadow,
    glowClass,
  };

  const handleClick = useCallback(() => {
    onFlip();
  }, [onFlip]);

  const handleDrawClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWritingModal(true);
  }, []);

  return {
    showWritingModal,
    setShowWritingModal,
    themeContext,
    handleClick,
    handleDrawClick,
  };
}
