"use client";

/**
 * @file ReviewHeader.tsx
 * @description Header halaman Mock Exam Review: badge, judul, dan tombol kembali.
 */

import { ArrowLeft } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReviewHeaderProps {
  /** Callback kembali ke layar hasil. */
  onBack: () => void;
}

/**
 * Header review exam dengan tombol kembali ke hasil.
 */
export function ReviewHeader({ onBack }: ReviewHeaderProps) {
  return (
    <header className="relative z-20 mb-8">
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between p-5 sm:p-8 mt-6 md:mt-10 border border-border bg-card rounded-xl shadow-lg">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit rounded-xl px-3 py-1">
            Mock Exam Review
          </Badge>
          <h2 className="text-xl sm:text-2xl text-foreground uppercase leading-none">
            Tinjau <span className="text-warning">Jawaban</span>
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Fokus ke kesalahan, section lemah, dan langkah latihan berikutnya.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full sm:w-auto text-xs neo-inset hover:bg-background text-muted-foreground hover:text-foreground px-5 py-3 h-auto font-black uppercase tracking-widest border border-border bg-muted/50 dark:bg-background/20 shadow-none rounded-xl"
        >
          <ArrowLeft data-icon="inline-start" />
          Kembali
        </Button>
      </Card>
    </header>
  );
}
