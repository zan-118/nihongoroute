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
import { ExternalLink } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { VocabItem } from "./types";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Props for the VocabCard component.
 */
interface VocabCardProps {
  /** Vocabulary item data containing word, meaning, and metadata. */
  item: VocabItem;
  /** Index of the card in the list. */
  idx: number;
  /** Toggle to display or hide romaji transliteration. */
  showRomaji: boolean;
}

// ==========================================
// KOMPONEN UTAMA: VocabCard
// ==========================================
/**
 * Interactive vocabulary card component with TTS integration.
 * Renders Japanese text, part of speech, meaning, and related kanji.
 * 
 * @param props - Component properties.
 * @returns React element representing the vocabulary card.
 */
export function VocabCard({ item, idx, showRomaji }: VocabCardProps) {
  return (
    <div
      style={{ 
        // Skip rendering offscreen elements to boost scroll performance
        contentVisibility: 'auto', 
        // Provide estimated height for layout calculations before rendering
        containIntrinsicSize: '0 250px',
      }}
      className="relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] font-sans h-full group"
    >
      {/* Tombou Register Mark (L-shape corner mark offset 6px outside rounded-2xl) */}
      <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
        <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 dark:bg-[#005C66] group-hover:bg-primary transition-colors duration-500" />
        <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 dark:bg-[#005C66] group-hover:bg-primary transition-colors duration-500" />
      </div>

      <Link href={ROUTES.LIBRARY.VOCAB(item.slug || item.id)} className="block h-full">
        <Card className="p-6 sm:p-7 md:p-8 bg-card border border-border/50 dark:border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] group-hover:border-primary/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col gap-5 relative overflow-hidden h-full">
          {/* Subtle indicator icon inside without glowing backgrounds */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <ExternalLink size={12} className="text-primary/70" aria-hidden="true" />
          </div>

          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-[4px] border border-border/70 h-auto bg-muted text-muted-foreground font-sans">
                {item.hinshi?.[0] || "vocab"}
              </Badge>
            </div>
            {/* Tombol TTS Offline (Mencegah navigasi Link saat ditekan) */}
            <div onClick={(e) => e.preventDefault()} className="relative z-10">
              <TTSReader text={item.word} minimal={true} speaker="indah" audioUrl={item.audio_url} />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            {/* Ejaan Utama Bahasa Jepang (Dengan Furigana Presisi 0.55em) */}
            <div className="text-2xl md:text-3xl font-bold text-foreground font-japanese leading-tight tracking-tight group-hover:text-primary transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <SmartJapanese word={item.word} furigana={item.furigana || undefined} />
            </div>
            
            {/* Tampilan Romaji (Opsional) */}
            {showRomaji && item.romaji && (
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest overflow-hidden font-sans">
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
            <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
              {item.related_kanji && item.related_kanji.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.related_kanji.map((kanji: { character: string; meaning: string }) => (
                    <span key={kanji.character} className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-muted text-muted-foreground border border-border/60 font-japanese" title={kanji.meaning}>
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