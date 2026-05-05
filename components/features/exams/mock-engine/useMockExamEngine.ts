import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ExamData, GameState, AudioState, ExamQuestion } from "./types";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { SECTION_LABELS } from "./constants";


/**
 * @file useMockExamEngine.ts
 * @description Logic engine untuk Simulasi Ujian JLPT. 
 * Dioptimalkan untuk performa pada device low-end dengan memoization dan minimalisasi re-render.
 */

// ======================
// PURE UTILITIES
// ======================

const performScoreCalculation = (questions: ExamQuestion[], answers: Record<string, number>) => {
  let correctCount = 0;
  const sectionBreakdown: Record<string, { total: number; correct: number }> = {
    vocabulary: { total: 0, correct: 0 },
    grammar: { total: 0, correct: 0 },
    listening: { total: 0, correct: 0 },
    reading: { total: 0, correct: 0 },
  };

  questions.forEach((q) => {
    const section = q.section || "vocabulary";
    if (!sectionBreakdown[section]) {
      sectionBreakdown[section] = { total: 0, correct: 0 };
    }
    
    sectionBreakdown[section].total += 1;
    if (answers[q._key] === q.correctAnswer) {
      correctCount++;
      sectionBreakdown[section].correct += 1;
    }
  });

  const finalScore = Math.round((correctCount / Math.max(1, questions.length)) * 180);
  return { correctCount, finalScore, sectionBreakdown };
};

