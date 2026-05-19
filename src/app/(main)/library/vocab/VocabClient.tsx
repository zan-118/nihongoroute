/**
 * LOKASI FILE: app/(main)/library/vocab/VocabClient.tsx
 * KONSEP: Mobile-First Neumorphic (Kamus Kosakata)
 * POLA: Server-Client Hybrid (Initial data from server, then client-side filtering/pagination via Sanity client)
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedVocab, PaginatedVocabResponse } from "@/actions/library.actions";

// Domain Components & Hooks
import { VocabCard } from "@/components/features/library/vocab/VocabCard";
import { VocabFlashcardView } from "@/components/features/library/vocab/VocabFlashcardView";
import { VocabHeader } from "@/components/features/library/vocab/VocabHeader";
import { VocabFilterPanel } from "@/components/features/library/vocab/VocabFilterPanel";
import { VocabPagination } from "@/components/features/library/vocab/VocabPagination";

export default function VocabClient({
  initialData,
}: {
  initialData: PaginatedVocabResponse;
}) {
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true);

  const [level, setLevel] = useState<string>("Semua");
  const [hinshi, setHinshi] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  const mapLevelToQuery = (lbl: string) => {
    if (lbl === "Semua") return "all";
    if (lbl === "Umum") return "umum";
    return lbl;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setCurrentPage(1);
    });
  }, [level, hinshi]);

  const { data, isFetching: loading } = useQuery({
    queryKey: ["vocab", currentPage, debouncedSearch, level, hinshi],
    queryFn: () => getPaginatedVocab(currentPage, limit, debouncedSearch, mapLevelToQuery(level), hinshi),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && level === "Semua" && hinshi === "all" ? initialData : undefined,
  });

  const vocabListRaw = data?.data || [];
  
  type VocabItemType = (typeof vocabListRaw)[number];

  // De-duplikasi Konten berdasarkan kata
  const uniqueVocab = Object.values(
    vocabListRaw.reduce((acc: Record<string, VocabItemType>, item: VocabItemType) => {
      const key = item.word || "";
      if (!acc[key]) {
        acc[key] = item;
      }
      return acc;
    }, {})
  );

  const vocabList = uniqueVocab;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Practice Mode View
  if (isFlashcardMode && vocabList.length > 0) {
    return (
      <VocabFlashcardView
        vocabList={vocabList}
        onBack={() => setIsFlashcardMode(false)}
      />
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col flex-1 pb-24 px-4 md:px-8 lg:px-12 pt-4 sm:pt-0">
      <VocabHeader 
        totalItems={totalItems}
        onPracticeClick={() => setIsFlashcardMode(true)}
        isPracticeDisabled={vocabList.length === 0}
      />

      <VocabFilterPanel 
        search={search}
        setSearch={setSearch}
        level={level}
        setLevel={setLevel}
        hinshi={hinshi}
        setHinshi={setHinshi}
        showRomaji={showRomaji}
        setShowRomaji={setShowRomaji}
      />

      {/* Content Grid */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[2rem]">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          )}
          {vocabList.length === 0 && !loading ? (
            <div
              className="py-24 text-center border border-dashed border-border rounded-3xl bg-muted/20 neo-inset px-6"
            >
              <Search className="mx-auto mb-6 text-muted-foreground/30" size={48} aria-hidden="true" />
              <p className="text-muted-foreground font-bold text-xs md:text-sm uppercase tracking-widest">
                Kosakata tidak ditemukan. Coba gunakan kriteria pencarian lain.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 min-h-[400px]"
            >
              {vocabList.map((item, idx) => (
                <VocabCard
                  key={item.id || item._id}
                  item={item}
                  idx={idx}
                  showRomaji={showRomaji}
                />
              ))}
            </div>
          )}
        </div>

      <VocabPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={handlePageChange}
      />

      {/* Footer Navigation */}
      <footer className="mt-16 md:mt-24 pt-10 md:pt-16 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3">
            <Loader2 size={16} className={`text-primary ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="text-muted-foreground font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Basis Data Real-time</span>
         </div>
         <Link href="/library" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full px-8 py-6 md:px-10 md:py-7 h-auto text-xs md:text-xs font-bold uppercase tracking-widest rounded-2xl bg-muted border border-border neo-card shadow-none hover:bg-primary hover:text-primary-foreground transition-all gap-3 group">
               <ChevronLeft size={16} className="group-hover:-translate-x-1.5 transition-transform duration-300" aria-hidden="true" /> Kembali ke Pustaka
            </Button>
         </Link>
      </footer>
    </div>
  );
}
