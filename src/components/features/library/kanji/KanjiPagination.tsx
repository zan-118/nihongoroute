"use client";

/**
 * @file KanjiPagination.tsx
 * @description Komponen pagination interaktif untuk daftar karakter Kanji di NihongoRoute.
 * Membantu navigasi berpindah halaman secara dinamis dengan tata letak visual premium.
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
 * Props for KanjiPagination component.
 */
interface KanjiPaginationProps {
  /** Current active page number. */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback triggered on page change. */
  onPageChange: (page: number) => void;
}

// ==========================================
// KOMPONEN UTAMA: KanjiPagination
// ==========================================
/**
 * Render pagination controls. Allow user navigate pages.
 * 
 * @param props Component properties.
 * @returns Pagination element or null if single page.
 */
export function KanjiPagination({
  currentPage,
  totalPages,
  onPageChange,
}: KanjiPaginationProps) {
  // Hide pagination if only one page exists.
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-6 mt-12 pb-12 font-sans">
      {/* Keterangan Halaman Aktif */}
      <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
        Halaman <span className="text-primary">{currentPage}</span> dari {totalPages}
      </div>
      
      {/* Kontrol Navigasi Halaman */}
      <div className="flex items-center gap-2">
        {/* Tombol ke Halaman Pertama */}
        <Button
          variant="ghost"
          size="icon" 
          aria-label="Kembali ke halaman pertama"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronsLeft size={18} />
        </Button>
        
        {/* Tombol ke Halaman Sebelumnya */}
        <Button
          variant="ghost"
          size="icon" 
          aria-label="Kembali ke halaman sebelumnya"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </Button>

        {/* Nomor Urut Halaman Pintas */}
        <div className="flex items-center gap-2">
          {/* Calculate sliding window of 5 pages around current page. */}
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
                aria-label={`Buka halaman ${pageNum}`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Tombol ke Halaman Berikutnya */}
        <Button
          variant="ghost"
          size="icon" 
          aria-label="Lanjut ke halaman berikutnya"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </Button>
        
        {/* Tombol ke Halaman Terakhir */}
        <Button
          variant="ghost"
          size="icon" 
          aria-label="Lanjut ke halaman terakhir"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronsRight size={18} />
        </Button>
      </div>
    </div>
  );
}