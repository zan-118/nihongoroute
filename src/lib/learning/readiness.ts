/**
 * @file readiness.ts
 * @description Derived JLPT readiness scoring helpers for dashboard guidance.
 */

import type { SRSState } from "@/lib/srs";
import { summarizeSrs, type SrsMemorySummary } from "@/lib/srs-summary";
import type { LessonProgress } from "@/store/types";

/**
 * Supported JLPT levels ordered from lowest to highest.
 */
export const JLPT_LEVELS = ["n5", "n4", "n3", "n2", "n1"] as const;

/**
 * JLPT level type.
 */
export type JlptLevel = (typeof JLPT_LEVELS)[number];

/**
 * Lesson structure for readiness calculation.
 */
export interface ReadinessCourseLesson {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
}

/**
 * Course category structure containing lessons.
 */
export interface ReadinessCourseCategory {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  lessonCount?: number;
  lessons?: ReadinessCourseLesson[];
  previews?: ReadinessCourseLesson[];
}

/**
 * Individual readiness metric score and weight.
 */
export interface ReadinessMetric {
  id: "curriculum" | "memoryVolume" | "stability" | "routine";
  label: string;
  score: number;
  weight: number;
  detail: string;
}

/**
 * Recommended action based on readiness score.
 */
export interface ReadinessAction {
  id: "review" | "course" | "library" | "exam" | "routine";
  label: string;
  href: string;
  reason: string;
}

/**
 * Final readiness calculation output.
 */
export interface ReadinessResult {
  score: number;
  targetLevel: JlptLevel;
  targetLabel: string;
  targetCourseTitle: string;
  targetCourseHref: string;
  statusLabel: string;
  confidenceLabel: "Rendah" | "Sedang" | "Tinggi";
  focusLabel: string;
  summary: string;
  metrics: ReadinessMetric[];
  actions: ReadinessAction[];
}

/**
 * Input parameters for readiness calculation.
 */
interface CalculateReadinessInput {
  courseMetadata: ReadinessCourseCategory[];
  completedLessons: Record<string, LessonProgress>;
  srs?: Record<string, SRSState>;
  srsSummary?: SrsMemorySummary;
  streak: number;
  todayReviewCount: number;
  studyDays: Record<string, number>;
  now?: Date;
}

/**
 * Intermediate stats for course progress.
 */
