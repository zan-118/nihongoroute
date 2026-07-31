/**
 * @file KanjiListView.tsx
 * @description Komponen klien interaktif untuk halaman daftar katalog Kanji.
 * Menyediakan pencarian, filter JLPT, dan paginasi berbasis state klien.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useEffect, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedKanji, PaginatedKanjiResponse } from "@/actions/library.actions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

// Komponen Pendukung
import { KanjiHeader } from "@/features/library/components/kanji/KanjiHeader";
import { KanjiGrid } from "@/features/library/components/kanji/KanjiGrid";
import { Pagination } from "@/components/ui/Pagination";

// ======================
// TIPE DATA
// ======================

/**
 * Props for KanjiListView component.
 */
interface KanjiListViewProps {
  /** Initial kanji data fetched from server. */
  initialData: PaginatedKanjiResponse;
}

/** Number of kanji items displayed per page. */
const ITEMS_PER_PAGE = 24;

/** Default JLPT level filter. */
const DEFAULT_KANJI_LEVEL = "N5";

/**
 * Normalize JLPT level string from URL parameter.
 * @param value Raw level string from URL.
 * @returns Normalized uppercase level string or default level.
 */
function normalizeLevelParam(value: string | null) {
  if (!value || value.toLowerCase() === "all") return DEFAULT_KANJI_LEVEL;
  if (/^n[1-5]$/i.test(value)) return value.toUpperCase();
  return value;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen KanjiListView: Menyediakan antarmuka interaktif untuk menyaring, mencari,
 * dan mempaginasi pustaka kanji dengan React Query dan state parameter URL.
 * 
 * @param props Properti komponen.
 * @returns Antarmuka direktori kanji interaktif.
 */
export default function KanjiListView({ initialData }: KanjiListViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial state from URL search params to support bookmarking.
  const initialLevel = normalizeLevelParam(searchParams.get("level"));
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page") || "1");

  // Local states for search, filter, and pagination.
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [levelFilter, setLevelFilter] = useState<string | null>(initialLevel);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Ref to track first mount and prevent redundant page resets.
  const isFirstMount = useRef(true);

  // Sync local state changes back to URL search params.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (levelFilter) {
      params.set("level", levelFilter);
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

    // Only update router if params actually changed.
    if (currentParamsString !== newParamsString) {
      router.replace(`${pathname}?${newParamsString}`, { scroll: false });
    }
  }, [debouncedSearch, levelFilter, currentPage, pathname, router, searchParams]);

  // Debounce search input to avoid excessive API requests.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== initialSearch) {
        setCurrentPage(1); // Reset page on search term change.
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Reset page to 1 when level filter changes.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [levelFilter]);

  // Fetch paginated kanji data using React Query.
  const { data, isFetching } = useQuery({
    queryKey: ["kanji", currentPage, debouncedSearch, levelFilter],
    queryFn: () => getPaginatedKanji(currentPage, ITEMS_PER_PAGE, debouncedSearch, levelFilter || ""),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && levelFilter === DEFAULT_KANJI_LEVEL ? initialData : undefined,
  });

  const kanjis = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  /**
   * Handle page change and scroll window to top.
   * @param page Target page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get user layout preference (grid or list) from UI store.
  const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";

  return (
    <div className="space-y-12">
      <KanjiHeader
        search={search}
        onSearchChange={setSearch}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
      />

      {layoutPreference === "grid" ? (
        <KanjiGrid
          kanjis={kanjis}
          isFetching={isFetching}
        />
      ) : (
        <div className="relative">
          {/* Loading overlay during data fetch */}
          {isFetching && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50  rounded-4xl">
              <Loader2 className="size-10 animate-spin text-primary" />
            </div>
          )}

          <div className="flex flex-col gap-2.5 min-h-100">
            {/* Kepala Tabel (Disembunyikan di Ponsel / Responsif) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border border-border rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-2">Kanji</div>
              <div className="col-span-6">Arti / Definisi</div>
              <div className="col-span-2 text-center">Level JLPT</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {/* Kanji List Rows */}
            {kanjis.map((kanji) => (
              <div
                key={kanji.id}
                className="flex md:grid md:grid-cols-12 items-center justify-between gap-6 px-6 py-4 bg-card border border-border/50 dark:border-white/10 hover:border-primary/45 shadow-sm transition-all duration-500 rounded-xl group relative group/row"
              >
                {/* Tombou Register Mark */}
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
                  <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover/row:bg-primary transition-colors duration-500" />
                  <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover/row:bg-primary transition-colors duration-500" />
                </div>

                {/* Sisi Kiri: Kanji & Arti (Flex di Seluler, Kolom Grid di Desktop) */}
                <div className="flex-1 md:col-span-8 flex flex-col md:grid md:grid-cols-8 md:gap-4 md:items-center min-w-0 pr-2">
                  <div className="md:col-span-2 font-black text-2xl md:text-3xl text-foreground font-japanese select-all leading-none">
                    {kanji.character}
                  </div>
                  <div className="md:col-span-6 text-[10px] md:text-sm text-muted-foreground md:text-foreground/90 font-medium line-clamp-1 mt-0.5 md:mt-0">
                    {kanji.meaning}
                  </div>
                </div>

                {/* Sisi Ranan: Level JLPT & Tombol Tindakan */}
                <div className="flex items-center gap-2.5 shrink-0 md:col-span-4 md:justify-end">
                  {kanji.jlptLevel && (
                    <span className="text-[9px] md:text-[10px] font-black bg-[rgb(var(--primary-rgb)/0.1)] text-primary px-2 py-0.5 rounded-[4px] border border-[rgb(var(--primary-rgb)/0.2)] uppercase shrink-0">
                      {kanji.jlptLevel}
                    </span>
                  )}
                  <Link href={`/library/kanji/${kanji.slug || kanji.id}`} className="shrink-0">
                    <Button
                      variant="outline"
                      className="px-3 h-8 text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-lg bg-muted border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      Detail
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {kanjis.length === 0 && !isFetching && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                  <Search size={32} className="text-muted-foreground/50" aria-hidden="true" />
                </div>
                <h3 className="text-xl text-foreground">Data Kanji tidak ditemukan</h3>
                <p className="text-muted-foreground">Silakan periksa kembali kata kunci atau sesuaikan filter level JLPT.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-12 pb-12"
      />
    </div>
  );
}