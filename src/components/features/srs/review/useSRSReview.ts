/**
 * @file useSRSReview.ts
 * @description Hook kustom untuk mengelola logika sesi ulasan SRS (Spaced Repetition System).
 * Mengatur urutan kartu, status balik kartu (flip), penanganan jawaban pengguna,
 * kalkulasi perolehan XP, efek audio, serta pintasan papan ketik (keyboard shortcuts).
 *
 * @package components/features/srs/review
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { updateCardState, createNewCardState } from "@/lib/srs";
import { FlashcardType } from "./types";
import { shuffleArray } from "@/lib/utils";
import { sounds } from "@/lib/audio";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook useSRSReview
 * Mengelola alur permainan dan status dari sesi ulasan kartu flash SRS.
 *
 * @param cards Daftar kartu flash yang akan diulas
 * @returns Berbagai status sesi ulasan, fungsi pembalik kartu, dan fungsi penjawab
 */
export function useSRSReview(cards: FlashcardType[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const shuffledCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return shuffleArray([...cards]);
  }, [cards]);
  
  // Status umpan balik (feedback states)
  const [isFinished, setIsFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);

  // Akses ke Zustand stores
  const updateProgress = useSRSStore((state) => state.updateProgress);
  const xp = useUserStore((state) => state.xp);
  const isSyncing = useUIStore((state) => state.isSyncing);
  const router = useRouter();

  // Memastikan rendering di sisi klien (hydration-safe)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const currentCard = shuffledCards[currentIndex];

  // ==========================================
  // FUNGSI NAVIGASI & PENANGANAN
  // ==========================================
  const goToNext = useCallback(() => {
    setDirection(1);
    setIsFlipped(false);

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, shuffledCards.length]);

  const isProcessing = useRef(false);

  /**
   * Menangani jawaban pengguna berdasarkan tingkat kemudahan (grade).
   * @param grade Angka 0 (salah) atau 2 (benar/mudah)
   */
  const handleAnswer = useCallback(
    (grade: number) => {
      if (!currentCard || isProcessing.current) return;
      isProcessing.current = true;

      const cardId = currentCard.id;
      const srs = useSRSStore.getState().srs;
      const currentState = srs[cardId] || createNewCardState();
      const newState = updateCardState(currentState, grade);

      const xpGain = grade >= 2 ? 10 : 2;
      updateProgress(xp + xpGain, {
        [cardId]: newState,
      });
      setEarnedXP((prev) => prev + xpGain);

      if (grade >= 2) {
        sounds?.playSuccess();
        setFlash("correct");
        setShowXP(true);
        setTimeout(() => setShowXP(false), 800);
      } else {
        sounds?.playError();
        setFlash("wrong");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }

      setTimeout(() => {
        setFlash(null);
        goToNext();
        isProcessing.current = false;
      }, 300);
    },
    [currentCard, xp, updateProgress, goToNext],
  );

  const toggleFlip = useCallback(() => {
    sounds?.playPop();
    setIsFlipped((prev) => !prev);
  }, []);

  // ==========================================
  // PINTASAN PAPAN KETIK (KEYBOARD SHORTCUTS)
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika pengguna sedang fokus pada input atau textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      if (!isFlipped) {
        // Tekan Spasi atau Enter untuk membalik kartu
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleFlip();
        }
      } else {
        // Tekan 1 atau Panah Kiri untuk Salah, Tekan 2 atau Panah Kanan untuk Benar
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleAnswer(0);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAnswer(2);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, toggleFlip, handleAnswer]);

  return {
    currentIndex,
    isFlipped,
    direction,
    isClient,
    shuffledCards,
    currentCard,
    handleAnswer,
    toggleFlip,
    isSyncing,
    isFinished,
    showXP,
    isShaking,
    flash,
    earnedXP,
    router,
  };
}
