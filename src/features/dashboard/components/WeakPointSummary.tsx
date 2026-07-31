"use client";

/**
 * @file WeakPointSummary.tsx
 * @description Komponen ringkasan compact titik lemah untuk tab Beranda dashboard.
 * Menampilkan maksimal 3 item teratas dari buildWeakPointInsights + CTA ke /tools/weak-points.
 *
 * @datasource useUIStore.learningEvents → buildWeakPointInsights (dari @/lib/learning-ecosystem)
 * @stores useUIStore (read-only: learningEvents)
 */

import Link from "next/link";
import { ArrowRight, BrainCircuit, Target } from "@/components/ui/icons";
import { buildWeakPointInsights } from "@/lib/learning-ecosystem";
import { useUIStore } from "@/store/useUIStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ROUTES } from "@/lib/core/routes";
/**
 * WeakPointSummary — compact weak-point overview for Dashboard Home tab.
 * Shows top 3 weak points with CTA to full trainer.
 */
export default function WeakPointSummary() {
  const events = useUIStore((state) => state.learningEvents);
  const weakPoints = buildWeakPointInsights({ events, limit: 3 });

  if (weakPoints.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/35 p-5 shadow-none md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
            <Target size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
              Titik Lemah
            </p>
            <h2 className="text-lg tracking-tight text-foreground">
              Perlu Perhatian
            </h2>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href={ROUTES.TOOLS.WEAK_POINTS}>
            Latih Semua
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {weakPoints.map((wp) => (
          <Link
            key={wp.id}
            href={wp.href}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-background/45 px-3 py-2 text-xs font-black text-foreground transition-colors hover:border-warning/35 hover:text-warning"
          >
            <BrainCircuit size={14} aria-hidden="true" />
            {wp.label}
            <span className="font-mono text-[10px] text-muted-foreground">
              {wp.mistakes}/{wp.attempts}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
