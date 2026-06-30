"use client";

/**
 * @file KanjiSentences.tsx
 * @description Komponen bento untuk menampilkan kalimat contoh dinamis dari database
 * yang mengandung karakter Kanji bersangkutan, lengkap dengan tombol Text-To-Speech (TTS).
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX, BookOpen } from "lucide-react";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES, type TtsVoice } from "@/lib/tts";
import type { SentenceRow } from "@/actions/sentences.actions";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface KanjiSentencesProps {
  sentences?: SentenceRow[];
  character: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen panel kalimat contoh kanji.
 */
export function KanjiSentences({ sentences = [], character }: KanjiSentencesProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Hitung voice deterministik dari teks agar suara konsisten tiap kalimat
  const VOICES_ROTATION: TtsVoice[] = [
    TTS_VOICES.LARA, TTS_VOICES.INDAH, TTS_VOICES.SITI, TTS_VOICES.DEWI,
    TTS_VOICES.HAYASHI, TTS_VOICES.SATO, TTS_VOICES.AYU, TTS_VOICES.ZUNDAMON,
    TTS_VOICES.RITSU, TTS_VOICES.DITO, TTS_VOICES.BUDI, TTS_VOICES.SUZUKI,
    TTS_VOICES.TANAKA, TTS_VOICES.KIMURA, TTS_VOICES.ANDI, TTS_VOICES.FAISAL,
    TTS_VOICES.TAKAHASHI, TTS_VOICES.KOBAYASHI, TTS_VOICES.NAMONASHI,
  ];

  const getDeterministicVoice = (text: string): TtsVoice => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return VOICES_ROTATION[Math.abs(hash) % VOICES_ROTATION.length];
  };

  /**
   * Mengucapkan contoh kalimat Jepang menggunakan cache DB (VoiceVox) dengan fallback Web Speech API.
   */
  const speakJapanese = async (text: string, index: number) => {
    // Toggle stop jika kalimat yang sama diklik lagi
    if (playingIndex === index) {
      audioRef.current?.pause();
      cleanupObjectUrl();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    // Hentikan yang sedang berjalan
    audioRef.current?.pause();
    cleanupObjectUrl();
    if (typeof window !== "undefined") window.speechSynthesis.cancel();

    const cleanText = text.trim();
    if (!cleanText) return;

    setPlayingIndex(index);
    const voice = getDeterministicVoice(cleanText);

    try {
      const audioUrl = await fetchTTSAudio(cleanText, voice);
      if (audioUrl) {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        cleanupObjectUrl();
        if (audioUrl.startsWith("blob:")) objectUrlRef.current = audioUrl;
        audio.src = audioUrl;
        audio.onended = () => { setPlayingIndex(null); cleanupObjectUrl(); };
        audio.onerror = () => {
          cleanupObjectUrl();
          speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
        };
        audio.play().catch(() => {
          speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
        });
      } else {
        // Fallback Web Speech API
        speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
      }
    } catch {
      speakWithWebSpeech(cleanText, voice, 1, () => setPlayingIndex(null), () => setPlayingIndex(null));
    }
  };

  // Bersihkan audio saat unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cleanupObjectUrl();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, [cleanupObjectUrl]);

  return (
    <Card className="p-6 md:p-10 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all glass shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={18} className="text-success" aria-hidden="true" />
        <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-foreground">
          Contoh Kalimat ({character})
        </h2>
      </div>

      {sentences && sentences.length > 0 ? (
        <div className="space-y-4">
          {sentences.map((sentence, i) => (
            <div
              key={sentence.id}
              className="border border-border rounded-[1.8rem] p-5 md:p-6 bg-card/5 backdrop-blur-lg hover:border-success/40 transition-all duration-300 shadow-sm relative overflow-hidden group flex items-start gap-4 md:gap-5"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-success/10 group-hover:bg-success transition-all duration-300" />

              <div className="hidden sm:flex flex-col items-center justify-center font-mono text-sm font-black text-muted-foreground/30 group-hover:text-success/40 transition-colors size-10 rounded-full border border-border/50 bg-card/10 select-none">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-lg md:text-xl font-japanese font-bold text-foreground leading-relaxed tracking-wide select-text">
                  {sentence.japanese}
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
                  onClick={() => speakJapanese(sentence.japanese, i)}
                  className={`h-12 w-12 rounded-[1.2rem] border flex items-center justify-center transition-all duration-300 relative ${
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
