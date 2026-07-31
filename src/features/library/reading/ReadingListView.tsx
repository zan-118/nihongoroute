/**
 * @file ReadingListView.tsx
 * @description Komponen klien interaktif untuk halaman daftar materi membaca (Dokkai List).
 * Menyediakan filter level JLPT, pencarian judul, dan paginasi berarsitektur Double-Bezel.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BookOpen, ArrowUpRight, GraduationCap, ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight, Search, Loader2, Clock, CheckCircle2 } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { getPaginatedReading, PaginatedReadingResponse } from "@/actions/library.actions";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

interface ReadingListViewProps {
  initialData: PaginatedReadingResponse;
}

const ITEMS_PER_PAGE = 9;
const JLPT_FILTERS = ["all", "N5", "N4", "N3", "N2", "N1"] as const;
type JlptFilter = (typeof JLPT_FILTERS)[number];

export default function ReadingListView({ initialData }: ReadingListViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page") || "1");
  const rawLevel = (searchParams.get("level") || "all").toUpperCase();
  const initialLevel: JlptFilter = JLPT_FILTERS.includes(rawLevel as JlptFilter)
    ? (rawLevel as JlptFilter)
    : "all";

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [level, setLevel] = useState<JlptFilter>(initialLevel);
  const completedLessons = useUserStore((state) => state.completedLessons);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== initialSearch) {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (level !== "all") {
      params.set("level", level);
    } else {
      params.delete("level");
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    } else {
      params.delete("page");
    }

    const currentParamsString = searchParams.toString();
    const newParamsString = params.toString();

    if (currentParamsString !== newParamsString) {
      router.replace(`${pathname}?${newParamsString}`, { scroll: false });
    }
  }, [debouncedSearch, level, currentPage, pathname, router, searchParams]);

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
    <div className="space-y-12 font-sans">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <BookOpen size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] font-mono">
              GRADED READING VAULT
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl text-foreground font-black tracking-tight">
            Bacaan Berjenjang
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl font-medium">
            Pilih materi membaca sesuai tingkat kelulusan JLPT. Didukung penjelas kosakata otomatis dan mode audio interaktif.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground size-5" aria-hidden="true" />
            <Input 
              placeholder="Cari judul bacaan atau topik..." 
              className="pl-13 h-14 bg-background/60 dark:bg-[#03060a]/60 border border-border/60 dark:border-white/10 rounded-2xl text-sm font-medium focus-visible:ring-purple-500/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full border border-border/40 bg-card/30 backdrop-blur-md w-fit">
            {JLPT_FILTERS.map((item) => (
              <Button
                key={item}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleLevelChange(item)}
                className={`rounded-full px-5 h-9 text-xs font-mono font-bold transition-all duration-300 ${
                  level === item
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20 scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "all" ? "Semua Level" : item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List with Double Bezel Cards */}
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-3xl">
            <Loader2 className="size-10 animate-spin text-purple-500" />
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
                className="group font-sans border-b border-border/30 py-5 hover:border-purple-500/50 transition-colors"
                style={{ 
                  contentVisibility: 'auto', 
                  containIntrinsicSize: '0 100px',
                }}
              >
                <Link href={ROUTES.LIBRARY.READING(material.slug)} className="block">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {(material.jlpt_level || material.difficulty) && (
                          <Badge className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {material.jlpt_level || material.difficulty}
                          </Badge>
                        )}
                        <span className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">
                          {material.category || "GENERAL READING"}
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 size={10} /> SELESAI
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug group-hover:text-purple-400 transition-colors truncate">
                        {material.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {material.estimated_minutes && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-muted-foreground/70 uppercase">
                          <Clock size={11} />
                          {material.estimated_minutes} MIN
                        </span>
                      )}
                      <ArrowUpRight size={16} className="text-muted-foreground/40 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {materials.length === 0 && !isFetching && (
          <div className="py-20 text-center space-y-4 rounded-[2.25rem] bg-card/20 border border-border/40 p-8">
             <div className="size-16 rounded-full bg-muted/30 border border-border/60 flex items-center justify-center mx-auto">
                <BookOpen size={24} className="text-muted-foreground/50" />
             </div>
             <h3 className="text-base font-black text-foreground uppercase tracking-widest font-mono">Materi Bacaan Tidak Ditemukan</h3>
             <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium">Silakan sesuaikan filter level JLPT atau kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
            HALAMAN <span className="text-purple-400">{currentPage}</span> DARI {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="size-9 rounded-full bg-card border border-border/40 text-muted-foreground disabled:opacity-30"
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-9 rounded-full bg-card border border-border/40 text-muted-foreground disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center gap-1.5">
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
                    onClick={() => handlePageChange(pageNum)}
                    className={`size-9 rounded-full font-mono text-xs font-bold transition-all ${
                      currentPage === pageNum 
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/20" 
                        : "bg-card border border-border/40 text-muted-foreground hover:text-foreground"
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-9 rounded-full bg-card border border-border/40 text-muted-foreground disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="size-9 rounded-full bg-card border border-border/40 text-muted-foreground disabled:opacity-30"
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}