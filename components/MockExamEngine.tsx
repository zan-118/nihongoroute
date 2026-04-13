// components/MockExamEngine.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Trophy,
  Skull,
  Volume2,
  ShieldAlert,
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

  // Anti-Cheat & Audio State
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Prevent duplicate API calls
  const hasSavedScore = useRef(false);

  /* =====================
     ANTI-CHEAT LOGIC
  ===================== */
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

  /* =====================
     HIDDEN AUDIO LOGIC
  ===================== */
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

  /* =====================
     TIMER LOGIC
  ===================== */
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

  /* =====================
     SAVE SCORE & CONFETTI
  ===================== */
  useEffect(() => {
    if (gameState === "result" && !hasSavedScore.current) {
      hasSavedScore.current = true; // Kunci agar tidak terkirim dua kali

      const { finalScore, sectionBreakdown } = calculateScore();
      const isPassed = finalScore >= exam.passingScore;

      // Ambil ID dari LocalStorage
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
      // 1. Tembak data ke API Sanity
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

      // 2. Jalankan Confetti jika lulus
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
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Kalkulasi Skor & Analisis per Seksi
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
      if (!sectionBreakdown[q.section]) {
        sectionBreakdown[q.section] = { total: 0, correct: 0 };
      }

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

  /* =====================
     LAYAR INTRO
  ===================== */
  if (gameState === "intro") {
    return (
      <div className="max-w-2xl mx-auto bg-cyber-surface p-10 rounded-[3rem] border border-white/5 shadow-2xl text-center">
        <AlertCircle
          size={64}
          className="mx-auto text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        />
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
          {exam.title}
        </h1>
        <div className="bg-cyber-bg p-6 rounded-2xl border border-white/5 mb-8 text-left space-y-4">
          <p className="text-[#c4cfde] flex justify-between border-b border-white/5 pb-2">
            <span className="opacity-60">Total Soal:</span>
            <span className="font-bold text-white">
              {exam.questions.length} Butir
            </span>
          </p>
          <p className="text-[#c4cfde] flex justify-between border-b border-white/5 pb-2">
            <span className="opacity-60">Batas Waktu:</span>
            <span className="font-bold text-amber-500">
              {exam.timeLimit} Menit
            </span>
          </p>
          <p className="text-[#c4cfde] flex justify-between">
            <span className="opacity-60">Target Kelulusan:</span>
            <span className="font-bold text-cyber-neon">
              {exam.passingScore} / 180
            </span>
          </p>
        </div>
        <p className="text-xs text-white/40 mb-8 font-mono uppercase tracking-widest leading-relaxed">
          Peringatan: Jika timer habis, ujian akan otomatis diselesaikan.
          Pastikan audio perangkat Anda menyala untuk sesi Choukai (Mendengar).
          Dilarang meninggalkan halaman selama ujian berlangsung.
        </p>
        <button
          onClick={() => setGameState("playing")}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest py-4 px-10 rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
        >
          Start Simulation
        </button>
      </div>
    );
  }

  /* =====================
     LAYAR HASIL (RESULT)
  ===================== */
  if (gameState === "result") {
    const { correctCount, finalScore, sectionBreakdown } = calculateScore();
    const isPassed = finalScore >= exam.passingScore;

    return (
      <div className="max-w-3xl mx-auto bg-cyber-surface p-10 md:p-12 rounded-[3rem] border shadow-2xl text-center relative overflow-hidden">
        {isPassed ? (
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
        ) : (
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        )}

        <div className="relative z-10">
          {isPassed ? (
            <Trophy
              size={80}
              className="mx-auto text-green-500 mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            />
          ) : (
            <Skull
              size={80}
              className="mx-auto text-red-500 mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            />
          )}

          <h1
            className={`text-5xl font-black uppercase italic tracking-tighter mb-2 ${isPassed ? "text-green-500" : "text-red-500"}`}
          >
            {isPassed ? "Exam Cleared!" : "Exam Failed"}
          </h1>
          <p className="text-white/50 font-mono uppercase tracking-widest text-sm mb-8">
            {exam.title}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-cyber-bg p-6 rounded-2xl border border-white/5">
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">
                Final Score
              </p>
              <p
                className={`text-4xl font-black ${isPassed ? "text-green-400" : "text-red-400"}`}
              >
                {finalScore}{" "}
                <span className="text-lg text-white/20">/ 180</span>
              </p>
            </div>
            <div className="bg-cyber-bg p-6 rounded-2xl border border-white/5">
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">
                Accuracy
              </p>
              <p className="text-4xl font-black text-white">
                {Math.round((correctCount / exam.questions.length) * 100)}%
              </p>
            </div>
          </div>

          {/* SECTION ANALYSIS */}
          <div className="bg-cyber-bg/50 p-6 rounded-2xl border border-white/5 mb-10 text-left">
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
              📊 Section Analysis
            </h3>
            <div className="space-y-4">
              {Object.entries(sectionBreakdown).map(([sectionKey, data]) => {
                if (data.total === 0) return null;

                const percentage = Math.round(
                  (data.correct / data.total) * 100,
                );
                let colorClass =
                  "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
                if (percentage >= 70)
                  colorClass =
                    "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
                else if (percentage >= 40)
                  colorClass =
                    "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";

                return (
                  <div key={sectionKey}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                        {
                          SECTION_LABELS[
                            sectionKey as keyof typeof SECTION_LABELS
                          ]
                        }
                      </span>
                      <span className="text-[10px] font-mono text-white/50">
                        {data.correct}/{data.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
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

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => setGameState("review")}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-black uppercase tracking-widest py-4 px-8 rounded-2xl transition-all"
            >
              🔍 Review Answers
            </button>
            <Link
              href="/dashboard"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-4 px-8 rounded-2xl transition-all"
            >
              View Certificate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =====================
     LAYAR REVIEW MISTAKES
  ===================== */
  if (gameState === "review") {
    return (
      <div className="max-w-4xl mx-auto w-full pb-20">
        <header className="flex justify-between items-center mb-10 bg-cyber-surface p-6 rounded-3xl border border-white/5 sticky top-4 z-50">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
            Exam <span className="text-amber-500">Review</span>
          </h2>
          <button
            onClick={() => setGameState("result")}
            className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white font-bold uppercase tracking-widest transition-all"
          >
            Back to Result
          </button>
        </header>

        <div className="space-y-8">
          {exam.questions.map((q, idx) => {
            const userAnswer = answers[q._key];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                key={q._key}
                className={`p-8 rounded-[2.5rem] border bg-cyber-surface shadow-xl ${
                  isCorrect ? "border-green-500/20" : "border-red-500/20"
                }`}
              >
                <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg text-white/40">
                    Question {idx + 1} • {SECTION_LABELS[q.section]}
                  </span>
                  {isCorrect ? (
                    <span className="text-green-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle size={14} /> Correct
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                      <XCircle size={14} /> Incorrect
                    </span>
                  )}
                </div>

                {q.questionText && (
                  <p
                    className="text-xl text-white font-japanese leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />
                )}

                {q.imageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="Ilustrasi Soal"
                      className="w-full max-h-[300px] object-contain opacity-80"
                    />
                  </div>
                )}

                {q.audioUrl && (
                  <div className="mb-6 p-4 rounded-xl bg-cyber-bg/50 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">
                      Audio Review
                    </p>
                    <audio
                      controls
                      className="w-full h-8 outline-none opacity-70"
                      src={q.audioUrl}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correctAnswer;
                    const isUserSelection = optIdx === userAnswer;

                    let borderClass =
                      "border-white/5 bg-cyber-bg/50 opacity-40";
                    if (isCorrectAnswer)
                      borderClass =
                        "border-green-500 bg-green-500/10 opacity-100 ring-1 ring-green-500/50";
                    if (isUserSelection && !isCorrectAnswer)
                      borderClass =
                        "border-red-500 bg-red-500/10 opacity-100 ring-1 ring-red-500/50";

                    return (
                      <div
                        key={optIdx}
                        className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${borderClass}`}
                      >
                        <span className="font-mono text-[10px] opacity-60">
                          {optIdx + 1}.
                        </span>
                        <span className="text-sm font-japanese">{opt}</span>
                        {isCorrectAnswer && (
                          <CheckCircle
                            size={16}
                            className="ml-auto text-green-500"
                          />
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <XCircle size={16} className="ml-auto text-red-500" />
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

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-[70vh]">
      <audio ref={audioRef} className="hidden" />

      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-cyber-surface p-5 rounded-3xl border border-white/5 shadow-inner sticky top-4 z-50">
        <div className="flex flex-col gap-1">
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 inline-flex w-fit">
            <p className="text-[10px] text-cyber-neon font-black uppercase tracking-widest flex items-center gap-2">
              {activeQuestion.section === "listening" && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {SECTION_LABELS[activeQuestion.section]}
            </p>
          </div>
          {cheatWarnings > 0 && (
            <span className="text-[9px] text-red-500 font-bold animate-pulse flex items-center gap-1 pl-2 mt-1">
              <ShieldAlert size={10} /> Fraud Detection: {cheatWarnings}
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-2 font-mono text-3xl font-black px-6 py-2 rounded-xl bg-cyber-bg border shadow-inner transition-colors duration-500 ${
            isTimeCritical
              ? "text-red-500 border-red-500/30 animate-pulse"
              : "text-amber-500 border-white/5"
          }`}
        >
          <Clock size={24} /> {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => {
            if (confirm("Yakin ingin menyelesaikan ujian sekarang?"))
              finishExam();
          }}
          className="text-xs text-white/40 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
        >
          Submit Early
        </button>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-cyber-surface rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col"
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <span className="text-white/40 font-mono text-sm font-bold">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </span>
            {answers[activeQuestion._key] !== undefined && (
              <span className="text-green-500 flex items-center gap-1 text-xs uppercase font-black tracking-widest">
                <CheckCircle size={14} /> Answered
              </span>
            )}
          </div>

          {activeQuestion.section === "listening" && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)] shrink-0">
                <Volume2 className="text-white" />
              </div>
              <div>
                <p className="text-sm text-red-200 font-black uppercase tracking-widest mb-1">
                  Audio Active
                </p>
                <p className="text-xs text-red-200/70">
                  Dengarkan baik-baik. Audio akan diputar secara otomatis dan
                  tidak dapat dihentikan.
                </p>
              </div>
            </div>
          )}

          {activeQuestion.questionText && (
            <p
              className="text-2xl text-white font-medium leading-relaxed mb-8 font-japanese"
              dangerouslySetInnerHTML={{ __html: activeQuestion.questionText }}
            />
          )}

          {activeQuestion.imageUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeQuestion.imageUrl}
                alt="Ilustrasi Soal"
                className="w-full max-h-[400px] object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = answers[activeQuestion._key] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-6 rounded-2xl border text-left transition-all font-medium text-lg font-japanese group ${
                    isSelected
                      ? "bg-cyber-neon/10 border-cyber-neon text-cyber-neon shadow-[inset_0_0_20px_rgba(0,255,239,0.1)]"
                      : "bg-cyber-bg border-white/5 text-[#c4cfde] hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`mr-4 font-mono text-sm transition-colors ${isSelected ? "text-cyber-neon" : "text-white/30 group-hover:text-white/50"}`}
                  >
                    {idx + 1}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-2xl text-white font-black uppercase tracking-widest text-sm transition-all"
        >
          ← Previous
        </button>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <button
            onClick={finishExam}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-black font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            Submit Exam
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-black uppercase tracking-widest text-sm transition-all"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
