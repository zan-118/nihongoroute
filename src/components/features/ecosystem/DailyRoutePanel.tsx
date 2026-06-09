"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Compass,
  Flame,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  buildDailyRoute,
  buildWeakPointInsights,
  type DailyRouteCategory,
} from "@/lib/learning-ecosystem";
import { useUIStore } from "@/store/useUIStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  DailyRouteCategory,
  { label: string; icon: LucideIcon; className: string }
> = {
  warmup: {
    label: "Warmup",
    icon: Flame,
    className: "border-secondary/25 bg-secondary/10 text-secondary",
  },
  continue: {
    label: "Lanjut",
    icon: PlayCircle,
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  review: {
    label: "Review",
    icon: RotateCcw,
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

interface DailyRoutePanelProps {
  compact?: boolean;
  className?: string;
}

export default function DailyRoutePanel({ compact = false, className }: DailyRoutePanelProps) {
  const events = useUIStore((state) => state.learningEvents);
  const readingProgressMap = useUIStore((state) => state.readingProgressMap);
  const readingVocabularyBank = useUIStore((state) => state.readingVocabularyBank);
  const dailyRoute = buildDailyRoute({
    events,
    readingProgressMap,
    readingVocabularyBank,
    limit: compact ? 4 : 6,
  });
  const weakPoints = buildWeakPointInsights({ events, limit: compact ? 2 : 4 });

  return (
    <Card
      className={cn(
        "rounded-[34px] border border-border bg-card/40 p-5 shadow-none backdrop-blur-xl md:p-6",
        className
      )}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Compass size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Daily Route
            </p>
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Belajar Hari Ini
            </h2>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit rounded-xl">
          <Link href="/learning-hub">
            Hub
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <div className={cn("grid gap-3", !compact && "lg:grid-cols-2")}>
        {dailyRoute.map((step) => {
          const meta = CATEGORY_META[step.category];
          const Icon = meta.icon;

          return (
            <Link
              key={step.id}
              href={step.href}
              className="group rounded-2xl border border-border bg-background/35 p-4 transition-all hover:border-primary/35 hover:bg-muted/20"
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
                  <h3 className="mt-2 line-clamp-1 text-sm font-black text-foreground">
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

      {weakPoints.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-warning/20 bg-warning/10 p-4">
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
                <BrainCircuit size={14} aria-hidden="true" />
                {weakPoint.label}
                <span className="font-mono text-[10px] text-muted-foreground">
                  {weakPoint.mistakes}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/15 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles size={15} aria-hidden="true" />
            <p className="text-sm font-bold">Belum ada titik lemah yang menonjol.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
