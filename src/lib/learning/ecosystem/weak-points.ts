/**
 * @file weak-points.ts
 * @description Analisis weak points dari event belajar: kategorisasi, URL target, dan insight.
 */

import type { LearningEvent } from "@/lib/learning-events";
import { ROUTES } from "@/lib/core/routes";
import type { WeakPointCategory, WeakPointInsight } from "./types";
import { drillHref } from "./urls";

/**
 * Metadata for weak point categories.
 */
const WEAK_POINT_META: Record<
 WeakPointCategory,
 { label: string; href: string; description: string }
> = {
 reading: {
 label: "Reading",
 href: "/library/reading",
 description: "Pemahaman bacaan butuh penguatan konteks.",
 },
 listening: {
 label: "Listening",
 href: "/library/listening",
 description: "Pemahaman audio butuh pengulangan aktif.",
 },
 vocab: {
 label: "Kosakata",
 href: "/tools/jlpt-drill?kind=vocab",
 description: "Arti, bacaan, atau konteks kata masih rapuh.",
 },
 kanji: {
 label: "Kanji",
 href: "/tools/jlpt-drill?kind=kanji",
 description: "Arti atau bacaan kanji perlu dilatih ulang.",
 },
 grammar: {
 label: "Grammar",
 href: "/tools/jlpt-drill?kind=grammar",
 description: "Pola kalimat perlu dipakai lagi dalam soal singkat.",
 },
 counter: {
 label: "Counter",
 href: ROUTES.TOOLS.COUNTER_TRAINER,
 description: "Pilihan kata bantu bilangan masih perlu pemanasan.",
 },
 conjugation: {
 label: "Konjugasi",
 href: ROUTES.TOOLS.CONJUGATION,
 description: "Bentuk verba perlu dicek ulang.",
 },
 sentence: {
 label: "Kalimat",
 href: "/tools/jlpt-drill?kind=sentence",
 description: "Pemahaman kalimat contoh perlu dilatih lagi.",
 },
 mixed: {
 label: "Campuran",
 href: ROUTES.TOOLS.JLPT_DRILL,
 description: "Ada beberapa area kecil yang perlu distabilkan.",
 },
};

/**
 * Sort events by date descending.
 */
function latestEvents(events: LearningEvent[]) {
 return [...events].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Determine weak point category from event.
 */
function weakPointCategory(event: LearningEvent): WeakPointCategory {
 const detailKind = event.details?.kind;
 if (detailKind === "counter" || detailKind === "conjugation") return detailKind;
 if (detailKind === "vocab" || detailKind === "kanji" || detailKind === "grammar") {
 return detailKind;
 }
 if (event.source.type === "vocab" || event.source.type === "kanji" || event.source.type === "grammar") {
 return event.source.type;
 }
 if (event.source.type === "reading" || event.source.type === "listening") {
 return event.source.type;
 }
 return "mixed";
}

/**
 * Get tool URL for weak point category.
 */
function categoryHref(category: WeakPointCategory, event?: LearningEvent) {
 if (category === "counter") return ROUTES.TOOLS.COUNTER_TRAINER;
 if (category === "conjugation") {
 const params = new URLSearchParams();
 if (event?.details?.prompt) params.set("verb", event.details.prompt);
 if (event?.details?.focus) params.set("group", event.details.focus);
 if (event?.details?.text) params.set("form", event.details.text);
 return params.size > 0 ? `/tools/conjugation?${params.toString()}` : ROUTES.TOOLS.CONJUGATION;
 }
 if (category === "vocab" || category === "kanji" || category === "grammar") {
 return drillHref(event?.source || { type: category }, category);
 }
 return WEAK_POINT_META[category].href;
}

/**
 * Build weak point insights from events.
 */
export function buildWeakPointInsights({
 events,
 limit = 5,
}: {
 events: LearningEvent[];
 limit?: number;
}): WeakPointInsight[] {
 const buckets = new Map<
 WeakPointCategory,
 {
 attempts: number;
 mistakes: number;
 lastEvent?: LearningEvent;
 lastSeenAt: number;
 sourceTitle?: string;
 }
 >();

 // Aggregate recent events into category buckets.
 latestEvents(events).slice(0, 40).forEach((event) => {
 const isAnswerEvent =
 event.type === "jlpt_drill_answered" ||
 event.type === "counter_answered" ||
 event.type === "conjugation_checked";
 const lowAccuracy =
 event.type === "jlpt_drill_completed" &&
 typeof event.metrics?.accuracy === "number" &&
 event.metrics.accuracy < 80;

 if (!isAnswerEvent && !lowAccuracy) return;

 const category = weakPointCategory(event);
 const existing = buckets.get(category) || {
 attempts: 0,
 mistakes: 0,
 lastSeenAt: 0,
 };
 const isMistake = event.details?.isCorrect === false || lowAccuracy;

 buckets.set(category, {
 attempts: existing.attempts + 1,
 mistakes: existing.mistakes + (isMistake ? 1 : 0),
 lastEvent: event.createdAt >= existing.lastSeenAt ? event : existing.lastEvent,
 lastSeenAt: Math.max(existing.lastSeenAt, event.createdAt),
 sourceTitle: event.source.title || existing.sourceTitle,
 });
 });

 // Map buckets to weak point insights.
 return Array.from(buckets.entries())
 .filter(([, bucket]) => bucket.mistakes > 0)
 .map(([category, bucket]) => {
 const meta = WEAK_POINT_META[category];
 // Calculate priority score.
 const score = bucket.mistakes * 10 + Math.min(bucket.attempts, 6) * 2 + bucket.lastSeenAt / 1_000_000_000_000;
 return {
 id: `weak-${category}`,
 category,
 label: meta.label,
 description:
 bucket.mistakes > 1
 ? `${bucket.mistakes} sinyal salah terakhir muncul di area ini.`
 : meta.description,
 href: categoryHref(category, bucket.lastEvent),
 mistakes: bucket.mistakes,
 attempts: bucket.attempts,
 score,
 lastSeenAt: bucket.lastSeenAt,
 sourceTitle: bucket.sourceTitle,
 };
 })
 .sort((a, b) => b.score - a.score)
 .slice(0, limit);
}
