"use client";

/**
 * @file WeakPointTrainerClient.tsx
 * @description Targeted flashcard session for fragile and overdue SRS cards.
 */

import Link from "next/link";
import type { ComponentType } from "react";
import { useCallback, useMemo, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  ChevronLeft,
  Gauge,
  Library,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import type { MasterCardData } from "@/components/features/flashcards/master/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSRSStore } from "@/store/useSRSStore";
import {
  getWeakPointSummary,
  selectWeakPointCandidates,
  type WeakPointCandidate,
} from "@/lib/weak-points";

/**
 * Card data enriched with weak point metadata.
 */
interface TrainerCard extends MasterCardData {
  weakPoint: WeakPointCandidate;
}

/**
 * Map candidate reasons to Indonesian labels.
 */
const reasonLabels: Record<WeakPointCandidate["reasons"][number], string> = {
  critical: "Kritis",
  fragile: "Rentan",
  due: "Jatuh Tempo",
  overdue: "Terlambat",
  learning: "Belajar",
};

/**
 * Generate unique string signature from SRS state. Prevent unnecessary re-renders.
 * @param srs SRS state object.
 * @returns Signature string.
 */
function getCandidateSignature(srs: ReturnType<typeof useSRSStore.getState>["srs"]) {
  return selectWeakPointCandidates(srs, { limit: 16 })
    .map((item) => [
      item.id,
      item.easeFactor,
      item.interval,
      item.repetition,
      item.nextReview,
      item.weaknessScore,
      item.reasons.join("."),
    ].join(":"))
    .join("|");
}

/**
 * Parse signature string back to candidate array.
 * @param signature Signature string.
 * @returns Candidate array.
 */
function parseCandidateSignature(signature: string): WeakPointCandidate[] {
  if (!signature) return [];

  // Split pipe-separated entries, reconstruct candidate objects
  return signature.split("|").map((entry) => {
    const [id, easeFactor, interval, repetition, nextReview, weaknessScore, reasonText] = entry.split(":");
    return {
      id,
      easeFactor: Number(easeFactor),
      interval: Number(interval),
      repetition: Number(repetition),
      nextReview: Number(nextReview),
      weaknessScore: Number(weaknessScore),
      reasons: reasonText.split(".").filter(Boolean) as WeakPointCandidate["reasons"],
    };
  });
}

/**
 * Calculate average weakness score of candidates.
 * @param candidates Candidate array.
 * @returns Average score.
 */
function getMeanWeakness(candidates: WeakPointCandidate[]) {
  if (candidates.length === 0) return 0;
  const total = candidates.reduce((sum, item) => sum + item.weaknessScore, 0);
  return Math.round(total / candidates.length);
}

/**
 * Client component for targeted flashcard session on weak SRS cards.
 */
export default function WeakPointTrainerClient() {
  const [cards, setCards] = useState<TrainerCard[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  // Get signature from SRS store
  const candidateSignature = useSRSStore((state) => getCandidateSignature(state.srs));
  // Parse signature to get candidates
  const candidates = useMemo(() => parseCandidateSignature(candidateSignature), [candidateSignature]);
  const summary = useMemo(() => getWeakPointSummary(candidates), [candidates]);
  const meanWeakness = useMemo(() => getMeanWeakness(candidates), [candidates]);
  // Map candidates by ID for fast lookup
  const candidateMap = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.id, candidate])),
    [candidates]
  );

  /**
   * Start training session. Fetch card details.
   */
  const startSession = useCallback(async () => {
    if (candidates.length === 0) return;

    try {
      setIsFetching(true);
      setIsSessionActive(false);

      const ids = candidates.map((candidate) => candidate.id);
      // Fetch full card details from API
      const res = await fetch(`/api/cards?ids=${ids.join(",")}`);
      if (!res.ok) throw new Error(`API /api/cards gagal: ${res.status}`);

      const data = (await res.json()) as MasterCardData[];
      // Match API cards with weak point metadata
      const enrichedCards = data
        .map((card, index) => {
          const weakPoint =
            candidateMap.get(card.id) ||
            candidateMap.get(card.word) ||
            candidateMap.get(ids[index]);

          return weakPoint ? { ...card, id: weakPoint.id, weakPoint } : null;
        })
        .filter((card): card is TrainerCard => Boolean(card));

      if (enrichedCards.length === 0) {
        toast.error("Waduh, kartu lemahmu belum bisa dimuat dari database.");
        setCards([]);
        return;
      }

      setCards(enrichedCards);
      setSessionKey((value) => value + 1);
      setIsSessionActive(true);
    } catch (error) {
      console.error("Gagal memulai Weak Point Trainer:", error);
      toast.error("Gagal memuat sesi titik lemah. Coba lagi ya!");
    } finally {
      setIsFetching(false);
    }
  }, [candidateMap, candidates]);

  /**
   * Reset session state.
   */
  const resetSession = () => {
    setIsSessionActive(false);
    setCards([]);
  };

  if (isFetching) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4">
        <Loader2 className="mb-4 animate-spin text-primary" size={34} />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          Menyusun latihan titik lemah...
        </p>
      </main>
    );
  }

  if (isSessionActive && cards.length > 0) {
    return (
      <main className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-4 py-8 md:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-5xl rounded-full bg-destructive/5 blur-[120px]" />
        <div className="relative z-10 w-full max-w-2xl">
          <header className="mb-8 flex items-center justify-between gap-4">
            <Button
              onClick={resetSession}
              variant="ghost"
              className="h-auto rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground"
            >
              <ChevronLeft size={14} />
              Diagnosis
            </Button>
            <Badge
              variant="outline"
              className="h-auto rounded-xl border-destructive/25 bg-destructive/10 px-4 py-2 text-destructive"
            >
              <Target size={14} />
              {cards.length} kartu prioritas
            </Badge>
          </header>

          <FlashcardMaster
            key={sessionKey}
            cards={cards}
            type={cards[0]?.docType === "kanji" ? "kanji" : "vocab"}
            mode="ujian"
            isFixedMode={true}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--destructive-rgb)/0.07),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-50" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="h-auto rounded-full border-destructive/25 bg-destructive/10 px-4 py-1.5 text-destructive"
              >
                <AlertTriangle size={13} />
                Pelatih Titik Lemah
              </Badge>
              <Badge variant="outline" className="h-auto rounded-full bg-muted/45 px-4 py-1.5 text-muted-foreground">
                SRS Diagnosis
              </Badge>
            </div>
            <h1 className="text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Latih Titik Lemah
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
              Sesi ini mengambil kartu dengan ease factor rendah, kartu yang jatuh tempo, dan item
              yang masih rapuh. Fokusnya bukan banyak-banyakan kartu, tapi memperbaiki memori yang bocor.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="h-12 rounded-lg px-5 text-xs font-black uppercase tracking-widest">
              <Link href="/dashboard">
                Dashboard
                <ArrowRight size={14} />
              </Link>
            </Button>
            <Button
              onClick={startSession}
              disabled={candidates.length === 0}
              className="h-12 rounded-lg px-6 text-xs font-black uppercase tracking-widest"
            >
              <Play size={15} />
              Mulai Latihan
            </Button>
          </div>
        </header>

        {candidates.length === 0 ? (
          <EmptyDiagnosis />
        ) : (
          <AnimatePresence mode="wait">
            <m.section
              key="diagnosis"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-[0.82fr_1.18fr]"
            >
              <Card className="relative overflow-hidden rounded-[34px] border-border bg-card/40 p-6 shadow-none  md:p-8">
                <div className="pointer-events-none absolute right-0 top-0 size-52 rounded-full bg-destructive/[0.08] blur-[70px]" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-destructive">
                      Diagnosis aktif
                    </p>
                    <div className="mt-5 flex items-end gap-4">
                      <span className="font-mono text-6xl font-black tracking-tight text-foreground md:text-7xl">
                        {candidates.length}
                      </span>
                      <span className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        kartu lemah
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                      Prioritas rata-rata sesi ini berada di skor {meanWeakness}/100. Kartu dengan skor
                      tertinggi akan muncul lebih dulu.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SummaryTile label="Kritis" value={summary.critical} icon={AlertTriangle} />
                    <SummaryTile label="Jatuh Tempo" value={summary.due} icon={RotateCcw} />
                    <SummaryTile label="Rentan" value={summary.fragile} icon={Gauge} />
                    <SummaryTile label="Belajar" value={summary.learning} icon={BrainCircuit} />
                  </div>
                </div>
              </Card>

              <Card className="rounded-[34px] border-border bg-card/30 p-4 shadow-none  md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4 px-1">
                  <div>
                    <h2 className="text-lg uppercase tracking-tight text-foreground">
                      Antrean Latihan
                    </h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      16 item teratas dari SRS
                    </p>
                  </div>
                  <ShieldCheck className="text-primary" size={24} />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {candidates.map((candidate, index) => (
                    <CandidateRow key={candidate.id} candidate={candidate} index={index} />
                  ))}
                </div>
              </Card>
            </m.section>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}

/**
 * Render summary metric tile.
 */
function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/35 p-4">
      <Icon className="mb-3 text-primary" size={18} />
      <div className="font-mono text-2xl font-black text-foreground">{value}</div>
      <div className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/**
 * Render single candidate row with progress bar.
 */
function CandidateRow({ candidate, index }: { candidate: WeakPointCandidate; index: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 p-4 transition-colors hover:border-destructive/25 hover:bg-background/45">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black text-muted-foreground">
              #{String(index + 1).padStart(2, "0")}
            </span>
            <p className="truncate text-sm font-black text-foreground">{candidate.id}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidate.reasons.map((reason) => (
              <Badge key={reason} variant="outline" className="h-auto rounded-lg px-2 py-0.5 text-[8px]">
                {reasonLabels[reason]}
              </Badge>
            ))}
          </div>
        </div>
        <span className="font-mono text-lg font-black text-destructive">{candidate.weaknessScore}</span>
      </div>

      <Progress
        value={candidate.weaknessScore}
        className="h-2 bg-muted/70"
        indicatorClassName="bg-destructive shadow-[0_0_12px_rgb(var(--destructive-rgb)/0.45)]"
      />

      <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <span>Ease {candidate.easeFactor.toFixed(2)}</span>
        <span>Interval {candidate.interval} hari</span>
      </div>
    </div>
  );
}

/**
 * Render empty state when no weak points found.
 */
function EmptyDiagnosis() {
  return (
    <Card className="rounded-[34px] border-border bg-card/35 p-8 text-center shadow-none  md:p-12">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success">
        <ShieldCheck size={30} />
      </div>
      <h2 className="text-2xl uppercase tracking-tight text-foreground">
        Tidak ada titik lemah aktif
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
        Kartu SRS kamu sedang stabil. Tambahkan materi baru atau lakukan latihan cepat untuk menemukan
        item yang perlu diperkuat.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild className="h-12 rounded-lg px-5 text-xs font-black uppercase tracking-widest">
          <Link href="/library/vocab">
            <Library size={15} />
            Tambah Kartu
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-lg px-5 text-xs font-black uppercase tracking-widest">
          <Link href="/tools/flashcards">
            Flashcards
            <ArrowRight size={15} />
          </Link>
        </Button>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
        <Skeleton className="h-3 rounded-full" />
        <Skeleton className="h-3 rounded-full" />
        <Skeleton className="h-3 rounded-full" />
      </div>
    </Card>
  );
}