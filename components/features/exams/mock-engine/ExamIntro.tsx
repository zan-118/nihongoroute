import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { ExamData, GameState } from "./types";

interface ExamIntroProps {
  exam: ExamData;
  setGameState: (state: GameState) => void;
  backLink: string;
}

export function ExamIntro({ exam, setGameState, backLink }: ExamIntroProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto p-8 md:p-12 text-center mt-6 md:mt-12 relative overflow-hidden neo-card rounded-[3rem] border border-border bg-card shadow-2xl transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-24 h-24 mx-auto neo-inset flex items-center justify-center rounded-[2rem] mb-8 bg-muted/50 border border-border shadow-none">
        <AlertCircle
          size={40}
          className="text-amber-500 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        />
      </Card>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight mb-8 leading-tight relative z-10">
        {exam.title}
      </h1>

      <Card className="neo-inset p-6 md:p-8 rounded-2xl mb-8 text-left space-y-5 relative z-10 bg-muted/30 border border-border shadow-none">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total Soal
          </span>
          <Badge variant="ghost" className="font-mono font-bold text-foreground text-sm md:text-base">
            {exam.questions.length} Soal
          </Badge>
        </div>
        <div className="flex justify-between items-center border-b border-border pb-4">
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Batas Waktu
          </span>
          <Badge variant="ghost" className="font-mono font-bold text-red-600 dark:text-red-400 text-sm md:text-base">
            {exam.timeLimit} Menit
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Target Pass
          </span>
          <Badge variant="ghost" className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm md:text-base">
            {exam.passingScore} / 180
          </Badge>
        </div>
      </Card>

      <p className="text-[9px] text-muted-foreground mb-10 font-bold uppercase tracking-widest leading-relaxed px-2 relative z-10">
        Ingat ya: Sistem deteksi kecurangan lagi aktif nih. Khusus bagian Mendengar (Choukai), audionya cuma bisa diputar SEKALI dan gak bisa diulang. Fokus ya!
      </p>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <Button
          asChild
          variant="ghost"
          className="neo-inset w-full hover:bg-background text-muted-foreground hover:text-foreground font-black uppercase tracking-widest h-auto py-5 px-6 rounded-xl transition-all text-[10px] sm:text-xs border border-border bg-muted/50 shadow-none"
        >
          <Link href={backLink}>
            ← Nanti Saja
          </Link>
        </Button>
        <Button
          onClick={() => setGameState("playing")}
          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-white text-white dark:text-black font-black uppercase tracking-widest h-auto py-5 px-10 rounded-xl transition-all shadow-lg active:scale-95 text-[10px] sm:text-xs border-none"
        >
          Mulai Sekarang
        </Button>
      </div>
    </Card>
  );
}
