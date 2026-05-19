"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabPaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function VocabPagination({ currentPage, totalPages, loading, onPageChange }: VocabPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="mt-12 md:mt-16 flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
        <span>
          Halaman <span className="text-primary">{currentPage}</span> dari {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
        <Button
          variant="ghost"
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(1)}
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronsLeft size={16} aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            variant="ghost"
            disabled={loading}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl text-xs md:text-sm font-black transition-all ${
              page === currentPage
                ? "bg-primary text-primary-foreground border-none shadow-lg"
                : "bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="ghost"
          disabled={currentPage === totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          disabled={currentPage === totalPages || loading}
          onClick={() => onPageChange(totalPages)}
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronsRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
