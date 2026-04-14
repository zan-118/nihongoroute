"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

export interface ExamQuestion {
  _key: string;
  section: "vocabulary" | "grammar" | "reading" | "listening";
  questionText?: string;
  imageUrl?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: number;
}

export interface ExamData {
  _id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
  questions: ExamQuestion[];
}

interface MockExamEngineProps {
  exam: ExamData;
}

const SECTION_LABELS = {
  vocabulary: "Kosakata & Kanji (Moji/Goi)",
  grammar: "Tata Bahasa (Bunpou)",
  reading: "Membaca (Dokkai)",
  listening: "Mendengar (Choukai)",
};

export default function MockExamEngine({ exam }: MockExamEngineProps) {
  const [gameState, setGameState] = useState<
    "intro" | "playing" | "result" | "review"
  >("intro");
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [cheatWarnings, setCheatWarnings] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSavedScore = useRef(false);

  useEffect(() => {
    if (gameState !== "playing") return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setCheatWarnings((prev) => prev + 1);
        alert(
          "PERINGATAN: Jangan meninggalkan halaman ujian! Aktivitas Anda dicatat.",
        );
      }
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [gameState]);

  useEffect(() => {
    const activeQuestion = exam.questions[currentQuestionIndex];
    if (
      gameState === "playing" &&
      activeQuestion.section === "listening" &&
      activeQuestion.audioUrl
    ) {
      if (audioRef.current) {
        audioRef.current.src = activeQuestion.audioUrl;
        audioRef.current
          .play()
          .catch((err) => console.log("User must interact first:", err));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [currentQuestionIndex, gameState, exam.questions]);

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

  useEffect(() => {
    if (gameState === "result" && !hasSavedScore.current) {
      hasSavedScore.current = true;
      const { finalScore, sectionBreakdown } = calculateScore();
      const isPassed = finalScore >= exam.passingScore;
      const guestId =
        localStorage.getItem("nihongo_guest_id") || "UNKNOWN_GUEST";
      const formattedSectionScores = {
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
      };

      fetch("/api/exam-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          examTitle: exam.title,
          score: finalScore,
          totalQuestions: exam.questions.length,
          passed: isPassed,
          sectionScores: formattedSectionScores,
        }),
      }).catch((err) => console.error("Gagal mengirim riwayat ujian:", err));

      if (isPassed) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };
        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
          });
        }, 250);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, exam.passingScore, exam.title, exam.questions.length]);

  const finishExam = () => {
    setGameState("result");
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (optionIndex: number) => {
    const question = exam.questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [question._key]: optionIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // FUNGSI INI BERNAMA prevQuestion
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

    const maxScore = 180;
    const finalScore = Math.round(
      (correctCount / exam.questions.length) * maxScore,
    );
    return { correctCount, finalScore, sectionBreakdown };
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (gameState === "intro") {
    return (
      <div className="w-full max-w-2xl mx-auto bg-cyber-surface p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl text-center mt-6 md:mt-12">
        <AlertCircle
          size={64}
          className="mx-auto text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-tight">
          {exam.title}
        </h1>
        <div className="bg-[#0a0c10]/50 p-6 rounded-2xl border border-white/5 mb-8 text-left space-y-4 shadow-inner">
          <p className="text-[#c4cfde] flex justify-between border-b border-white/5 pb-3">
            <span className="opacity-60 text-sm">Total Soal:</span>
            <span className="font-bold text-white text-sm">
              {exam.questions.length} Butir
            </span>
          </p>
          <p className="text-[#c4cfde] flex justify-between border-b border-white/5 pb-3">
            <span className="opacity-60 text-sm">Batas Waktu:</span>
            <span className="font-bold text-amber-500 text-sm">
              {exam.timeLimit} Menit
            </span>
          </p>
          <p className="text-[#c4cfde] flex justify-between">
            <span className="opacity-60 text-sm">Target Kelulusan:</span>
            <span className="font-bold text-cyan-400 text-sm">
              {exam.passingScore} / 180
            </span>
          </p>
        </div>
        <p className="text-[10px] sm:text-xs text-white/40 mb-8 font-mono uppercase tracking-widest leading-relaxed px-2">
          Peringatan: Jika timer habis, ujian otomatis diselesaikan. Pastikan
          audio perangkat menyala untuk sesi Choukai (Mendengar). Seksi
          Mendengar hanya diputar sekali dan tidak bisa diulang. Dilarang
          meninggalkan tab selama ujian.
        </p>
        <button
          onClick={() => setGameState("playing")}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest py-4 px-10 rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 text-xs sm:text-sm"
        >
          Mulai Ujian
        </button>
      </div>
    );
  }

  if (gameState === "result") {
    const { correctCount, finalScore, sectionBreakdown } = calculateScore();
    const isPassed = finalScore >= exam.passingScore;

    return (
      <div className="w-full max-w-3xl mx-auto bg-cyber-surface p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border shadow-2xl text-center relative overflow-hidden mt-6 md:mt-12">
        {isPassed ? (
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
        ) : (
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        )}

        <div className="relative z-10">
          {isPassed ? (
            <Trophy
              size={80}
              className="mx-auto text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]"
            />
          ) : (
            <Skull
              size={80}
              className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            />
          )}

          <h1
            className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 ${isPassed ? "text-emerald-400" : "text-red-500"}`}
          >
            {isPassed ? "Exam Cleared!" : "Exam Failed"}
          </h1>
          <p className="text-white/50 font-mono uppercase tracking-widest text-[10px] md:text-sm mb-8">
            {exam.title}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0a0c10]/50 p-6 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-white/40 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2">
                Final Score
              </p>
              <p
                className={`text-3xl md:text-4xl font-black ${isPassed ? "text-emerald-400" : "text-red-400"}`}
              >
                {finalScore}{" "}
                <span className="text-sm md:text-lg text-white/20">/ 180</span>
              </p>
            </div>
            <div className="bg-[#0a0c10]/50 p-6 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-white/40 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2">
                Accuracy
              </p>
              <p className="text-3xl md:text-4xl font-black text-white">
                {Math.round((correctCount / exam.questions.length) * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-cyber-surface/50 p-6 rounded-2xl border border-white/5 mb-10 text-left">
            <h3 className="text-xs md:text-sm font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-3 mb-5 flex items-center gap-2">
              📊 Analisis Bagian
            </h3>
            <div className="space-y-5">
              {Object.entries(sectionBreakdown).map(([sectionKey, data]) => {
                if (data.total === 0) return null;
                const percentage = Math.round(
                  (data.correct / data.total) * 100,
                );

                let colorClass =
                  "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
                if (percentage >= 70)
                  colorClass =
                    "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
                else if (percentage >= 40)
                  colorClass =
                    "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]";

                return (
                  <div key={sectionKey}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest">
                        {
                          SECTION_LABELS[
                            sectionKey as keyof typeof SECTION_LABELS
                          ]
                        }
                      </span>
                      <span className="text-[9px] md:text-[10px] font-mono text-white/50">
                        {data.correct}/{data.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#0a0c10] rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${colorClass}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setGameState("review");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-black uppercase tracking-widest py-4 px-8 rounded-xl transition-all text-xs"
            >
              🔍 Review Jawaban
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-4 px-8 rounded-xl transition-all text-xs flex items-center justify-center"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "review") {
    return (
      <div className="w-full pb-10">
        <header className="relative z-20 flex justify-between items-center mb-8 bg-cyber-surface p-5 sm:p-6 rounded-3xl border border-white/5 shadow-xl mt-6 md:mt-10">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter">
            Exam <span className="text-amber-500">Review</span>
          </h2>
          <button
            onClick={() => {
              setGameState("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-white font-bold uppercase tracking-widest transition-all border border-white/5"
          >
            ← Kembali
          </button>
        </header>

        <div className="space-y-6 md:space-y-8">
          {exam.questions.map((q, idx) => {
            const userAnswer = answers[q._key];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                key={q._key}
                className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border bg-cyber-surface shadow-xl ${
                  isCorrect ? "border-emerald-500/20" : "border-red-500/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6 border-b border-white/5 pb-4">
                  <span className="text-[9px] md:text-[10px] font-mono font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg text-white/40 w-fit">
                    Question {idx + 1} • {SECTION_LABELS[q.section]}
                  </span>
                  {isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
                      <CheckCircle size={14} /> Benar
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg w-fit">
                      <XCircle size={14} /> Salah
                    </span>
                  )}
                </div>

                {q.questionText && (
                  <div
                    className="text-lg md:text-xl text-white font-medium leading-relaxed mb-6 font-japanese prose-custom"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />
                )}

                {q.imageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0a0c10]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="Ilustrasi Soal"
                      className="w-full max-h-[300px] object-contain opacity-80"
                    />
                  </div>
                )}

                {q.audioUrl && (
                  <div className="mb-6 p-4 rounded-xl bg-[#0a0c10]/50 border border-white/5">
                    <p className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                      <Volume2 size={14} /> Audio Review
                    </p>
                    <audio
                      controls
                      className="w-full h-8 outline-none opacity-80 custom-audio-player"
                      src={q.audioUrl}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correctAnswer;
                    const isUserSelection = optIdx === userAnswer;

                    let borderClass =
                      "border-white/5 bg-[#0a0c10]/50 opacity-50";
                    if (isCorrectAnswer)
                      borderClass =
                        "border-emerald-500 bg-emerald-500/10 opacity-100 ring-1 ring-emerald-500/50";
                    if (isUserSelection && !isCorrectAnswer)
                      borderClass =
                        "border-red-500 bg-red-500/10 opacity-100 ring-1 ring-red-500/50";

                    return (
                      <div
                        key={optIdx}
                        className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${borderClass}`}
                      >
                        <span className="font-mono text-[10px] md:text-xs opacity-60 mt-0.5">
                          {optIdx + 1}.
                        </span>
                        <span className="text-sm md:text-base font-japanese">
                          {opt}
                        </span>
                        {isCorrectAnswer && (
                          <CheckCircle
                            size={16}
                            className="ml-auto text-emerald-400 shrink-0 mt-0.5"
                          />
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <XCircle
                            size={16}
                            className="ml-auto text-red-500 shrink-0 mt-0.5"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  /* =====================
     LAYAR UJIAN (PLAYING)
  ===================== */
  const activeQuestion = exam.questions[currentQuestionIndex];
  const isTimeCritical = timeLeft < 300;

  // ✨ KATUP SATU ARAH: Mencegah pengguna mundur kembali ke Listening!
  const isCurrentlyListening =
    activeQuestion.section === "listening" || !!activeQuestion.audioUrl;

  // PERBAIKAN ERROR: Mengubah nama variabel agar tidak tabrakan dengan nama fungsi `prevQuestion()`
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
    <div className="w-full flex flex-col">
      <audio ref={audioRef} className="hidden" />

      <header className="relative z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 bg-cyber-surface p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl mt-2 md:mt-6">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#0a0c10] border border-white/5 px-3 py-1.5 rounded-lg text-white/50 font-mono text-[10px] md:text-xs font-bold shadow-inner">
              {currentQuestionIndex + 1} / {exam.questions.length}
            </span>
            <div className="bg-[#0a0c10] px-3 py-1.5 rounded-lg border border-white/5 shadow-inner flex items-center gap-2">
              {isCurrentlyListening && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <span className="text-[9px] sm:text-[10px] text-cyan-400 font-black uppercase tracking-widest">
                {SECTION_LABELS[activeQuestion.section]}
              </span>
            </div>
          </div>

          {cheatWarnings > 0 && (
            <span className="text-[9px] text-red-500 font-bold animate-pulse flex items-center gap-1 pl-1 mt-1">
              <ShieldAlert size={12} /> Fraud Detection: {cheatWarnings}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div
            className={`flex items-center gap-2 font-mono text-2xl sm:text-3xl font-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-[#0a0c10] border shadow-inner transition-colors duration-500 ${
              isTimeCritical
                ? "text-red-500 border-red-500/30 animate-pulse"
                : "text-amber-400 border-white/5"
            }`}
          >
            <Clock size={20} className="sm:w-6 sm:h-6" /> {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => {
              if (
                confirm(
                  "Yakin ingin menyelesaikan ujian sekarang? Skor akan dihitung dari jawaban yang sudah terisi.",
                )
              )
                finishExam();
            }}
            className="text-[10px] sm:text-xs text-white/40 hover:text-red-400 font-bold uppercase tracking-widest transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/5"
          >
            Akhiri
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-cyber-surface rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 border border-white/5 shadow-2xl flex flex-col"
        >
          {isCurrentlyListening && (
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start sm:items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)] shrink-0">
                <Volume2 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-red-300 font-black uppercase tracking-widest mb-1">
                  Seksi Mendengar (Choukai)
                </p>
                <p className="text-[10px] sm:text-xs text-red-200/70 leading-relaxed">
                  Audio akan diputar otomatis dan tidak dapat dijeda. Anda{" "}
                  <strong>tidak dapat kembali</strong> ke soal sebelumnya pada
                  seksi ini.
                </p>
              </div>
            </div>
          )}

          {activeQuestion.questionText && (
            <div
              className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed mb-8 font-japanese prose-custom"
              dangerouslySetInnerHTML={{ __html: activeQuestion.questionText }}
            />
          )}

          {activeQuestion.imageUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-[#0a0c10]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeQuestion.imageUrl}
                alt="Ilustrasi Soal"
                className="w-full max-h-[300px] md:max-h-[400px] object-contain opacity-90"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-8">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = answers[activeQuestion._key] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-5 md:p-6 rounded-2xl border text-left transition-all font-medium text-base md:text-lg font-japanese group flex items-start gap-3 md:gap-4 ${
                    isSelected
                      ? "bg-cyan-400/10 border-cyan-400 text-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.15)]"
                      : "bg-[#0a0c10] border-white/5 text-[#c4cfde] hover:border-cyan-400/30 hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] md:text-xs transition-colors mt-1 shrink-0 ${isSelected ? "text-cyan-400" : "text-white/30 group-hover:text-white/50"}`}
                  >
                    {idx + 1}.
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 md:mt-8 pb-10">
        <button
          onClick={prevQuestion}
          disabled={disablePreviousButton}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed rounded-xl md:rounded-2xl text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border border-white/5"
        >
          <ArrowLeft size={16} /> Sebelumnya
        </button>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <button
            onClick={() => {
              if (confirm("Kirim jawaban sekarang? Waktu masih tersisa."))
                finishExam();
            }}
            className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-amber-500 hover:bg-amber-400 rounded-xl md:rounded-2xl text-black font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            Kirim Ujian
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-cyan-400/10 border border-cyan-400/30 hover:bg-cyan-400 hover:text-black rounded-xl md:rounded-2xl text-cyan-400 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            Selanjutnya <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
