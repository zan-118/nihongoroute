"use client";

import { Card } from "@/components/ui/card";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";

interface VocabHeroProps {
  word: string;
  furigana?: string;
  romaji?: string;
  meaning: string;
}

export function VocabHero({ word, furigana, romaji, meaning }: VocabHeroProps) {
  return (
    <Card className="p-8 md:p-12 bg-card/40 backdrop-blur-xl border-border rounded-[2rem] hover:border-primary/40 transition-all group overflow-hidden relative md:col-span-2 lg:col-span-2 md:row-span-2 flex flex-col items-center justify-center text-center shadow-2xl">
      <div className="absolute top-4 right-4 z-10">
        <TTSReader text={word} minimal={false} />
      </div>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground font-japanese leading-none tracking-tighter mb-4 drop-shadow-sm mt-8">
        <SmartJapanese word={word} furigana={furigana} />
      </h1>
      {romaji && (
        <p className="text-sm md:text-base font-black text-muted-foreground uppercase tracking-[0.4em] opacity-50 mb-6">
          {romaji}
        </p>
      )}
      <div className="h-1.5 w-16 bg-primary rounded-full mb-6 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] mx-auto" />
      <p className="text-2xl md:text-3xl font-black text-foreground leading-tight">
        {meaning}
      </p>
    </Card>
  );
}
