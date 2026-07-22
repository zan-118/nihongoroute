/**
 * @file ListeningListClient.tsx
 * @description Komponen klien interaktif untuk memetakan, menyaring, dan mempaginasi daftar audio choukai.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Search, Headphones, Play, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, CheckCircle2, Radio, ArrowUpRight } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedListening, PaginatedListeningResponse, ListeningTaskItem } from "@/actions/library.actions";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

interface ListeningListClientProps {
  initialData: PaginatedListeningResponse;
}

const ITEMS_PER_PAGE = 10;
const JLPT_FILTERS = ["all", "N5", "N4", "N3", "N2", "N1"] as const;
type JlptFilter = (typeof JLPT_FILTERS)[number];

export default function ListeningListClient({ initialData }: ListeningListClientProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [level, setLevel] = useState<JlptFilter>("all");
  const completedLessons = useUserStore((state) => state.completedLessons);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isFetching } = useQuery({
    queryKey: ["listening", currentPage, debouncedSearch, level],
    queryFn: () => getPaginatedListening(currentPage, ITEMS_PER_PAGE, debouncedSearch, level),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && level === "all" ? initialData : undefined,
  });

  const tasks = data?.data || [];
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
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <Headphones size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] font-mono">
              LISTENING LAB VAULT
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl text-foreground font-black tracking-tight">
            Latihan Menyimak
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl font-medium">
            Tingkatkan kepekaan pendengaran audio percakapan asli Jepang, kuis pemahaman, dan transkrip interaktif.
          </p>
        </div>

        {/* Search & Level Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <Input 
              placeholder="Cari modul listening..." 
              className="pl-13 h-14 bg-background/60 dark:bg-[#03060a]/60 border border-border/60 dark:border-white/10 rounded-2xl text-sm font-medium focus-visible:ring-cyan-500/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "all" ? "Semua Level" : item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Double Bezel Cards */}
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-3xl">
            <Loader2 className="size-10 animate-spin text-cyan-500" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[300px]">
          {tasks.map((task: ListeningTaskItem & { jlpt_level?: string; difficulty?: string }) => {
            const isCompleted = !!(
              task.id &&
              completedLessons[task.id] &&
              !completedLessons[task.id].isDeleted
            );

            return (
              <div
                key={task.id}
                className="group font-sans border-b border-border/30 py-5 hover:border-cyan-500/50 transition-colors"
                style={{ 
                  contentVisibility: 'auto', 
                  containIntrinsicSize: '0 100px',
                }}
              >
                <Link href={`/library/listening/${task.slug}`} className="block">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {task.jlpt_level && (
                          <Badge className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {task.jlpt_level}
                          </Badge>
                        )}
                        {task.difficulty && (
                          <span className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">
                            LEVEL {task.difficulty}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 size={10} /> SELESAI
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug group-hover:text-cyan-400 transition-colors truncate">
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-muted-foreground/70 uppercase">
                        <Radio size={11} className="text-cyan-400 animate-pulse" />
                        {task.audioUrl ? "AUDIO NATIVE" : "AI VOICE"}
                      </span>

                      <div className="size-8 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                        <Play size={12} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
            HALAMAN <span className="text-cyan-400">{currentPage}</span> DARI {totalPages}
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
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" 
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

      {tasks.length === 0 && !isFetching && (
        <div className="py-20 text-center space-y-4 rounded-[2.25rem] bg-card/20 border border-border/40 p-8">
           <div className="size-16 rounded-full bg-muted/30 border border-border/60 flex items-center justify-center mx-auto">
              <Headphones size={24} className="text-muted-foreground/50" />
           </div>
           <h3 className="text-base font-black text-foreground uppercase tracking-widest font-mono">Materi Audio Tidak Ditemukan</h3>
           <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium">Silakan coba dengan kata kunci lain atau pilih level JLPT yang berbeda.</p>
        </div>
      )}
    </div>
  );
}