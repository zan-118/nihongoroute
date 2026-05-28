"use client";

import React, { useState, useEffect } from "react";
import { useSRSStore } from "@/store/useSRSStore";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, PenTool, ArrowRight, Loader2, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeakItem {
  id: string;
  type: "vocab" | "kanji";
  display: string; // word atau character
  detail: string; // meaning atau romaji
  easeFactor: number;
  slug?: string;
}

export default function WeakPointPanel() {
  const [weakItems, setWeakItems] = useState<WeakItem[]>([]);
  const [loading, setLoading] = useState(true);
  const srs = useSRSStore((state) => state.srs);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!srs) {
        setLoading(false);
        return;
      }

      // 1. Dapatkan daftar ID kartu bermasalah (easeFactor < 2.2 dan aktif)
      const dirtyLeeches = Object.entries(srs)
        .filter(([_, state]) => !state.isDeleted && state.easeFactor < 2.2)
        .map(([id, state]) => ({ id, easeFactor: state.easeFactor }))
        .sort((a, b) => a.easeFactor - b.easeFactor) // Kesulitan tertinggi (easeFactor terendah) di atas
        .slice(0, 4); // Ambil top 4 saja

      if (dirtyLeeches.length === 0) {
        setWeakItems([]);
        setLoading(false);
        return;
      }

      const leechesIds = dirtyLeeches.map((item) => item.id);

      try {
        const supabase = createClient();
        
        // 2. Query dari tabel 'vocab'
        const { data: vocabData, error: vocabErr } = await supabase
          .from("vocab")
          .select("id, word, romaji, furigana, slug")
          .in("id", leechesIds);

        // 3. Query dari tabel 'kanji'
        const { data: kanjiData, error: kanjiErr } = await supabase
          .from("kanji")
          .select("id, character, meaning")
          .in("id", leechesIds);

        if (vocabErr) console.error("Error fetching weak vocab:", vocabErr);
        if (kanjiErr) console.error("Error fetching weak kanji:", kanjiErr);

        // 4. Gabungkan data
        const mergedList: WeakItem[] = [];

        dirtyLeeches.forEach((leech) => {
          // Cari di vocab
          const vocabItem = vocabData?.find((v) => v.id === leech.id);
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

          // Cari di kanji
          const kanjiItem = kanjiData?.find((k) => k.id === leech.id);
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

        setWeakItems(mergedList);
      } catch (err) {
        console.error("Gagal mendiagnosis titik lemah:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [srs]);

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center bg-card/40 border-border rounded-2xl glass">
        <Loader2 className="animate-spin text-primary" size={24} />
      </Card>
    );
  }

  if (weakItems.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/30 backdrop-blur-xl border border-border rounded-[34px] p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]">
        <div className="absolute top-0 right-0 size-24 bg-success/5 blur-3xl rounded-full" />
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success shadow-[0_0_15px_rgba(var(--success-rgb),0.2)]">
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
    <Card className="relative overflow-hidden bg-card/30 backdrop-blur-xl border border-border rounded-[34px] p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_35px_rgba(var(--primary-rgb),0.08)]">
      <div className="absolute top-0 right-0 size-32 bg-destructive/5 blur-3xl rounded-full" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-destructive font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-destructive animate-pulse" />
            Diagnosis Titik Lemah (Leech Detected)
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
            Item memori berikut memiliki tingkat pengulangan gagal yang tinggi.
          </p>
        </div>
        <Badge variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive text-[8px] font-bold uppercase tracking-widest px-3">
          {weakItems.length} Titik Lemah
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weakItems.map((item) => {
          // Normalisasi persentase kesulitan dari easeFactor (semakin kecil, semakin sulit).
          // Default awal = 2.5. Sangat lemah jika < 2.2. Rentang: 1.3 - 2.2.
          const difficultyPercent = Math.min(100, Math.max(10, Math.floor(((2.2 - item.easeFactor) / (2.2 - 1.3)) * 100)));
          
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-200"
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
                
                {/* Visual Difficulty Indicator Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[6px] font-bold uppercase tracking-wider text-destructive/60 font-mono">
                    <span>Tingkat Kegagalan</span>
                    <span>{difficultyPercent}%</span>
                  </div>
                  <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden border border-border/50">
                    <div 
                      className="bg-destructive h-full rounded-full shadow-[0_0_8px_rgba(var(--destructive-rgb),0.6)]" 
                      style={{ width: `${difficultyPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Action Links */}
              <div>
                {item.type === "vocab" && item.slug ? (
                  <Link href={`/library/vocab/${item.slug}`}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="size-8 p-0 rounded-xl bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all"
                      title="Pelajari Kosakata"
                    >
                      <BookOpen size={14} />
                    </Button>
                  </Link>
                ) : item.type === "kanji" ? (
                  <Link href={`/tools/writing?char=${encodeURIComponent(item.display)}`}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="size-8 p-0 rounded-xl bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20 transition-all"
                      title="Latih Menulis Kanji"
                    >
                      <PenTool size={14} />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="size-8 p-0 rounded-xl text-muted-foreground border-border bg-muted/40 hover:text-foreground hover:bg-muted/80 transition-all"
                    disabled
                  >
                    <ArrowRight size={14} />
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
