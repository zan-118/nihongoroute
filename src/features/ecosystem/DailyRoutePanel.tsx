"use client";

import Link from "next/link";
import {
 ArrowRight,
 BookOpen,
  Brain,
  Check,
  ChevronRight,
  Compass,
  Flame,
  Play,
  RefreshCcw,
 Sparkles,
 Target,
 Wrench,
 type IconType,
} from "@/components/ui/icons";
import {
 buildDailyRoute,
 buildWeakPointInsights,
 type DailyRouteCategory,
} from "@/lib/learning-ecosystem";
import { useUIStore } from "@/store/useUIStore";
import { useUserStore } from "@/store/useUserStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Metadata mapping for daily route categories.
 * Defines label, icon, and style classes.
 */
const CATEGORY_META: Record<
 DailyRouteCategory,
 { label: string; icon: IconType; className: string }
> = {
 warmup: {
 label: "Warmup",
 icon: Flame,
 className: "border-secondary/25 bg-secondary/10 text-secondary",
 },
 continue: {
 label: "Lanjut",
 icon: Play,
 className: "border-primary/25 bg-primary/10 text-primary",
 },
 review: {
 label: "Review",
 icon: RefreshCcw,
 className: "border-warning/25 bg-warning/10 text-warning",
 },
 tool: {
 label: "Tool",
 icon: Wrench,
 className: "border-success/25 bg-success/10 text-success",
 },
 library: {
 label: "Library",
 icon: BookOpen,
 className: "border-primary/25 bg-primary/10 text-primary",
 },
};

import type { EcosystemCourseMetadataItem } from "@/lib/learning/learning-ecosystem";

/**
 * Props for DailyRoutePanel component.
 */
interface DailyRoutePanelProps {
 /** Show fewer items if true. */
 compact?: boolean;
 /** Additional CSS classes. */
 className?: string;
 /** Course structure metadata */
 courseMetadata?: EcosystemCourseMetadataItem[];
 /** Due count for SRS */
 dueCount?: number;
}

/**
 * Render daily learning route and weak points based on user history.
 */
export default function DailyRoutePanel({ compact = false, className, courseMetadata, dueCount = 0 }: DailyRoutePanelProps) {
 // Get user learning history and progress from store.
 const events = useUIStore((state) => state.learningEvents);
 const readingProgressMap = useUIStore((state) => state.readingProgressMap);
 const readingVocabularyBank = useUIStore((state) => state.readingVocabularyBank);
 const completedLessons = useUserStore((state) => state.completedLessons);
 
 // Generate personalized steps.
 const dailyRoute = buildDailyRoute({
 events,
 readingProgressMap,
 readingVocabularyBank,
 completedLessons,
 courseMetadata,
 dueCount,
 limit: compact ? 4 : 6,
 });
 
 // Identify areas needing review.
 const weakPoints = buildWeakPointInsights({ events, limit: compact ? 2 : 4 });

 return (
 <Card
 className={cn(
 "rounded-2xl md:rounded-3xl border border-border bg-card/40 p-5 shadow-none md:p-6",
 className
 )}
 >
 <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
 <Compass size={20} aria-hidden="true" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
 Daily Route
 </p>
 <h2 className="text-xl tracking-tight text-foreground">
 Belajar Hari Ini
 </h2>
 </div>
 </div>
 <Button asChild variant="outline" size="sm" className="w-fit rounded-xl">
 <Link href="/dashboard">
 Hub
 <ArrowRight data-icon="inline-end" />
 </Link>
 </Button>
 </div>

 <div className={cn("grid gap-3", !compact && "lg:grid-cols-2")}>
 {dailyRoute.map((step) => {
 // Get category visual style.
 const meta = CATEGORY_META[step.category];
 const Icon = meta.icon;

 return (
 <Link
 key={step.id}
 href={step.href}
 className="group rounded-lg border border-border bg-background/35 p-4 transition-all hover:border-primary/35 hover:bg-muted/20"
 >
 <div className="flex items-start gap-3">
 <div
 className={cn(
 "flex size-10 shrink-0 items-center justify-center rounded-xl border",
 meta.className
 )}
 >
 <Icon size={16} aria-hidden="true" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <span className="font-mono text-xs font-black text-muted-foreground">
 {String(step.order).padStart(2, "0")}
 </span>
 <Badge variant="outline" className="rounded-lg text-[8px]">
 {meta.label}
 </Badge>
 </div>
 <h3 className="mt-2 line-clamp-1 text-sm text-foreground">
 {step.title}
 </h3>
 <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
 {step.description}
 </p>
 {!compact ? (
 <p className="mt-2 line-clamp-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
 {step.reason}
 </p>
 ) : null}
 </div>
 <ArrowRight
 size={16}
 className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
 aria-hidden="true"
 />
 </div>
 </Link>
 );
 })}
 </div>

 {/* Render weak points section if mistakes exist */}
 {weakPoints.length > 0 ? (
 <div className="mt-5 rounded-lg border border-warning/20 bg-warning/10 p-4">
 <div className="mb-3 flex items-center gap-2">
 <Target size={15} className="text-warning" aria-hidden="true" />
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
 Titik Lemah Aktif
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 {weakPoints.map((weakPoint) => (
 <Link
 key={weakPoint.id}
 href={weakPoint.href}
 className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-background/45 px-3 py-2 text-xs font-black text-foreground transition-colors hover:border-warning/35 hover:text-warning"
 >
 <Brain size={14} aria-hidden="true" />
 {weakPoint.label}
 <span className="font-mono text-[10px] text-muted-foreground">
 {weakPoint.mistakes}
 </span>
 </Link>
 ))}
 </div>
 </div>
 ) : (
 <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/15 p-4">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Sparkles size={15} aria-hidden="true" />
 <p className="text-sm font-bold">Belum ada titik lemah yang menonjol.</p>
 </div>
 </div>
 )}
 </Card>
 );
}