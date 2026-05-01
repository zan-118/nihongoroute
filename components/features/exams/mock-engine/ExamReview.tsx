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
    <div className="w-full pb-20 max-w-4xl mx-auto">
      <header className="relative z-20 flex justify-between items-center mb-10">
        <Card className="flex-1 flex justify-between items-center p-5 sm:p-8 mt-6 md:mt-10 border-white/5 bg-cyber-surface rounded-3xl neo-card shadow-none">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">
              Exam <span className="text-amber-500">Review</span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Pembahasan Detail Soal</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setGameState("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[9px] sm:text-[10px] neo-inset hover:bg-white hover:text-black text-slate-200 px-5 py-3 h-auto font-black uppercase tracking-widest transition-all border-white/5 bg-black/20 shadow-none rounded-xl"
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
              <Card className={`p-8 md:p-12 neo-card rounded-[3rem] border-white/5 bg-cyber-surface shadow-none ${isCorrect ? "border-emerald-500/20" : "border-red-500/20"}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10 border-b border-white/5 pb-8">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono font-black uppercase tracking-widest neo-inset px-4 py-2 text-slate-300 w-fit rounded-xl bg-black/20 border-white/5 h-auto"
                  >
                    SOAL {idx + 1} • {SECTION_LABELS[q.section]}
                  </Badge>
                  {isCorrect ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 neo-inset rounded-xl h-auto font-black uppercase text-[10px] italic tracking-widest">
                      <CheckCircle size={14} className="mr-2" /> Benar
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-2 neo-inset rounded-xl h-auto font-black uppercase text-[10px] italic tracking-widest">
                      <XCircle size={14} className="mr-2" /> Salah
                    </Badge>
                  )}
                </div>

                {q.questionText && (
                  <div
                    className="text-lg md:text-2xl text-white font-medium leading-relaxed mb-10 font-japanese prose-custom bg-black/10 p-6 rounded-2xl border border-white/5 neo-inset"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />
                )}

                {q.imageUrl && (
                  <div className="mb-10 rounded-3xl overflow-hidden neo-inset p-3 bg-black/20 border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="Ilustrasi Soal"
                      className="w-full max-h-[400px] object-contain opacity-90 rounded-2xl"
                    />
                  </div>
                )}

                {q.audioUrl && (
                  <Card className="mb-10 p-6 neo-inset border-white/5 bg-black/30 flex flex-col gap-4 shadow-none rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] flex items-center gap-2">
                      <Volume2 size={16} className="text-cyan-400" /> Audio Track (Review)
                    </p>
                    <audio
                      controls
                      className="w-full h-12 outline-none opacity-90 contrast-125 invert"
                      src={q.audioUrl}
                    />
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correctAnswer;
                    const isUserSelection = optIdx === userAnswer;
                    
                    let variantStyle = "bg-black/10 border-white/5 opacity-50";
                    if (isCorrectAnswer) variantStyle = "bg-emerald-500/10 border-emerald-500/30 text-white opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                    else if (isUserSelection) variantStyle = "bg-red-500/10 border-red-500/30 text-white opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]";

                    return (
                      <Card
                        key={optIdx}
                        className={`p-6 flex items-center gap-5 transition-all rounded-2xl border neo-inset shadow-none ${variantStyle}`}
                      >
                        <Badge variant="outline" className={`font-mono font-black text-xs h-8 w-8 rounded-lg flex items-center justify-center border-none ${isCorrectAnswer ? "bg-emerald-500 text-black" : isUserSelection ? "bg-red-500 text-black" : "bg-white/5 text-slate-500"}`}>
                          {optIdx + 1}
                        </Badge>
                        <span className="text-base md:text-xl font-japanese font-medium leading-tight flex-1">
                          {opt}
                        </span>
                        {isCorrectAnswer && (
                          <CheckCircle
                            size={24}
                            className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                          />
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <XCircle
                            size={24}
                            className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
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
