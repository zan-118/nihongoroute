"use client";

import { useState, useEffect } from "react";

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
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        speak();
      }}
      className={`flex items-center justify-center gap-2 border transition-all font-bold ${
        minimal
          ? "p-2 md:p-3 aspect-square rounded-xl"
          : "px-4 py-2 rounded-xl w-max text-xs"
      } ${
        isPlaying
          ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          : "bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon hover:bg-cyber-neon/20 active:scale-95 shadow-sm"
      }`}
      title="Dengarkan pengucapan"
    >
      <span
        className={`${minimal ? "text-lg md:text-xl" : "text-base"} ${isPlaying ? "animate-pulse" : ""}`}
      >
        {isPlaying ? "⏹️" : "🔊"}
      </span>
      {!minimal && (isPlaying ? "Berhenti" : "Dengarkan")}
    </button>
  );
}
