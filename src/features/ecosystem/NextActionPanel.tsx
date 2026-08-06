"use client";

import Link from "next/link";
import {
 ArrowRight,
 BookOpen,
 Brain,
 ChevronRight,
 Compass,
 Play,
 RefreshCcw,
 Sparkles,
} from "@/components/ui/icons";
import { buildEcosystemRecommendations } from "@/lib/learning-ecosystem";
import { useUIStore } from "@/store/useUIStore";
import { useUserStore } from "@/store/useUserStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Category metadata. Map category to label, icon, style. */
const CATEGORY_META = {
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
 icon: Brain,
 className: "border-success/25 bg-success/10 text-success",
 },
 library: {
 label: "Library",
 icon: BookOpen,
 className: "border-secondary/25 bg-secondary/10 text-secondary",
 },
} as const;

import type { EcosystemCourseMetadataItem } from "@/lib/learning/learning-ecosystem";

/** Props for NextActionPanel. */
interface NextActionPanelProps {
 /** Show fewer items if true. */
 compact?: boolean;
 /** Custom CSS classes. */
 className?: string;
 /** Text for empty state. */
 emptyTitle?: string;
 /** Course structure metadata */
 courseMetadata?: EcosystemCourseMetadataItem[];
}

/**
 * NextActionPanel component.
 * Show personalized learning recommendations.
 */
export default function NextActionPanel({
 compact = false,
 className,
 emptyTitle = "Belum ada sinyal belajar",
 courseMetadata,
}: NextActionPanelProps) {
 // Get user state from store.
 const events = useUIStore((state) => state.learningEvents);
 const readingProgressMap = useUIStore((state) => state.readingProgressMap);
 const readingVocabularyBank = useUIStore((state) => state.readingVocabularyBank);
 const completedLessons = useUserStore((state) => state.completedLessons);
 
 // Build recommendations list.
 const recommendations = buildEcosystemRecommendations({
 events,
 readingProgressMap,
 readingVocabularyBank,
 completedLessons,
 courseMetadata,
 limit: compact ? 3 : 5,
 });

 return (
 <Card
 className={cn(
 "relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card/35 p-5 shadow-none md:p-6",
 className
 )}
 >
 <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
 <Compass size={18} aria-hidden="true" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
 Ekosistem Belajar
 </p>
 <h2 className="text-lg tracking-tight text-foreground">
 Langkah Berikutnya
 </h2>
 </div>
 </div>
 <Badge variant="outline" className="rounded-xl text-[9px]">
 {recommendations.length}
 </Badge>
 </div>

 {recommendations.length > 0 ? (
 <div className="relative z-10 grid gap-3">
 {recommendations.map((item) => {
 // Get category metadata for rendering.
 const meta = CATEGORY_META[item.category];
 const Icon = meta.icon;
 return (
 <Link
 key={item.id}
 href={item.href}
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
 <span className="text-sm font-black text-foreground">{item.title}</span>
 <Badge variant="outline" className="rounded-lg text-[8px]">
 {meta.label}
 </Badge>
 </div>
 <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
 {item.description}
 </p>
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
 ) : (
 <div className="relative z-10 rounded-lg border border-dashed border-border bg-muted/15 p-5">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Sparkles size={16} aria-hidden="true" />
 <p className="text-sm font-bold">{emptyTitle}</p>
 </div>
 <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
 <Link href="/library">Mulai dari Library</Link>
 </Button>
 </div>
 )}
 </Card>
 );
}