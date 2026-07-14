"use client";

/**
 * @file KanjiProgressGrid.tsx
 * @description Komponen grid visual kemajuan belajar Kanji (khusus tingkat N5) untuk NihongoRoute.
 * Mengambil data kosakata aksara Kanji dari Supabase, mencocokkannya dengan data repetisi SRS (Spaced Repetition System)
 * di Zustand store, dan menampilkannya sebagai peta visual interaktif berkode warna (Belum, Latihan, Mahir).
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Info } from "lucide-react";
import { useSRSStore } from "@/store/useSRSStore";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================

/**
 * Kanji item structure.
 */
interface KanjiItem {
  _id: string;
  kanji: string;
  meaning: string;
}

/**
 * SRS status for a kanji.
 */
interface KanjiStatus {
  interval: number;
}

/**
 * Cached promise for N5 kanji fetch. Prevents duplicate requests.
 */
let n5KanjiPromise: Promise<KanjiItem[]> | null = null;

/**
 * Fetch N5 kanji list from Supabase.
 * Uses promise caching to avoid redundant network calls.
 */
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

/**
 * Generate string signature of SRS states for dependency tracking.
 * Prevents unnecessary re-renders from store updates.
 */
function getKanjiSrsSignature(
  srs: ReturnType<typeof useSRSStore.getState>["srs"],
  kanjiIdsSignature: string
) {
  if (!kanjiIdsSignature) return "";

  const signatures: string[] = [];

  // Loop through IDs to build signature string
  for (const id of kanjiIdsSignature.split("|")) {
    const status = srs[id];
    if (!status || status.isDeleted) continue;
    signatures.push(`${id}:${status.interval}`);
  }

  return signatures.join("|");
}

/**
 * Parse SRS signature string back into status map.
 */
function parseKanjiSrsSignature(signature: string) {
  const statuses = new Map<string, KanjiStatus>();
  if (!signature) return statuses;

  signature.split("|").forEach((entry) => {
    const separatorIndex = entry.lastIndexOf(":");
    // Extract ID and interval value
    statuses.set(entry.slice(0, separatorIndex), {
      interval: Number(entry.slice(separatorIndex + 1)),
    });
  });

  return statuses;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================

/**
 * Grid component showing N5 Kanji learning progress.
 * Maps database kanji items against local SRS intervals.
 */
export default function KanjiProgressGrid() {
  const { data: kanjis = [], isLoading } = useQuery({
    queryKey: ["dashboard", "n5-kanji-progress"],
    queryFn: getN5Kanjis,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
  
  // Create stable string key of all kanji IDs
  const kanjiIdsSignature = useMemo(
    () => kanjis.map((item) => item._id).join("|"),
    [kanjis]
  );
  
  // Get SRS signature for current kanjis
  const kanjiSrsSignature = useSRSStore((state) =>
    getKanjiSrsSignature(state.srs, kanjiIdsSignature)
  );
  
  // Parse signature to map for O(1) lookups
  const kanjiStatuses = useMemo(
    () => parseKanjiSrsSignature(kanjiSrsSignature),
    [kanjiSrsSignature]
  );

  // Calculate mastery counts and item states
  const kanjiProgress = useMemo(() => {
    const counts = { masteredCount: 0, learningCount: 0 };

    const items = kanjis.map((item) => {
      const status = kanjiStatuses.get(item._id);
      // Mastered if SRS interval exceeds 21 days
      const isMastered = (status?.interval || 0) > 21;
      const isLearning = !!status && !isMastered;

      if (isMastered) counts.masteredCount += 1;
      if (isLearning) counts.learningCount += 1;

      return { ...item, isMastered, isLearning };
    });

    return { items, ...counts };
  }, [kanjis, kanjiStatuses]);

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center bg-card/50 border-border">
        <Loader2 className="animate-spin text-primary" size={24} />
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 size-32 bg-primary/5 blur-3xl rounded-full" />
      
      {/* BAGIAN HEADER GRID */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-muted-foreground uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            Peta Penguasaan Kanji N5
          </h2>
          <p className="text-sm font-black text-foreground uppercase tracking-tight">
            {kanjiProgress.masteredCount} <span className="text-muted-foreground font-medium text-xs">Dikuasai</span> / {kanjis.length} <span className="text-muted-foreground font-medium text-xs">Total</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest px-3">
            {kanjiProgress.learningCount} Belajar
          </Badge>
          <Badge variant="outline" className="bg-success/10 border-success/20 text-success text-[8px] font-bold uppercase tracking-widest px-3">
            {kanjiProgress.masteredCount} Mahir
          </Badge>
        </div>
      </div>

      {/* GRID VISUAL KANJI */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {kanjiProgress.items.map((item) => {
          return (
            <div
              key={item._id}
              title={`${item.kanji}: ${item.meaning} (${item.isMastered ? "Mahir" : item.isLearning ? "Latihan" : "Belum"})`}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-lg font-japanese font-bold transition-all duration-300 border cursor-default
                ${item.isMastered
                  ? 'bg-success border-success text-success-foreground' 
                  : item.isLearning
                  ? 'bg-primary/20 border-primary/40 text-primary' 
                  : 'bg-muted/50 border-border/50 text-muted-foreground/30 hover:border-muted-foreground/50'}
              `}
            >
              {item.kanji}
            </div>
          );
        })}
      </div>

      {/* TIPS HARI INI */}
      <div className="mt-8 flex items-center gap-2 text-muted-foreground">
        <Info size={12} />
        <p className="text-xs font-bold uppercase tracking-widest">
          Tip: Pelajari kanji baru di menu kursus untuk mengisi peta ini.
        </p>
      </div>
    </Card>
  );
}