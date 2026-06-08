"use client";

/**
 * @file VocabCard.tsx
 * @description Komponen kartu tampilan kosakata individual (Vocab Card) di NihongoRoute.
 * Menampilkan ejaan SmartJapanese, romaji opsional, part of speech (hinshi), arti, serta daftar kanji relevan.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { VocabItem } from "./types";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface VocabCardProps {
  item: VocabItem;
  idx: number;
  showRomaji: boolean;
}

// ==========================================
// KOMPONEN UTAMA: VocabCard
// ==========================================
/**
 * Komponen kartu kosakata interaktif berkecepatan tinggi dengan integrasi TTS luring.
 * 
 * @param {VocabCardProps} props Properti komponen kartu kosakata.
 */
export function VocabCard({ item, idx, showRomaji }: VocabCardProps) {
  return (
    <div
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '0 250px',
      }}
      className="transform hover:-translate-y-1 transition-all duration-300 font-sans"
    >
      <Link href={ROUTES.LIBRARY.VOCAB(item.slug)} className="block h-full">
        <Card className="p-4 sm:p-5 md:p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all duration-300 group shadow-sm flex flex-col gap-4 relative overflow-hidden h-full">
          {/* Efek Indikator Sorot Halus */}
          <div className="absolute top-0 right-0 size-12 bg-[rgb(var(--primary-rgb)/0.05)] rounded-bl-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-500">
            <ExternalLink size={14} className="text-primary mr-2 mb-2" aria-hidden="true" />
          </div>

          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg border h-auto bg-muted text-muted-foreground font-sans">
                {item.hinshi?.[0] || "vocab"}
              </Badge>
            </div>
            {/* Tombol TTS Offline (Mencegah navigasi Link saat ditekan) */}
            <div onClick={(e) => e.preventDefault()} className="relative z-10">
              <TTSReader text={item.word} minimal={true} speaker="indah" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            {/* Ejaan Utama Bahasa Jepang (Dengan Furigana Presisi 0.55em) */}
            <div className="text-2xl md:text-3xl font-black text-foreground font-japanese leading-tight tracking-tight group-hover:text-primary transition-colors">
              <SmartJapanese word={item.word} furigana={item.furigana || undefined} />
            </div>
            
            {/* Tampilan Romaji (Opsional) */}
            {showRomaji && item.romaji && (
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest overflow-hidden">
                {item.romaji}
              </p>
            )}
            
            {/* Arti Kosakata */}
            <p className="text-sm md:text-base font-medium text-muted-foreground leading-snug group-hover:text-foreground transition-colors line-clamp-2">
              {item.meaning}
            </p>
          </div>

          {/* Bagian Kanji Relevan/Terkait */}
          {(item.mnemonic || (item.related_kanji && item.related_kanji.length > 0)) && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {item.related_kanji && item.related_kanji.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.related_kanji.map((kanji: { character: string; meaning: string }) => (
                    <span key={kanji.character} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-japanese" title={kanji.meaning}>
                      {kanji.character}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
}

