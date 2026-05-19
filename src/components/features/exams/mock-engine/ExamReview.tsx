import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";
import { ExamData, GameState } from "./types";
import { SECTION_LABELS } from "./constants";

interface ExamReviewProps {
  exam: ExamData;
  answers: Record<string, number>;
  setGameState: (state: GameState) => void;
}

export function ExamReview({ exam, answers, setGameState }: ExamReviewProps) {
  // Gunakan useTheme agar reactive terhadap perubahan tema dan SSR-safe
  const { resolvedTheme } = useTheme();
  return (
    <div className="w-full pb-20 max-w-4xl mx-auto transition-colors duration-300">
      <header className="relative z-20 flex justify-between items-center mb-10">
        <Card className="flex-1 flex justify-between items-center p-5 sm:p-8 mt-6 md:mt-10 border border-border bg-card bg-background rounded-3xl neo-card shadow-lg">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight leading-none">
              Tinjau <span className="text-warning text-warning">Jawaban</span>
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Yuk, cek detail jawabannya!</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setGameState("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-xs sm:text-xs neo-inset hover:bg-background text-muted-foreground hover:text-foreground px-5 py-3 h-auto font-black uppercase tracking-widest transition-all border border-border bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.2)] shadow-none rounded-xl"
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
              <Card className={`p-8 md:p-12 neo-card rounded-[3rem] border border-border bg-card bg-background shadow-2xl transition-colors ${isCorrect ? "border-success/20" : "border-destructive/20"}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10 border-b border-border pb-8">
                  <Badge
                    variant="outline"
                    className="text-xs font-bold uppercase tracking-widest neo-inset px-4 py-2 text-muted-foreground w-fit rounded-xl bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.2)] border border-border h-auto"
                  >
                    SOAL {idx + 1} • {SECTION_LABELS[q.section]}
                  </Badge>
                  {isCorrect ? (
                    <Badge className="bg-success/10 text-success text-success border-success/20 px-4 py-2 neo-inset rounded-xl h-auto font-bold uppercase text-xs tracking-widest">
                      <CheckCircle size={14} aria-hidden="true" className="mr-2" /> Benar
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive text-destructive border-destructive/20 px-4 py-2 neo-inset rounded-xl h-auto font-bold uppercase text-xs tracking-widest">
                      <XCircle size={14} aria-hidden="true" className="mr-2" /> Salah
                    </Badge>
                  )}
                </div>

                {q.questionText && (
                  <div
                    className="text-lg md:text-2xl text-foreground font-medium leading-relaxed mb-10 font-japanese prose-custom bg-[rgba(var(--muted-rgb),0.3)] dark:bg-[rgba(var(--background-rgb),0.1)] p-6 rounded-2xl border border-border neo-inset"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />
                )}

                {q.imageUrl && (
                  <div className="mb-10 rounded-3xl overflow-hidden neo-inset p-3 bg-[rgba(var(--muted-rgb),0.2)] dark:bg-[rgba(var(--background-rgb),0.2)] border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="Gambar Pendukung"
                      className="w-full max-h-[400px] object-contain opacity-90 rounded-2xl"
                    />
                  </div>
                )}

                {q.audioUrl && (
                  <Card className="mb-10 p-6 neo-inset border border-border bg-[rgba(var(--muted-rgb),0.2)] dark:bg-[rgba(var(--background-rgb),0.3)] flex flex-col gap-4 shadow-none rounded-2xl">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                      <Volume2 size={16} aria-hidden="true" className="text-primary" /> Audio Track (Review)
                    </p>
                    <audio
                      controls
                      className={`w-full h-12 outline-none opacity-90 transition-all ${resolvedTheme === 'dark' ? 'invert' : ''}`}
                      src={q.audioUrl}
                    />
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correctAnswer;
                    const isUserSelection = optIdx === userAnswer;
                    
                    let variantStyle = "bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.1)] border-border opacity-60";
                    if (isCorrectAnswer) variantStyle = "bg-success/10 border-success/30 text-foreground text-foreground opacity-100 shadow-sm";
                    else if (isUserSelection) variantStyle = "bg-destructive/10 border-destructive/30 text-foreground text-foreground opacity-100 shadow-sm";

                    return (
                      <Card
                        key={optIdx}
                        className={`p-6 flex items-center gap-5 transition-all rounded-2xl border neo-inset shadow-none ${variantStyle}`}
                      >
                        <Badge variant="outline" className={`font-mono font-black text-xs h-8 w-8 rounded-lg flex items-center justify-center border-none ${isCorrectAnswer ? "bg-success text-success-foreground" : isUserSelection ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>
                          {optIdx + 1}
                        </Badge>
                        <span className="text-base md:text-xl font-japanese font-medium leading-tight flex-1">
                          {opt}
                        </span>
                        {isCorrectAnswer && (
                          <CheckCircle
                            size={24}
                            aria-hidden="true"
                            className="text-success text-success drop-shadow-sm"
                          />
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <XCircle
                            size={24}
                            aria-hidden="true"
                            className="text-destructive text-destructive drop-shadow-sm"
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
