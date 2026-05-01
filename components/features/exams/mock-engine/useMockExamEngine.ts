import { useState, useEffect, useRef, useCallback } from "react";
import { ExamData, GameState, AudioState } from "./types";

export function useMockExamEngine(exam: ExamData) {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [audioStatus, setAudioStatus] = useState<Record<string, AudioState>>({});
  const [cheatWarnings, setCheatWarnings] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeQuestion = exam.questions[currentQuestionIndex];
  const isTimeCritical = timeLeft < 300;

  const isCurrentlyListening = activeQuestion?.section === "listening" || !!activeQuestion?.audioUrl;

  const previousQuestionData = currentQuestionIndex > 0 ? exam.questions[currentQuestionIndex - 1] : null;
  const isPrevQuestionListening = previousQuestionData
    ? previousQuestionData.section === "listening" || !!previousQuestionData.audioUrl
    : false;

  const disablePreviousButton = currentQuestionIndex === 0 || isCurrentlyListening || isPrevQuestionListening;

  const finishExam = useCallback(() => {
    setGameState("result");
    if (audioRef.current) audioRef.current.pause();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (!activeQuestion) return;
    setAnswers((prev) => ({ ...prev, [activeQuestion._key]: optionIndex }));
  }, [activeQuestion]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentQuestionIndex, exam.questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (gameState !== "playing") return;
    let cheatTimer: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cheatTimer = setTimeout(() => {
          setCheatWarnings((prev) => prev + 1);
          alert("PERINGATAN: Jangan meninggalkan halaman ujian! Aktivitas Anda dicatat.");
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

  useEffect(() => {
    if (gameState !== "playing") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (activeQuestion && idx < activeQuestion.options.length) {
          handleAnswer(idx);
        }
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentQuestionIndex < exam.questions.length - 1) nextQuestion();
      } else if (e.key === "ArrowLeft") {
        if (!disablePreviousButton) prevQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentQuestionIndex, activeQuestion, disablePreviousButton, handleAnswer, nextQuestion, prevQuestion, exam.questions.length]);

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
  }, [gameState, finishExam]);

  const calculateScore = useCallback(() => {
    let correctCount = 0;
    const sectionBreakdown: Record<string, { total: number; correct: number }> = {
      vocabulary: { total: 0, correct: 0 },
      grammar: { total: 0, correct: 0 },
      reading: { total: 0, correct: 0 },
      listening: { total: 0, correct: 0 },
    };
    exam.questions.forEach((q) => {
      if (!sectionBreakdown[q.section]) sectionBreakdown[q.section] = { total: 0, correct: 0 };
      sectionBreakdown[q.section].total += 1;
      if (answers[q._key] === q.correctAnswer) {
        correctCount++;
        sectionBreakdown[q.section].correct += 1;
      }
    });
    const finalScore = Math.round((correctCount / exam.questions.length) * 180);
    return { correctCount, finalScore, sectionBreakdown };
  }, [exam.questions, answers]);

  const handlePlayAudio = useCallback(() => {
    if (!activeQuestion) return;
    const qKey = activeQuestion._key;
    const currentStatus = audioStatus[qKey] || "idle";
    if (currentStatus === "played" || currentStatus === "playing") return;

    if (audioRef.current && activeQuestion.audioUrl) {
      audioRef.current.src = activeQuestion.audioUrl;
      audioRef.current.play().catch((err) => console.error("Gagal memutar audio", err));
      setAudioStatus((prev) => ({ ...prev, [qKey]: "playing" }));
      audioRef.current.onended = () => {
        setAudioStatus((prev) => ({ ...prev, [qKey]: "played" }));
      };
    }
  }, [activeQuestion, audioStatus]);

  const handleShareResult = useCallback(() => {
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
        vocabulary: sectionBreakdown.vocabulary.total > 0 ? Math.round((sectionBreakdown.vocabulary.correct / sectionBreakdown.vocabulary.total) * 100) : 0,
        grammar: sectionBreakdown.grammar.total > 0 ? Math.round((sectionBreakdown.grammar.correct / sectionBreakdown.grammar.total) * 100) : 0,
        reading: sectionBreakdown.reading.total > 0 ? Math.round((sectionBreakdown.reading.correct / sectionBreakdown.reading.total) * 100) : 0,
        listening: sectionBreakdown.listening.total > 0 ? Math.round((sectionBreakdown.listening.correct / sectionBreakdown.listening.total) * 100) : 0,
      },
      date: new Date().toISOString(),
    };

    const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const shareUrl = `${window.location.origin}/share?data=${encodedData}`;

    navigator.clipboard.writeText(shareUrl);
    alert("Link sertifikat berhasil disalin! Silakan bagikan ke teman Anda.");
  }, [calculateScore, exam.passingScore, exam.title, exam.questions.length]);

  return {
    gameState,
    setGameState,
    timeLeft,
    answers,
    currentQuestionIndex,
    audioStatus,
    cheatWarnings,
    audioRef,
    activeQuestion,
    isTimeCritical,
    isCurrentlyListening,
    disablePreviousButton,
    handlePlayAudio,
    finishExam,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    calculateScore,
    handleShareResult,
  };
}
