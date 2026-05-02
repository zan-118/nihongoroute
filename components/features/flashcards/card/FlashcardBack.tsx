import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";
import TTSReader from "@/components/TTSReader";
import { FlashcardThemeContext } from "./types";

interface FlashcardBackProps {
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  themeContext: FlashcardThemeContext;
  onDrawClick: (e: React.MouseEvent) => void;
}

export function FlashcardBack({
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
      <div className="w-full h-full flex flex-col items-center justify-center relative pt-8">
        <Badge
          variant="outline"
          className={`absolute top-0 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${themeColor} border-current/20 px-4 py-1.5 rounded-lg h-auto bg-muted dark:bg-black/20`}
        >
          Definisi & Arti
        </Badge>

        <div className="absolute top-0 right-0 z-20">
          <TTSReader text={word} minimal={true} />
        </div>

        <div className="text-center w-full flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
          {!isKanji && (
            <p
              className={`${themeColor} font-mono font-bold text-xs md:text-sm tracking-widest uppercase opacity-40`}
            >
              {furigana || romaji || "..."}
            </p>
          )}

          <h2
            className={`${word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight font-japanese leading-tight drop-shadow-sm dark:drop-shadow-lg transition-all`}
          >
            {word}
          </h2>

          {/* KANJI DETAILS */}
          {isKanji && kanjiDetails && (
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
              {kanjiDetails.onyomi && (
                <Card className="bg-muted/50 dark:bg-white/[0.04] px-4 py-2.5 rounded-xl border-border dark:border-white/[0.08] flex flex-col items-center min-w-[100px] md:min-w-[120px] shadow-none">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                    ONYOMI
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-japanese font-bold text-base md:text-lg">
                    {kanjiDetails.onyomi}
                  </span>
                </Card>
              )}
              {kanjiDetails.kunyomi && (
                <Card className="bg-muted/50 dark:bg-white/[0.04] px-4 py-2.5 rounded-xl border-border dark:border-white/[0.08] flex flex-col items-center min-w-[100px] md:min-w-[120px] shadow-none">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                    KUNYOMI
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-japanese font-bold text-base md:text-lg">
                    {kanjiDetails.kunyomi}
                  </span>
                </Card>
              )}
            </div>
          )}

          {/* MEANING CARD */}
          <Card
            className={`p-5 md:p-6 bg-muted/50 dark:bg-white/[0.03] rounded-2xl border ${themeBorder} w-full flex items-center justify-center shadow-none min-h-[80px] md:min-h-[100px] mt-2 md:mt-0`}
          >
            <h3
              className={`${themeColor} text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tight leading-snug`}
            >
              {meaning}
            </h3>
          </Card>

          {isKanji && (
            <Button
              onClick={onDrawClick}
              className="mt-4 md:mt-6 flex items-center justify-center gap-2 w-full max-w-[240px] mx-auto bg-purple-600 dark:bg-purple-500 hover:bg-foreground hover:text-background dark:hover:bg-white text-white dark:text-black font-black uppercase tracking-widest h-auto py-3.5 px-6 rounded-xl transition-all shadow-lg border-none text-[9px] md:text-[10px]"
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
