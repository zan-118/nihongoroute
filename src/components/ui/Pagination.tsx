"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
        Halaman <span className="text-primary">{currentPage}</span> dari {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronsLeft size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  currentPage === pageNum 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronsRight size={18} />
        </Button>
      </div>
    </div>
  );
}
