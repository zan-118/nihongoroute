import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenTool, ExternalLink } from "lucide-react";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { FlashcardThemeContext } from "./types";
import Link from "next/link";
import KanjiStrokeOrder from "@/components/features/kanji/KanjiStrokeOrder";

interface FlashcardBackProps {
  id: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  themeContext: FlashcardThemeContext;
  onDrawClick: (e: React.MouseEvent) => void;
}

export function FlashcardBack({
  id,
  word,
  meaning,
  furigana,
  romaji,
  kanjiDetails,
  themeContext,
  onDrawClick,
}: FlashcardBackProps) {
  const { isKanji, themeColor, themeBorder, themeShadow } = themeContext;

  return (
    <Card
      className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-2xl ${themeShadow} flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-500 shadow-none overflow-hidden bg-card dark:bg-[#0a0c10]`}
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative pt-14">
        <Badge
          variant="outline"
          className={`absolute top-4 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${themeColor} border-current/20 px-4 py-1.5 rounded-lg h-auto bg-muted dark:bg-black/20 z-30`}
        >
          Definisi & Arti
        </Badge>

        <div className="absolute top-4 right-4 z-20">
          <TTSReader text={word} minimal={true} />
        </div>

        <div className={`text-center w-full flex flex-col items-center justify-center h-full ${isKanji ? 'space-y-3 md:space-y-4' : 'space-y-4 md:space-y-6'}`}>
          {!isKanji && (
            <p
              className={`${themeColor} font-mono font-bold text-xs md:text-sm tracking-widest uppercase opacity-40`}
            >
              {furigana || romaji || "..."}
            </p>
          )}

          <h2
            className={`${isKanji ? "text-6xl md:text-8xl" : word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight font-japanese leading-none drop-shadow-sm dark:drop-shadow-lg transition-all mb-2`}
          >
            {word}
          </h2>

          {/* KANJI DETAILS */}
          {isKanji && kanjiDetails && (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {kanjiDetails.onyomi && (
                <div className="bg-muted/30 dark:bg-white/[0.03] p-3 rounded-2xl border border-border/50 dark:border-white/[0.05] flex flex-col items-center shadow-none">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 opacity-60">
                    Onyomi
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-japanese font-bold text-sm md:text-base leading-tight text-center">
                    {kanjiDetails.onyomi}
                  </span>
                </div>
              )}
              {kanjiDetails.kunyomi && (
                <div className="bg-muted/30 dark:bg-white/[0.03] p-3 rounded-2xl border border-border/50 dark:border-white/[0.05] flex flex-col items-center shadow-none">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 opacity-60">
                    Kunyomi
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-japanese font-bold text-sm md:text-base leading-tight text-center">
                    {kanjiDetails.kunyomi}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* MEANING CARD */}
          <Card
            className={`p-5 md:p-6 bg-muted/50 dark:bg-white/[0.03] rounded-2xl border ${themeBorder} w-full flex items-center justify-center shadow-none min-h-[80px] md:min-h-[100px] mt-2 md:mt-0 relative group/meaning`}
          >
            <h3
              className={`${themeColor} text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tight leading-snug`}
            >
              {meaning}
            </h3>
            
            <Button
              asChild
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="absolute -bottom-3 right-4 h-8 bg-background border border-border hover:bg-muted text-[8px] font-black uppercase tracking-widest rounded-lg px-3 shadow-sm opacity-0 group-hover/meaning:opacity-100 transition-all"
            >
              <Link href={`/library/${isKanji ? 'kanji' : 'vocab'}/${id}`}>
                <ExternalLink size={12} className="mr-1.5" /> Lihat Detail
              </Link>
            </Button>
          </Card>

          {isKanji && (
            <div className="w-full max-w-[120px] mx-auto py-1">
              <KanjiStrokeOrder kanji={word} minimal={true} />
            </div>
          )}

          {isKanji && (
            <Button
              onClick={onDrawClick}
              className="mt-2 flex items-center justify-center gap-2 w-full max-w-[240px] mx-auto bg-purple-600 dark:bg-purple-500 hover:bg-foreground hover:text-background dark:hover:bg-white text-white dark:text-black font-black uppercase tracking-widest h-auto py-3.5 px-6 rounded-xl transition-all shadow-lg border-none text-[9px] md:text-[10px]"
            >
              <PenTool size={16} />
              <span>Latih Menulis</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
