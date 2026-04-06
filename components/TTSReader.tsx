"use client";

import { useState } from "react";

interface Props {
  text: string;
}

export default function TTSReader({ text }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

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
    utterance.lang = "in-ID"; // Memaksa browser menggunakan suara bahasa Indonesia
    utterance.rate = 0.8; // Sedikit dilambatkan agar terdengar jelas untuk belajar

    utterance.onend = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-bold w-full md:w-auto ${
        isPlaying
          ? "bg-red-500/20 border-red-500 text-red-400"
          : "bg-[#0ef]/10 border-[#0ef]/30 text-[#0ef] hover:bg-[#0ef]/20 hover:scale-105"
      }`}
    >
      <span className="text-lg">{isPlaying ? "⏹️" : "🔊"}</span>
      {isPlaying ? "Hentikan Suara" : "Dengarkan Summary"}
    </button>
  );
}
