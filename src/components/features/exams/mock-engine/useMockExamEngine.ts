import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ExamData, GameState, AudioState, ExamQuestion, PendingConfirmType } from "./types";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { SECTION_LABELS } from "./constants";
import {
  getCompletedJlptMockSessionExam,
  saveJlptMockSessionAnswers,
  startJlptMockSession,
  submitJlptMockSession,
} from "@/actions/jlpt-exams.actions";


/**
 * @file useMockExamEngine.ts
 * @description Logic engine untuk Simulasi Ujian JLPT. 
 * Dioptimalkan untuk performa pada device low-end dengan memoization dan minimalisasi re-render.
 */

// ======================
// UTILITAS MURNI
// ======================

const performScoreCalculation = (questions: ExamQuestion[], answers: Record<string, number>, passingScore: number) => {
  let correctCount = 0;
  const sectionBreakdown: Record<string, { total: number; correct: number; passed: boolean }> = {
    vocabulary: { total: 0, correct: 0, passed: true },
    grammar: { total: 0, correct: 0, passed: true },
    listening: { total: 0, correct: 0, passed: true },
    reading: { total: 0, correct: 0, passed: true },
  };

  questions.forEach((q) => {
    const section = q.section || "vocabulary";
    if (!sectionBreakdown[section]) {
      sectionBreakdown[section] = { total: 0, correct: 0, passed: true };
    }

    sectionBreakdown[section].total += 1;
    if (answers[q._key] === q.correctAnswer) {
      correctCount++;
      sectionBreakdown[section].correct += 1;
    }
  });

  const finalScore = Math.round((correctCount / Math.max(1, questions.length)) * 180);

  // Terapkan Batas Kelulusan Bagian (Maiten) - setidaknya 32% akurasi diperlukan per bagian
  let failedSection = false;
  Object.keys(sectionBreakdown).forEach((sec) => {
    const data = sectionBreakdown[sec];
    if (data.total > 0) {
      const accuracy = data.correct / data.total;
      if (accuracy < 0.32) {
        data.passed = false;
        failedSection = true;
      }
    }
  });

  const isPassed = finalScore >= passingScore && !failedSection;
  return { correctCount, finalScore, sectionBreakdown, failedSection, isPassed };
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useMockExamEngine(initialExam: ExamData) {
  const [exam, setExam] = useState<ExamData>(initialExam);
  const [gameState, setGameState] = useState<GameState>(() =>
    initialExam.serverResult ? "result" : initialExam.sessionId ? "playing" : "intro"
  );
  const [timeLeft, setTimeLeft] = useState(
    () => initialExam.remainingTimeSeconds ?? exam.timeLimit * 60
  );
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Object.entries(
        initialExam.serverResult?.answers ?? initialExam.savedAnswers ?? {}
      ).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number"
      )
    )
  );
  const [serverResult, setServerResult] = useState(() => exam.serverResult ?? null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const answersRef = useRef(answers);
  const isStartingRef = useRef(false);
  const isFinishingRef = useRef(false);
  const hasHydratedSavedAnswersRef = useRef(Boolean(initialExam.savedAnswers));
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [audioStatus, setAudioStatus] = useState<Record<string, AudioState>>({});
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmType>(null);

  // Kelompokkan pertanyaan berdasarkan bagian
  const sections = useMemo(() => {
    const groups: Record<string, number[]> = {};
    exam.questions.forEach((q, idx) => {
      const section = q.section || "vocabulary";
      if (!groups[section]) groups[section] = [];
      groups[section].push(idx);
    });
    return groups;
  }, [exam.questions]);

  const addXP = useUserStore((state) => state.addXP);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Urutan bagian
  const sectionOrder = ["vocabulary", "grammar", "reading", "listening"];
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

  useEffect(() => {
    if (
      exam.source !== "supabase" ||
      !exam.sessionId ||
      serverResult ||
      gameState !== "playing"
    ) {
      return;
    }

    if (hasHydratedSavedAnswersRef.current) {
      hasHydratedSavedAnswersRef.current = false;
      return;
    }

    const saveTimer = window.setTimeout(() => {
      saveJlptMockSessionAnswers({
        sessionId: exam.sessionId!,
        answers: answersRef.current,
      }).catch((error) => {
        console.error("Gagal menyimpan jawaban sementara mock test:", error);
      });
    }, 1200);

    return () => window.clearTimeout(saveTimer);
  }, [answers, exam.sessionId, exam.source, gameState, serverResult]);

  const startExam = useCallback(async () => {
    if (isStartingRef.current) return;

    if (exam.source !== "supabase" || exam.sessionId) {
      setGameState("playing");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const templateSlug = exam.templateSlug || exam.slug || exam.id;
    if (!templateSlug) {
      toast.error("Template mock test Supabase tidak memiliki slug.");
      return;
    }

    isStartingRef.current = true;
    setIsStartingSession(true);

    try {
      const result = await startJlptMockSession({ templateSlug });
      setExam(result.exam);
      setTimeLeft(result.exam.timeLimit * 60);
      setAnswers({});
      answersRef.current = {};
      setServerResult(null);
      setCurrentQuestionIndex(0);
      setActiveSectionIndex(0);
      setAudioStatus({});
      setPendingConfirm(null);
      setGameState("playing");
      window.history.replaceState(
        null,
        "",
        `/exams/session/${encodeURIComponent(result.sessionId)}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Gagal memulai sesi mock test Supabase.")
      );
    } finally {
      isStartingRef.current = false;
      setIsStartingSession(false);
    }
  }, [exam.id, exam.sessionId, exam.slug, exam.source, exam.templateSlug]);

  const finishExam = useCallback(async () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    if (audioRef.current) audioRef.current.pause();

    if (exam.source === "supabase") {
      if (!exam.sessionId) {
        toast.error("Sesi mock test Supabase belum dimulai.");
        isFinishingRef.current = false;
        return;
      }

      setIsSubmittingSession(true);

      try {
        const result = await submitJlptMockSession({
          sessionId: exam.sessionId,
          answers: answersRef.current,
        });
        const completedExam = await getCompletedJlptMockSessionExam(exam.sessionId);
        setServerResult(result);
        setExam((prev) => ({ ...(completedExam ?? prev), serverResult: result }));
        const xpGain = (result.correctCount * 10) + (result.isPassed ? 50 : 0);
        addXP(xpGain);
        setGameState("result");
        setPendingConfirm(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Gagal mengirim hasil mock test Supabase.")
        );
      } finally {
        setIsSubmittingSession(false);
        isFinishingRef.current = false;
      }

      return;
    }

    const { correctCount, isPassed } = performScoreCalculation(exam.questions, answersRef.current, exam.passingScore);
    const xpGain = (correctCount * 10) + (isPassed ? 50 : 0);
    addXP(xpGain);
    setGameState("result");
    setPendingConfirm(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    isFinishingRef.current = false;
  }, [exam.source, exam.sessionId, exam.questions, exam.passingScore, addXP]);

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
      if (activeSectionIndex < availableSections.length - 1) {
        // Tidak langsung pindah — minta konfirmasi via Dialog (bukan confirm())
        setPendingConfirm("section");
      } else {
        // Soal terakhir dari seksi terakhir — minta konfirmasi pengumpulan
        setPendingConfirm("finish");
      }
    } else {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, exam.questions.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentQuestionIndex, exam.questions.length, sections, currentSection, activeSectionIndex, availableSections]);

  /** Eksekusi aksi yang ditunda setelah user konfirmasi via Dialog */
  const confirmPendingAction = useCallback(() => {
    if (pendingConfirm === "section") {
      const nextSecIndex = activeSectionIndex + 1;
      setActiveSectionIndex(nextSecIndex);
      const firstQuestionOfNextSection = sections[availableSections[nextSecIndex]][0];
      setCurrentQuestionIndex(firstQuestionOfNextSection);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (pendingConfirm === "finish") {
      void finishExam();
    }
    if (pendingConfirm !== "finish") {
      setPendingConfirm(null);
    }
  }, [pendingConfirm, activeSectionIndex, sections, availableSections, finishExam]);

  const prevQuestion = useCallback(() => {
    const sectionQuestions = sections[currentSection];
    const isFirstInSection = sectionQuestions[0] === currentQuestionIndex;

    // Hanya izinkan kembali jika BUKAN soal pertama di bagian saat ini
    if (!isFirstInSection) {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentQuestionIndex, sections, currentSection]);

  const calculateScore = useCallback(() => {
    const result = serverResult ?? exam.serverResult;
    if (result) {
      return {
        correctCount: result.correctCount,
        finalScore: result.totalScore,
        sectionBreakdown: result.sectionBreakdown,
        failedSection: result.failedSection,
        isPassed: result.isPassed,
      };
    }

    return performScoreCalculation(exam.questions, answersRef.current, exam.passingScore);
  }, [serverResult, exam.serverResult, exam.questions, exam.passingScore]);

  const handleShareResult = useCallback(() => {
    const { finalScore, sectionBreakdown, isPassed } = calculateScore();
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
  }, [calculateScore, exam.title, exam.questions.length]);

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
          void finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, finishExam]);

  // Hentikan audio dan kunci (tandai sebagai telah diputar) saat berganti pertanyaan (untuk mencegah pemutaran ulang dan tumpang tindih)
  const prevQuestionIndexRef = useRef(currentQuestionIndex);
  useEffect(() => {
    const prevIdx = prevQuestionIndexRef.current;
    if (prevIdx !== currentQuestionIndex) {
      if (!exam.choukaiAudioUrl) {
        const prevQ = exam.questions[prevIdx];
        if (prevQ && audioStatus[prevQ._key] === "playing") {
          setAudioStatus((prev) => ({ ...prev, [prevQ._key]: "played" }));
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
      prevQuestionIndexRef.current = currentQuestionIndex;
    }
  }, [currentQuestionIndex, exam.questions, exam.choukaiAudioUrl, audioStatus]);

  const handlePlayAudio = useCallback(() => {
    if (exam.choukaiAudioUrl) {
      if (audioRef.current) {
        // Jika sudah pernah diputar atau sedang diputar, jangan izinkan untuk memutar ulang
        if (audioStatus.global === "played" || audioStatus.global === "playing") return;

        if (audioRef.current.paused && audioRef.current.currentTime === 0) {
          audioRef.current.src = exam.choukaiAudioUrl;
          audioRef.current.play().catch((err: unknown) => {
            console.error("Gagal memutar global audio", err);
          });
          setAudioStatus((prev) => ({ ...prev, global: "playing" }));
          audioRef.current.onended = () => setAudioStatus((prev) => ({ ...prev, global: "played" }));
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

      // Batasi lompatan pada bagian menyimak (hanya navigasi linear saja)
      if (currentSection === "listening" && !exam.choukaiAudioUrl) {
        if (index !== currentQuestionIndex) {
          toast.error("Bagian Mendengar (Choukai) harus dikerjakan secara berurutan.");
          return;
        }
      }

      // Hanya izinkan melompat jika soal target berada di bagian aktif saat ini
      if (targetSection === currentSection) {
        setCurrentQuestionIndex(index);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [exam.questions, currentSection, currentQuestionIndex, exam.choukaiAudioUrl]);

  // Label dinamis untuk Dialog konfirmasi
  const pendingConfirmLabel = useMemo(() => {
    if (pendingConfirm === "section") {
      const nextSec = availableSections[activeSectionIndex + 1];
      return {
        title: `Lanjut ke ${SECTION_LABELS[nextSec] || "Bagian Berikutnya"}?`,
        description: "Setelah pindah bagian, kamu tidak bisa kembali ke soal di bagian ini.",
      };
    }
    if (pendingConfirm === "finish") {
      return {
        title: "Kumpulkan Jawaban?",
        description: "Pastikan semua soal sudah dijawab. Ujian akan berakhir dan nilaimu akan dihitung.",
      };
    }
    return null;
  }, [pendingConfirm, availableSections, activeSectionIndex]);

  return {
    exam, gameState, setGameState, timeLeft, answers, currentQuestionIndex, audioStatus,
    cheatWarnings, audioRef, activeQuestion, isTimeCritical, isCurrentlyListening,
    disablePreviousButton, handlePlayAudio, startExam, finishExam, handleAnswer, nextQuestion,
    prevQuestion, calculateScore, handleShareResult,
    sections, availableSections, currentSection, goToQuestion, activeSectionIndex,
    pendingConfirm, setPendingConfirm, confirmPendingAction, pendingConfirmLabel,
    isStartingSession, isSubmittingSession, serverResult,
  };
}
