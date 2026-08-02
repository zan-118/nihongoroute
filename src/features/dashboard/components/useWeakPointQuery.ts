/**
 * @file useWeakPointQuery.ts
 * @description Custom hook querying and assembling weak SRS point details from Supabase.
 * @module features/dashboard/components
 */

import { useState, useEffect, useMemo } from "react";
import { useSRSStore } from "@/store/useSRSStore";
import { createClient } from "@/lib/supabase/client";
import { selectWeakPointCandidates } from "@/lib/weak-points";

export interface WeakItem {
 id: string;
 type: "vocab" | "kanji";
 display: string;
 detail: string;
 easeFactor: number;
 slug?: string;
}

interface WeakCandidate {
 id: string;
 easeFactor: number;
}

function getTopWeakCandidates(srs: ReturnType<typeof useSRSStore.getState>["srs"]) {
 return selectWeakPointCandidates(srs, { limit: 4 }).map((candidate) => ({
 id: candidate.id,
 easeFactor: candidate.easeFactor,
 }));
}

function getWeakCandidatesSignature(srs: ReturnType<typeof useSRSStore.getState>["srs"]) {
 return getTopWeakCandidates(srs)
 .map((item) => `${item.id}:${item.easeFactor}`)
 .join("|");
}

function parseWeakCandidatesSignature(signature: string): WeakCandidate[] {
 if (!signature) return [];

 return signature.split("|").map((entry) => {
 const separatorIndex = entry.lastIndexOf(":");
 return {
 id: entry.slice(0, separatorIndex),
 easeFactor: Number(entry.slice(separatorIndex + 1)),
 };
 });
}

/**
 * Custom hook to query and assemble weak SRS point details from Supabase.
 */
export function useWeakPointQuery() {
 const [weakItems, setWeakItems] = useState<WeakItem[]>([]);
 const [loading, setLoading] = useState(true);
 const weakCandidatesSignature = useSRSStore((state) => getWeakCandidatesSignature(state.srs));
 const weakCandidates = useMemo(
 () => parseWeakCandidatesSignature(weakCandidatesSignature),
 [weakCandidatesSignature]
 );

 useEffect(() => {
 let isMounted = true;

 const fetchDetails = async () => {
 if (weakCandidates.length === 0) {
 if (!isMounted) return;
 setWeakItems([]);
 setLoading(false);
 return;
 }

 const leechesIds = weakCandidates.map((item) => item.id);
 setLoading(true);

 const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const uuids = leechesIds.filter((id) => UUID_REGEX.test(id));
 const nonUuids = leechesIds.filter((id) => !UUID_REGEX.test(id));

 try {
 const supabase = createClient();
 let vocabData: { id: string; word: string; romaji?: string; furigana?: string; slug?: string }[] = [];
 let kanjiData: { id: string; character: string; meaning: string }[] = [];

 if (uuids.length > 0 || nonUuids.length > 0) {
 let vocabQuery = supabase.from("vocab").select("id, word, romaji, furigana, slug");
 if (uuids.length > 0 && nonUuids.length > 0) {
 vocabQuery = vocabQuery.or(`id.in.(${uuids.map((id) => `"${id}"`).join(",")}),slug.in.(${nonUuids.map((slug) => `"${slug}"`).join(",")})`);
 } else if (uuids.length > 0) {
 vocabQuery = vocabQuery.in("id", uuids);
 } else {
 vocabQuery = vocabQuery.in("slug", nonUuids);
 }
 const { data, error: vocabErr } = await vocabQuery;
 if (vocabErr) {
 console.error("Error fetching weak vocab:", vocabErr);
 } else {
 vocabData = data || [];
 }
 }

 if (uuids.length > 0) {
 const { data, error: kanjiErr } = await supabase
 .from("kanji")
 .select("id, character, meaning")
 .in("id", uuids);

 if (kanjiErr) {
 console.error("Error fetching weak kanji:", kanjiErr);
 } else {
 kanjiData = data || [];
 }
 }

 if (!isMounted) return;

 const combined: WeakItem[] = weakCandidates
 .map((candidate): WeakItem | null => {
 const v = vocabData.find((item) => item.id === candidate.id || item.slug === candidate.id);
 if (v) {
 return {
 id: v.id,
 type: "vocab" as const,
 display: v.word,
 detail: v.romaji || v.furigana || "",
 easeFactor: candidate.easeFactor,
 slug: v.slug || v.id,
 };
 }

 const k = kanjiData.find((item) => item.id === candidate.id);
 if (k) {
 return {
 id: k.id,
 type: "kanji" as const,
 display: k.character,
 detail: k.meaning,
 easeFactor: candidate.easeFactor,
 };
 }

 return null;
 })
 .filter((item): item is WeakItem => item !== null);

 setWeakItems(combined);
 } catch (err) {
 console.error("Failed to fetch leech details:", err);
 } finally {
 if (isMounted) setLoading(false);
 }
 };

 fetchDetails();

 return () => {
 isMounted = false;
 };
 }, [weakCandidates]);

 return { weakItems, loading };
}
