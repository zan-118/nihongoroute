/**
 * @file MockExamEngine.tsx
 * @description Mesin simulasi ujian JLPT utama.
 * Fitur: Anti-cheat, Audio Choukai (1x play), Auto-timer, Encoding Hasil (Base64).
 * @module MockExamEngine
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trophy,
  Skull,
  Volume2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ======================
// CONSTANTS / TYPES
// ======================

/**
 * Representasi data untuk setiap butir pertanyaan dalam ujian.
 */
export interface ExamQuestion {
  _key: string;
  section: "vocabulary" | "grammar" | "reading" | "listening";
  questionText?: string;
  imageUrl?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: number;
}

/**
 * Konfigurasi utama parameter ujian.
 */
export interface ExamData {
  _id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
  categorySlug?: string;
  questions: ExamQuestion[];
}

interface MockExamEngineProps {
  exam: ExamData;
}

const SECTION_LABELS = {
  vocabulary: "Kosakata & Kanji (Moji/Goi)",
  grammar: "Tata Bahasa (Bunpou)",
  listening: "Mendengar (Choukai)",
  reading: "Membaca (Dokkai)",
};

type AudioState = "idle" | "playing" | "played";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen MockExamEngine: Mengelola seluruh siklus simulasi ujian.
 * 
 * @param {MockExamEngineProps} props - Properti komponen.
 * @returns {JSX.Element} Antarmuka ujian.
 */
