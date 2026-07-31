"use client";

/**
 * @file useReviewSession.ts
 * @description Hook kustom (Custom Hook) untuk mengelola inisialisasi sesi ulasan (Review Session).
 */

// ======================
// IMPOR
// ======================
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MasterCardData } from "@/features/review/flashcards/master/types";
import { useSRSStore } from "@/store/useSRSStore";
import { summarizeSrs } from "@/lib/srs-summary";

// ======================
// ANTARMUKA & TIPE
// ======================
export type SessionMode = "srs" | "quick" | null;

function getReviewIds(selectedMode: Exclude<SessionMode, null>, now: number) {
  const srs = useSRSStore.getState().srs || {};

  if (selectedMode === "quick") {
    const sample: string[] = [];
    let seenActiveItems = 0;

    for (const id in srs) {
      const state = srs[id];
      if (state.isDeleted) continue;

      seenActiveItems += 1;
      if (sample.length < 10) {
        sample.push(id);
        continue;
      }

      const replacementIndex = Math.floor(Math.random() * seenActiveItems);
      if (replacementIndex < 10) sample[replacementIndex] = id;
    }

    return sample;
  }

  const ids: string[] = [];
  for (const id in srs) {
    const state = srs[id];
    if (state.isDeleted || state.nextReview > now) continue;
    ids.push(id);
  }

  return ids;
}

// ======================
// HOOK UTAMA
// ======================
export function useReviewSession(loading: boolean) {
  const [mode, setMode] = useState<SessionMode>(null);
  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [now] = useState(() => Date.now());
  
  const reviewCountsSignature = useSRSStore((state) => {
    const { active, due } = summarizeSrs(state.srs, now);
    return `${due}:${active}`;
  });
  const [dueCount, allCount] = reviewCountsSignature.split(":").map(Number);

  const startSession = useCallback(async (selectedMode: SessionMode) => {
    if (!selectedMode) return;
    
    try {
      setIsFetching(true);
      setMode(selectedMode);
      setIsFinished(false);

      const targetIds = getReviewIds(selectedMode, now);

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
  }, [now]);

  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as SessionMode;

  useEffect(() => {
    if (initialMode && (initialMode === "srs" || initialMode === "quick") && !mode && !loading) {
      const trigger = async () => {
        await startSession(initialMode);
      };
      void trigger();
    }
  }, [initialMode, loading, mode, startSession]);

  return {
    mode,
    setMode,
    cards,
    isFetching,
    isFinished,
    setIsFinished,
    dueCount,
    allCount,
    startSession
  };
}
