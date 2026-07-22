"use client";

/**
 * @file KanjiSentences.tsx
 * @description Komponen bento untuk menampilkan kalimat contoh dinamis dari database
 * yang mengandung karakter Kanji bersangkutan, lengkap dengan tombol Text-To-Speech (TTS).
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX, BookOpen } from "lucide-react";
import { TTS_VOICES, type TtsVoice } from "@/lib/tts";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { SentenceRow } from "@/actions/sentences.actions";
import { SmartJapanese } from "@/components/ui/SmartJapanese";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for KanjiSentences component.
 */
interface KanjiSentencesProps {
  /** Array of sentence rows containing Japanese text and translations. */
  sentences?: SentenceRow[];
  /** Target kanji character. */
  character: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Render list of example sentences for specific kanji with TTS audio.
 */
export function KanjiSentences({ sentences = [], character }: KanjiSentencesProps) {
  // Track index of currently playing sentence audio.
  const { playingIndex, playAudio } = useAudioPlayer();

  // List of available TTS voices for rotation.
  const VOICES_ROTATION: TtsVoice[] = [
    TTS_VOICES.LALA, TTS_VOICES.INDAH, TTS_VOICES.SITI, TTS_VOICES.DEWI,
    TTS_VOICES.HAYASHI, TTS_VOICES.SATO, TTS_VOICES.AYU, TTS_VOICES.ZUNDAMON,
    TTS_VOICES.RITSU, TTS_VOICES.DITO, TTS_VOICES.BUDI, TTS_VOICES.SUZUKI,
    TTS_VOICES.TANAKA, TTS_VOICES.KIMURA, TTS_VOICES.ANDI, TTS_VOICES.FAISAL,
    TTS_VOICES.TAKAHASHI, TTS_VOICES.KOBAYASHI,
  ];

  /**
   * Get voice deterministically based on text hash.
   * @param text Input text.
   * @returns Selected TTS voice.
   */
  const getDeterministicVoice = (text: string): TtsVoice => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return VOICES_ROTATION[Math.abs(hash) % VOICES_ROTATION.length];
  };

  return (
    <Card className="p-6 md:p-10 bg-card/20  border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all glass shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={18} className="text-success" aria-hidden="true" />
        <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-foreground">
          Contoh Kalimat ({character})
        </h2>
      </div>

      {sentences && sentences.length > 0 ? (
        <div className="space-y-4">
          {sentences.map((sentence, i) => (
            <div
              key={sentence.id}
              className="border border-border rounded-2xl p-5 md:p-6 bg-card/5  hover:border-success/40 transition-all duration-300 shadow-sm relative overflow-hidden group flex items-start gap-4 md:gap-5"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-success/10 group-hover:bg-success transition-all duration-300" />

              <div className="hidden sm:flex flex-col items-center justify-center font-mono text-sm font-black text-muted-foreground/30 group-hover:text-success/40 transition-colors size-10 rounded-full border border-border/50 bg-card/10 select-none">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-lg md:text-xl font-japanese font-bold text-foreground leading-relaxed tracking-wide select-text">
                  <SmartJapanese word={sentence.japanese} furigana={sentence.furigana || undefined} />
                </p>
                {(sentence.indonesia || sentence.english) && (
                  <div className="mt-3 pl-4 border-l-2 border-success/30 text-sm md:text-base text-muted-foreground/80 font-semibold leading-relaxed select-text">
                    {sentence.indonesia || sentence.english}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => playAudio(sentence.japanese, i, { voice: getDeterministicVoice(sentence.japanese) })}
                  className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all duration-300 relative ${
                    playingIndex === i
                      ? "border-success bg-success/10 text-success shadow-[0_0_20px_rgb(var(--success-rgb)/0.35)] animate-pulse"
                      : "border-border bg-card/20 text-muted-foreground hover:border-success/40 hover:text-success hover:bg-success/5"
                  }`}
                  aria-label={playingIndex === i ? "Hentikan pengucapan" : "Dengarkan pengucapan"}
                >
                  {playingIndex === i ? (
                    <VolumeX size={20} className="scale-110" />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Belum ada kalimat contoh untuk karakter kanji ini di database.
        </p>
      )}
    </Card>
  );
}