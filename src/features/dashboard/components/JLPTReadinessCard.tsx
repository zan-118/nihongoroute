"use client";

/**
 * @file JLPTReadinessCard.tsx
 * @description Dashboard widget that turns study signals into a JLPT readiness score.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clipboard,
  DashboardSpeed,
  Book,
  Repeat,
  Trophy,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";
import { calculateJlptReadiness, type ReadinessCourseCategory } from "@/lib/readiness";

/**
 * Props for JLPTReadinessCard component.
 */
interface JLPTReadinessCardProps {
 /** Loading state flag. */
 loading: boolean;
 /** Course metadata for readiness calculation. */
 courseMetadata: ReadinessCourseCategory[];
}

/** Map action IDs to Lucide icons. */
const actionIcons = {
 review: Repeat,
 course: BookOpen,
 library: Book,
 exam: Clipboard,
 routine: Brain,
};

/**
 * Get color, badge, and glow styles based on score.
 * @param score - Readiness score (0-100).
 */
function getScoreTone(score: number) {
 if (score >= 85) {
 return {
 color: "hsl(var(--success))",
 badge: "border-success/25 bg-success/10 text-success",
 glow: "shadow-[0_0_55px_hsl(var(--success)/0.16)]",
 };
 }

 if (score >= 60) {
 return {
 color: "hsl(var(--primary))",
 badge: "border-primary/25 bg-primary/10 text-primary",
 glow: "shadow-[0_0_55px_hsl(var(--primary)/0.14)]",
 };
 }

 return {
 color: "hsl(var(--warning))",
 badge: "border-warning/25 bg-warning/10 text-warning",
 glow: "shadow-[0_0_55px_hsl(var(--warning)/0.12)]",
 };
}

/**
 * JLPT Readiness Card component.
 * Displays readiness score, metrics, and recommendations.
 */
export default function JLPTReadinessCard({ loading, courseMetadata }: JLPTReadinessCardProps) {
 const completedLessons = useUserStore((state) => state.completedLessons);
 const streak = useUserStore((state) => state.streak);
 const todayReviewCount = useUserStore((state) => state.todayReviewCount);
 const studyDays = useUserStore((state) => state.studyDays);
 const srs = useSRSStore((state) => state.srs);

 // Calculate readiness metrics when dependencies change.
 const readiness = useMemo(
 () =>
 calculateJlptReadiness({
 courseMetadata,
 completedLessons,
 srs,
 streak,
 todayReviewCount,
 studyDays,
 }),
 [completedLessons, courseMetadata, srs, streak, studyDays, todayReviewCount]
 );

 // Show skeleton loader during data fetch.
 if (loading) {
 return <Skeleton className="h-[460px] w-full rounded-2xl" />;
 }

 const tone = getScoreTone(readiness.score);

 return (
 <div className="relative group">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card
 className="relative overflow-hidden rounded-2xl border border-border/50 dark:border-white/10 bg-card p-6 shadow-[0_4px_25px_rgba(0,0,0,0.015)] transition-all duration-500 hover:border-primary/45"
 >

 <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(240px,0.82fr)_minmax(0,1.18fr)]">
 <section className="flex flex-col justify-between gap-8">
 <div className="flex flex-col gap-5">
 <div className="flex flex-wrap items-center gap-3">
 <Badge className={tone.badge}>
 <DashboardSpeed size={12} />
 Kesiapan
 </Badge>
 <Badge variant="outline" className="bg-muted/45 text-muted-foreground">
 {readiness.targetLabel}
 </Badge>
 <Badge variant="outline" className="bg-muted/45 text-muted-foreground">
 Keyakinan {readiness.confidenceLabel}
 </Badge>
 </div>

 <div>
 <h2 className="text-2xl uppercase tracking-tight text-foreground md:text-3xl">
 Skor Kesiapan JLPT
 </h2>
 <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
 {readiness.summary}
 </p>
 </div>
 </div>

 <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
 {/* Render circular progress ring using conic gradient. */}
 <div
 className="relative grid size-[168px] shrink-0 place-items-center rounded-full border border-border bg-background/55 shadow-inner"
 style={{
 background: `conic-gradient(${tone.color} ${readiness.score}%, hsl(var(--muted)/0.38) 0)`,
 }}
 aria-label={`Skor kesiapan ${readiness.score} persen`}
 >
 <div className="grid size-[124px] place-items-center rounded-full border border-border bg-card">
 <div className="text-center">
 <div className="font-mono text-5xl font-black tracking-tight text-foreground">
 {readiness.score}
 </div>
 <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
 / 100
 </div>
 </div>
 </div>
 </div>

 <div className="flex min-w-0 flex-1 flex-col gap-4">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
 Status Saat Ini
 </p>
 <p className="mt-1 text-2xl font-black text-foreground">
 {readiness.statusLabel}
 </p>
 </div>
 <div className="rounded-lg border border-border bg-muted/25 p-4">
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
 Target aktif
 </p>
 <Link
 href={readiness.targetCourseHref}
 className="mt-2 flex items-center justify-between gap-3 text-sm font-black text-foreground transition-colors hover:text-primary"
 >
 <span className="truncate">{readiness.targetCourseTitle}</span>
 <ArrowRight size={16} />
 </Link>
 </div>
 </div>
 </div>
 </section>

 <section className="flex flex-col gap-6">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 {readiness.metrics.map((metric) => (
 <div
 key={metric.id}
 className="rounded-lg border border-border bg-background/25 p-4 transition-colors hover:border-primary/25 hover:bg-background/35"
 >
 <div className="mb-3 flex items-start justify-between gap-3">
 <div>
 <p className="text-sm font-black text-foreground">{metric.label}</p>
 <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
 {metric.detail}
 </p>
 </div>
 <span className="font-mono text-lg font-black text-primary">{metric.score}%</span>
 </div>
 <Progress value={metric.score} className="h-2 bg-muted/70" />
 </div>
 ))}
 </div>

 <div className="rounded-xl border border-border bg-muted/20 p-5">
 <div className="mb-4 flex items-center justify-between gap-4">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
 Rekomendasi
 </p>
 <h3 className="mt-1 text-lg text-foreground">{readiness.focusLabel}</h3>
 </div>
 <Trophy className="shrink-0 text-primary" size={24} />
 </div>

 <div className="flex flex-col gap-3">
 {readiness.actions.map((action, index) => {
 // Resolve icon component dynamically.
 const Icon = actionIcons[action.id];
 return (
 <Button
 key={`${action.id}-${index}`}
 asChild
 variant={index === 0 ? "default" : "outline"}
 className="h-auto min-h-[76px] justify-start rounded-lg rounded-br-none px-4 py-3 text-left border-border/60 hover:border-primary/30"
 >
 <Link href={action.href}>
 <Icon size={16} />
 <span className="flex min-w-0 flex-col items-start gap-1">
 <span className="truncate text-[10px] uppercase tracking-[0.14em]">
 {action.label}
 </span>
 <span className="line-clamp-2 text-[10px] font-semibold normal-case tracking-normal opacity-70">
 {action.reason}
 </span>
 </span>
 </Link>
 </Button>
 );
 })}
 </div>
 </div>
 </section>
 </div>
 </Card>
 </div>
 );
}