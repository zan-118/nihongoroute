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

const kanjiPromisesMap: Record<string, Promise<KanjiItem[]> | null> = {
  N5: null,
  N4: null,
  N3: null,
};

function getKanjisForLevel(level: string) {
  if (!kanjiPromisesMap[level]) {
    kanjiPromisesMap[level] = (async () => {
      const { data, error } = await createClient()
        .from("kanji")
        .select("id, character, meaning")
        .eq("jlpt_level", level)
        .order("character", { ascending: true });

      if (error) {
        kanjiPromisesMap[level] = null;
        throw error;
      }

      return (data || []).map((k: { id: string; character: string; meaning: string }) => ({
        _id: k.id,
        kanji: k.character,
        meaning: k.meaning,
      }));
    })();
  }

  return kanjiPromisesMap[level]!;
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
 * Custom hook to manage kanji progress fetching and SRS state calculation for N5/N4/N3.
 */
export function useKanjiProgressQuery(level: string = "N5") {
  const { data: kanjis = [], isLoading } = useQuery({
    queryKey: ["dashboard", "kanji-progress", level],
    queryFn: () => getKanjisForLevel(level),
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
