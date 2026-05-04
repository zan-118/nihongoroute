import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export function useAddToSRS(wordId: string) {
  const { addToSRS } = useSRSStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const [isAdded, setIsAdded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (progress.srs && progress.srs[wordId]) {
      setIsAdded(true);
    }
  }, [progress.srs, wordId]);

  const handleAdd = useCallback(() => {
    addToSRS(wordId);
    setIsAdded(true);
  }, [addToSRS, wordId]);

  return { isLoaded, isAdded, handleAdd };
}