interface CourseReadinessStats {
  course: ReadinessCourseCategory;
  level: JlptLevel | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

/**
 * Target thresholds per JLPT level.
 */
const LEVEL_TARGETS: Record<JlptLevel, { cards: number; activeDays: number; streak: number }> = {
  n5: { cards: 150, activeDays: 7, streak: 7 },
  n4: { cards: 400, activeDays: 9, streak: 14 },
  n3: { cards: 900, activeDays: 10, streak: 21 },
  n2: { cards: 1500, activeDays: 11, streak: 30 },
  n1: { cards: 2500, activeDays: 12, streak: 45 },
};

/**
 * Target daily review count.
 */
const DAILY_REVIEW_TARGET = 20;

/**
 * Day window size for recent activity check.
 */
const RECENT_WINDOW_DAYS = 14;

/**
 * Clamps score between 0 and 100.
 */
function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Formats number as percentage string.
 */
function formatPercent(value: number) {
  return `${clampScore(value)}%`;
}

/**
 * Converts date to local YYYY-MM-DD key.
 */
function toLocalDateKey(date: Date) {
  // Adjust timezone offset to get correct local date string
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

/**
 * Counts active study days in recent window.
 */
function getRecentStudyDayCount(
  studyDays: Record<string, number>,
  windowDays = RECENT_WINDOW_DAYS,
  now = new Date()
) {
  let activeDays = 0;

  for (let i = 0; i < windowDays; i += 1) {
    const cursor = new Date(now);
    cursor.setDate(now.getDate() - i);
    if ((studyDays[toLocalDateKey(cursor)] || 0) > 0) activeDays += 1;
  }

  return activeDays;
}

/**
 * Extracts JLPT level from string.
 */
export function detectJlptLevel(value: string | null | undefined): JlptLevel | null {
  if (!value) return null;

  const match = value.toLowerCase().match(/n\s*([1-5])/);
  if (!match) return null;

  return `n${match[1]}` as JlptLevel;
}

/**
 * Gets possible identifier keys for lesson.
 */
function getLessonKeyCandidates(lesson: ReadinessCourseLesson) {
  return [lesson._id, lesson.id, lesson.slug].filter((key): key is string => Boolean(key));
}

/**
 * Retrieves lessons or previews from course.
 */
function getCourseLessons(course: ReadinessCourseCategory) {
  if (course.lessons && course.lessons.length > 0) return course.lessons;
  return course.previews || [];
}

/**
 * Checks if lesson is completed.
 */
function isLessonCompleted(
  lesson: ReadinessCourseLesson,
  completedLessons: Record<string, LessonProgress>
) {
  return getLessonKeyCandidates(lesson).some((key) => {
    const progress = completedLessons[key];
    return Boolean(progress?.completedAt && !progress.isDeleted);
  });
}

/**
 * Builds progress stats for all courses.
 */
function buildCourseStats(
  courseMetadata: ReadinessCourseCategory[],
  completedLessons: Record<string, LessonProgress>
) {
  return courseMetadata.map<CourseReadinessStats>((course) => {
    const lessons = getCourseLessons(course);
    const completed = lessons.filter((lesson) => isLessonCompleted(lesson, completedLessons)).length;
    const declaredTotal = course.lessonCount || lessons.length;
    const totalLessons = Math.max(declaredTotal, completed);
    const progress = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;

    return {
      course,
      level: detectJlptLevel(`${course.slug} ${course.title}`),
      totalLessons,
      completedLessons: completed,
      progress,
    };
  });
}

/**
 * Sorts course stats by JLPT level order.
 */
function sortByJlptOrder(a: CourseReadinessStats, b: CourseReadinessStats) {
  const aOrder = a.level ? JLPT_LEVELS.indexOf(a.level) : Number.MAX_SAFE_INTEGER;
  const bOrder = b.level ? JLPT_LEVELS.indexOf(b.level) : Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
}

/**
 * Finds current target course based on progress.
 */
function getTargetCourse(stats: CourseReadinessStats[]) {
  const jlptStats = stats.filter((stat) => stat.level).sort(sortByJlptOrder);
  const target =
    jlptStats.find((stat) => stat.progress < 100) ||
    jlptStats[jlptStats.length - 1] ||
    stats.find((stat) => stat.progress < 100) ||
    stats[0];

  return target || null;
}

/**
 * Maps score to status label.
 */
function getStatusLabel(score: number) {
  if (score >= 85) return "Siap Simulasi";
  if (score >= 70) return "Hampir Siap";
  if (score >= 50) return "On Track";
  if (score >= 25) return "Fondasi Awal";
  return "Mulai Fondasi";
}

/**
 * Maps weakest metric to focus label.
 */
function getFocusLabel(metric: ReadinessMetric) {
  if (metric.id === "curriculum") return "Lanjutkan materi inti";
  if (metric.id === "memoryVolume") return "Perbesar bank hafalan";
  if (metric.id === "stability") return "Stabilkan kartu rentan";
  return "Jaga ritme harian";
}

/**
 * Calculates confidence label based on activity signals.
 */
function getConfidenceLabel(stats: {
  totalLessons: number;
  activeCards: number;
  recentActiveDays: number;
}): ReadinessResult["confidenceLabel"] {
  let signals = 0;
  if (stats.totalLessons > 0) signals += 1;
  if (stats.activeCards >= 20) signals += 1;
  if (stats.recentActiveDays > 0) signals += 1;

  if (signals >= 3) return "Tinggi";
  if (signals === 2) return "Sedang";
  return "Rendah";
}

/**
 * Pushes action to list if ID is unique.
 */
function pushUniqueAction(actions: ReadinessAction[], action: ReadinessAction) {
  if (!actions.some((item) => item.id === action.id)) actions.push(action);
}

/**
 * Builds recommended actions based on metrics and scores.
 */
function buildActions(params: {
  metrics: ReadinessMetric[];
  score: number;
  dueCount: number;
  activeCards: number;
  targetCourseHref: string;
  targetCourseTitle: string;
}) {
  const actions: ReadinessAction[] = [];
  const metricMap = new Map(params.metrics.map((metric) => [metric.id, metric]));

  if (params.dueCount > 0) {
    pushUniqueAction(actions, {
      id: "review",
      label: "Mulai review",
      href: "/review",
      reason: `${params.dueCount} kartu menunggu penguatan.`,
    });
  }

  if ((metricMap.get("curriculum")?.score || 0) < 75) {
    pushUniqueAction(actions, {
      id: "course",
      label: "Lanjut kursus",
      href: params.targetCourseHref,
      reason: params.targetCourseTitle,
    });
  }

  if ((metricMap.get("stability")?.score || 0) < 70 && params.activeCards > 0) {
    pushUniqueAction(actions, {
      id: "review",
      label: "Stabilkan memori",
      href: "/review",
      reason: "Prioritaskan kartu yang masih rentan.",
    });
  }

  if ((metricMap.get("memoryVolume")?.score || 0) < 70) {
    pushUniqueAction(actions, {
      id: "library",
      label: "Tambah kartu",
      href: "/library/vocab",
      reason: "Bank hafalan belum memenuhi target level ini.",
    });
  }

  if ((metricMap.get("routine")?.score || 0) < 70) {
    pushUniqueAction(actions, {
      id: "routine",
      label: "Sesi singkat",
      href: "/tools/flashcards",
      reason: "Bangun ritme dengan latihan ringan.",
    });
  }

  if (params.score >= 70) {
    pushUniqueAction(actions, {
      id: "exam",
      label: "Coba simulasi",
      href: "/exams",
      reason: "Skor kesiapan sudah cukup untuk diuji.",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "course",
      label: "Mulai materi",
      href: params.targetCourseHref,
      reason: "Bangun fondasi dari lesson berikutnya.",
    });
  }

  return actions.slice(0, 3);
}

/**
 * Calculates overall JLPT readiness score and metrics.
 */
export function calculateJlptReadiness(input: CalculateReadinessInput): ReadinessResult {
  const srsSummary = input.srsSummary || summarizeSrs(input.srs);
  const courseStats = buildCourseStats(input.courseMetadata || [], input.completedLessons || {});
  const target = getTargetCourse(courseStats);
  const targetLevel = target?.level || "n5";
  const targets = LEVEL_TARGETS[targetLevel];
  const activeCards = srsSummary.active;
  const stableCards = srsSummary.easeStable + srsSummary.easeMaster;
  const fragileCards = srsSummary.easeCritical + srsSummary.easeFragile;
  const recentActiveDays = getRecentStudyDayCount(input.studyDays || {}, RECENT_WINDOW_DAYS, input.now);
  const targetCourseTitle = target?.course.title || `JLPT ${targetLevel.toUpperCase()}`;
  const targetCourseHref = target?.course.slug ? `/courses/${target.course.slug}` : "/courses";
  const curriculumScore = clampScore(target?.progress || 0);
  const memoryVolumeScore = clampScore((activeCards / targets.cards) * 100);
  
  // Calculate stability score with penalties for fragile and due cards
  const stabilityBase = activeCards > 0 ? (stableCards / activeCards) * 100 : 0;
  const fragilePenalty = activeCards > 0 ? (fragileCards / activeCards) * 25 : 0;
  const duePenalty = activeCards > 0 ? Math.min(20, (srsSummary.due / activeCards) * 20) : 0;
  const stabilityScore = clampScore(stabilityBase - fragilePenalty - duePenalty);
  
  const activeDaysScore = clampScore((recentActiveDays / targets.activeDays) * 100);
  const todayReviewScore = clampScore((input.todayReviewCount / DAILY_REVIEW_TARGET) * 100);
  const streakScore = clampScore((input.streak / targets.streak) * 100);
  
  // Weighted routine score calculation
  const routineScore = clampScore(activeDaysScore * 0.45 + todayReviewScore * 0.35 + streakScore * 0.2);

  const metrics: ReadinessMetric[] = [
    {
      id: "curriculum",
      label: "Kurikulum",
      score: curriculumScore,
      weight: 0.35,
      detail: target
        ? `${target.completedLessons}/${target.totalLessons} lesson selesai`
        : "Belum ada jalur kursus",
    },
    {
      id: "memoryVolume",
      label: "Bank Memori",
      score: memoryVolumeScore,
      weight: 0.25,
      detail: `${activeCards}/${targets.cards} kartu aktif`,
    },
    {
      id: "stability",
      label: "Stabilitas",
      score: stabilityScore,
      weight: 0.25,
      detail: `${stableCards} stabil, ${fragileCards} rentan`,
    },
    {
      id: "routine",
      label: "Ritme",
      score: routineScore,
      weight: 0.15,
      detail: `${recentActiveDays}/14 hari aktif, ${input.todayReviewCount} review hari ini`,
    },
  ];

  const weightedScore = metrics.reduce((total, metric) => total + metric.score * metric.weight, 0);
  const score = clampScore(weightedScore);
  const weakestMetric = metrics.reduce((weakest, metric) =>
    metric.score < weakest.score ? metric : weakest
  );
  const totalLessons = courseStats.reduce((sum, stat) => sum + stat.totalLessons, 0);
  const confidenceLabel = getConfidenceLabel({ totalLessons, activeCards, recentActiveDays });
  const focusLabel = getFocusLabel(weakestMetric);

  return {
    score,
    targetLevel,
    targetLabel: `JLPT ${targetLevel.toUpperCase()}`,
    targetCourseTitle,
    targetCourseHref,
    statusLabel: getStatusLabel(score),
    confidenceLabel,
    focusLabel,
    summary: `${focusLabel}. Sinyal terlemah saat ini: ${weakestMetric.label.toLowerCase()} (${formatPercent(weakestMetric.score)}).`,
    metrics,
    actions: buildActions({
      metrics,
      score,
      dueCount: srsSummary.due,
      activeCards,
      targetCourseHref,
      targetCourseTitle,
    }),
  };
}