/**
 * @file ListeningListClient.tsx
 * @description Komponen klien interaktif untuk memetakan, menyaring, dan mempaginasi daftar audio choukai.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useEffect } from "react";
import { Search, Headphones, Play, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, CheckCircle2, Radio } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedListening, PaginatedListeningResponse, ListeningTaskItem } from "@/actions/library.actions";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

// ======================
// TIPE DATA
// ======================

/**
 * Props for ListeningListClient component.
 */
interface ListeningListClientProps {
  /** Initial paginated listening data from server. */
  initialData: PaginatedListeningResponse;
}

/** Number of items displayed per page. */
const ITEMS_PER_PAGE = 10;

/** Available JLPT level filters. */
const JLPT_FILTERS = ["all", "N5", "N4", "N3", "N2", "N1"] as const;

/** Type representing selected JLPT filter level. */
type JlptFilter = (typeof JLPT_FILTERS)[number];

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Interactive client component for filtering, searching, and paginating listening tasks.
 * 
 * @param props - Component properties.
 * @returns Rendered listening list interface.
 */
export default function ListeningListClient({ initialData }: ListeningListClientProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [level, setLevel] = useState<JlptFilter>("all");
  const completedLessons = useUserStore((state) => state.completedLessons);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated listening tasks based on search, page, and level filters
  const { data, isFetching } = useQuery({
    queryKey: ["listening", currentPage, debouncedSearch, level],
    queryFn: () => getPaginatedListening(currentPage, ITEMS_PER_PAGE, debouncedSearch, level),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && level === "all" ? initialData : undefined,
  });

  const tasks = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  /**
   * Handles page navigation and scrolls window to top.
   * 
   * @param page - Target page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handles JLPT level filter changes and resets page to 1.
   * 
   * @param nextLevel - Selected JLPT level.
   */
  const handleLevelChange = (nextLevel: JlptFilter) => {
    setLevel(nextLevel);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-12">
      {/* Bagian Tajuk */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="size-12 rounded-lg bg-[rgb(var(--primary-rgb)/0.1)] flex items-center justify-center text-primary border border-[rgb(var(--primary-rgb)/0.2)]">
            <Headphones size={24} />
          </div>
          <h1 className="text-4xl md:text-6xl uppercase tracking-tight text-foreground">
            Listening <span className="text-primary">Lab</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Latih kemampuan pendengaranmu dengan rekaman suara asli dan dialog interaktif. Dilengkapi dengan transkrip dan kuis pemahaman.
        </p>

        <div className="flex flex-col gap-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <Input 
              placeholder="Cari materi listening..." 
              className="pl-12 h-14 bg-[rgb(var(--card-rgb)/0.4)]  border-[rgb(var(--border-rgb)/0.4)] rounded-lg text-lg shadow-2xl focus:ring-[rgb(var(--primary-rgb)/0.2)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/35 p-2  w-fit max-w-full">
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

      {/* Daftar Konten */}
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgb(var(--background-rgb)/0.5)]  rounded-[2rem]">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[300px]">
          {tasks.map((task: ListeningTaskItem & { jlpt_level?: string; difficulty?: string }) => {
            // Check if user completed current task
            const isCompleted = !!(
              task.id &&
              completedLessons[task.id] &&
              !completedLessons[task.id].isDeleted
            );

            return (
              <div
                key={task.id}
                className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] h-full"
                // Optimize rendering performance for off-screen cards
                style={{ 
                  contentVisibility: 'auto', 
                  containIntrinsicSize: '0 200px',
                }}
              >
                <Link href={`/library/listening/${task.slug}`}>
                  <div className="relative group/task h-full">
                    {/* Tombou Register Mark */}
                    <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
                      <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover/task:bg-primary transition-colors duration-500" />
                      <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover/task:bg-primary transition-colors duration-500" />
                    </div>

                    <Card className="h-full p-8 md:p-10 rounded-2xl bg-card border border-border/50 dark:border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover/task:border-primary/45 transition-all duration-500 relative overflow-hidden flex flex-col justify-between cursor-pointer">
                      {/* Efek Kilau / Pendar Ambient */}
                      <div className="absolute top-0 right-0 size-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover/task:bg-primary/10 transition-all duration-700" />
                      
                      <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            {task.jlpt_level && (
                              <Badge variant="outline" className="rounded-[4px] border-primary/20 bg-primary/10 text-primary">
                                {task.jlpt_level}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-[4px]",
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
                          <div className="p-2 rounded-lg bg-background/5 border border-border group-hover/task:bg-primary/10 group-hover/task:border-primary/20 transition-all duration-700">
                            <Headphones size={16} className="text-muted-foreground group-hover/task:text-primary transition-colors duration-500" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          {task.difficulty && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              Level {task.difficulty}
                            </span>
                          )}
                          <h3 className="text-2xl text-foreground text-foreground leading-tight group-hover/task:text-primary transition-colors duration-500 font-bold line-clamp-2">
                            {task.title}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-between relative z-10">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-muted-foreground group-hover/task:text-foreground transition-colors duration-500">
                            {isCompleted ? "Dengarkan Ulang" : "Mulai Menyimak"}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <Radio size={12} aria-hidden="true" />
                            {task.audioUrl ? "Audio asli" : "AI voice"}
                          </span>
                        </div>
                        <div className="size-10 rounded-lg flex items-center justify-center bg-background/5 border border-border group-hover/task:bg-primary group-hover/task:text-primary-foreground group-hover/task:border-transparent transition-all duration-700">
                          <Play size={16} className="ml-0.5 fill-current" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kontrol Paginasi */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 pt-8">
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
                // Calculate sliding window of page numbers to display
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

      {tasks.length === 0 && !isFetching && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="size-20 rounded-full bg-[rgb(var(--muted-rgb)/0.2)] flex items-center justify-center mb-6">
             <Headphones size={32} className="text-muted-foreground/50" />
          </div>
          <h3 className="text-xl text-foreground">Materi tidak ditemukan</h3>
          <p className="text-muted-foreground">Coba cari dengan kata kunci lain.</p>
        </div>
      )}
    </div>
  );
}