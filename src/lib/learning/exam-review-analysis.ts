/**
 * @file exam-review-analysis.ts
 * @description Pure helpers for post-exam mistake review and remediation guidance.
 */

import type { ExamData, ExamQuestion } from "@/components/features/exams/mock-engine/types";

import { ROUTES } from "@/lib/core/routes";
/**
 * Insight details for a single exam question.
 */
export interface ExamReviewQuestionInsight {
  /** The original exam question data. */
  question: ExamQuestion;
  /** Zero-based index of the question in the exam. */
  index: number;
  /** The index of the answer selected by the user, if any. */
  userAnswer?: number;
  /** Indicates if the user provided an answer. */
  isAnswered: boolean;
  /** Indicates if the user's answer matches the correct answer. */
  isCorrect: boolean;
}

/**
 * Performance metrics grouped by exam section.
 */
export interface ExamReviewSectionInsight {
  /** The section category. */
  section: ExamQuestion["section"];
  /** Total questions in this section. */
  total: number;
  /** Number of correct answers. */
  correct: number;
  /** Number of incorrect answers. */
  wrong: number;
  /** Number of unanswered questions. */
  unanswered: number;
  /** Percentage of correct answers (0-100). */
  accuracy: number;
}

/**
 * Recommended action item for study remediation.
 */
export interface ExamReviewAction {
  /** Unique identifier for the action type. */
  id: "weak-points" | "flashcards" | "listening" | "reading" | "grammar" | "vocab";
  /** Display label for the action button or link. */
  label: string;
  /** Target URL for remediation. */
  href: string;
  /** Reason explaining why this action is recommended. */
  reason: string;
}

/**
 * Complete analysis payload for exam review.
 */
export interface ExamReviewAnalysis {
  /** Total number of questions in the exam. */
  totalQuestions: number;
  /** Total correct answers. */
  correctCount: number;
  /** Total incorrect answers. */
  wrongCount: number;
  /** Total unanswered questions. */
  unansweredCount: number;
  /** Overall exam accuracy percentage (0-100). */
  accuracy: number;
  /** Detailed insights for all questions. */
  insights: ExamReviewQuestionInsight[];
  /** Subset of insights containing only incorrect or unanswered questions. */
  mistakes: ExamReviewQuestionInsight[];
  /** Performance metrics grouped by section. */
  sections: ExamReviewSectionInsight[];
  /** The section with the lowest performance, if applicable. */
  weakestSection: ExamReviewSectionInsight | null;
  /** Recommended remediation actions (maximum of 3). */
  actions: ExamReviewAction[];
}

/**
 * Standard display and processing order for exam sections.
 */
const SECTION_ORDER: ExamQuestion["section"][] = ["vocabulary", "grammar", "reading", "listening"];

/**
 * Clamps a numeric value to a valid percentage integer between 0 and 100.
 * 
 * @param value - The raw percentage value.
 * @returns Clamped integer percentage.
 */
function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Generates a remediation action based on the weakest exam section.
 * 
 * @param section - The target exam section.
 * @returns The corresponding review action.
 */
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

/**
 * Appends an action to the list if an action with the same ID does not already exist.
 * 
 * @param actions - The target actions array.
 * @param action - The action to insert.
 */
function pushUniqueAction(actions: ExamReviewAction[], action: ExamReviewAction) {
  if (!actions.some((item) => item.id === action.id)) actions.push(action);
}

/**
 * Analyzes exam questions and user answers to generate performance insights and remediation actions.
 * 
 * @param exam - Object containing the list of exam questions.
 * @param answers - Map of question keys to user-selected answer indices.
 * @returns Comprehensive exam review analysis.
 */
export function analyzeExamReview(
  exam: Pick<ExamData, "questions">,
  answers: Record<string, number>
): ExamReviewAnalysis {
  const sectionMap = new Map<ExamQuestion["section"], ExamReviewSectionInsight>();

  // Initialize map with default metrics for all standard sections
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

  // Process each question to build individual insights and aggregate section metrics
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

  // Calculate final accuracy percentages for active sections
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

  // Determine weakest section by lowest accuracy, breaking ties with total incorrect/unanswered count
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
  
  // Add section-specific remediation if a weakest section is identified
  if (weakestSection) pushUniqueAction(actions, getSectionAction(weakestSection.section));

  // Add general remediation actions based on performance
  if (mistakes.length > 0) {
    pushUniqueAction(actions, {
      id: "weak-points",
      label: "Weak Point Trainer",
      href:ROUTES.TOOLS.WEAK_POINTS,
      reason: "Perkuat kartu SRS yang rentan setelah ujian.",
    });
  }

  pushUniqueAction(actions, {
    id: "flashcards",
    label: "Flashcards",
    href:ROUTES.TOOLS.FLASHCARDS,
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
    actions: actions.slice(0, 3), // Limit to top 3 recommendations
  };
}