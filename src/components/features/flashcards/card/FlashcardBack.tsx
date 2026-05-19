import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenTool, ExternalLink } from "lucide-react";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { FlashcardThemeContext } from "./types";
import Link from "next/link";
import * as wanakana from "wanakana";
import { splitFurigana } from "@/components/ui/SmartJapanese";

interface FlashcardBackProps {
  id: string;
  docType?: string;
  slug?: string;
  word: string;
  meaning: string;
  furigana?: string | null;
  romaji?: string | null;
  themeContext: FlashcardThemeContext;
  onDrawClick: (e: React.MouseEvent) => void;
  srsState?: {
    interval: number;
    repetition: number;
    easeFactor: number;
    nextReview: number;
  };
  mnemonic?: string | null;
  pitchAccent?: string | null;
  hinshi?: string | null;
  examples?: Array<{ 
    japanese?: string; 
    indonesian?: string;
    jp?: string;
    meaning?: string;
  }> | null;
  kanjiDetails?: any;
  relatedKanji?: any[] | null;
}

export function FlashcardBack({
  id,
  docType,
  slug,
  word,
  meaning,
  furigana,
  romaji,
  themeContext,
  onDrawClick,
  srsState,
  mnemonic,
  pitchAccent,
  hinshi,
  examples,
}: FlashcardBackProps) {
  const { isKanji, themeColor, themeBorder, themeShadow } = themeContext;

  const isRomaji = furigana && /^[a-zA-Z\s.,?!'-]+$/.test(furigana);
  const displayRomaji = romaji || (isRomaji ? furigana : (furigana ? wanakana.toRomaji(furigana) : ""));
  const hiraReading = isRomaji ? wanakana.toHiragana(furigana || "") : (furigana || "");

  const getMemoryLevel = (interval: number) => {
    if (interval <= 1) return { label: "Baru", color: "text-primary bg-primary/10" };
    if (interval <= 3) return { label: "Belajar", color: "text-primary bg-primary/10" };
    if (interval <= 10) return { label: "Akrab", color: "text-success bg-success/10" };
    if (interval <= 30) return { label: "Kuat", color: "text-warning bg-warning/10" };
    return { label: "Master", color: "text-destructive bg-destructive/10" };
  };

  const memory = srsState ? getMemoryLevel(srsState.interval) : { label: "Baru", color: "text-primary bg-primary/10" };

  return (
    <Card
      className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-2xl ${themeShadow} flex flex-col p-4 md:p-6 transition-all duration-500 shadow-none overflow-hidden bg-card`}
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="w-full h-full flex flex-col relative">
        {/* HEADER SECTION */}
        <div className="w-full flex items-center justify-between mb-2 shrink-0">
          <Badge
            variant="outline"
            className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${themeColor} border-current/20 px-2 py-0.5 rounded-lg h-auto bg-muted dark:bg-background/20 z-30`}
          >
            {isKanji ? "Detail Karakter" : (hinshi || "Definisi")}
          </Badge>

          <div className="flex items-center gap-2 z-20">
            {pitchAccent && (
              <span className="text-[8px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">
                PITCH: {pitchAccent}
              </span>
            )}
            <TTSReader text={word} minimal={true} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between flex-1 min-h-0 py-1">
          {/* WORD DISPLAY - Tighter sizing */}
          <div className="flex flex-col items-center relative group/kanji shrink-0">
            <h2
              className={`${isKanji ? "text-5xl md:text-7xl" : word.length > 5 ? "text-2xl md:text-5xl" : "text-4xl md:text-7xl"} font-black text-foreground tracking-tight font-japanese leading-none drop-shadow-sm`}
            >
              {isKanji ? word : (
                splitFurigana(word, hiraReading).map((chunk, i) => (
                  chunk.furi ? (
                    <ruby key={i}>
                      {chunk.text}
                      <rt className="text-[0.5em] text-primary/80 font-bold tracking-widest not-italic">
                        {chunk.furi}
                      </rt>
                    </ruby>
                  ) : (
                    <span key={i}>{chunk.text}</span>
                  )
                ))
              )}
            </h2>
            {!isKanji && displayRomaji && (
              <p className="text-[7px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 mt-1">
                {displayRomaji}
              </p>
            )}
          </div>

          {/* MEANING CARD - More compact padding */}
          <div className="w-full px-1">
            <div className="bg-muted/30 dark:bg-background/[0.03] p-3 md:p-6 rounded-xl border border-border w-full flex flex-col items-center justify-center text-center shadow-none relative group/meaning">
              <h3 className={`${themeColor} text-base md:text-2xl font-black uppercase tracking-tight leading-tight line-clamp-2`}>
                {meaning}
              </h3>
            </div>
          </div>

          {/* CONTENT SECTION (Example OR Mnemonic) - Tighter constraints */}
          <div className="w-full px-1 space-y-2">
            {examples && examples.length > 0 ? (
              <div className="p-2.5 bg-primary/[0.03] border border-primary/10 rounded-xl text-left">
                <span className="text-[7px] font-black uppercase tracking-widest text-primary/60 block mb-0.5">Contoh</span>
                <p className="text-[10px] md:text-[12px] font-bold text-foreground font-japanese leading-tight line-clamp-1">
                  {examples[0].jp || examples[0].japanese}
                </p>
                <p className="text-[8px] md:text-[11px] font-medium text-muted-foreground italic line-clamp-1">
                  {examples[0].meaning || examples[0].indonesian}
                </p>
              </div>
            ) : mnemonic && (
              <div className="p-2.5 bg-warning/[0.03] border border-warning/10 rounded-xl text-left relative overflow-hidden">
                <span className="text-[7px] font-black uppercase tracking-widest text-warning/60 block mb-0.5">Mnemonic</span>
                <p className="text-[9px] md:text-[11px] font-medium text-muted-foreground italic leading-tight line-clamp-2">
                  &quot;{mnemonic}&quot;
                </p>
              </div>
            )}

            {/* QUICK ACTIONS - Lower height */}
            <div className="flex gap-2 w-full">
              {isKanji && (
                <Button
                  onClick={onDrawClick}
                  aria-label="Latih menulis kanji"
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black uppercase tracking-widest h-7 rounded-lg text-[8px] md:text-[10px]"
                >
                  <PenTool size={10} className="mr-1" aria-hidden="true" />
                  <span>Tulis</span>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="flex-1 h-7 bg-background border-border hover:bg-muted text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg px-2 shadow-none"
              >
                <Link 
                  href={`/library/${
                    docType === 'verb_dictionary' ? 'verbs' : 
                    isKanji ? 'kanji' : 'vocab'
                  }/${slug || id}`} 
                  aria-label="Lihat detail kata ini"
                >
                  <ExternalLink size={10} className="mr-1" aria-hidden="true" /> Detail
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* SRS STATUS FOOTER */}
        <div className="w-full pt-2 flex items-center justify-between border-t border-border/50 shrink-0">
          <div className="flex flex-col items-start">
            <span className="text-[7px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Memori</span>
            <span className={`text-[9px] font-black uppercase ${memory.color.split(' ')[0]}`}>
              {memory.label}
            </span>
          </div>
          {srsState && (
            <div className="flex flex-col items-end">
              <span className="text-[7px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Interval</span>
              <span className="text-[9px] font-black text-foreground">{srsState.interval} Hari</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

