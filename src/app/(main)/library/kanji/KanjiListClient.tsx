"use client";

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedKanji, PaginatedKanjiResponse } from "@/actions/library.actions";

// Domain Components
import { KanjiHeader } from "@/components/features/library/kanji/KanjiHeader";
import { KanjiGrid } from "@/components/features/library/kanji/KanjiGrid";
import { Pagination } from "@/components/ui/Pagination";

interface KanjiListClientProps {
  initialData: PaginatedKanjiResponse;
}

const ITEMS_PER_PAGE = 24;

export default function KanjiListClient({ initialData }: KanjiListClientProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isFetching } = useQuery({
    queryKey: ["kanji", currentPage, debouncedSearch, levelFilter],
    queryFn: () => getPaginatedKanji(currentPage, ITEMS_PER_PAGE, debouncedSearch, levelFilter || ""),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && levelFilter === null ? initialData : undefined,
  });

  const kanjis = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filter changes
  useEffect(() => {
    requestAnimationFrame(() => {
      setCurrentPage(1);
    });
  }, [levelFilter]);

  return (
    <div className="space-y-12">
      <KanjiHeader 
        search={search}
        onSearchChange={setSearch}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
      />

      <KanjiGrid 
        kanjis={kanjis}
        isFetching={isFetching}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-12 pb-12"
      />
    </div>
  );
}
