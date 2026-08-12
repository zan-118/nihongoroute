"use client";

/**
 * @file ReviewFilterBar.tsx
 * @description Bar filter daftar review: tampilkan semua soal atau hanya soal salah.
 */

import { Filter } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ReviewFilter } from "./review-utils";

interface ReviewFilterBarProps {
  /** Filter aktif (memperhitungkan fallback ke "all" bila tak ada kesalahan). */
  effectiveFilter: ReviewFilter;
  /** Jumlah soal salah + kosong. */
  mistakeCount: number;
  /** Total soal ujian. */
  totalCount: number;
  /** Callback ganti filter. */
  onFilterChange: (filter: ReviewFilter) => void;
}

/**
 * Section header daftar review + toggle filter Soal Salah / Semua Soal.
 */
export function ReviewFilterBar({
  effectiveFilter,
  mistakeCount,
  totalCount,
  onFilterChange,
}: ReviewFilterBarProps) {
  return (
    <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Filter size={18} aria-hidden="true" className="text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-foreground">
          Daftar Review
        </span>
      </div>

      <div className="flex rounded-lg border border-border bg-muted/40 p-1.5">
        <Button
          type="button"
          variant={effectiveFilter === "mistakes" ? "default" : "ghost"}
          size="sm"
          disabled={mistakeCount === 0}
          aria-pressed={effectiveFilter === "mistakes"}
          onClick={() => onFilterChange("mistakes")}
          className="rounded-xl px-4"
        >
          Soal Salah ({mistakeCount})
        </Button>
        <Button
          type="button"
          variant={effectiveFilter === "all" ? "default" : "ghost"}
          size="sm"
          aria-pressed={effectiveFilter === "all"}
          onClick={() => onFilterChange("all")}
          className="rounded-xl px-4"
        >
          Semua Soal ({totalCount})
        </Button>
      </div>
    </section>
  );
}
