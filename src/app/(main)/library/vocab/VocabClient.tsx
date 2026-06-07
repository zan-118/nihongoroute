/**
 * @file VocabClient.tsx
 * @description Komponen klien interaktif untuk halaman Kamus Kosakata (Vocab Dictionary).
 * Mendukung pencarian, filter level JLPT, filter part-of-speech, dan paginasi berbasis state klien.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedVocab, PaginatedVocabResponse } from "@/actions/library.actions";

// Komponen Pendukung
import { VocabCard } from "@/components/features/library/vocab/VocabCard";
import { VocabFlashcardView } from "@/components/features/library/vocab/VocabFlashcardView";
import { VocabHeader } from "@/components/features/library/vocab/VocabHeader";
import { VocabFilterPanel } from "@/components/features/library/vocab/VocabFilterPanel";
import { VocabPagination } from "@/components/features/library/vocab/VocabPagination";
import { useUIStore } from "@/store/useUIStore";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen VocabClient: Menyediakan antarmuka direktori kamus kosakata interaktif 
 * dengan penyaringan level JLPT, jenis kata (Hinshi), pencarian instan, dan mode latihan flashcard.
 * 
 * @param {Object} props Properti komponen.
 * @param {PaginatedVocabResponse} props.initialData Data kosakata inisial dari server (RSC).
 * @returns {JSX.Element} Antarmuka direktori kosakata interaktif.
 */
