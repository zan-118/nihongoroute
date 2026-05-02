import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointer2 } from "lucide-react";
import { FlashcardThemeContext } from "./types";

interface FlashcardFrontProps {
  word: string;
  themeContext: FlashcardThemeContext;
}

export function FlashcardFront({ word, themeContext }: FlashcardFrontProps) {
  const { isKanji, themeColor, themeBorder, themeShadow } = themeContext;

  return (
    <Card
      className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-2xl ${themeShadow} flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-500 shadow-none overflow-hidden bg-card dark:bg-[#0a0c10]`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 blur-[80px] md:blur-[100px] rounded-full opacity-10 pointer-events-none ${isKanji ? 'bg-purple-500' : 'bg-primary'}`} />

      <Badge
        variant="outline"
        className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-border dark:border-white/[0.08] px-4 md:px-5 py-1.5 rounded-lg bg-muted dark:bg-black/20 h-auto whitespace-nowrap"
      >
        {isKanji ? "Karakter Kanji" : "Kosakata Utama"}
      </Badge>

      <h2
        className={`${word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight font-japanese leading-tight transition-all duration-300 drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
      >
        {word}
      </h2>

      <div className="absolute bottom-6 md:bottom-8 flex flex-col items-center gap-1.5">
         <MousePointer2 size={16} className={`${themeColor} opacity-40 animate-bounce`} />
         <p className={`${themeColor} opacity-40 text-[9px] font-bold uppercase tracking-widest`}>
           Ketuk untuk Melihat Arti
         </p>
      </div>
    </Card>
  );
}
