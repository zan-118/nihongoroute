"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import { VocabItem } from "./types";
import Link from "next/link";

interface VocabCardProps {
  item: VocabItem;
  idx: number;
  showRomaji: boolean;
}

/**
 * Komponen kartu kosakata individual.
 * Dioptimalkan tanpa Framer Motion untuk performa ekstrem.
 */
export function VocabCard({ item, idx, showRomaji }: VocabCardProps) {
  return (
    <div
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '0 250px',
      }}
      className="transform hover:-translate-y-1 transition-all duration-300"
    >
      <Link href={ROUTES.LIBRARY.VOCAB(item.slug)} className="block h-full">
        <Card className="p-5 md:p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all duration-300 group shadow-sm flex flex-col gap-4 relative overflow-hidden h-full">
          {/* Subtle Hover Indicator */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-[rgba(var(--primary-rgb),0.05)] rounded-bl-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-500">
            <ExternalLink size={14} className="text-primary mr-2 mb-2" aria-hidden="true" />
          </div>

          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg border h-auto bg-muted text-muted-foreground">
                {item.hinshi?.[0] || "vocab"}
              </Badge>
            </div>
            <div onClick={(e) => e.preventDefault()} className="relative z-10">
              <TTSReader text={item.word} minimal={true} />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="text-2xl md:text-3xl font-black text-foreground font-japanese leading-tight tracking-tight group-hover:text-primary transition-colors">
              <SmartJapanese word={item.word} furigana={item.furigana || undefined} />
            </div>
            
            {showRomaji && item.romaji && (
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest overflow-hidden">
                {item.romaji}
              </p>
            )}
            
            <p className="text-sm md:text-base font-medium text-muted-foreground leading-snug group-hover:text-foreground transition-colors line-clamp-2">
              {item.meaning}
            </p>
          </div>

          {(item.mnemonic || (item.related_kanji && item.related_kanji.length > 0)) && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {item.related_kanji && item.related_kanji.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.related_kanji.map((kanji: { character: string; meaning: string }, kIdx: number) => (
                    <span key={kIdx} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-japanese" title={kanji.meaning}>
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
