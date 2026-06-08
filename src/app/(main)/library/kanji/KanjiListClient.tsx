/**
 * @file KanjiListClient.tsx
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
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

// Komponen Pendukung
import { KanjiHeader } from "@/components/features/library/kanji/KanjiHeader";
import { KanjiGrid } from "@/components/features/library/kanji/KanjiGrid";
import { Pagination } from "@/components/ui/Pagination";

// ======================
// TIPE DATA
// ======================
interface KanjiListClientProps {
  initialData: PaginatedKanjiResponse;
}

const ITEMS_PER_PAGE = 24;

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen KanjiListClient: Menyediakan antarmuka interaktif untuk menyaring, mencari,
 * dan mempaginasi pustaka kanji dengan React Query dan state parameter URL.
 * 
 * @param {KanjiListClientProps} props Properti komponen.
 * @returns {JSX.Element} Antarmuka direktori kanji interaktif.
 */
export default function KanjiListClient({ initialData }: KanjiListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Membaca nilai filter awal dari URL jika ada (kompatibel dengan bookmark)
  const initialLevel = searchParams.get("level") || "n5";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page") || "1");

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [levelFilter, setLevelFilter] = useState<string | null>(initialLevel);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const isFirstMount = useRef(true);

  // Menyinkronkan status filter dengan parameter pencarian URL secara reaktif
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

    if (currentParamsString !== newParamsString) {
      router.replace(`${pathname}?${newParamsString}`, { scroll: false });
    }
  }, [debouncedSearch, levelFilter, currentPage, pathname, router, searchParams]);

  // Melakukan debounce pada input pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== initialSearch) {
        setCurrentPage(1); // Reset halaman jika kata kunci berubah
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Mereset halaman ke 1 saat filter level berubah
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [levelFilter]);

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
          {isFetching && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[2rem]">
              <Loader2 className="size-10 animate-spin text-primary" />
            </div>
          )}

          <div className="flex flex-col gap-2.5 min-h-[400px]">
            {/* Kepala Tabel (Disembunyikan di Ponsel / Responsif) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-2">Kanji</div>
              <div className="col-span-6">Arti / Definisi</div>
              <div className="col-span-2 text-center">Level JLPT</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {kanjis.map((kanji) => (
              <div
                key={kanji.id}
                className="flex md:grid md:grid-cols-12 items-center justify-between gap-4 px-4 py-3 bg-[rgb(var(--card-rgb)/0.3)] backdrop-blur-3xl border border-border hover:border-[rgb(var(--primary-rgb)/0.5)] transition-all duration-300 rounded-2xl shadow-sm hover:shadow-[0_0_25px_rgb(var(--primary-rgb)/0.08)] group"
              >
                {/* Sisi Kiri: Kanji & Arti (Flex di Seluler, Kolom Grid di Desktop) */}
                <div className="flex-1 md:col-span-8 flex flex-col md:grid md:grid-cols-8 md:gap-4 md:items-center min-w-0 pr-2">
                  <div className="md:col-span-2 font-black text-2xl md:text-3xl text-foreground font-japanese select-all leading-none">
                    {kanji.character}
                  </div>
                  <div className="md:col-span-6 text-[10px] md:text-sm text-muted-foreground md:text-foreground/90 font-medium line-clamp-1 mt-0.5 md:mt-0">
                    {kanji.meaning}
                  </div>
                </div>

                {/* Sisi Kanan: Level JLPT & Tombol Tindakan */}
                <div className="flex items-center gap-2.5 shrink-0 md:col-span-4 md:justify-end">
                  {kanji.jlptLevel && (
                    <span className="text-[9px] md:text-[10px] font-black bg-[rgb(var(--primary-rgb)/0.1)] text-primary px-2 py-0.5 rounded-full border border-[rgb(var(--primary-rgb)/0.2)] uppercase shrink-0">
                      {kanji.jlptLevel}
                    </span>
                  )}
                  <Link href={`/library/kanji/${kanji.character}`} className="shrink-0">
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

            {kanjis.length === 0 && !isFetching && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                  <Search size={32} className="text-muted-foreground/50" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Data Kanji tidak ditemukan</h3>
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
