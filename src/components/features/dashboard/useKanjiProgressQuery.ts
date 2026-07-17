import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useSRSStore } from "@/store/useSRSStore";

export interface KanjiItem {
  _id: string;
  kanji: string;
  meaning: string;
}

export interface KanjiStatus {
  interval: number;
}

let n5KanjiPromise: Promise<KanjiItem[]> | null = null;

function getN5Kanjis() {
  if (!n5KanjiPromise) {
    n5KanjiPromise = (async () => {
      const { data, error } = await createClient()
        .from("kanji")
        .select("id, character, meaning")
        .eq("jlpt_level", "N5")
        .order("character", { ascending: true });

      if (error) {
        n5KanjiPromise = null;
        throw error;
      }

      return (data || []).map((k: { id: string; character: string; meaning: string }) => ({
        _id: k.id,
        kanji: k.character,
        meaning: k.meaning,
      }));
    })();
  }

  return n5KanjiPromise;
}

function getKanjiSrsSignature(
  srs: ReturnType<typeof useSRSStore.getState>["srs"],
  kanjiIdsSignature: string
) {
  if (!kanjiIdsSignature) return "";

  const signatures: string[] = [];

  for (const id of kanjiIdsSignature.split("|")) {
    const status = srs[id];
    if (!status || status.isDeleted) continue;
    signatures.push(`${id}:${status.interval}`);
  }

  return signatures.join("|");
}

function parseKanjiSrsSignature(signature: string) {
  const statuses = new Map<string, KanjiStatus>();
  if (!signature) return statuses;

  signature.split("|").forEach((entry) => {
    const separatorIndex = entry.lastIndexOf(":");
    statuses.set(entry.slice(0, separatorIndex), {
      interval: Number(entry.slice(separatorIndex + 1)),
    });
  });

  return statuses;
}

/**
 * Custom hook to manage N5 kanji progress fetching and SRS state calculation.
 */
export function useKanjiProgressQuery() {
  const { data: kanjis = [], isLoading } = useQuery({
    queryKey: ["dashboard", "n5-kanji-progress"],
    queryFn: getN5Kanjis,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const kanjiIdsSignature = useMemo(
    () => kanjis.map((item) => item._id).join("|"),
    [kanjis]
  );

  const kanjiSrsSignature = useSRSStore((state) =>
    getKanjiSrsSignature(state.srs, kanjiIdsSignature)
  );

  const kanjiStatuses = useMemo(
    () => parseKanjiSrsSignature(kanjiSrsSignature),
    [kanjiSrsSignature]
  );

  const kanjiProgress = useMemo(() => {
    const counts = { masteredCount: 0, learningCount: 0 };

    const items = kanjis.map((item) => {
      const status = kanjiStatuses.get(item._id);
      const isMastered = (status?.interval || 0) > 21;
      const isLearning = !!status && !isMastered;

      if (isMastered) counts.masteredCount += 1;
      if (isLearning) counts.learningCount += 1;

      return { ...item, isMastered, isLearning };
    });

    return { items, ...counts };
  }, [kanjis, kanjiStatuses]);

  return { kanjis, kanjiProgress, isLoading };
}
