/**
 * @file review-utils.ts
 * @description Pure helpers untuk UI review jawaban mock exam: tone akurasi,
 * status soal, link sumber, dan label SRS. Dipisah dari ExamReview agar testable.
 */

import {
 Alert,
 BookOpen,
 Brain,
 Check,
 Clipboard,
 Target,
 VolumeUp,
 X,
 type IconType,
} from "@/components/ui/icons";
import type {
 ExamReviewAction,
 ExamReviewQuestionInsight,
} from "@/lib/learning/exam-review-analysis";

/** Filter daftar review soal. */
export type ReviewFilter = "mistakes" | "all";

/** Map action ID to icon. */
export const ACTION_ICONS: Record<ExamReviewAction["id"], IconType> = {
 "weak-points": Target,
 flashcards: Clipboard,
 listening: VolumeUp,
 reading: BookOpen,
 grammar: Brain,
 vocab: BookOpen,
};

/** Get CSS classes from accuracy score. */
export function getAccuracyTone(accuracy: number) {
 if (accuracy >= 70) return "text-success border-success/25 bg-success/10";
 if (accuracy >= 45) return "text-warning border-warning/25 bg-warning/10";
 return "text-destructive border-destructive/25 bg-destructive/10";
}

/** Get border class from question correctness. */
export function getQuestionBorderClass(insight: ExamReviewQuestionInsight) {
 if (insight.isCorrect) return "border-success/25";
 if (!insight.isAnswered) return "border-warning/30";
 return "border-destructive/25";
}

/** Get status metadata for question. */
export function getQuestionStatus(insight: ExamReviewQuestionInsight) {
 if (insight.isCorrect) {
   return {
     label: "Benar",
     icon: Check,
     className: "bg-success/10 text-success border-success/20",
   };
 }

 if (!insight.isAnswered) {
   return {
     label: "Kosong",
     icon: Alert,
     className: "bg-warning/10 text-warning border-warning/20",
   };
 }

 return {
   label: "Salah",
   icon: X,
   className: "bg-destructive/10 text-destructive border-destructive/20",
 };
}

/** Get library URL from source type and ID. */
export function getSourceHref(sourceType?: string | null, sourceId?: string | null) {
 if (!sourceType || !sourceId) return null;
 const encodedId = encodeURIComponent(sourceId);

 if (sourceType === "vocab") return `/library/vocab/${encodedId}`;
 if (sourceType === "kanji") return `/library/kanji/${encodedId}`;
 if (sourceType === "reading") return `/library/reading/${encodedId}`;
 if (sourceType === "listening") return `/library/listening/${encodedId}`;
 if (sourceType === "grammar") return `/library/grammar/${encodedId}`;

 return null;
}

/** Get SRS label for wrong answer. */
export function getSrsStatusLabel(insight: ExamReviewQuestionInsight) {
 const hasSource = Boolean(insight.question.sourceType && insight.question.sourceId);
 if (insight.isCorrect || !hasSource) return null;

 return insight.question.sourceType === "vocab"
   ? "Masuk SRS otomatis"
   : "Masuk weak point";
}
