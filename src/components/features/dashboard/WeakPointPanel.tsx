"use client";

/**
 * @file WeakPointPanel.tsx
 * @description Komponen panel diagnosis titik lemah (leech items detector) pada dashboard NihongoRoute.
 * Menyaring kartu memori bermasalah dengan easeFactor < 2.2 dari SRS store secara reaktif,
 * mengambil detil leksikal kosakata/kanji dari database Supabase, serta menyediakan tindakan cepat
 * seperti melihat detail materi kosakata atau melatih guratan menulis Kanji.
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React, { useState, useEffect, useMemo } from "react";
import { useSRSStore } from "@/store/useSRSStore";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, PenTool, ArrowRight, Loader2, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
interface WeakItem {
  id: string;
  type: "vocab" | "kanji";
  display: string; // kata atau karakter kanji
  detail: string; // arti atau romaji/cara baca
  easeFactor: number;
  slug?: string;
}

interface WeakCandidate {
  id: string;
  easeFactor: number;
}

function getTopWeakCandidates(srs: ReturnType<typeof useSRSStore.getState>["srs"]) {
  const candidates: WeakCandidate[] = [];

  for (const [id, state] of Object.entries(srs || {})) {
    if (state.isDeleted || state.easeFactor >= 2.2) continue;

    candidates.push({ id, easeFactor: state.easeFactor });
    candidates.sort((a, b) => a.easeFactor - b.easeFactor);
    if (candidates.length > 4) candidates.pop();
  }

  return candidates;
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

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function WeakPointPanel() {
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

      try {
        const supabase = createClient();
        
        // 2. Ambil data pelengkap dari tabel 'vocab'
        const { data: vocabData, error: vocabErr } = await supabase
          .from("vocab")
          .select("id, word, romaji, furigana, slug")
          .in("id", leechesIds);

        // 3. Ambil data pelengkap dari tabel 'kanji'
        const { data: kanjiData, error: kanjiErr } = await supabase
          .from("kanji")
          .select("id, character, meaning")
          .in("id", leechesIds);

        if (vocabErr) console.error("Error fetching weak vocab:", vocabErr);
        if (kanjiErr) console.error("Error fetching weak kanji:", kanjiErr);

        // 4. Gabungkan data dari kedua tabel
        const mergedList: WeakItem[] = [];

        const vocabMap = new Map(vocabData?.map((v) => [v.id, v]) ?? []);
        const kanjiMap = new Map(kanjiData?.map((k) => [k.id, k]) ?? []);

        weakCandidates.forEach((leech) => {
          // Cari kecocokan di vocab
          const vocabItem = vocabMap.get(leech.id);
          if (vocabItem) {
            mergedList.push({
              id: leech.id,
              type: "vocab",
              display: vocabItem.word,
              detail: vocabItem.furigana ? `${vocabItem.furigana} (${vocabItem.romaji})` : vocabItem.romaji,
              easeFactor: leech.easeFactor,
              slug: vocabItem.slug || undefined,
            });
            return;
          }

          // Cari kecocokan di kanji
          const kanjiItem = kanjiMap.get(leech.id);
          if (kanjiItem) {
            mergedList.push({
              id: leech.id,
              type: "kanji",
              display: kanjiItem.character,
              detail: kanjiItem.meaning,
              easeFactor: leech.easeFactor,
            });
          }
        });

        if (isMounted) setWeakItems(mergedList);
      } catch (err) {
        console.error("Gagal mendiagnosis titik lemah:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [weakCandidates]);

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center bg-card/40 border-border rounded-2xl glass">
        <Loader2 className="animate-spin text-primary" size={24} />
      </Card>
    );
  }

  // Tampilan jika tidak ada titik lemah terdeteksi (semua aman)
  if (weakItems.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/30 backdrop-blur-xl border border-border rounded-[34px] p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgb(var(--primary-rgb)/0.05)] shadow-none">
        <div className="absolute top-0 right-0 size-24 bg-success/5 blur-3xl rounded-full" />
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success shadow-[0_0_15px_rgb(var(--success-rgb)/0.2)]">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-success">Status: Semua Sistem Optimal</h4>
            <p className="text-[10px] text-muted-foreground mt-1">
              Tidak ada titik lemah kritis yang terdeteksi saat ini. Penguasaan memorimu berjalan dengan sangat baik!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-card/30 backdrop-blur-xl border border-border rounded-[34px] p-6 md:p-8 transition-all duration-500 hover:border-destructive/20 hover:shadow-[0_0_40px_rgb(var(--destructive-rgb)/0.08)] shadow-none">
      <div className="absolute top-0 right-0 size-32 bg-destructive/5 blur-3xl rounded-full pointer-events-none" />

      {/* Bagian Header diagnosis */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-destructive font-black uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-destructive animate-pulse" />
            Diagnosis Titik Lemah (Leech Detected)
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Item memori berikut memiliki tingkat kegagalan yang tinggi.
          </p>
        </div>
        <Badge variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive text-[8px] font-black uppercase tracking-widest px-3 py-1.5 h-auto">
          {weakItems.length} Titik Lemah
        </Badge>
      </div>

      {/* Daftar Item Titik Lemah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weakItems.map((item) => {
          // Normalisasi persentase kesulitan dari easeFactor (semakin kecil, semakin sulit).
          // Default awal = 2.5. Sangat lemah jika < 2.2. Rentang: 1.3 - 2.2.
          const difficultyPercent = Math.min(100, Math.max(10, Math.floor(((2.2 - item.easeFactor) / (2.2 - 1.3)) * 100)));
          const isCritical = difficultyPercent > 70;
          
          return (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                isCritical
                  ? "bg-destructive/[0.03] border-destructive/20 hover:bg-destructive/[0.06] hover:border-destructive/35 hover:shadow-[0_0_20px_rgb(var(--destructive-rgb)/0.08)] animate-[pulse_5s_infinite]"
                  : "bg-card/50 border-border hover:bg-card/80 hover:border-primary/20"
              }`}
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-japanese font-black text-foreground">
                    {item.display}
                  </span>
                  <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-muted/40">
                    {item.type}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">
                  {item.detail}
                </div>
                
                {/* Indikator Kesulitan Visual */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[6px] font-black uppercase tracking-widest text-destructive/70 font-mono">
                    <span>Tingkat Kegagalan</span>
                    <span>{difficultyPercent}%</span>
                  </div>
                  <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden border border-border/50">
                    <div 
                      className="bg-destructive h-full rounded-full shadow-[0_0_10px_rgb(var(--destructive-rgb)/0.6)] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent" 
                      style={{ width: `${difficultyPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tautan Tindakan Cepat (Quick Action) */}
              <div className="shrink-0 transition-transform active:scale-95 hover:scale-105">
                {item.type === "vocab" && item.slug ? (
                  <Link href={`/library/vocab/${item.slug}`}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="size-9 p-0 rounded-xl bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all shadow-none"
                      title="Pelajari Kosakata"
                      aria-label={`Pelajari Kosakata: ${item.display}`}
                    >
                      <BookOpen size={16} />
                    </Button>
                  </Link>
                ) : item.type === "kanji" ? (
                  <Link href={`/tools/writing?char=${encodeURIComponent(item.display)}`}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="size-9 p-0 rounded-xl bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20 transition-all shadow-none"
                      title="Latih Menulis Kanji"
                      aria-label={`Latih Menulis Kanji: ${item.display}`}
                    >
                      <PenTool size={16} />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="size-9 p-0 rounded-xl text-muted-foreground border-border bg-muted/40 hover:text-foreground hover:bg-muted/80 transition-all"
                    disabled
                    aria-label="Tindakan tidak tersedia"
                  >
                    <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
