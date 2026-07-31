"use client";

/**
 * @file VocabPagination.tsx
 * @description Komponen pagination navigasi halaman kosakata (Vocab Pagination) di NihongoRoute.
 * Menyediakan tombol akses cepat ke halaman awal, akhir, sebelumnya, berikutnya, serta nomor halaman aktif.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Props for VocabPagination component.
 */
interface VocabPaginationProps {
  /** Current active page number. */
  currentPage: number;
  /** Total number of pages available. */
  totalPages: number;
  /** Loading state blocks interaction. */
  loading: boolean;
  /** Callback triggered when page changes. */
  onPageChange: (page: number) => void;
}

// ==========================================
// KOMPONEN UTAMA: VocabPagination
// ==========================================
/**
 * Interactive pagination navigation component.
 * 
 * @param props Component properties.
 * @returns Pagination element or null if single page.
 */
export function VocabPagination({ currentPage, totalPages, loading, onPageChange }: VocabPaginationProps) {
  // Hide pagination if only one page exists.
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  // Calculate start index based on current page position.
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  // Calculate end index based on start index and max visible limit.
  const end = Math.min(totalPages, start + maxVisible - 1);
  // Adjust start index if remaining pages smaller than max visible limit.
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  // Populate visible page numbers.
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="mt-12 md:mt-16 flex flex-col items-center gap-6 font-sans">
      {/* Label Halaman Aktif */}
      <div className="flex items-center gap-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
        <span>
          Halaman <span className="text-primary">{currentPage}</span> dari {totalPages}
        </span>
      </div>

      {/* Kontrol Tombol Navigasi */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
        {/* Tombol Halaman Pertama */}
        <Button
          variant="ghost"
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(1)}
          aria-label="Kembali ke halaman pertama"
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronsLeft size={16} aria-hidden="true" />
        </Button>

        {/* Tombol Halaman Sebelumnya */}
        <Button
          variant="ghost"
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Kembali ke halaman sebelumnya"
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>

        {/* Daftar Nomor Halaman Pintas */}
        {pages.map((page) => (
          <Button
            key={page}
            variant="ghost"
            disabled={loading}
            onClick={() => onPageChange(page)}
            aria-label={`Buka halaman ${page}`}
            className={`w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl text-xs md:text-sm font-black transition-all ${
              page === currentPage
                ? "bg-primary text-primary-foreground border-none shadow-lg"
                : "bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {page}
          </Button>
        ))}

        {/* Tombol Halaman Berikutnya */}
        <Button
          variant="ghost"
          disabled={currentPage === totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Lanjut ke halaman berikutnya"
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Button>

        {/* Tombol Halaman Terakhir */}
        <Button
          variant="ghost"
          disabled={currentPage === totalPages || loading}
          onClick={() => onPageChange(totalPages)}
          aria-label="Lanjut ke halaman terakhir"
          className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
        >
          <ChevronsRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}