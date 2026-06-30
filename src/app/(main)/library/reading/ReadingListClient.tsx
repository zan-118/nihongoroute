/**
 * @file ReadingListClient.tsx
 * @description Komponen klien interaktif untuk halaman daftar materi membaca (Dokkai List).
 * Menyediakan filter level JLPT, pencarian judul, dan paginasi berbasis state klien.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, GraduationCap, ChevronLeft, ChevronsLeft, ChevronsRight, Search, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { getPaginatedReading, PaginatedReadingResponse } from "@/actions/library.actions";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

// ======================
// TIPE DATA
// ======================
interface ReadingListClientProps {
  initialData: PaginatedReadingResponse;
}

const ITEMS_PER_PAGE = 9;
const JLPT_FILTERS = ["all", "N5", "N4", "N3", "N2", "N1"] as const;
type JlptFilter = (typeof JLPT_FILTERS)[number];

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen ReadingListClient: Menyediakan antarmuka interaktif untuk menyaring, mencari,
 * dan mempaginasi pustaka graded reading dengan React Query.
 * 
 * @param {ReadingListClientProps} props Properti komponen.
 * @returns {JSX.Element} Antarmuka direktori graded reading interaktif.
 */
export default function ReadingListClient({ initialData }: ReadingListClientProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [level, setLevel] = useState<JlptFilter>("all");
  const completedLessons = useUserStore((state) => state.completedLessons);

  // Melakukan debounce pada input pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset halaman jika kata kunci pencarian baru diinputkan
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isFetching } = useQuery({
    queryKey: ["reading", currentPage, debouncedSearch, level],
    queryFn: () => getPaginatedReading(currentPage, ITEMS_PER_PAGE, debouncedSearch, level),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && level === "all" ? initialData : undefined,
  });

  const materials = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLevelChange = (nextLevel: JlptFilter) => {
    setLevel(nextLevel);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <BookOpen size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Perpustakaan Digital</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
            Graded Reading
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Pilih bacaan yang sesuai dengan level Anda. Klik pada kata yang sulit untuk melihat arti dan mendengarkan pengucapannya.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" aria-hidden="true" />
            <Input 
              placeholder="Cari judul atau kategori bacaan..." 
              className="pl-12 h-14 bg-[rgb(var(--card-rgb)/0.4)] backdrop-blur-xl border border-border rounded-2xl text-lg shadow-2xl focus:ring-[rgb(var(--primary-rgb)/0.2)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/35 p-2 backdrop-blur-xl w-fit max-w-full">
            {JLPT_FILTERS.map((item) => (
              <Button
                key={item}
                type="button"
                variant={level === item ? "default" : "ghost"}
                size="sm"
                aria-pressed={level === item}
                onClick={() => handleLevelChange(item)}
                className="rounded-xl px-4"
              >
                {item === "all" ? "Semua" : item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgb(var(--background-rgb)/0.5)] backdrop-blur-sm rounded-[2rem]">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[300px]">
          {materials.map((material) => {
            const isCompleted = !!(
              material.id &&
              completedLessons[material.id] &&
              !completedLessons[material.id].isDeleted
            );

            return (
            <div
              key={material.slug}
              className="transform hover:-translate-y-1 transition-all duration-300"
              style={{ 
                contentVisibility: 'auto', 
                containIntrinsicSize: '0 200px',
              }}
            >
              <Link href={ROUTES.LIBRARY.READING(material.slug)}>
                <div className="group h-full p-8 md:p-10 rounded-[2.5rem] bg-card/35 backdrop-blur-xl border border-border hover:border-primary/45 shadow-[0_0_30px_rgba(var(--primary-rgb),0.015)] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] transition-all duration-500 relative overflow-hidden flex flex-col justify-between cursor-pointer glass">
                  {/* Efek Kilau saat Melayang */}
                  <div className="absolute top-0 right-0 size-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-500" />
                  
                  <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {(material.jlpt_level || material.difficulty) && (
                          <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                            {material.jlpt_level || material.difficulty}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            isCompleted
                              ? "border-success/25 bg-success/10 text-success"
                              : "border-border bg-muted/30 text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={12} aria-hidden="true" className="mr-1.5" />
                          ) : null}
                          {isCompleted ? "Selesai" : "Belum mulai"}
                        </Badge>
                      </div>
                      <div className="p-2 rounded-xl bg-background/5 border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                        <GraduationCap size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {material.category || "General Reading"}
                      </span>
                      <h3 className="text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {material.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        {isCompleted ? "Baca Ulang" : "Mulai Membaca"}
                      </span>
                      {material.estimated_minutes ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          <Clock size={12} aria-hidden="true" />
                          {material.estimated_minutes} menit
                        </span>
                      ) : null}
                    </div>
                    <div className="size-10 rounded-full flex items-center justify-center bg-background/5 border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-300">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            );
          })}
        </div>

        {materials.length === 0 && !isFetching && (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="size-20 rounded-full bg-[rgb(var(--background-rgb)/0.05)] border border-dashed border-border flex items-center justify-center mx-auto">
                <BookOpen size={32} className="text-muted-foreground opacity-30" />
             </div>
             <p className="text-muted-foreground font-medium">Materi bacaan tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 pt-12">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            Halaman <span className="text-primary">{currentPage}</span> dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Halaman pertama"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
            >
              <ChevronsLeft size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Halaman sebelumnya"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
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
                    aria-label={`Halaman ${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      currentPage === pageNum 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-[rgb(var(--primary-rgb)/0.2)]" 
                        : "bg-card border border-border text-muted-foreground hover:border-[rgb(var(--primary-rgb)/0.4)]"
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
              aria-label="Halaman berikutnya"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Halaman terakhir"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="size-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
            >
              <ChevronsRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

