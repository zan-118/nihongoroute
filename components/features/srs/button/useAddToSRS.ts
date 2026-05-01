import { useState, useEffect, useCallback } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

export function useAddToSRS(wordId: string) {
  const { progress, addToSRS } = useProgressStore(
    useShallow((state) => ({ progress: state.progress, addToSRS: state.addToSRS }))
  );
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
