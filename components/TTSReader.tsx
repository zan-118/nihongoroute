/**
 * LOKASI FILE: components/TTSReader.tsx
 * KONSEP: Cyber-Dark Neumorphic (Vocal Synthesis HUD)
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, AudioLines } from "lucide-react";

interface Props {
  text: string;
  minimal?: boolean; // Mode ringkas (hanya ikon)
}

export default function TTSReader({ text, minimal = false }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 1. Deteksi apakah teks mengandung huruf Jepang
  useEffect(() => {
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    setHasJapanese(jpRegex.test(text));
  }, [text]);

  // 2. Pre-load Voices (Anti-Bug Safari/Mobile)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return alert("Maaf, browser kamu tidak mendukung fitur audio.");
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;

    const currentVoices =
      voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    const jpVoice = currentVoices.find(
      (voice) =>
        voice.lang === "ja-JP" ||
        voice.lang.includes("ja") ||
        voice.name.includes("Japanese"),
    );

    if (jpVoice) {
      utterance.voice = jpVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!hasJapanese || !text) return null;

  return (
    <Button
      variant="ghost"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        speak();
      }}
      className={`flex items-center justify-center gap-3 border transition-all font-black uppercase tracking-[0.2em] h-auto italic ${
        minimal
          ? "w-12 h-12 md:w-14 md:h-14 rounded-2xl"
          : "px-6 py-2.5 rounded-xl w-max text-[10px]"
      } ${
        isPlaying
          ? "bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] neo-card shadow-none"
          : "bg-black/40 border-white/5 text-slate-500 hover:text-red-500 hover:border-red-500/30 neo-inset shadow-none"
      }`}
      title="Vocal_Synthesis_Execution"
    >
      {isPlaying ? (
        <AudioLines size={minimal ? 24 : 16} className="animate-pulse" />
      ) : (
        <Volume2 size={minimal ? 24 : 16} />
      )}
      {!minimal && (isPlaying ? "Terminate" : "Listen")}
    </Button>
  );
}
