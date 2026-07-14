/**
 * @file useAddToSRS.ts
 * @description Hook kustom (Custom Hook) untuk mengelola penyimpanan kosakata baru ke sistem SRS (Spaced Repetition System).
 * Mendeteksi secara asinkron apakah kosakata tertentu sudah terdaftar di dalam store `useSRSStore`.
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

// ======================
// HOOK UTAMA
// ======================
/**
 * Hook to manage adding vocabulary to Spaced Repetition System (SRS).
 * Tracks loading state and whether word is already added.
 * 
 * @param wordId - Unique identifier of vocabulary word.
 * @returns Object containing loading state, added status, and add handler.
 */
export function useAddToSRS(wordId: string) {
  const addToSRS = useSRSStore((state) => state.addToSRS);
  const name = useUserStore((state) => state.name);
  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const streak = useUserStore((state) => state.streak);
  const todayReviewCount = useUserStore((state) => state.todayReviewCount);
  const lastStudyDate = useUserStore((state) => state.lastStudyDate);
  const studyDays = useUserStore((state) => state.studyDays);
  const inventory = useUserStore((state) => state.inventory);
  const srs = useSRSStore((state) => state.srs);
  const notifications = useUIStore((state) => state.notifications);
  const settings = useUIStore((state) => state.settings);
  const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const [isAdded, setIsAdded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Defer state updates to next animation frame to prevent blocking main thread
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true);
      // Check if word already exists in SRS store
      if (progress.srs && progress.srs[wordId]) {
        setIsAdded(true);
      }
    });
    // Clean up pending animation frame on unmount
    return () => cancelAnimationFrame(frame);
  }, [progress.srs, wordId]);

  const handleAdd = useCallback(() => {
    // Trigger store action to add word to SRS
    addToSRS(wordId);
    setIsAdded(true);
  }, [addToSRS, wordId]);

  return { isLoaded, isAdded, handleAdd };
}