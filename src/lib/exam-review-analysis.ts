/**
 * @file exam-review-analysis.ts
 * @description Pure helpers for post-exam mistake review and remediation guidance.
 */

import type { ExamData, ExamQuestion } from "@/components/features/exams/mock-engine/types";

export interface ExamReviewQuestionInsight {
  question: ExamQuestion;
  index: number;
  userAnswer?: number;
  isAnswered: boolean;
  isCorrect: boolean;
}

export interface ExamReviewSectionInsight {
  section: ExamQuestion["section"];
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
}

export interface ExamReviewAction {
  id: "weak-points" | "flashcards" | "listening" | "reading" | "grammar" | "vocab";
  label: string;
  href: string;
  reason: string;
}

export interface ExamReviewAnalysis {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracy: number;
  insights: ExamReviewQuestionInsight[];
  mistakes: ExamReviewQuestionInsight[];
  sections: ExamReviewSectionInsight[];
  weakestSection: ExamReviewSectionInsight | null;
  actions: ExamReviewAction[];
}

const SECTION_ORDER: ExamQuestion["section"][] = ["vocabulary", "grammar", "reading", "listening"];

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSectionAction(section: ExamQuestion["section"]): ExamReviewAction {
  if (section === "listening") {
    return {
      id: "listening",
      label: "Latihan listening",
      href: "/library/listening",
      reason: "Bagian mendengar paling perlu diperkuat.",
    };
  }

  if (section === "reading") {
    return {
      id: "reading",
      label: "Latihan reading",
      href: "/library/reading",
      reason: "Perbanyak paparan bacaan dan konteks soal.",
    };
  }

  if (section === "grammar") {
    return {
      id: "grammar",
      label: "Review grammar",
      href: "/library/grammar",
      reason: "Pola tata bahasa menjadi sumber kesalahan utama.",
    };
  }

  return {
    id: "vocab",
    label: "Perkuat kosakata",
    href: "/library/vocab",
    reason: "Kosakata dan kanji perlu masuk latihan ulang.",
  };
}

function pushUniqueAction(actions: ExamReviewAction[], action: ExamReviewAction) {
  if (!actions.some((item) => item.id === action.id)) actions.push(action);
}

export function analyzeExamReview(
  exam: Pick<ExamData, "questions">,
  answers: Record<string, number>
): ExamReviewAnalysis {
  const sectionMap = new Map<ExamQuestion["section"], ExamReviewSectionInsight>();

  for (const section of SECTION_ORDER) {
    sectionMap.set(section, {
      section,
      total: 0,
      correct: 0,
      wrong: 0,
      unanswered: 0,
      accuracy: 0,
    });
  }

  const insights = exam.questions.map<ExamReviewQuestionInsight>((question, index) => {
    const userAnswer = answers[question._key];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === question.correctAnswer;
    const section = question.section || "vocabulary";
    const sectionInsight =
      sectionMap.get(section) ||
      ({
        section,
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        accuracy: 0,
      } satisfies ExamReviewSectionInsight);

    sectionInsight.total += 1;
    if (isCorrect) sectionInsight.correct += 1;
    else if (isAnswered) sectionInsight.wrong += 1;
    else sectionInsight.unanswered += 1;

    sectionMap.set(section, sectionInsight);

    return {
      question,
      index,
      userAnswer,
      isAnswered,
      isCorrect,
    };
  });

  const sections = Array.from(sectionMap.values())
    .filter((section) => section.total > 0)
    .map((section) => ({
      ...section,
      accuracy: clampPercent((section.correct / section.total) * 100),
    }));

  const mistakes = insights.filter((insight) => !insight.isCorrect);
  const correctCount = insights.length - mistakes.length;
  const unansweredCount = mistakes.filter((insight) => !insight.isAnswered).length;
  const wrongCount = mistakes.length - unansweredCount;
  const weakestSection =
    sections.length > 0
      ? sections.reduce((weakest, section) => {
          if (section.accuracy !== weakest.accuracy) {
            return section.accuracy < weakest.accuracy ? section : weakest;
          }
          return section.wrong + section.unanswered > weakest.wrong + weakest.unanswered
            ? section
            : weakest;
        })
      : null;

  const actions: ExamReviewAction[] = [];
  if (weakestSection) pushUniqueAction(actions, getSectionAction(weakestSection.section));

  if (mistakes.length > 0) {
    pushUniqueAction(actions, {
      id: "weak-points",
      label: "Weak Point Trainer",
      href: "/tools/weak-points",
      reason: "Perkuat kartu SRS yang rentan setelah ujian.",
    });
  }

  pushUniqueAction(actions, {
    id: "flashcards",
    label: "Flashcards",
    href: "/tools/flashcards",
    reason: "Ulangi materi dengan sesi kartu cepat.",
  });

  return {
    totalQuestions: insights.length,
    correctCount,
    wrongCount,
    unansweredCount,
    accuracy: clampPercent((correctCount / Math.max(1, insights.length)) * 100),
    insights,
    mistakes,
    sections,
    weakestSection,
    actions: actions.slice(0, 3),
  };
}
