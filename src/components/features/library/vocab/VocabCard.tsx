"use client";

/**
 * @file VocabCard.tsx
 * @description Komponen kartu kosakata individual NihongoRoute.
 * Menyajikan kata Jepang, Furigana, Romaji, Arti, audio TTS, dan penanda JLPT.
 */

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { VocabItem } from "./types";

interface VocabCardProps {
  item: VocabItem;
  idx: number;
  showRomaji: boolean;
}

export function VocabCard({ item, showRomaji }: VocabCardProps) {
  return (
    <div
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '0 220px',
      }}
      className="relative transition-all duration-300 font-sans h-full group"
    >
      <Link 
        href={ROUTES.LIBRARY.VOCAB(item.slug || item.id)} 
        className="w-full h-full rounded-2xl p-5 bg-card/70 dark:bg-card/30 backdrop-blur-md border border-border/60 dark:border-white/10 shadow-sm group-hover:border-primary/40 group-hover:shadow-md flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 group-active:scale-[0.995]"
      >
        {/* Top Meta Bar */}
        <div className="flex justify-between items-center gap-3 relative z-10">
          <div className="flex flex-wrap gap-1.5 items-center">
            <Badge className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest font-mono rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20">
              {item.hinshi?.[0] || "kosakata"}
            </Badge>

            {item.jlpt_level && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wider">
                {item.jlpt_level.toUpperCase()}
              </span>
            )}
          </div>

          <div onClick={(e) => e.preventDefault()} className="relative z-20 shrink-0">
            <TTSReader text={item.word} minimal={true} speaker="indah" audioUrl={item.audio_url} />
          </div>
        </div>

        {/* Word & Meaning */}
        <div className="space-y-1.5 flex-1 relative z-10">
          <div className="text-2xl font-black text-foreground font-japanese leading-tight group-hover:text-primary transition-colors">
            <SmartJapanese word={item.word} furigana={item.furigana || undefined} />
          </div>
          
          {showRomaji && item.romaji && (
            <p className="text-[10px] font-mono font-bold text-muted-foreground/60 uppercase tracking-wider">
              {item.romaji}
            </p>
          )}
          
          <p className="text-xs font-medium text-muted-foreground leading-snug line-clamp-2 pt-0.5">
            {item.meaning}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/40 dark:border-white/5 flex items-center justify-between gap-3 relative z-10">
          {item.related_kanji && item.related_kanji.length > 0 ? (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[9px] font-mono font-bold text-muted-foreground/50 uppercase tracking-widest mr-1">
                Kanji:
              </span>
              {item.related_kanji.slice(0, 3).map((kanji: { character: string; meaning: string }) => (
                <span key={kanji.character} className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted/60 text-foreground border border-border/40 font-japanese" title={kanji.meaning}>
                  {kanji.character}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[9px] font-mono font-bold text-muted-foreground/40 uppercase tracking-widest">
              LIHAT DETAIL
            </span>
          )}

          <div className="size-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <ArrowUpRight size={12} />
          </div>
        </div>
      </Link>
    </div>
  );
}