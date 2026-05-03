import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenTool, ExternalLink } from "lucide-react";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { FlashcardThemeContext } from "./types";
import Link from "next/link";

interface FlashcardBackProps {
  id: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  themeContext: FlashcardThemeContext;
  onDrawClick: (e: React.MouseEvent) => void;
  srsState?: {
    interval: number;
    repetition: number;
    easeFactor: number;
    nextReview: number;
  };
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
  srsState,
}: FlashcardBackProps) {
  const { isKanji, themeColor, themeBorder, themeShadow } = themeContext;

  const getMemoryLevel = (interval: number) => {
    if (interval <= 1) return { label: "Baru", color: "text-blue-500 bg-blue-500/10" };
    if (interval <= 3) return { label: "Belajar", color: "text-cyan-500 bg-cyan-500/10" };
    if (interval <= 10) return { label: "Akrab", color: "text-emerald-500 bg-emerald-500/10" };
    if (interval <= 30) return { label: "Kuat", color: "text-amber-500 bg-amber-500/10" };
    return { label: "Master", color: "text-rose-500 bg-rose-500/10" };
  };

  const memory = srsState ? getMemoryLevel(srsState.interval) : { label: "Baru", color: "text-blue-500 bg-blue-500/10" };

  return (
    <Card
      className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-2xl ${themeShadow} flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-500 shadow-none overflow-hidden bg-card dark:bg-[#0a0c10]`}
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="w-full h-full flex flex-col items-center relative p-1 pb-4">
        {/* HEADER SECTION */}
        <div className="w-full flex items-center justify-between mb-4 px-1">
          <Badge
            variant="outline"
            className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${themeColor} border-current/20 px-4 py-1.5 rounded-lg h-auto bg-muted dark:bg-black/20 z-30`}
          >
            Definisi & Arti
          </Badge>

          <div className="z-20">
            <TTSReader text={word} minimal={true} />
          </div>
        </div>

        <div className={`text-center w-full flex flex-col items-center justify-center flex-1 ${isKanji ? 'space-y-4 md:space-y-6' : 'space-y-4 md:space-y-8'}`}>
          {/* WORD DISPLAY */}
          <div className="flex flex-col items-center relative group/kanji">
            {!isKanji && (
              <p
                className={`${themeColor} font-mono font-bold text-xs md:text-sm tracking-widest uppercase opacity-40 mb-1`}
              >
                {furigana || romaji || "..."}
              </p>
            )}

            <h2
              className={`${isKanji ? "text-7xl md:text-9xl" : word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight font-japanese leading-none drop-shadow-sm dark:drop-shadow-lg transition-all`}
            >
              {word}
            </h2>
          </div>

          {/* KANJI DETAILS */}
          {isKanji && kanjiDetails && (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm px-2">
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
          <div className="w-full px-2">
            <Card
              className={`p-5 md:p-6 bg-muted/50 dark:bg-white/[0.03] rounded-2xl border ${themeBorder} w-full flex items-center justify-center shadow-none min-h-[80px] md:min-h-[100px] relative group/meaning overflow-hidden`}
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
          </div>

          {/* WRITE PRACTICE BUTTON */}
          {isKanji && (
            <Button
              onClick={onDrawClick}
              className="mt-2 flex items-center justify-center gap-2 w-full max-w-[240px] mx-auto bg-purple-600 dark:bg-purple-500 hover:bg-foreground hover:text-background dark:hover:bg-white text-white dark:text-black font-black uppercase tracking-widest h-auto py-3 px-6 rounded-xl transition-all shadow-lg border-none text-[10px] md:text-xs"
            >
              <PenTool size={14} />
              <span>Latih Menulis</span>
            </Button>
          )}
        </div>

        {/* SRS STATUS FOOTER */}
        <div className="w-full pt-4 flex items-center justify-center gap-4 border-t border-border/50 dark:border-white/5 mt-4">
          <div className={`flex flex-col items-center gap-1`}>
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Kekuatan Memori</span>
            <Badge variant="outline" className={`${memory.color} border-none text-[9px] font-black uppercase px-3 py-1 rounded-full h-auto`}>
              {memory.label}
            </Badge>
          </div>
          {srsState && (
              <div className="flex flex-col items-center gap-1 border-l border-border/50 dark:border-white/5 pl-4">
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Interval</span>
              <span className="text-[10px] font-black text-foreground">{srsState.interval} Hari</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

