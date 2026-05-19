"use client";

import { useState, useMemo, useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { useSRSStore } from "@/store/useSRSStore";

export type SessionMode = "srs" | "quick" | null;

export function useReviewSession(loading: boolean) {
  const srs = useSRSStore((state) => state.srs);
  const [mode, setMode] = useState<SessionMode>(null);
  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [now] = useState(() => Date.now());

  // Hitung jumlah kartu yang jatuh tempo (due)
  const dueItemIds = useMemo(() => {
    return Object.entries(srs || {})
      .filter(([, state]) => state.nextReview <= now)
      .map(([id]) => id);
  }, [srs, now]);

  const allItemIds = useMemo(() => Object.keys(srs || {}), [srs]);

  const startSession = async (selectedMode: SessionMode) => {
    if (!selectedMode) return;
    
    try {
      setIsFetching(true);
      setMode(selectedMode);
      setIsFinished(false);

      let targetIds: string[] = [];
      
      if (selectedMode === "srs") {
        targetIds = dueItemIds;
      } else {
        // Quick mode: ambil 10 kartu acak dari koleksi
        targetIds = [...allItemIds].sort(() => Math.random() - 0.5).slice(0, 10);
      }

      if (targetIds.length === 0) {
        setCards([]);
        setIsFetching(false);
        return;
      }

      let data: MasterCardData[] = [];
      try {
        const res = await fetch(`/api/cards?ids=${targetIds.join(",")}`);
        if (!res.ok) throw new Error(`API /api/cards gagal: ${res.status}`);
        data = await res.json();
      } catch (cmsError) {
        console.error("Gagal memuat kartu dari CMS:", cmsError);
        throw cmsError;
      }
      
      setCards(data.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Gagal memulai sesi:", error);
      toast.error("Gagal memuat kartu");
      setMode(null);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-start berdasarkan query params
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as SessionMode;

  useEffect(() => {
    if (initialMode && (initialMode === "srs" || initialMode === "quick") && !mode && !loading) {
      // Defer execution to avoid synchronous setState in effect
      const trigger = async () => {
        await startSession(initialMode);
      };
      void trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode, loading]);

  return {
    mode,
    setMode,
    cards,
    isFetching,
    isFinished,
    setIsFinished,
    dueItemIds,
    allItemIds,
    startSession
  };
}
