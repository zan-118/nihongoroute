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
      className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-[2.5rem] md:rounded-[3rem] ${themeShadow} flex flex-col items-center justify-center p-4 sm:p-10 md:p-12 transition-all duration-500 neo-card shadow-none overflow-hidden bg-[#0a0c10]`}
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative pt-8 md:pt-10">
        <Badge
          variant="outline"
          className={`absolute top-0 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${themeColor} border-current/20 px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl h-auto neo-inset bg-black/20`}
        >
          Definisi
        </Badge>

        <div className="absolute top-0 right-0 z-20">
          <TTSReader text={word} minimal={true} />
        </div>

        <div className="text-center w-full flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
          {!isKanji && (
            <p
              className={`${themeColor} font-mono font-bold text-sm sm:text-lg md:text-2xl tracking-widest uppercase opacity-80`}
            >
              {furigana || romaji || "..."}
            </p>
          )}

          <h2
            className={`${word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-white tracking-tight font-japanese leading-tight drop-shadow-lg transition-all`}
          >
            {word}
          </h2>

          {/* KANJI DETAILS */}
          {isKanji && kanjiDetails && (
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full">
              {kanjiDetails.onyomi && (
                <Card className="bg-black/40 px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border-white/5 flex flex-col items-center min-w-[100px] md:min-w-[120px] neo-inset shadow-none">
                  <span className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                    Onyomi
                  </span>
                  <span className="text-purple-400 font-japanese font-bold text-lg md:text-xl">
                    {kanjiDetails.onyomi}
                  </span>
                </Card>
              )}
              {kanjiDetails.kunyomi && (
                <Card className="bg-black/40 px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border-white/5 flex flex-col items-center min-w-[100px] md:min-w-[120px] neo-inset shadow-none">
                  <span className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                    Kunyomi
                  </span>
                  <span className="text-purple-400 font-japanese font-bold text-lg md:text-xl">
                    {kanjiDetails.kunyomi}
                  </span>
                </Card>
              )}
            </div>
          )}

          {/* MEANING CARD */}
          <Card
            className={`p-5 md:p-8 bg-black/40 rounded-[2rem] md:rounded-[2.5rem] border ${themeBorder} w-full flex items-center justify-center neo-inset shadow-none min-h-[100px] md:min-h-[140px] mt-2 md:mt-0`}
          >
            <h3
              className={`${themeColor} text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-snug`}
            >
              {meaning}
            </h3>
          </Card>

          {isKanji && (
            <Button
              onClick={onDrawClick}
              className="mt-4 md:mt-8 flex items-center justify-center gap-2 md:gap-3 w-full max-w-sm mx-auto bg-purple-500 hover:bg-white text-black font-bold uppercase tracking-widest h-auto py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] border-none text-[10px] md:text-xs"
            >
              <PenTool size={18} className="md:w-5 md:h-5" />
              <span>Latih Menulis</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