export default function MockExamEngine({ exam }: MockExamEngineProps) {
  // State Management
  const [gameState, setGameState] = useState<
    "intro" | "playing" | "result" | "review"
  >("intro");
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Status Pemutaran Audio & Anti-Cheat
  const [audioStatus, setAudioStatus] = useState<Record<string, AudioState>>(
    {},
  );
  const [cheatWarnings, setCheatWarnings] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSavedScore = useRef(false);

  const backLink = exam.categorySlug
    ? `/courses/${exam.categorySlug}`
    : "/courses";

  // ======================
  // BUSINESS LOGIC / EFFECTS
  // ======================

  // ANTI-CHEAT LOGIC
  useEffect(() => {
    if (gameState !== "playing") return;

    let cheatTimer: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Grace period 1.5s
        cheatTimer = setTimeout(() => {
          setCheatWarnings((prev) => prev + 1);
          alert(
            "PERINGATAN: Jangan meninggalkan halaman ujian! Aktivitas Anda dicatat.",
          );
        }, 1500);
      } else {
        clearTimeout(cheatTimer);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      clearTimeout(cheatTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [gameState]);

  // TIMER LOGIC
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // RESULT EFFECTS (Confetti)
  useEffect(() => {
    if (gameState === "result" && !hasSavedScore.current) {
      hasSavedScore.current = true;
      const { finalScore } = calculateScore();
      const isPassed = finalScore >= exam.passingScore;

      if (isPassed) {
        // Confetti removed for performance
      }
    }
  }, [gameState, exam.passingScore, exam.questions.length]);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Menangani pemutaran audio Choukai (1x play).
   */
  const handlePlayAudio = () => {
    const activeQuestion = exam.questions[currentQuestionIndex];
    const qKey = activeQuestion._key;
    const currentStatus = audioStatus[qKey] || "idle";

    if (currentStatus === "played" || currentStatus === "playing") return;

    if (audioRef.current && activeQuestion.audioUrl) {
      audioRef.current.src = activeQuestion.audioUrl;
      audioRef.current
        .play()
        .catch((err) => console.error("Gagal memutar audio", err));

      setAudioStatus((prev) => ({ ...prev, [qKey]: "playing" }));

      audioRef.current.onended = () => {
        setAudioStatus((prev) => ({ ...prev, [qKey]: "played" }));
      };
    }
  };

  /**
   * Mengakhiri sesi ujian.
   */
  const finishExam = () => {
    setGameState("result");
    if (audioRef.current) audioRef.current.pause();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Menyimpan jawaban pengguna.
   */
  const handleAnswer = (optionIndex: number) => {
    const question = exam.questions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question._key]: optionIndex }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * Menghitung skor akhir dan statistik per sesi.
   */
  const calculateScore = () => {
    let correctCount = 0;
    const sectionBreakdown: Record<string, { total: number; correct: number }> =
      {
        vocabulary: { total: 0, correct: 0 },
        grammar: { total: 0, correct: 0 },
        reading: { total: 0, correct: 0 },
        listening: { total: 0, correct: 0 },
      };

    exam.questions.forEach((q) => {
      if (!sectionBreakdown[q.section])
        sectionBreakdown[q.section] = { total: 0, correct: 0 };
      sectionBreakdown[q.section].total += 1;
      
      if (answers[q._key] === q.correctAnswer) {
        correctCount++;
        sectionBreakdown[q.section].correct += 1;
      }
    });

    const finalScore = Math.round((correctCount / exam.questions.length) * 180);
    return { correctCount, finalScore, sectionBreakdown };
  };

  /**
   * Memformat detik ke MM:SS.
   */
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  /**
   * Membuat URL hasil untuk dibagikan (Base64).
   */
  const handleShareResult = () => {
    const { finalScore, sectionBreakdown } = calculateScore();
    const isPassed = finalScore >= exam.passingScore;
    const guestId = localStorage.getItem("nihongo_guest_id") || "UNKNOWN_GUEST";

    const shareData = {
      guestId,
      examTitle: exam.title,
      score: finalScore,
      totalQuestions: exam.questions.length,
      passed: isPassed,
      sectionScores: {
        vocabulary:
          sectionBreakdown.vocabulary.total > 0
            ? Math.round(
                (sectionBreakdown.vocabulary.correct /
                  sectionBreakdown.vocabulary.total) *
                  100,
              )
            : 0,
        grammar:
          sectionBreakdown.grammar.total > 0
            ? Math.round(
                (sectionBreakdown.grammar.correct /
                  sectionBreakdown.grammar.total) *
                  100,
              )
            : 0,
        reading:
          sectionBreakdown.reading.total > 0
            ? Math.round(
                (sectionBreakdown.reading.correct /
                  sectionBreakdown.reading.total) *
                  100,
              )
            : 0,
        listening:
          sectionBreakdown.listening.total > 0
            ? Math.round(
                (sectionBreakdown.listening.correct /
                  sectionBreakdown.listening.total) *
                  100,
              )
            : 0,
      },
      date: new Date().toISOString(),
    };

    const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const shareUrl = `${window.location.origin}/share?data=${encodedData}`;

    navigator.clipboard.writeText(shareUrl);
    alert("Link sertifikat berhasil disalin! Silakan bagikan ke teman Anda.");
  };

  // ======================
  // 1. TAMPILAN INTRO
  // ======================
  if (gameState === "intro") {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 md:p-12 text-center mt-6 md:mt-12 relative overflow-hidden neo-card rounded-[3rem] border-white/5 bg-cyber-surface shadow-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

        <Card className="w-24 h-24 mx-auto neo-inset flex items-center justify-center rounded-[2rem] mb-8 bg-black/20 border-white/5 shadow-none">
          <AlertCircle
            size={40}
            className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          />
        </Card>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8 leading-tight relative z-10">
          {exam.title}
        </h1>

        <Card className="neo-inset p-6 md:p-8 rounded-2xl mb-8 text-left space-y-5 relative z-10 bg-black/20 border-white/5 shadow-none">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300">
              Total Soal
            </span>
            <Badge variant="ghost" className="font-mono font-bold text-white text-sm md:text-base">
              {exam.questions.length} Butir
            </Badge>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300">
              Batas Waktu
            </span>
            <Badge variant="ghost" className="font-mono font-bold text-red-400 text-sm md:text-base">
              {exam.timeLimit} Menit
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300">
              Target Pass
            </span>
            <Badge variant="ghost" className="font-mono font-bold text-amber-400 text-sm md:text-base">
              {exam.passingScore} / 180
            </Badge>
          </div>
        </Card>

        <p className="text-[10px] text-slate-400 mb-10 font-mono uppercase tracking-widest leading-relaxed px-2 relative z-10 italic">
          Sistem memiliki fitur Anti-Cheat aktif. Untuk Seksi Mendengar
          (Choukai), audio HANYA DAPAT DIPUTAR SATU KALI dan tidak bisa
          dijeda/diulang.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Button
            asChild
            variant="ghost"
            className="neo-inset w-full hover:bg-white hover:text-black text-slate-200 font-black uppercase tracking-widest h-auto py-5 px-6 rounded-xl transition-all text-[10px] sm:text-xs border-white/5 bg-black/10 shadow-none"
          >
            <Link href={backLink}>
              ← Batal
            </Link>
          </Button>
          <Button
            onClick={() => setGameState("playing")}
            className="w-full bg-red-500 hover:bg-white text-black font-black uppercase tracking-widest h-auto py-5 px-10 rounded-xl transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-95 text-[10px] sm:text-xs border-none"
          >
            Mulai Ujian
          </Button>
        </div>
      </Card>
    );
  }

  // ======================
  // 2. TAMPILAN HASIL
  // ======================
  if (gameState === "result") {
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
            className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 ${isPassed ? "text-emerald-400" : "text-red-500"}`}
          >
            {isPassed ? "Exam Cleared" : "Exam Failed"}
          </h1>
          <Badge variant="ghost" className="text-slate-300 font-mono uppercase tracking-widest text-[10px] md:text-xs mb-10 h-auto">
            {exam.title}
          </Badge>

          {/* Kotak Skor Neumorphic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <Card className="neo-inset p-6 md:p-8 flex flex-col items-center justify-center border-white/5 bg-black/20 shadow-none">
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-3">
                Final Score
              </p>
              <p
                className={`text-4xl md:text-6xl font-black font-mono ${isPassed ? "text-emerald-400" : "text-red-500"}`}
              >
                {finalScore}{" "}
                <span className="text-lg md:text-2xl text-slate-600">/ 180</span>
              </p>
            </Card>
            <Card className="neo-inset p-6 md:p-8 flex flex-col items-center justify-center border-white/5 bg-black/20 shadow-none">
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-3">
                Accuracy
              </p>
              <p className="text-4xl md:text-6xl font-black font-mono text-white">
                {Math.round((correctCount / exam.questions.length) * 100)}%
              </p>
            </Card>
          </div>

          {/* Breakdown Section */}
          <Card className="bg-black/20 p-6 md:p-10 border-white/5 mb-10 text-left rounded-3xl neo-inset shadow-none">
            <h3 className="text-[10px] md:text-xs font-black text-slate-200 uppercase tracking-[0.3em] border-b border-white/5 pb-4 mb-8">
              Analisis Per Sektor
            </h3>
            <div className="space-y-8">
              {Object.entries(sectionBreakdown).map(([sectionKey, data]) => {
                if (data.total === 0) return null;
                const percentage = Math.round(
                  (data.correct / data.total) * 100,
                );
                let indicatorColor = "bg-red-500";
                if (percentage >= 70) indicatorColor = "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
                else if (percentage >= 40) indicatorColor = "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
                else indicatorColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";

                return (
                  <div key={sectionKey}>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                        {
                          SECTION_LABELS[
                            sectionKey as keyof typeof SECTION_LABELS
                          ]
                        }
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
              🔍 Review Jawaban
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

  // ======================
  // 3. TAMPILAN REVIEW
  // ======================
  if (gameState === "review") {
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

                {/* Khusus mode Pembahasan (Review), blok Audio diaktifkan kembali tanpa proteksi Auto-Play agar peserta bisa mempelajari kesalahannya. */}
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

  // ======================
  // 4. TAMPILAN PLAYING
  // ======================
  const activeQuestion = exam.questions[currentQuestionIndex];
  const isTimeCritical = timeLeft < 300;

  // Mendeteksi status soal untuk menerapkan penguncian UI pada saat Sesi Listening berjalan
  const isCurrentlyListening =
    activeQuestion.section === "listening" || !!activeQuestion.audioUrl;

  // Mencegah peserta mundur/curang jika soal sebelumnya adalah soal listening
  const previousQuestionData =
    currentQuestionIndex > 0 ? exam.questions[currentQuestionIndex - 1] : null;
  const isPrevQuestionListening = previousQuestionData
    ? previousQuestionData.section === "listening" ||
      !!previousQuestionData.audioUrl
    : false;

  const disablePreviousButton =
    currentQuestionIndex === 0 ||
    isCurrentlyListening ||
    isPrevQuestionListening;

  return (
    <div className="w-full flex flex-col max-w-5xl mx-auto">
      {/* Audio Element Tersembunyi (Dikontrol secara terpusat oleh fungsi handlePlayAudio) */}
      <audio ref={audioRef} className="hidden" />

      {/* HEADER HUD (HEAD-UP DISPLAY) */}
      <header className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <Card className="w-full flex flex-col md:flex-row justify-between items-start md:items-center p-6 mt-2 md:mt-8 border-white/5 bg-cyber-surface rounded-3xl neo-card shadow-none">
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className="neo-inset px-5 py-2.5 text-slate-300 font-mono text-[10px] md:text-xs font-black bg-black/40 border-white/10 h-auto"
              >
                {currentQuestionIndex + 1} <span className="mx-1 opacity-30">/</span> {exam.questions.length}
              </Badge>
              <Badge
                variant="outline"
                className="neo-inset px-5 py-2.5 text-red-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] bg-red-500/10 border-red-500/30 h-auto italic"
              >
                {SECTION_LABELS[activeQuestion.section]}
              </Badge>
            </div>
            {cheatWarnings > 0 && (
              <Badge variant="ghost" className="text-[9px] text-amber-500 font-black uppercase tracking-widest animate-pulse flex items-center gap-2 p-0 h-auto">
                <ShieldAlert size={14} /> CHEAT ALERT: {cheatWarnings}x
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6">
            <div
              className={`flex items-center gap-4 font-mono text-3xl md:text-5xl font-black px-8 py-3 neo-inset transition-all duration-500 rounded-2xl bg-black/40 border-white/5 ${isTimeCritical ? "text-red-500 !border-red-500/50 animate-pulse shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]" : "text-white"}`}
            >
              <Clock
                size={24}
                className={isTimeCritical ? "text-red-500" : "text-slate-500"}
              />{" "}
              {formatTime(timeLeft)}
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  confirm(
                    "Yakin ingin menyelesaikan ujian sekarang? Skor akan dihitung dari jawaban yang sudah terisi.",
                  )
                )
                  finishExam();
              }}
              className="text-[10px] neo-card border-white/5 bg-black/20 text-slate-400 hover:bg-red-500 hover:text-black font-black uppercase tracking-widest h-auto px-6 py-4 rounded-xl shadow-none transition-all"
            >
              Akhiri
            </Button>
          </div>
        </Card>
      </header>

      {/* KOTAK SOAL UTAMA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full mb-10"
        >
          <Card className="p-8 sm:p-12 md:p-16 flex flex-col neo-card rounded-[3.5rem] border-white/5 bg-cyber-surface shadow-none min-h-[500px]">
          {/* UI AUDIO BARU (Proteksi Auto-Play Dinonaktifkan dengan eksekusi on-click) */}
          {isCurrentlyListening && (
            <Card className="mb-10 p-6 neo-inset border-red-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-none bg-red-500/5 rounded-3xl">
              <Button
                onClick={handlePlayAudio}
                disabled={
                  audioStatus[activeQuestion._key] !== "idle" &&
                  audioStatus[activeQuestion._key] !== undefined
                }
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shrink-0 border-none ${
                  !audioStatus[activeQuestion._key] ||
                  audioStatus[activeQuestion._key] === "idle"
                    ? "bg-red-500 text-white hover:scale-110 shadow-[0_0_25px_rgba(239,68,68,0.5)] cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Volume2
                  size={32}
                  className={
                    audioStatus[activeQuestion._key] === "playing"
                      ? "animate-pulse"
                      : ""
                  }
                />
              </Button>
              <div className="text-center sm:text-left">
                <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] mb-2 text-white italic">
                  {!audioStatus[activeQuestion._key] ||
                  audioStatus[activeQuestion._key] === "idle"
                    ? "Putar Audio Choukai"
                    : audioStatus[activeQuestion._key] === "playing"
                      ? "Audio Sedang Diputar..."
                      : "Pemutaran Audio Selesai"}
                </p>
                <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed uppercase font-black tracking-widest">
                  Perhatian: Audio HANYA BISA DIPUTAR <span className="text-red-500 underline">1 KALI</span>. Pastikan konsentrasi penuh.
                </p>
              </div>
            </Card>
          )}

          {activeQuestion.questionText && (
            <div
              className="text-xl sm:text-2xl md:text-3xl text-white font-medium leading-relaxed mb-12 font-japanese prose-custom bg-black/20 p-8 rounded-3xl border border-white/5 neo-inset"
              dangerouslySetInnerHTML={{ __html: activeQuestion.questionText }}
            />
          )}

          {activeQuestion.imageUrl && (
            <div className="mb-12 rounded-3xl overflow-hidden neo-inset p-3 bg-black/20 border-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeQuestion.imageUrl}
                alt="Ilustrasi Soal"
                className="w-full max-h-[400px] md:max-h-[500px] object-contain opacity-90 rounded-2xl"
              />
            </div>
          )}

          {/* OPSI JAWABAN */}
          <div className="grid grid-cols-1 gap-5 mt-auto">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = answers[activeQuestion._key] === idx;
              return (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={() => handleAnswer(idx)}
                  className={`p-8 md:p-10 rounded-3xl text-left transition-all font-medium h-auto group flex items-center gap-6 border neo-card shadow-none ${
                    isSelected
                      ? "bg-red-500/10 border-red-500/50 text-white neo-inset shadow-none"
                      : "bg-black/20 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <Badge variant="outline" className={`font-mono text-sm font-black transition-colors h-10 w-10 rounded-xl flex items-center justify-center border-none ${isSelected ? "bg-red-500 text-black" : "bg-white/5 text-slate-600 group-hover:text-slate-200"}`}>
                    {idx + 1}
                  </Badge>
                  <span className="leading-tight font-japanese text-lg md:text-2xl flex-1">{opt}</span>
                  {isSelected && <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse" />}
                </Button>
              );
            })}
          </div>
                </Card>
        </motion.div>
      </AnimatePresence>

      {/* NAVIGASI BAWAH */}
      <div className="flex flex-col sm:flex-row justify-between gap-5 pb-20">
        <Button
          variant="ghost"
          onClick={prevQuestion}
          disabled={disablePreviousButton}
          className="w-full sm:w-auto neo-card border-white/5 bg-black/20 px-10 py-8 h-auto text-slate-300 hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all rounded-2xl shadow-none"
        >
          <ArrowLeft size={20} /> Sebelumnya
        </Button>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <Button
            onClick={() => {
              if (confirm("Kirim jawaban sekarang? Waktu masih tersisa."))
                finishExam();
            }}
            className="w-full sm:w-auto bg-amber-500 hover:bg-white text-black px-12 py-8 h-auto flex items-center justify-center font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(245,158,11,0.4)] rounded-2xl border-none transition-all"
          >
            <CheckCircle size={20} className="mr-3" /> Kirim Jawaban Ujian
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            variant="ghost"
            className="w-full sm:w-auto neo-card border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black px-10 py-8 h-auto flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all rounded-2xl shadow-none"
          >
            Selanjutnya <ArrowRight size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
