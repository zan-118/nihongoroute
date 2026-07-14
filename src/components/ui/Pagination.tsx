/**
 * @file Pagination.tsx
 * @description Komponen Kontrol Halaman (Pagination) premium teranimasi dengan gaya siber.
 */

"use client";

// ======================
// IMPOR
// ======================
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Properties for Pagination component.
 */
interface PaginationProps {
  /** Current active page number. */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback triggered on page change. */
  onPageChange: (page: number) => void;
  /** Optional CSS class name. */
  className?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Cyber-style pagination control component.
 * Renders page navigation buttons and page indicator.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  // Hide pagination if only one page exists.
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
          aria-label="Ke halaman pertama"
          className="action-icon size-10 disabled:opacity-30"
        >
          <ChevronsLeft size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Ke halaman sebelumnya"
          className="action-icon size-10 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="flex items-center gap-2">
          {/* Generate sliding window of max 5 page numbers around current page */}
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
                className={`size-10 rounded-xl font-black transition-all ${
                  currentPage === pageNum
                    ? "btn-cyber p-0 text-[11px]"
                    : "button-outline-premium text-muted-foreground hover:text-primary"
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
          aria-label="Ke halaman berikutnya"
          className="action-icon size-10 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Ke halaman terakhir"
          className="action-icon size-10 disabled:opacity-30"
        >
          <ChevronsRight size={18} />
        </Button>
      </div>
    </div>
  );
}