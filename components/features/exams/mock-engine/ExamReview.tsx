import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { ExamData, GameState } from "./types";
import { SECTION_LABELS } from "./constants";

interface ExamReviewProps {
  exam: ExamData;
  answers: Record<string, number>;
  setGameState: (state: GameState) => void;
}

export function ExamReview({ exam, answers, setGameState }: ExamReviewProps) {
  return (
    <div className="w-full pb-20 max-w-4xl mx-auto transition-colors duration-300">
      <header className="relative z-20 flex justify-between items-center mb-10">
        <Card className="flex-1 flex justify-between items-center p-5 sm:p-8 mt-6 md:mt-10 border border-border dark:border-white/5 bg-card dark:bg-slate-900 rounded-3xl neo-card shadow-lg">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight leading-none">
              Tinjau <span className="text-amber-600 dark:text-amber-500">Jawaban</span>
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Yuk, cek detail jawabannya!</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setGameState("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-xs sm:text-xs neo-inset hover:bg-background text-muted-foreground hover:text-foreground px-5 py-3 h-auto font-black uppercase tracking-widest transition-all border border-border bg-muted/50 dark:bg-black/20 shadow-none rounded-xl"
          >
            ← Kembali
          </Button>
        </Card>
      </header>

      <div className="space-y-10 md:space-y-16">
        {exam.questions.map((q, idx) => {
          const userAnswer = answers[q._key];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              key={q._key}
              className="w-full"
            >
              <Card className={`p-8 md:p-12 neo-card rounded-[3rem] border border-border dark:border-white/5 bg-card dark:bg-slate-900 shadow-2xl transition-colors ${isCorrect ? "border-emerald-500/20" : "border-red-500/20"}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10 border-b border-border dark:border-white/5 pb-8">
                  <Badge
                    variant="outline"
                    className="text-xs font-bold uppercase tracking-widest neo-inset px-4 py-2 text-muted-foreground w-fit rounded-xl bg-muted/50 dark:bg-black/20 border border-border dark:border-white/5 h-auto"
                  >
                    SOAL {idx + 1} • {SECTION_LABELS[q.section]}
                  </Badge>
                  {isCorrect ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-4 py-2 neo-inset rounded-xl h-auto font-bold uppercase text-xs tracking-widest">
                      <CheckCircle size={14} className="mr-2" /> Benar
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20 px-4 py-2 neo-inset rounded-xl h-auto font-bold uppercase text-xs tracking-widest">
                      <XCircle size={14} className="mr-2" /> Salah
                    </Badge>
                  )}
                </div>

                {q.questionText && (
                  <div
                    className="text-lg md:text-2xl text-foreground font-medium leading-relaxed mb-10 font-japanese prose-custom bg-muted/30 dark:bg-black/10 p-6 rounded-2xl border border-border dark:border-white/5 neo-inset"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />
                )}

                {q.imageUrl && (
                  <div className="mb-10 rounded-3xl overflow-hidden neo-inset p-3 bg-muted/20 dark:bg-black/20 border border-border dark:border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="Gambar Pendukung"
                      className="w-full max-h-[400px] object-contain opacity-90 rounded-2xl"
                    />
                  </div>
                )}

                {q.audioUrl && (
                  <Card className="mb-10 p-6 neo-inset border border-border dark:border-white/5 bg-muted/20 dark:bg-black/30 flex flex-col gap-4 shadow-none rounded-2xl">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                      <Volume2 size={16} className="text-primary" /> Audio Track (Review)
                    </p>
                    <audio
                      controls
                      className={`w-full h-12 outline-none opacity-90 transition-all ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'invert' : ''}`}
                      src={q.audioUrl}
                    />
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correctAnswer;
                    const isUserSelection = optIdx === userAnswer;
                    
                    let variantStyle = "bg-muted/50 dark:bg-black/10 border-border dark:border-white/5 opacity-60";
                    if (isCorrectAnswer) variantStyle = "bg-emerald-500/10 border-emerald-500/30 text-foreground dark:text-white opacity-100 shadow-sm";
                    else if (isUserSelection) variantStyle = "bg-red-500/10 border-red-500/30 text-foreground dark:text-white opacity-100 shadow-sm";

                    return (
                      <Card
                        key={optIdx}
                        className={`p-6 flex items-center gap-5 transition-all rounded-2xl border neo-inset shadow-none ${variantStyle}`}
                      >
                        <Badge variant="outline" className={`font-mono font-black text-xs h-8 w-8 rounded-lg flex items-center justify-center border-none ${isCorrectAnswer ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black" : isUserSelection ? "bg-red-600 dark:bg-red-500 text-white dark:text-black" : "bg-muted dark:bg-white/5 text-muted-foreground"}`}>
                          {optIdx + 1}
                        </Badge>
                        <span className="text-base md:text-xl font-japanese font-medium leading-tight flex-1">
                          {opt}
                        </span>
                        {isCorrectAnswer && (
                          <CheckCircle
                            size={24}
                            className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                          />
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <XCircle
                            size={24}
                            className="text-red-600 dark:text-red-500 drop-shadow-sm"
                          />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
