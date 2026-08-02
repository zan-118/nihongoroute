"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
 Activity,
 ArrowRight,
 BookOpen,
 CheckCircle2,
 GraduationCap,
 Hash,
 Headphones,
 Languages,
 ListChecks,
 Mic,
 PlayCircle,
 XCircle,
 type IconType,
} from "@/components/ui/icons";
import type { LearningEvent, LearningEventType, LearningSourceType } from "@/lib/learning-ecosystem";
import { useUIStore } from "@/store/useUIStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Map event types to UI metadata.
 */
const EVENT_META: Record<
 LearningEventType,
 {
 label: string;
 description: string;
 icon: IconType;
 className: string;
 }
> = {
 reading_started: {
 label: "Reading",
 description: "Mulai membaca materi library.",
 icon: BookOpen,
 className: "border-primary/25 bg-primary/10 text-primary",
 },
 reading_completed: {
 label: "Reading",
 description: "Selesai membaca materi library.",
 icon: CheckCircle2,
 className: "border-success/25 bg-success/10 text-success",
 },
 listening_started: {
 label: "Listening",
 description: "Mulai menyimak materi audio.",
 icon: Headphones,
 className: "border-primary/25 bg-primary/10 text-primary",
 },
 listening_completed: {
 label: "Listening",
 description: "Sesi listening selesai.",
 icon: CheckCircle2,
 className: "border-success/25 bg-success/10 text-success",
 },
 jlpt_drill_answered: {
 label: "Drill",
 description: "Menjawab soal JLPT mini drill.",
 icon: ListChecks,
 className: "border-warning/25 bg-warning/10 text-warning",
 },
 jlpt_drill_completed: {
 label: "Drill",
 description: "Sesi JLPT mini drill selesai.",
 icon: CheckCircle2,
 className: "border-success/25 bg-success/10 text-success",
 },
 counter_answered: {
 label: "Counter",
 description: "Menjawab latihan counter.",
 icon: Hash,
 className: "border-warning/25 bg-warning/10 text-warning",
 },
 counter_completed: {
 label: "Counter",
 description: "Bank counter selesai dikerjakan.",
 icon: CheckCircle2,
 className: "border-success/25 bg-success/10 text-success",
 },
 shadowing_recorded: {
 label: "Shadowing",
 description: "Rekaman shadowing baru tersimpan.",
 icon: Mic,
 className: "border-secondary/25 bg-secondary/10 text-secondary",
 },
 conjugation_checked: {
 label: "Konjugasi",
 description: "Mengecek jawaban bentuk verba.",
 icon: GraduationCap,
 className: "border-success/25 bg-success/10 text-success",
 },
 text_analyzed: {
 label: "Analyzer",
 description: "Menganalisis teks Jepang.",
 icon: Languages,
 className: "border-primary/25 bg-primary/10 text-primary",
 },
};

/**
 * Map source types to display labels.
 */
const SOURCE_LABELS: Record<LearningSourceType, string> = {
 reading: "Reading",
 listening: "Listening",
 vocab: "Vocab",
 kanji: "Kanji",
 grammar: "Grammar",
 sentence: "Kalimat",
 tool: "Tool",
};

/**
 * Format timestamp to relative time. Fallback if invalid.
 */
function formatTimeSafely(timestamp: number) {
 try {
 // Check invalid timestamp
 if (!Number.isFinite(timestamp) || timestamp <= 0) return "Baru saja";
 return formatDistanceToNow(timestamp, { addSuffix: true, locale: idLocale });
 } catch {
 return "Baru saja";
 }
}

/**
 * Get outcome icon, label, style from event.
 */
function getOutcome(event: LearningEvent) {
 // Check incorrect answer
 if (event.details?.isCorrect === false) {
 return {
 icon: XCircle,
 label: "Review",
 className: "border-warning/25 bg-warning/10 text-warning",
 };
 }

 // Check correct answer
 if (event.details?.isCorrect === true) {
 return {
 icon: CheckCircle2,
 label: "Tepat",
 className: "border-success/25 bg-success/10 text-success",
 };
 }

 // Check completion event
 if (event.type.endsWith("_completed")) {
 return {
 icon: CheckCircle2,
 label: "Selesai",
 className: "border-success/25 bg-success/10 text-success",
 };
 }

 // Default active state
 return {
 icon: PlayCircle,
 label: "Aktif",
 className: "border-border bg-muted/20 text-muted-foreground",
 };
}

/**
 * Get title for event.
 */
function getEventTitle(event: LearningEvent) {
 return event.source.title || event.details?.prompt || SOURCE_LABELS[event.source.type];
}

/**
 * Render single event row.
 */
function TimelineRow({ event }: { event: LearningEvent }) {
 const meta = EVENT_META[event.type];
 const outcome = getOutcome(event);
 const Icon = meta.icon;
 const OutcomeIcon = outcome.icon;
 const title = getEventTitle(event);
 const content = (
 <div className="group flex items-start gap-3 rounded-lg border border-border bg-background/35 p-4 transition-all hover:border-primary/35 hover:bg-muted/20">
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
 <Badge variant="outline" className="rounded-lg text-[8px]">
 {meta.label}
 </Badge>
 <span
 className={cn(
 "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest",
 outcome.className
 )}
 >
 <OutcomeIcon size={10} aria-hidden="true" />
 {outcome.label}
 </span>
 </div>
 <h3 className="mt-2 truncate text-sm text-foreground">{title}</h3>
 <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
 {meta.description}
 </p>
 <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
 {SOURCE_LABELS[event.source.type]} · {formatTimeSafely(event.createdAt)}
 </p>
 </div>
 {event.source.href ? (
 <ArrowRight
 size={16}
 className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
 aria-hidden="true"
 />
 ) : null}
 </div>
 );

 // Render link wrapper if href exists
 if (!event.source.href) return content;

 return (
 <Link href={event.source.href} aria-label={`Buka ${title}`}>
 {content}
 </Link>
 );
}

/**
 * Props for timeline panel.
 */
interface LearningTimelinePanelProps {
 compact?: boolean;
 className?: string;
 limit?: number;
}

/**
 * Panel showing recent learning activities.
 */
export default function LearningTimelinePanel({
 compact = false,
 className,
 limit,
}: LearningTimelinePanelProps) {
 const events = useUIStore((state) => state.learningEvents);
 const visibleEvents = events.slice(0, limit || (compact ? 4 : 6));

 return (
 <Card
 className={cn(
 "rounded-2xl md:rounded-3xl border border-border bg-card/35 p-5 shadow-none md:p-6",
 className
 )}
 >
 <div className="mb-5 flex items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary">
 <Activity size={18} aria-hidden="true" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
 Timeline
 </p>
 <h2 className="text-lg tracking-tight text-foreground">
 Aktivitas Terbaru
 </h2>
 </div>
 </div>
 <Badge variant="outline" className="rounded-xl text-[9px]">
 {events.length}
 </Badge>
 </div>

 {visibleEvents.length > 0 ? (
 <div className="grid gap-3">
 {visibleEvents.map((event) => (
 <TimelineRow key={event.id} event={event} />
 ))}
 </div>
 ) : (
 <div className="rounded-lg border border-dashed border-border bg-muted/15 p-5">
 <p className="text-sm font-bold text-muted-foreground">Belum ada aktivitas.</p>
 <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
 <Link href="/library">Buka Library</Link>
 </Button>
 </div>
 )}
 </Card>
 );
}