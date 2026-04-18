/**
 * LOKASI FILE: components/MockExamEngine.tsx
 * KONSEP: Cyber-Dark Neumorphic (Visual Overhaul)
 * FITUR BARU:
 * - Audio Play 1-Kali (Bypass larangan Auto-Play Browser)
 * - Share Result via Base64 URL (Nol Database)
 * - Toleransi Anti-Cheat 1.5 Detik
 */

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
  Share2,
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

export default function MockExamEngine({ exam }: MockExamEngineProps) {
  const [gameState, setGameState] = useState<
    "intro" | "playing" | "result" | "review"
  >("intro");
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Status Pemutaran Audio per Soal
  const [audioStatus, setAudioStatus] = useState<Record<string, AudioState>>(
    {},
  );
  const [cheatWarnings, setCheatWarnings] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSavedScore = useRef(false);

  const backLink = exam.categorySlug
    ? `/courses/${exam.categorySlug}`
    : "/courses";

  // --- LOGIKA ANTI-CHEAT (Dengan Grace Period 1.5s) ---
  useEffect(() => {
    if (gameState !== "playing") return;

    let cheatTimer: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Beri toleransi 1.5 detik jika hanya kepencet/notifikasi lewat
        cheatTimer = setTimeout(() => {
          setCheatWarnings((prev) => prev + 1);
          alert(
            "PERINGATAN: Jangan meninggalkan halaman ujian! Aktivitas Anda dicatat.",
          );
        }, 5000);
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

  // --- LOGIKA TIMER ---
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // --- LOGIKA HASIL (Konfeti Saja, API Dihapus) ---
  useEffect(() => {
    if (gameState === "result" && !hasSavedScore.current) {
      hasSavedScore.current = true;
      const { finalScore } = calculateScore();
      const isPassed = finalScore >= exam.passingScore;

      // HANYA Memicu Konfeti jika Lulus (API Call Dihapus Sepenuhnya)
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
  }, [gameState, exam.passingScore, exam.questions.length]);

  // --- HANDLER AUDIO (1 KALI PUTAR) ---
  const handlePlayAudio = () => {
    const activeQuestion = exam.questions[currentQuestionIndex];
    const qKey = activeQuestion._key;
    const currentStatus = audioStatus[qKey] || "idle";

    // Blokir jika sudah pernah diputar atau sedang diputar
    if (currentStatus === "played" || currentStatus === "playing") return;

    if (audioRef.current && activeQuestion.audioUrl) {
      audioRef.current.src = activeQuestion.audioUrl;
      audioRef.current
        .play()
        .catch((err) => console.error("Gagal memutar audio", err));

      setAudioStatus((prev) => ({ ...prev, [qKey]: "playing" }));

      // Kunci audio saat selesai
      audioRef.current.onended = () => {
        setAudioStatus((prev) => ({ ...prev, [qKey]: "played" }));
      };
    }
  };

  const finishExam = () => {
    setGameState("result");
    if (audioRef.current) audioRef.current.pause();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- HANDLER SHARE URL BASE64 ---
  const handleShareResult = () => {
    // 1. Ambil data kalkulasi skor saat ini
    const { finalScore, sectionBreakdown } = calculateScore();
    const isPassed = finalScore >= exam.passingScore;
    const guestId = localStorage.getItem("nihongo_guest_id") || "UNKNOWN_GUEST";

    // 2. Rakit objek data sesuai dengan format yang diharapkan halaman penerima
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

    // 3. Encode data yang sudah dirakit
    const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const shareUrl = `${window.location.origin}/share?data=${encodedData}`;

    // 4. Salin ke clipboard
    navigator.clipboard.writeText(shareUrl);
    alert("Link sertifikat berhasil disalin! Silakan bagikan ke teman Anda.");
  };

  /* =========================================
     1. TAMPILAN INTRO (Mulai Ujian)
  ========================================= */
  if (gameState === "intro") {
    return (
      <div className="w-full max-w-2xl mx-auto neo-card p-8 md:p-12 text-center mt-6 md:mt-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-24 h-24 mx-auto neo-inset text-amber-500 flex items-center justify-center rounded-full mb-8 shadow-inner">
          <AlertCircle
            size={40}
            className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8 leading-tight relative z-10">
          {exam.title}
        </h1>

        <div className="neo-inset p-6 md:p-8 rounded-2xl mb-8 text-left space-y-5 relative z-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300">
              Total Soal
            </span>
            <span className="font-mono font-bold text-white text-sm md:text-base">
              {exam.questions.length} Butir
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300">
              Batas Waktu
            </span>
            <span className="font-mono font-bold text-red-400 text-sm md:text-base">
              {exam.timeLimit} Menit
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300">
              Target Pass
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm md:text-base">
              {exam.passingScore} / 180
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-300 mb-10 font-mono uppercase tracking-widest leading-relaxed px-2 relative z-10">
          Sistem memiliki fitur Anti-Cheat aktif. Untuk Seksi Mendengar
          (Choukai), audio HANYA DAPAT DIPUTAR SATU KALI dan tidak bisa
          dijeda/diulang.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Link
            href={backLink}
            className="neo-inset w-full hover:text-white text-slate-200 font-black uppercase tracking-widest py-4 px-6 flex justify-center transition-colors text-[10px] sm:text-xs"
          >
            ← Batal
          </Link>
          <button
            onClick={() => setGameState("playing")}
            className="w-full bg-red-500 hover:bg-white text-[#0a0c10] font-black uppercase tracking-widest py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 text-[10px] sm:text-xs"
          >
            Mulai Ujian
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     2. TAMPILAN HASIL (Result)
  ========================================= */
  if (gameState === "result") {
    const { correctCount, finalScore, sectionBreakdown } = calculateScore();
    const isPassed = finalScore >= exam.passingScore;

    return (
      <div className="w-full max-w-3xl mx-auto neo-card p-8 md:p-12 text-center relative overflow-hidden mt-6 md:mt-12">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] blur-[150px] rounded-full pointer-events-none ${isPassed ? "bg-emerald-500/10" : "bg-red-500/10"}`}
        />

        <div className="relative z-10">
          <div
            className={`w-28 h-28 mx-auto neo-inset flex items-center justify-center rounded-full mb-8 shadow-inner ${isPassed ? "text-emerald-400" : "text-red-500"}`}
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
          </div>

          <h1
            className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 ${isPassed ? "text-emerald-400" : "text-red-500"}`}
          >
            {isPassed ? "Exam Cleared" : "Exam Failed"}
          </h1>
          <p className="text-slate-300 font-mono uppercase tracking-widest text-[10px] md:text-xs mb-10">
            {exam.title}
          </p>

          {/* Kotak Skor Neumorphic */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="neo-inset p-6 md:p-8 flex flex-col items-center justify-center">
              <p className="text-slate-300 text-[10px] uppercase font-black tracking-widest mb-3">
                Final Score
              </p>
              <p
                className={`text-4xl md:text-5xl font-black font-mono ${isPassed ? "text-emerald-400" : "text-red-500"}`}
              >
                {finalScore}{" "}
                <span className="text-lg md:text-xl text-slate-600">/ 180</span>
              </p>
            </div>
            <div className="neo-inset p-6 md:p-8 flex flex-col items-center justify-center">
              <p className="text-slate-300 text-[10px] uppercase font-black tracking-widest mb-3">
                Accuracy
              </p>
              <p className="text-4xl md:text-5xl font-black font-mono text-white">
                {Math.round((correctCount / exam.questions.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="neo-card !bg-transparent p-6 md:p-8 border-white/5 mb-10 text-left">
            <h3 className="text-[10px] md:text-xs font-black text-slate-200 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              Analisis Sektor
            </h3>
            <div className="space-y-6">
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
                      <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {
                          SECTION_LABELS[
                            sectionKey as keyof typeof SECTION_LABELS
                          ]
                        }
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-300">
                        {data.correct}/{data.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 neo-inset p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${colorClass}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Tombol Share Baru */}
            <button
              onClick={handleShareResult}
              className="w-full sm:w-auto btn-cyber flex justify-center items-center gap-2 py-4 px-8 text-[10px] md:text-xs"
            >
              <Share2 size={16} /> Bagikan Hasil
            </button>
            <button
              onClick={() => {
                setGameState("review");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto neo-inset !border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-black uppercase tracking-widest py-4 px-8 flex justify-center items-center gap-2 transition-all text-[10px] md:text-xs"
            >
              🔍 Review Jawaban
            </button>
            <Link
              href={backLink}
              className="w-full sm:w-auto neo-inset text-slate-200 hover:text-white font-black uppercase tracking-widest py-4 px-8 flex justify-center items-center transition-all text-[10px] md:text-xs"
            >
              Selesai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     3. TAMPILAN REVIEW (Pembahasan)
  ========================================= */
  if (gameState === "review") {
    return (
      <div className="w-full pb-10">
        <header className="relative z-20 flex justify-between items-center mb-10 neo-card p-5 sm:p-6 mt-6 md:mt-10">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">
            Exam <span className="text-amber-500">Review</span>
          </h2>
          <button
            onClick={() => {
              setGameState("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[9px] sm:text-[10px] neo-inset hover:text-white text-slate-200 px-4 py-2.5 font-black uppercase tracking-widest transition-all"
          >
            ← Kembali
          </button>
        </header>

        <div className="space-y-8 md:space-y-12">
          {exam.questions.map((q, idx) => {
            const userAnswer = answers[q._key];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                key={q._key}
                className={`neo-card p-6 md:p-8 lg:p-10 ${isCorrect ? "border-emerald-500/30" : "border-red-500/30"}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 border-b border-white/5 pb-6">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest neo-inset px-3 py-1.5 text-slate-200 w-fit">
                    Soal {idx + 1} • {SECTION_LABELS[q.section]}
                  </span>
                  {isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 neo-inset !border-emerald-500/20 w-fit">
                      <CheckCircle size={14} /> Benar
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 neo-inset !border-red-500/20 w-fit">
                      <XCircle size={14} /> Salah
                    </span>
                  )}
                </div>

                {q.questionText && (
                  <div
                    className="text-lg md:text-xl text-white font-medium leading-relaxed mb-8 font-japanese prose-custom"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />
                )}

                {q.imageUrl && (
                  <div className="mb-8 rounded-2xl overflow-hidden neo-inset p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="Ilustrasi Soal"
                      className="w-full max-h-[300px] object-contain opacity-90 rounded-xl"
                    />
                  </div>
                )}

                {/* Di mode Review, Audio boleh diplay berkali-kali pake kontrol bawaan browser */}
                {q.audioUrl && (
                  <div className="mb-8 p-5 neo-inset flex flex-col gap-3">
                    <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest flex items-center gap-2">
                      <Volume2 size={14} /> Audio Track (Review)
                    </p>
                    <audio
                      controls
                      className="w-full h-10 outline-none opacity-80"
                      src={q.audioUrl}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correctAnswer;
                    const isUserSelection = optIdx === userAnswer;
                    let wrapperClass = "neo-inset opacity-50";

                    if (isCorrectAnswer)
                      wrapperClass =
                        "neo-inset !border-emerald-500/50 !shadow-[inset_0_0_15px_rgba(16,185,129,0.15)] opacity-100 text-white";
                    else if (isUserSelection)
                      wrapperClass =
                        "neo-inset !border-red-500/50 !shadow-[inset_0_0_15px_rgba(239,68,68,0.15)] opacity-100 text-white";

                    return (
                      <div
                        key={optIdx}
                        className={`p-5 flex items-start gap-4 transition-all ${wrapperClass}`}
                      >
                        <span className="font-mono font-bold text-[10px] md:text-xs opacity-50 mt-1 shrink-0">
                          {optIdx + 1}.
                        </span>
                        <span className="text-sm md:text-base font-japanese font-medium leading-snug">
                          {opt}
                        </span>
                        {isCorrectAnswer && (
                          <CheckCircle
                            size={18}
                            className="ml-auto text-emerald-400 shrink-0 mt-0.5"
                          />
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <XCircle
                            size={18}
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

  /* =========================================
     4. LAYAR UJIAN (Playing Mode)
  ========================================= */
  const activeQuestion = exam.questions[currentQuestionIndex];
  const isTimeCritical = timeLeft < 300;

  // Status Audio Spesifik untuk UI Navigation Lock
  const isCurrentlyListening =
    activeQuestion.section === "listening" || !!activeQuestion.audioUrl;

  // Mencegah user mundur jika soal sebelumnya adalah soal listening
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
      {/* Audio Element Tersembunyi (Dikontrol secara Programmatic) */}
      <audio ref={audioRef} className="hidden" />

      {/* HEADER HUD (HEAD-UP DISPLAY) */}
      <header className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 neo-card p-5 sm:p-6 mt-2 md:mt-6">
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="neo-inset px-4 py-2 text-slate-200 font-mono text-[10px] md:text-xs font-black shadow-inner">
              {currentQuestionIndex + 1} / {exam.questions.length}
            </span>
            <div className="neo-inset px-4 py-2 flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] text-red-500 font-black uppercase tracking-widest">
                {SECTION_LABELS[activeQuestion.section]}
              </span>
            </div>
          </div>
          {cheatWarnings > 0 && (
            <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5 pl-1">
              <ShieldAlert size={14} /> Peringatan Tab Keluar: {cheatWarnings}x
            </span>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
          <div
            className={`flex items-center gap-3 font-mono text-2xl sm:text-3xl font-black px-6 py-2 neo-inset transition-colors duration-500 ${isTimeCritical ? "text-red-500 !border-red-500/50 animate-pulse shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]" : "text-white"}`}
          >
            <Clock
              size={20}
              className={isTimeCritical ? "text-red-500" : "text-slate-300"}
            />{" "}
            {formatTime(timeLeft)}
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
            className="text-[9px] sm:text-[10px] neo-inset text-slate-300 hover:text-white font-black uppercase tracking-widest px-4 py-3 transition-colors"
          >
            Akhiri
          </button>
        </div>
      </header>

      {/* KOTAK SOAL UTAMA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full neo-card p-6 sm:p-8 md:p-12 flex flex-col mb-8"
        >
          {/* UI AUDIO BARU (Tanpa Auto-Play) */}
          {isCurrentlyListening && (
            <div className="mb-8 p-5 neo-inset !border-red-500/30 flex items-center gap-4 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
              <button
                onClick={handlePlayAudio}
                disabled={
                  audioStatus[activeQuestion._key] !== "idle" &&
                  audioStatus[activeQuestion._key] !== undefined
                }
                className={`p-4 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  !audioStatus[activeQuestion._key] ||
                  audioStatus[activeQuestion._key] === "idle"
                    ? "bg-red-500 text-white hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
                    : "bg-slate-800 text-slate-300 cursor-not-allowed"
                }`}
              >
                <Volume2
                  size={24}
                  className={
                    audioStatus[activeQuestion._key] === "playing"
                      ? "animate-pulse text-red-500"
                      : ""
                  }
                />
              </button>
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 text-white">
                  {!audioStatus[activeQuestion._key] ||
                  audioStatus[activeQuestion._key] === "idle"
                    ? "Putar Audio Choukai"
                    : audioStatus[activeQuestion._key] === "playing"
                      ? "Audio Sedang Diputar..."
                      : "Pemutaran Audio Selesai"}
                </p>
                <p className="text-[9px] md:text-[10px] text-slate-200 leading-relaxed uppercase font-mono tracking-wide">
                  Perhatian: Audio HANYA BISA DIPUTAR 1 KALI. Audio tidak dapat
                  dijeda atau diulang. Pastikan volume suara perangkat Anda
                  sudah cukup.
                </p>
              </div>
            </div>
          )}

          {activeQuestion.questionText && (
            <div
              className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed mb-10 font-japanese prose-custom"
              dangerouslySetInnerHTML={{ __html: activeQuestion.questionText }}
            />
          )}

          {activeQuestion.imageUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden neo-inset p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeQuestion.imageUrl}
                alt="Ilustrasi Soal"
                className="w-full max-h-[300px] md:max-h-[400px] object-contain opacity-90 rounded-xl"
              />
            </div>
          )}

          {/* OPSI JAWABAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = answers[activeQuestion._key] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-5 md:p-6 rounded-2xl text-left transition-all font-medium text-base md:text-lg font-japanese group flex items-start gap-4 ${
                    isSelected
                      ? "neo-inset !bg-red-500/10 !border-red-500/50 text-white shadow-[inset_0_0_20px_rgba(239,68,68,0.15)]"
                      : "neo-inset text-slate-200 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] md:text-xs font-black transition-colors mt-1 shrink-0 ${isSelected ? "text-red-500" : "text-slate-600 group-hover:text-slate-200"}`}
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

      {/* NAVIGASI BAWAH */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-10">
        <button
          onClick={prevQuestion}
          disabled={disablePreviousButton}
          className="w-full sm:w-auto neo-inset px-6 md:px-8 py-4 text-slate-200 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          <ArrowLeft size={16} /> Sebelumnya
        </button>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <button
            onClick={() => {
              if (confirm("Kirim jawaban sekarang? Waktu masih tersisa."))
                finishExam();
            }}
            className="w-full sm:w-auto btn-cyber !bg-amber-500 !text-black px-6 md:px-10 py-4 flex items-center justify-center font-black uppercase tracking-widest text-[10px] md:text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            Kirim Ujian
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full sm:w-auto neo-inset !border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black px-6 md:px-8 py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all"
          >
            Selanjutnya <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
