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
          ? "bg-destructive/10 border-destructive/40 text-destructive shadow-[0_0_20px_rgba(var(--destructive-rgb),0.2)] neo-card shadow-none"
          : "bg-muted/50 border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 neo-inset shadow-none"
      }`}
      title="Vocal_Synthesis_Execution"
      aria-label={isPlaying ? "Berhenti mendengarkan" : "Dengarkan pengucapan"}
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
