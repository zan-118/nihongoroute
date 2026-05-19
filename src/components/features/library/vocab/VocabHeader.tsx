"use client";

import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabHeaderProps {
  totalItems: number;
  onPracticeClick: () => void;
  isPracticeDisabled: boolean;
}

export function VocabHeader({ totalItems, onPracticeClick, isPracticeDisabled }: VocabHeaderProps) {
  return (
    <header className="mb-10 md:mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 border-b border-border pb-6 md:pb-12">
        <div className="flex items-center gap-5 md:gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
            <Book size={28} className="text-primary md:w-8 md:h-8" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none mb-2">
              Pusat <span className="text-primary">Kosakata</span>
            </h1>
            <span className="text-xs md:text-xs text-muted-foreground font-medium tracking-tight uppercase tracking-widest">
              Perkaya perbendaharaan kata bahasa Jepang Anda.
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Ditemukan</span>
            <span className="text-xs md:text-xs font-black text-foreground">{totalItems} Kata</span>
          </div>
          <Button
            onClick={onPracticeClick}
            disabled={isPracticeDisabled}
            className="h-auto py-4 px-6 md:py-5 md:px-8 rounded-xl md:rounded-2xl bg-primary hover:bg-foreground text-primary-foreground font-bold uppercase tracking-widest transition-all shadow-lg border-none text-xs md:text-sm disabled:opacity-50"
          >
            Latih Halaman Ini
          </Button>
        </div>
      </div>
    </header>
  );
}
