/**
 * @file GrammarView.tsx
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
/** JLPT levels for filtering. */
const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
/** Pagination limit. */
const ITEMS_PER_PAGE = 12;
/** Static empty array reference. Prevent unnecessary re-renders. */
const EMPTY_GRAMMAR_ARTICLES: GrammarArticle[] = [];

// ======================
// TIPE DATA
// ======================
/**
 * Grammar article schema.
 */
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

/**
 * Props for GrammarView.
 */
interface GrammarViewProps {
  initialArticles?: GrammarArticle[];
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * GrammarView component. Handle search, filter, pagination.
 * 
 * @param props Component props.
 * @returns Interactive grammar directory UI.
 */
export default function GrammarView({ initialArticles = EMPTY_GRAMMAR_ARTICLES }: GrammarViewProps) {
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

    // Update URL only if parameters changed. Prevent redundant history entries.
    if (currentParamsString !== newParamsString) {
      router.replace(`${pathname}?${newParamsString}`, { scroll: false });
    }
  }, [searchTerm, selectedLevel, currentPage, pathname, router, searchParams]);

  useEffect(() => {
    // Skip fetch if initial load and level is default n5.
    if (selectedLevel === "n5" && articles.length > 0 && articles.length === (initialArticles?.length || 0)) {
      return;
    }

    /**
     * Fetch grammar articles from server action.
     */
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

  // Filter articles locally based on search term.
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
  
  // Slice filtered articles for current page view.
  const paginatedArticles = useMemo(() => filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [currentPage, filteredArticles]);

  /**
   * Handle page change event. Scroll to top smoothly.
   * 
   * @param page Target page number.
   */
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

      <section className="relative min-h-100">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50  rounded-4xl">
            <div className="size-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        
        {paginatedArticles.length > 0 ? (
          layoutMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
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
            <div className="w-full overflow-x-auto font-sans">
              <table className="w-full min-w-160 text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-border/80 text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground/80 bg-muted/20">
                    <th className="py-3 px-4 w-48">POLA KALIMAT</th>
                    <th className="py-3 px-4">ARTI / PENGGUNAAN</th>
                    <th className="py-3 px-4 w-40">PEMBENTUKAN</th>
                    <th className="py-3 px-4 w-20 text-center">LEVEL</th>
                    <th className="py-3 px-4 w-24 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-sans">
                  {paginatedArticles.map((article) => (
                    <tr key={article.id || article._id} className="hover:bg-emerald-500/5 transition-colors group">
                      <td className="py-3.5 px-4 font-black font-japanese text-base text-foreground group-hover:text-emerald-500 transition-colors align-top">
                        {article.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed align-top">
                        {article.meaning || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground/80 align-top">
                        {article.formation || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center align-top">
                        <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase inline-block">
                          {article.jlptLevel || selectedLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right align-top">
                        <Link href={`/library/grammar/${article.slug || article.id || article._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 h-8 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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