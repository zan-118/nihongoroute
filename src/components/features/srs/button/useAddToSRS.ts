import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

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
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true);
      if (progress.srs && progress.srs[wordId]) {
        setIsAdded(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [progress.srs, wordId]);

  const handleAdd = useCallback(() => {
    addToSRS(wordId);
    setIsAdded(true);
  }, [addToSRS, wordId]);

  return { isLoaded, isAdded, handleAdd };
}
