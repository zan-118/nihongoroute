"use client";

import { Button } from "@/components/ui/button";
import { Volume2, AudioLines } from "lucide-react";
import { useTTSReader } from "../audio/useTTSReader";

interface Props {
  text: string;
  minimal?: boolean;
}

export default function TTSReader({ text, minimal = false }: Props) {
  const { isPlaying, hasJapanese, speak } = useTTSReader(text);

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
          : "px-6 py-2.5 rounded-xl w-max text-xs"
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
