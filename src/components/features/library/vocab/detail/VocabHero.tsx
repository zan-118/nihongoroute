"use client";

/**
 * @file VocabHero.tsx
 * @description Komponen panel tajuk utama detail kosakata (Vocab Hero).
 * Menampilkan tulisan ejaan kanji/kana utama, bacaan romaji, arti, serta tombol aksi TTS & penambahan ke SRS.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Card } from "@/components/ui/card";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { AddToSRSButton } from "@/components/features/srs/button/AddToSRSButton";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface VocabHeroProps {
  word: string;
  furigana?: string;
  romaji?: string;
  meaning: string;
  audioUrl?: string | null;
}

// ==========================================
// KOMPONEN UTAMA: VocabHero
// ==========================================
/**
 * Komponen panel visualisasi utama detail kosakata Jepang.
 * 
 * @param {VocabHeroProps} props Properti komponen visual utama kosakata.
 */
export function VocabHero({ word, furigana, romaji, meaning, audioUrl }: VocabHeroProps) {
  return (
    <Card className="p-8 md:p-12 bg-card/40  border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all group overflow-hidden relative flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)] font-sans glass">
      {/* Grup Tombol Aksi Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <AddToSRSButton wordId={word} />
        <TTSReader text={word} minimal={false} speaker="indah" audioUrl={audioUrl} />
      </div>

      {/* Karakter Ejaan Utama (Furigana Presisi 0.55em) */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl text-foreground font-japanese leading-none tracking-tighter mb-4 drop-shadow-sm mt-8">
        <SmartJapanese word={word} furigana={furigana} />
      </h1>

      {/* Bacaan Latin Romaji */}
      {romaji && (
        <p className="text-sm md:text-base font-black text-muted-foreground uppercase tracking-[0.4em] opacity-50 mb-6">
          {romaji}
        </p>
      )}
      
      {/* Aksen Batang Pendar Siber */}
      <div className="h-1.5 w-16 bg-primary rounded-full mb-6 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.5)] mx-auto" />
      
      {/* Arti Utama Bahasa Indonesia */}
      <p className="text-2xl md:text-3xl font-black text-foreground leading-tight">
        {meaning}
      </p>
    </Card>
  );
}

