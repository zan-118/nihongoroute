import { useState, useCallback } from "react";
import { FlashcardProps } from "./types";

export function useFlashcard({ type, onFlip }: Pick<FlashcardProps, 'type' | 'onFlip'>) {
  const [showWritingModal, setShowWritingModal] = useState(false);

  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-purple-400" : "text-cyber-neon";
  const themeBorder = isKanji ? "border-purple-500/30" : "border-cyber-neon/30";
  const themeShadow = isKanji 
    ? "shadow-[0_0_30px_rgba(168,85,247,0.1)]" 
    : "shadow-[0_0_30px_rgba(0,238,255,0.1)]";
  const glowClass = isKanji 
    ? "drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
    : "drop-shadow-[0_0_15px_rgba(0,238,255,0.5)]";

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
