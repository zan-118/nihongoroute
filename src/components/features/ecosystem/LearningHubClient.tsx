"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Headphones,
  Layers,
  Library,
  Target,
  Wrench,
} from "@/components/ui/icons";
import { buildWeakPointInsights } from "@/lib/learning-ecosystem";
import { useUIStore } from "@/store/useUIStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DailyRoutePanel from "./DailyRoutePanel";
import LearningTimelinePanel from "./LearningTimelinePanel";
import NextActionPanel from "./NextActionPanel";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/lib/core/routes";
/**
 * Quick navigation links for ecosystem.
 */
const QUICK_LINKS = [
  {
    title: "Reading",
    description: "Lanjutkan input teks dan kumpulkan vocab dari bacaan.",
    href: "/library/reading",
    icon: BookOpen,
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  {
    title: "Listening",
    description: "Bangun loop menyimak, transkrip, lalu shadowing.",
    href: "/library/listening",
    icon: Headphones,
    className: "border-secondary/25 bg-secondary/10 text-secondary",
  },
  {
    title: "Tools",
    description: "Buka latihan yang tersambung dengan data library.",
    href:ROUTES.TOOLS.ROOT,
    icon: Wrench,
    className: "border-success/25 bg-success/10 text-success",
  },
  {
    title: "Materi",
    description: "Ikuti kurikulum pelajaran terstruktur tingkat JLPT.",
    href: "/courses",
    icon: BookOpen,
    className: "border-warning/25 bg-warning/10 text-warning",
  },
];

/**
 * Card component for single metric.
 * 
 * @param props - Component properties.
 * @param props.label - Metric name.
 * @param props.value - Metric value.
 * @param props.icon - Lucide icon component.
 */
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
}) {
  return (
    <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/35 p-5 shadow-none">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-mono text-3xl font-black text-foreground">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Icon size={19} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Main dashboard client. Connects library, tools, weak points, next actions.
 */
export default function LearningHubClient() {
  // Fetch learning events.
  const events = useUIStore((state) => state.learningEvents);
  // Fetch reading progress.
  const readingProgressMap = useUIStore((state) => state.readingProgressMap);
  // Fetch vocabulary bank.
  const readingVocabularyBank = useUIStore((state) => state.readingVocabularyBank);
  
  // Compute weak points.
  const weakPoints = buildWeakPointInsights({ events, limit: 4 });
  // Count active readings.
  const activeReadingCount = Object.values(readingProgressMap).filter(
    (entry) => !entry.completedAt
  ).length;
  // Count total vocabulary.
  const vocabBankCount = Object.keys(readingVocabularyBank).length;

  return (
    <div className="min-h-screen bg-transparent px-4 pb-24 pt-8 md:px-8 md:pt-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Layers size={26} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  Learning Ecosystem
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Route · Review · Tools · Library
                </p>
              </div>
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl uppercase leading-none tracking-tight text-foreground md:text-6xl">
                Learning Hub
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                Pusat kendali untuk menyambungkan aktivitas library, tools, titik lemah,
                dan langkah belajar berikutnya.
              </p>
            </div>
          </div>

          <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/35 p-5 shadow-none">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Status Ekosistem
                </p>
                <h2 className="mt-1 text-xl text-foreground">
                  {events.length > 0 ? "Aktif" : "Siap Dimulai"}
                </h2>
              </div>
              <Badge variant="outline" className="rounded-xl">
                {events.length} event
              </Badge>
            </div>
            <Button asChild className="w-full rounded-xl">
              <Link href="/library">
                Mulai Sesi Baru
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </Card>
        </header>

        <section className="grid gap-4 grid-cols-1 md:grid-cols-12">
          <StatCard label="Aktivitas" value={events.length} icon={Activity} />
          <StatCard label="Reading Aktif" value={activeReadingCount} icon={BookOpen} />
          <StatCard label="Bank Vocab" value={vocabBankCount} icon={BrainCircuit} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <DailyRoutePanel />
          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/35 p-5 shadow-none md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
                  <Target size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                    Adaptive Signals
                  </p>
                  <h2 className="text-lg tracking-tight text-foreground">
                    Titik Lemah
                  </h2>
                </div>
              </div>

              {weakPoints.length > 0 ? (
                <div className="grid gap-3">
                  {weakPoints.map((weakPoint) => (
                    <Link
                      key={weakPoint.id}
                      href={weakPoint.href}
                      className="group rounded-lg border border-border bg-background/35 p-4 transition-all hover:border-warning/35 hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-lg text-[8px]">
                              {weakPoint.label}
                            </Badge>
                            <span className="font-mono text-[10px] font-black text-warning">
                              {weakPoint.mistakes}/{weakPoint.attempts}
                            </span>
                          </div>
                          <h3 className="mt-2 line-clamp-1 text-sm text-foreground">
                            {weakPoint.sourceTitle || weakPoint.label}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
                            {weakPoint.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-warning"
                          aria-hidden="true"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-muted/15 p-5 text-sm font-bold text-muted-foreground">
                  Belum ada pola kesalahan yang cukup kuat.
                </p>
              )}
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-lg border border-border bg-card/35 p-4 transition-all hover:border-primary/35 hover:bg-muted/20"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                          item.className
                        )}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm text-foreground">{item.title}</h3>
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
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <NextActionPanel />
          <LearningTimelinePanel limit={8} />
        </section>
      </div>
    </div>
  );
}