export function useMockExamEngine(exam: ExamData) {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [timeLeft, setTimeLeft] = useState(() => exam.timeLimit * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [audioStatus, setAudioStatus] = useState<Record<string, AudioState>>({});
  const [cheatWarnings, setCheatWarnings] = useState(0);

  // Group questions by section
  const sections = useMemo(() => {
    const groups: Record<string, number[]> = {};
    exam.questions.forEach((q, idx) => {
      const section = q.section || "vocabulary";
      if (!groups[section]) groups[section] = [];
      groups[section].push(idx);
    });
    return groups;
  }, [exam.questions]);

  const { addXP } = useUserStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Order of sections
  const sectionOrder = ["vocabulary", "grammar", "listening", "reading"];
  const availableSections = sectionOrder.filter(s => sections[s] && sections[s].length > 0);

  const activeQuestion = useMemo(() => exam.questions[currentQuestionIndex], [exam.questions, currentQuestionIndex]);
  const currentSection = activeQuestion?.section || "vocabulary";
  const isTimeCritical = useMemo(() => timeLeft < 300, [timeLeft]);
  const isCurrentlyListening = useMemo(() => 
    currentSection === "listening" || !!activeQuestion?.audioUrl, 
    [currentSection, activeQuestion]
  );
  const hasGlobalChoukai = !!exam.choukaiAudioUrl;

  const disablePreviousButton = useMemo(() => {
    if (currentQuestionIndex === 0) return true;
    if (hasGlobalChoukai) return false;
    if (isCurrentlyListening) return true;
    const prevQ = exam.questions[currentQuestionIndex - 1];
    return prevQ?.section === "listening" || !!prevQ?.audioUrl;
  }, [currentQuestionIndex, isCurrentlyListening, exam.questions, hasGlobalChoukai]);

  const finishExam = useCallback(() => {
    const { correctCount, finalScore } = performScoreCalculation(exam.questions, answers);
    const isPassed = finalScore >= exam.passingScore;
    const xpGain = (correctCount * 10) + (isPassed ? 50 : 0);
    addXP(xpGain);
    setGameState("result");
    if (audioRef.current) audioRef.current.pause();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [exam.questions, answers, exam.passingScore, addXP]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (!activeQuestion) return;
    setAnswers((prev) => {
      if (prev[activeQuestion._key] === optionIndex) return prev;
      return { ...prev, [activeQuestion._key]: optionIndex };
    });
  }, [activeQuestion]);

  const nextQuestion = useCallback(() => {
    const sectionQuestions = sections[currentSection];
    const isLastInSection = sectionQuestions[sectionQuestions.length - 1] === currentQuestionIndex;

    if (isLastInSection) {
      // If it's the last question of the section, we move to the next section
      if (activeSectionIndex < availableSections.length - 1) {
        if (confirm(`Lanjut ke bagian ${SECTION_LABELS[availableSections[activeSectionIndex + 1]]}? Setelah pindah, kamu tidak bisa kembali ke bagian ini.`)) {
          const nextSecIndex = activeSectionIndex + 1;
          setActiveSectionIndex(nextSecIndex);
          const firstQuestionOfNextSection = sections[availableSections[nextSecIndex]][0];
          setCurrentQuestionIndex(firstQuestionOfNextSection);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        // If it's the last question of the last section
        if (confirm("Kumpulkan jawaban sekarang?")) {
          finishExam();
        }
      }
    } else {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, exam.questions.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentQuestionIndex, exam.questions.length, sections, currentSection, activeSectionIndex, availableSections, finishExam]);

  const prevQuestion = useCallback(() => {
    const sectionQuestions = sections[currentSection];
    const isFirstInSection = sectionQuestions[0] === currentQuestionIndex;

    // Only allow previous if it's NOT the first question of the current section
    if (!isFirstInSection) {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentQuestionIndex, sections, currentSection]);

  const calculateScore = useCallback(() => {
    return performScoreCalculation(exam.questions, answers);
  }, [exam.questions, answers]);

  const handleShareResult = useCallback(() => {
    const { finalScore, sectionBreakdown } = calculateScore();
    const isPassed = finalScore >= exam.passingScore;
    const userFullName = useUserStore.getState().name;
    const guestId = userFullName || "Pelajar NihongoRoute";

    const shareData = {
      guestId,
      examTitle: exam.title,
      score: finalScore,
      totalQuestions: exam.questions.length,
      passed: isPassed,
      sectionScores: {
        vocabulary: sectionBreakdown.vocabulary?.total > 0 ? Math.round((sectionBreakdown.vocabulary.correct / sectionBreakdown.vocabulary.total) * 100) : 0,
        grammar: sectionBreakdown.grammar?.total > 0 ? Math.round((sectionBreakdown.grammar.correct / sectionBreakdown.grammar.total) * 100) : 0,
        reading: sectionBreakdown.reading?.total > 0 ? Math.round((sectionBreakdown.reading.correct / sectionBreakdown.reading.total) * 100) : 0,
        listening: sectionBreakdown.listening?.total > 0 ? Math.round((sectionBreakdown.listening.correct / sectionBreakdown.listening.total) * 100) : 0,
      },
      date: new Date().toISOString(),
    };

    try {
      const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const shareUrl = `${window.location.origin}/share?data=${encodedData}`;
      
      if (navigator.share) {
        navigator.share({
          title: `Hasil Ujian NihongoRoute - ${exam.title}`,
          text: `Saya baru saja menyelesaikan ujian ${exam.title} di NihongoRoute dengan skor ${finalScore}/180!`,
          url: shareUrl,
        }).catch(() => {
           navigator.clipboard.writeText(shareUrl);
           toast.success("Link pencapaian disalin!");
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link pencapaian disalin!");
      }
    } catch (err) {
      console.error("Gagal membuat share link", err);
      toast.error("Gagal membuat link berbagi.");
    }
  }, [calculateScore, exam.passingScore, exam.title, exam.questions.length]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTimeout(() => setCheatWarnings((prev) => prev + 1), 1500);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameState]);

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

  const handlePlayAudio = useCallback(() => {
    if (exam.choukaiAudioUrl) {
      if (audioRef.current) {
        // If already played, don't allow restart
        if (audioStatus.global === "played") return;

        if (audioRef.current.paused && audioRef.current.currentTime === 0) {
          audioRef.current.src = exam.choukaiAudioUrl;
          audioRef.current.play().catch((err: unknown) => {
            console.error("Gagal memutar global audio", err);
          });
          setAudioStatus((prev) => ({ ...prev, global: "playing" }));
          audioRef.current.onended = () => setAudioStatus((prev) => ({ ...prev, global: "played" }));
        } else if (audioRef.current.paused) {
          audioRef.current.play();
          setAudioStatus(prev => ({ ...prev, global: "playing" }));
        }
      }
      return;
    }

    if (!activeQuestion) return;
    const qKey = activeQuestion._key;
    if (audioStatus[qKey] === "played" || audioStatus[qKey] === "playing") return;

    if (audioRef.current && activeQuestion.audioUrl) {
      audioRef.current.src = activeQuestion.audioUrl;
      audioRef.current.play().catch((err: unknown) => {
        console.error("Gagal memutar audio", err);
      });
      setAudioStatus(prev => ({ ...prev, [qKey]: "playing" }));
      audioRef.current.onended = () => setAudioStatus(prev => ({ ...prev, [qKey]: "played" }));
    }
  }, [activeQuestion, audioStatus, exam.choukaiAudioUrl]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < exam.questions.length) {
      const targetQuestion = exam.questions[index];
      const targetSection = targetQuestion.section || "vocabulary";
      
      // Only allow jumping if the target question is in the CURRENT active section
      if (targetSection === currentSection) {
        setCurrentQuestionIndex(index);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [exam.questions, currentSection]);

  return {
    gameState, setGameState, timeLeft, answers, currentQuestionIndex, audioStatus,
    cheatWarnings, audioRef, activeQuestion, isTimeCritical, isCurrentlyListening,
    disablePreviousButton, handlePlayAudio, finishExam, handleAnswer, nextQuestion,
    prevQuestion, calculateScore, handleShareResult,
    sections, availableSections, currentSection, goToQuestion, activeSectionIndex
  };
}
