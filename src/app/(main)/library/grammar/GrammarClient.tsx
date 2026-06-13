/**
 * @file GrammarClient.tsx
 * @description Komponen klien interaktif untuk halaman daftar panduan tata bahasa (Grammar List).
 * Menyediakan filter JLPT, pencarian, dan paginasi berbasis state klien.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useState, useEffect, useMemo, useRef } from "react";
import { getGrammarArticles } from "@/actions/library.actions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

// Komponen Pendukung
import { GrammarCard } from "@/components/features/grammar/GrammarCard";
import { GrammarSearch } from "@/components/features/grammar/GrammarSearch";
import { GrammarEmptyState } from "@/components/features/grammar/GrammarEmptyState";
import { GrammarHeader } from "@/components/features/grammar/GrammarHeader";

// ======================
// KONFIGURASI / KONSTANTA
// ======================
const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
const ITEMS_PER_PAGE = 12;
const EMPTY_GRAMMAR_ARTICLES: GrammarArticle[] = [];

// ======================
// TIPE DATA
// ======================
interface GrammarArticle {
  id?: string;
  _id: string;
  title: string;
  slug: string;
  jlptLevel?: string | null;
  meaning?: string;
  formation?: string;
  notes?: string;
}

interface GrammarClientProps {
  initialArticles?: GrammarArticle[];
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen GrammarClient: Menyediakan antarmuka interaktif untuk menyaring, mencari, 
 * dan mempaginasi materi tata bahasa Jepang (Bunpou) dengan status sinkronisasi URL.
 * 
 * @param {GrammarClientProps} props Properti komponen.
 * @returns {JSX.Element} Antarmuka direktori tata bahasa interaktif.
 */
export default function GrammarClient({ initialArticles = EMPTY_GRAMMAR_ARTICLES }: GrammarClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Membaca filter awal dari URL jika ada (bookmark friendly)
  const initialLevel = searchParams.get("level") || "n5";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page") || "1");

  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [articles, setArticles] = useState<GrammarArticle[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const isFirstMount = useRef(true);

  // Membaca preferensi tata letak awal dari Zustand
  const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";
  const layoutMode = layoutPreference === "list" ? "list" : "grid";

  // Menyinkronkan status filter dengan parameter pencarian URL secara reaktif
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    if (selectedLevel !== "n5") {
      params.set("level", selectedLevel);
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
  }, [searchTerm, selectedLevel, currentPage, pathname, router, searchParams]);

  useEffect(() => {
    if (selectedLevel === "n5" && articles.length > 0 && articles.length === (initialArticles?.length || 0)) {
      return;
    }

    async function fetchGrammar() {
      setLoading(true);
      try {
        const data = await getGrammarArticles(selectedLevel);
        setArticles(data);
        if (isFirstMount.current) {
          isFirstMount.current = false;
        } else {
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Gagal memuat tata bahasa:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGrammar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel]);

  const filteredArticles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return articles;

    return articles.filter((art) => {
      const titleMatch = art.title.toLowerCase().includes(term);
      const meaningMatch = art.meaning?.toLowerCase().includes(term) || false;
      const formationMatch = art.formation?.toLowerCase().includes(term) || false;
      const notesMatch = art.notes?.toLowerCase().includes(term) || false;
      return titleMatch || meaningMatch || formationMatch || notesMatch;
    });
  }, [articles, searchTerm]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = useMemo(() => filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [currentPage, filteredArticles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div className="max-w-7xl mx-auto w-full relative z-10 pt-4 md:pt-10">
      <GrammarHeader 
        levels={LEVELS}
        selectedLevel={selectedLevel}
        onLevelChange={(lvl) => {
          setSelectedLevel(lvl);
          setSearchTerm("");
        }}
      />

      <GrammarSearch
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
      />

      <section className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[2rem]">
            <div className="size-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        
        {paginatedArticles.length > 0 ? (
          layoutMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
              {paginatedArticles.map((article, idx) => (
                <GrammarCard
                  key={article.id || article._id}
                  article={article}
                  index={idx}
                  selectedLevel={selectedLevel}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {/* Kepala Tabel (Disembunyikan di Ponsel / Responsif) */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <div className="col-span-3">Pola Kalimat</div>
                <div className="col-span-4">Arti / Penggunaan</div>
                <div className="col-span-2">Pembentukan</div>
                <div className="col-span-1 text-center">Level</div>
                <div className="col-span-2 text-right">Aksi</div>
              </div>

              {paginatedArticles.map((article) => (
                <div
                  key={article.id || article._id}
                  className="flex md:grid md:grid-cols-12 items-center justify-between gap-4 px-4 py-3 bg-card/70 border border-border hover:border-[rgb(var(--primary-rgb)/0.5)] transition-all duration-200 rounded-2xl shadow-sm group"
                >
                  {/* Sisi Kiri: Pola Kalimat & Arti (Flex di Seluler, Kolom Grid di Desktop) */}
                  <div className="flex-1 md:col-span-7 flex flex-col md:grid md:grid-cols-7 md:gap-4 md:items-center min-w-0 pr-2">
                    <div className="md:col-span-3 font-black text-sm md:text-base text-foreground leading-snug truncate select-all">
                      {article.title}
                    </div>
                    <div className="md:col-span-4 text-[10px] md:text-sm text-muted-foreground md:text-foreground/90 font-medium line-clamp-1 mt-0.5 md:mt-0">
                      {article.meaning || "-"}
                    </div>
                  </div>

                  {/* Bagian Pembentukan (Sembunyikan di Seluler, Tampilkan di Desktop) */}
                  <div className="hidden md:block md:col-span-2 text-xs text-muted-foreground font-mono truncate">
                    {article.formation || "-"}
                  </div>

                  {/* Sisi Kanan: Level & Tombol Tindakan */}
                  <div className="flex items-center gap-2.5 shrink-0 md:col-span-3 md:justify-end">
                    <span className="text-[9px] md:text-[10px] font-black bg-[rgb(var(--primary-rgb)/0.1)] text-primary px-2 py-0.5 rounded-full border border-[rgb(var(--primary-rgb)/0.2)] uppercase shrink-0">
                      {article.jlptLevel || selectedLevel}
                    </span>
                    <Link href={`/library/grammar/${article.slug || article.id || article._id}`} className="shrink-0">
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
            </div>
          )
        ) : !loading ? (
          <GrammarEmptyState 
            searchTerm={searchTerm}
            selectedLevel={selectedLevel}
            onResetSearch={() => setSearchTerm("")}
          />
        ) : null}
      </section>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-16 pb-12"
      />
    </div>
  );
}
