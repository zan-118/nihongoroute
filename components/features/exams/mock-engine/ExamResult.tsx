import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Skull, Share2 } from "lucide-react";
import Link from "next/link";
import { ExamData, GameState } from "./types";
import { SECTION_LABELS } from "./constants";

interface ExamResultProps {
  exam: ExamData;
  setGameState: (state: GameState) => void;
  backLink: string;
  calculateScore: () => {
    correctCount: number;
    finalScore: number;
    sectionBreakdown: Record<string, { total: number; correct: number }>;
  };
  handleShareResult: () => void;
}

export function ExamResult({
  exam,
  setGameState,
  backLink,
  calculateScore,
  handleShareResult,
}: ExamResultProps) {
  const { correctCount, finalScore, sectionBreakdown } = calculateScore();
  const isPassed = finalScore >= exam.passingScore;

  return (
    <Card className="w-full max-w-3xl mx-auto p-8 md:p-12 text-center relative overflow-hidden mt-6 md:mt-12 neo-card rounded-[3rem] border-white/5 bg-cyber-surface shadow-none">
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] blur-[150px] rounded-full pointer-events-none ${isPassed ? "bg-emerald-500/10" : "bg-red-500/10"}`}
      />

      <div className="relative z-10">
        <Card
          className={`w-28 h-28 mx-auto neo-inset flex items-center justify-center rounded-[2.5rem] mb-8 bg-black/20 border-white/5 shadow-none ${isPassed ? "text-emerald-400" : "text-red-500"}`}
        >
          {isPassed ? (
            <Trophy
              size={48}
              className="drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]"
            />
          ) : (
            <Skull
              size={48}
              className="drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            />
          )}
        </Card>

        <h1
          className={`text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 ${isPassed ? "text-emerald-400" : "text-red-500"}`}
        >
          {isPassed ? "Keren! Kamu Lulus!" : "Jangan Menyerah, Coba Lagi Yuk!"}
        </h1>
        <Badge variant="ghost" className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-10 h-auto">
          {exam.title}
        </Badge>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Card className="neo-inset p-6 md:p-8 flex flex-col items-center justify-center border-white/5 bg-black/20 shadow-none">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-3">
              Skor Akhir
            </p>
            <p
              className={`text-4xl md:text-6xl font-black font-mono ${isPassed ? "text-emerald-400" : "text-red-500"}`}
            >
              {finalScore}{" "}
              <span className="text-lg md:text-2xl text-slate-600">/ 180</span>
            </p>
          </Card>
          <Card className="neo-inset p-6 md:p-8 flex flex-col items-center justify-center border-white/5 bg-black/20 shadow-none">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-3">
              Akurasi
            </p>
            <p className="text-4xl md:text-6xl font-black font-mono text-white">
              {Math.round((correctCount / exam.questions.length) * 100)}%
            </p>
          </Card>
        </div>

        <Card className="bg-black/20 p-6 md:p-10 border-white/5 mb-10 text-left rounded-3xl neo-inset shadow-none">
          <h3 className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-8">
            Gimana Hasil Tiap Bagian?
          </h3>
          <div className="space-y-8">
            {Object.entries(sectionBreakdown).map(([sectionKey, data]) => {
              if (data.total === 0) return null;
              const percentage = Math.round((data.correct / data.total) * 100);
              let indicatorColor = "bg-red-500";
              if (percentage >= 70) indicatorColor = "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
              else if (percentage >= 40) indicatorColor = "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
              else indicatorColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";

              return (
                <div key={sectionKey}>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {SECTION_LABELS[sectionKey as keyof typeof SECTION_LABELS]}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono font-bold text-slate-300 border-white/10 neo-inset h-auto px-2">
                      {data.correct} / {data.total}
                    </Badge>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 bg-[#080a0f] border-none"
                    indicatorClassName={indicatorColor}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={handleShareResult}
            className="w-full bg-red-500 hover:bg-white text-black font-black uppercase tracking-widest h-auto py-5 px-6 rounded-xl text-[10px] md:text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] border-none"
          >
            <Share2 size={16} className="mr-2" /> Bagikan Hasil
          </Button>
          <Button
            onClick={() => {
              setGameState("review");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            variant="ghost"
            className="w-full neo-card border-white/5 bg-black/20 text-amber-500 hover:bg-amber-500 hover:text-black font-black uppercase tracking-widest h-auto py-5 px-6 rounded-xl flex justify-center items-center gap-2 transition-all text-[10px] md:text-xs shadow-none"
          >
            🔍 Cek Kesalahanmu
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full neo-card text-slate-200 border-white/5 bg-black/20 hover:bg-white hover:text-black font-black uppercase tracking-widest h-auto py-5 px-6 rounded-xl flex justify-center items-center transition-all text-[10px] md:text-xs shadow-none"
          >
            <Link href={backLink}>
              Selesai
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
