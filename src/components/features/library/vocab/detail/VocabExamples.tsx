"use client";

/**
 * @file VocabExamples.tsx
 * @description Komponen penampil contoh kalimat penggunaan kosakata (Vocab Examples).
 * Mendukung pembacaan furigana (SmartJapanese), romaji (Latin), dan arti terjemahan bahasa Indonesia.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Card } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { SmartJapanese } from "@/components/ui/SmartJapanese";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface Example {
  jp?: string;
  japanese?: string;
  id?: string;
  indonesian?: string;
  furigana?: string;
  romaji?: string;
  meaning?: string;
}

interface VocabExamplesProps {
  examples?: Example[];
}

// ==========================================
// KOMPONEN UTAMA: VocabExamples
// ==========================================
/**
 * Komponen panel penampil daftar contoh kalimat interaktif.
 * 
 * @param {VocabExamplesProps} props Properti komponen contoh kalimat kosakata.
 */
export function VocabExamples({ examples }: VocabExamplesProps) {
  return (
    <Card className="p-6 md:p-8 bg-card/20 backdrop-blur-xl border-border rounded-[2rem] hover:border-primary/40 transition-all group overflow-hidden relative md:col-span-full lg:col-span-2 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Layers size={18} aria-hidden="true" className="text-primary" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Contoh Penggunaan</h2>
      </div>

      {/* Daftar Contoh Kalimat */}
      <div className="space-y-4">
        {examples?.map((ex) => (
          <div key={ex.jp || ex.japanese} className="p-5 pl-6 bg-[rgba(var(--card-rgb),0.3)] border border-border rounded-2xl relative overflow-hidden group/item hover:border-primary/30 transition-all duration-300 shadow-sm">
            {/* Aksen Batang Warna Kiri */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/item:bg-primary transition-all duration-300" />
            
            <div className="mb-3 flex flex-col gap-1">
              {/* Kalimat Ejaan Bahasa Jepang (Furigana Presisi 0.55em) */}
              <p className="text-lg md:text-xl font-bold text-foreground font-japanese leading-relaxed">
                <SmartJapanese word={ex.jp || ex.japanese || ""} furigana={ex.furigana} />
              </p>
              {ex.romaji && (
                <span className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] font-sans opacity-60">
                  {ex.romaji}
                </span>
              )}
            </div>

            {/* Arti Terjemahan Bahasa Indonesia */}
            <div className="flex items-start gap-3 border-t border-border/50 pt-3">
              <div className="size-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
              <p className="text-sm font-semibold text-muted-foreground italic leading-relaxed">
                {ex.meaning || ex.id || ex.indonesian}
              </p>
            </div>
          </div>
        ))}
        {(!examples || examples.length === 0) && (
          <p className="text-xs text-muted-foreground italic">Belum ada contoh kalimat untuk kata ini.</p>
        )}
      </div>
    </Card>
  );
}

