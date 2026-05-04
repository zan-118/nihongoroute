import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointer2, CheckCircle2, XCircle } from "lucide-react";
import { FlashcardThemeContext } from "./types";
import { Input } from "@/components/ui/input";
import * as wanakana from "wanakana";

interface FlashcardFrontProps {
  word: string;
  themeContext: FlashcardThemeContext;
  studyMode?: "latihan" | "ujian" | "tantangan";
  userInput?: string;
  onUserInputChange?: (val: string) => void;
  isAnswerChecked?: boolean;
  inputResult?: "correct" | "wrong" | null;
  srsState?: {
    interval: number;
    repetition: number;
    easeFactor: number;
    nextReview: number;
  };
}

export function FlashcardFront({ 
  word, 
  themeContext, 
  studyMode,
  userInput = "",
  onUserInputChange,
  isAnswerChecked,
  inputResult,
  srsState,
}: FlashcardFrontProps) {
  const { isKanji, themeColor, themeBorder, themeShadow } = themeContext;

  const isChallenge = studyMode === "tantangan";

  const getMastery = (interval: number = 0) => {
    if (interval <= 1) return { icon: "🌱", label: "Learning" };
    if (interval <= 5) return { icon: "🌿", label: "Familiar" };
    if (interval <= 14) return { icon: "🔥", label: "Solid" };
    return { icon: "💎", label: "Master" };
  };

  const mastery = getMastery(srsState?.interval);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Auto convert to Hiragana if it's Japanese input
    const converted = wanakana.toHiragana(val);
    onUserInputChange?.(converted);
  };

  return (
    <Card
      className={`absolute inset-0 w-full h-full border rounded-2xl flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-500 shadow-none overflow-hidden bg-card dark:bg-[#0a0c10] ${
        inputResult === "correct" 
          ? "border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-emerald-500/[0.02]" 
          : inputResult === "wrong"
          ? "border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] bg-red-500/[0.02]"
          : `${themeBorder} ${themeShadow}`
      }`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* Dynamic Glow Layer */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none opacity-20 ${
          inputResult === "correct" ? "bg-emerald-500 blur-[120px]" : inputResult === "wrong" ? "bg-red-500 blur-[120px]" : "opacity-0"
        }`} 
      />

      <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 blur-[80px] md:blur-[100px] rounded-full opacity-10 pointer-events-none ${isKanji ? 'bg-purple-500' : 'bg-primary'}`} />

      <Badge
        variant="outline"
        className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground border-border dark:border-white/[0.08] px-4 md:px-5 py-1.5 rounded-lg bg-muted dark:bg-black/20 h-auto whitespace-nowrap"
      >
        {isChallenge ? "Tantangan Produksi" : isKanji ? "Karakter Kanji" : "Kosakata Utama"}
      </Badge>

      <div className="absolute top-6 md:top-8 right-6 md:right-8 flex flex-col items-end gap-1 opacity-60">
        <span className="text-lg md:text-xl">{mastery.icon}</span>
        <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">{mastery.label}</span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full space-y-8">
        <h2
          className={`${word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight font-japanese leading-tight transition-all duration-300 drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
        >
          {word}
        </h2>

        {isChallenge && (
          <div className="w-full max-w-[280px] space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <Input
                value={userInput}
                onChange={handleInputChange}
                disabled={isAnswerChecked && inputResult === "correct"}
                placeholder="Ketik bacaan..."
                className={`h-14 bg-muted/50 border-2 text-center text-lg font-bold rounded-xl transition-all ${
                  inputResult === "correct" 
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" 
                    : inputResult === "wrong"
                    ? "border-red-500 bg-red-500/10 text-red-600"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {inputResult === "correct" && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
                {inputResult === "wrong" && <XCircle className="text-red-500 w-6 h-6" />}
              </div>
            </div>
            
            <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              {isAnswerChecked && inputResult === "wrong" ? "Coba lagi atau tekan Periksa" : "Tekan Enter untuk memeriksa"}
            </p>
          </div>
        )}
      </div>

      {!isChallenge && (
        <div className="absolute bottom-6 md:bottom-8 flex flex-col items-center gap-1.5">
           <MousePointer2 size={16} className={`${themeColor} opacity-40 animate-bounce`} />
           <p className={`${themeColor} opacity-40 text-xs font-bold uppercase tracking-widest`}>
             Ketuk untuk Melihat Arti
           </p>
        </div>
      )}
    </Card>
  );
}
