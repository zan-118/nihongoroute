"use client";

import { useState, useEffect } from "react";

interface Props {
  text: string;
  minimal?: boolean; // Prop baru untuk mode ringkas
}

export default function TTSReader({ text, minimal = false }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);

  useEffect(() => {
    // Deteksi apakah ada huruf Jepang
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    setHasJapanese(jpRegex.test(text));
  }, [text]);

  const speak = () => {
    if (!window.speechSynthesis) {
      return alert("Maaf, browser kamu tidak mendukung fitur audio.");
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; // Paksa logat Jepang
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find((voice) => voice.lang.includes("ja"));
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
        e.stopPropagation(); // Mencegah kartu ikut terbalik (flip) saat tombol audio diklik
        speak();
      }}
      className={`flex items-center justify-center gap-2 border transition-all font-bold ${
        minimal
          ? "p-2 md:p-3 aspect-square rounded-xl"
          : "px-4 py-2 rounded-xl w-max text-xs"
      } ${
        isPlaying
          ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          : "bg-[#0ef]/10 border-[#0ef]/30 text-[#0ef] hover:bg-[#0ef]/20 active:scale-95 shadow-sm"
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
