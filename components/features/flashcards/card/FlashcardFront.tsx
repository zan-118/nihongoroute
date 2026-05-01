import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointer2 } from "lucide-react";
import { FlashcardThemeContext } from "./types";

interface FlashcardFrontProps {
  word: string;
  themeContext: FlashcardThemeContext;
}

export function FlashcardFront({ word, themeContext }: FlashcardFrontProps) {
  const { isKanji, themeColor, glowClass } = themeContext;

  return (
    <Card
      className="absolute inset-0 w-full h-full bg-[#0a0c10] border-white/5 flex flex-col items-center justify-center p-4 sm:p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] neo-card shadow-none overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 blur-[80px] md:blur-[100px] rounded-full opacity-10 pointer-events-none ${isKanji ? 'bg-purple-500' : 'bg-cyber-neon'}`} />

      <Badge
        variant="outline"
        className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 border-white/5 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-black/20 neo-inset h-auto whitespace-nowrap"
      >
        {isKanji ? "Karakter Kanji" : "Kosakata Utama"}
      </Badge>

      <h2
        className={`${word.length > 4 ? "text-5xl sm:text-6xl md:text-7xl lg:text-9xl" : "text-7xl sm:text-8xl md:text-9xl lg:text-[11rem]"} font-black text-white tracking-tight font-japanese leading-none z-10 ${glowClass} transition-all duration-300`}
      >
        {word}
      </h2>

      <div className="absolute bottom-6 md:bottom-10 flex flex-col items-center gap-1.5 md:gap-2">
         <MousePointer2 size={16} className={`${themeColor} opacity-50 animate-bounce md:w-5 md:h-5`} />
         <p className={`${themeColor} opacity-50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest`}>
           Ketuk Untuk Membuka
         </p>
      </div>
    </Card>
  );
}