export default function VocabClient({
  initialData,
}: {
  initialData: PaginatedVocabResponse;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Membaca nilai filter awal dari URL jika ada (kompatibel dengan bookmark)
  const initialLevel = searchParams.get("level") || "n5";
  const initialHinshi = searchParams.get("hinshi") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page") || "1");

  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true);

  const [level, setLevel] = useState<string>(initialLevel);
  const [hinshi, setHinshi] = useState<string>(initialHinshi);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const limit = 50;

  const isFirstMount = useRef(true);
  const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";

  const mapLevelToQuery = (lbl: string) => {
    if (lbl === "Semua") return "all";
    if (lbl === "Umum") return "umum";
    return lbl;
  };

  // Menyinkronkan status filter dengan parameter pencarian URL secara reaktif
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (level !== "Semua") {
      params.set("level", level);
    } else {
      params.delete("level");
    }

    if (hinshi !== "all") {
      params.set("hinshi", hinshi);
    } else {
      params.delete("hinshi");
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
  }, [debouncedSearch, level, hinshi, currentPage, pathname, router, searchParams]);

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
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [level, hinshi]);

  const { data, isFetching: loading } = useQuery({
    queryKey: ["vocab", currentPage, debouncedSearch, level, hinshi],
    queryFn: () => getPaginatedVocab(currentPage, limit, debouncedSearch, mapLevelToQuery(level), hinshi),
    placeholderData: keepPreviousData,
    initialData: currentPage === 1 && debouncedSearch === "" && level === "Semua" && hinshi === "all" ? initialData : undefined,
  });

  const vocabListRaw = data?.data || [];

  type VocabItemType = (typeof vocabListRaw)[number];

  // Melakukan de-duplikasi konten berdasarkan kata kunci unik
  const uniqueVocab = Object.values(
    vocabListRaw.reduce((acc: Record<string, VocabItemType>, item: VocabItemType) => {
      const key = item.word || "";
      if (!acc[key]) {
        acc[key] = item;
      }
      return acc;
    }, {})
  );

  const vocabList: import("@/components/features/library/vocab/types").VocabItem[] = uniqueVocab.map((item) => {
    const relatedKanjiParsed = Array.isArray(item.related_kanji)
      ? (item.related_kanji as unknown[]).map((rk) => {
        if (typeof rk === "string") {
          return { character: rk, meaning: "" };
        }
        if (rk && typeof rk === "object") {
          const obj = rk as Record<string, unknown>;
          return {
            character: typeof obj.character === "string" ? obj.character : "",
            meaning: typeof obj.meaning === "string" ? obj.meaning : "",
          };
        }
        return { character: "", meaning: "" };
      })
      : null;

    return {
      id: item.id,
      word: item.word,
      furigana: item.furigana ?? null,
      romaji: item.romaji ?? null,
      meaning: item.meaning,
      hinshi: item.hinshi ?? null,
      slug: item.slug,
      jlpt_level: item.jlpt_level ?? null,
      pitch_accent: item.pitch_accent ?? null,
      audio_url: item.audio_url ?? null,
      usage_notes: item.usage_notes ?? null,
      mnemonic: item.mnemonic ?? null,
      is_common: item.is_common,
      show_in_flashcard: item.show_in_flashcard,
      examples: Array.isArray(item.examples)
        ? (item.examples as unknown[]).map((ex) => {
          if (ex && typeof ex === "object") {
            const obj = ex as Record<string, unknown>;
            return {
              id: typeof obj.id === "string" ? obj.id : undefined,
              jp: typeof obj.jp === "string" ? obj.jp : undefined,
              romaji: typeof obj.romaji === "string" ? obj.romaji : undefined,
              furigana: typeof obj.furigana === "string" ? obj.furigana : undefined,
              meaning: typeof obj.meaning === "string" ? obj.meaning : undefined,
              japanese: typeof obj.japanese === "string" ? obj.japanese : undefined,
              indonesian: typeof obj.indonesian === "string" ? obj.indonesian : undefined,
            };
          }
          return {};
        })
        : null,
      synonyms: Array.isArray(item.synonyms) ? item.synonyms.map(String) : null,
      antonyms: Array.isArray(item.antonyms) ? item.antonyms.map(String) : null,
      related_kanji: relatedKanjiParsed,
      conjugations: item.conjugations as Record<string, string> | null,
      created_at: item.created_at,
    };
  });
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Mode Latihan Flashcard
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

      {/* Grid Konten */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[2rem]">
            <Loader2 className="size-10 animate-spin text-primary" />
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
        ) : layoutPreference === "grid" ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 min-h-[400px]"
          >
            {vocabList.map((item, idx) => (
              <VocabCard
                key={item.id}
                item={item}
                idx={idx}
                showRomaji={showRomaji}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 min-h-[400px]">
            {/* Kepala Tabel (Disembunyikan di Ponsel / Responsif) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-3">Kosakata</div>
              <div className="col-span-4">Arti / Definisi</div>
              <div className="col-span-2">Jenis Kata</div>
              <div className="col-span-1 text-center">JLPT</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {vocabList.map((item) => (
              <div
                key={item.id}
                className="flex md:grid md:grid-cols-12 items-center justify-between gap-4 px-4 py-3 bg-[rgba(var(--card-rgb),0.3)] backdrop-blur-3xl border border-border hover:border-[rgba(var(--primary-rgb),0.5)] transition-all duration-300 rounded-2xl shadow-sm hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.08)] group"
              >
                {/* Sisi Kiri: Kosakata & Arti (Flex di Seluler, Kolom Grid di Desktop) */}
                <div className="flex-1 md:col-span-7 flex flex-col md:grid md:grid-cols-7 md:gap-4 md:items-center min-w-0 pr-2">
                  <div className="md:col-span-3 flex flex-col justify-center min-w-0">
                    <span className="text-base md:text-lg font-black text-foreground truncate">
                      <SmartJapanese word={item.word} furigana={item.furigana || undefined} />
                    </span>
                    {showRomaji && item.romaji && (
                      <span className="text-[9px] md:text-xs text-muted-foreground/60 font-semibold tracking-wide uppercase mt-0.5 truncate">
                        {item.romaji}
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-4 text-[10px] md:text-sm text-muted-foreground md:text-foreground/90 font-medium line-clamp-1 mt-0.5 md:mt-0">
                    {item.meaning}
                  </div>
                </div>

                {/* Jenis Kata (Sembunyikan di Seluler, Tampilkan di Desktop) */}
                <div className="hidden md:block md:col-span-2">
                  {item.hinshi && (
                    <span className="text-[9px] md:text-[10px] font-black bg-muted px-2 py-0.5 rounded-md border border-border uppercase tracking-widest text-muted-foreground max-w-max">
                      {item.hinshi}
                    </span>
                  )}
                </div>

                {/* Sisi Kanan: Level JLPT & Tombol Tindakan */}
                <div className="flex items-center gap-2.5 shrink-0 md:col-span-3 md:justify-end">
                  {item.jlpt_level && (
                    <span className="text-[9px] md:text-[10px] font-black bg-[rgba(var(--primary-rgb),0.1)] text-primary px-2 py-0.5 rounded-full border border-[rgba(var(--primary-rgb),0.2)] uppercase shrink-0">
                      {item.jlpt_level.toUpperCase()}
                    </span>
                  )}
                  <TTSReader text={item.word} small={true} speaker="indah" />
                  <Link href={`/library/vocab/${item.slug}`} className="shrink-0">
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
