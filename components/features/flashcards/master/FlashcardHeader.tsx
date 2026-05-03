import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Check, X } from "lucide-react";
import { StudyMode } from "./types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface FlashcardHeaderProps {
  isFixedMode: boolean;
  studyMode: StudyMode;
  setStudyMode: (mode: StudyMode) => void;
  setIsFlipped: (flipped: boolean) => void;
  currentIndex: number;
  totalCards: number;
  themeColor: string;
  themeBgColor: string;
  themeShadow: string;
  router: AppRouterInstance;
}

export function FlashcardHeader({
  isFixedMode,
  studyMode,
  setStudyMode,
  setIsFlipped,
  currentIndex,
  totalCards,
  themeColor,
  themeBgColor,
  themeShadow,
  router,
}: FlashcardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-10">
      <div className="flex justify-between items-center gap-3">
        {!isFixedMode && (
          <Card className="flex-1 flex justify-between items-center bg-muted/50 p-1.5 rounded-xl md:rounded-2xl border-border shadow-none">
            <Button
              variant="ghost"
              onClick={() => {
                setStudyMode("latihan");
                setIsFlipped(false);
              }}
              className={`flex-1 rounded-lg md:rounded-xl h-10 md:h-12 text-xs md:text-xs font-bold uppercase tracking-widest transition-all ${
                studyMode === "latihan"
                  ? "bg-background dark:bg-white/10 text-foreground dark:text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Pemanasan
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStudyMode("ujian");
                setIsFlipped(false);
              }}
              className={`flex-1 rounded-lg md:rounded-xl h-10 md:h-12 text-xs md:text-xs font-bold uppercase tracking-widest transition-all ${
                studyMode === "ujian"
                  ? `${themeBgColor} text-black ${themeShadow} hover:bg-white`
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Check size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Uji Hafalan
            </Button>
          </Card>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted/50 hover:bg-rose-500 hover:text-white transition-all border border-border"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 md:gap-3">
            <Badge
              variant="outline"
              className={`${themeColor} text-xs md:text-xs uppercase tracking-widest font-bold border-border h-auto bg-muted/50 px-3 py-1 md:px-4 md:py-1.5`}
            >
              {studyMode === "latihan" ? "Mode Santai" : "Mode Ujian"}
            </Badge>
            <span className="text-xs md:text-xs text-slate-500 font-bold uppercase tracking-widest hidden sm:inline opacity-80">
              {studyMode === "latihan" ? "Belajar Santai" : "Kumpulkan XP"}
            </span>
          </div>
          <Badge variant="ghost" className="text-muted-foreground font-mono text-xs md:text-sm font-bold bg-muted/50 px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl border border-border h-auto">
            {currentIndex + 1} <span className="opacity-30 mx-1">/</span> {totalCards}
          </Badge>
        </div>
        <Progress
          value={((currentIndex + 1) / totalCards) * 100}
          className="h-1.5 md:h-2 bg-muted/50 border-none"
          indicatorClassName={`${themeBgColor} shadow-[0_0_10px_rgba(0,238,255,0.5)]`}
        />
      </div>
    </header>
  );
}
