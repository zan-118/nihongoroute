/**
 * @file VocabView.tsx
 * @description Interactive client view component for the Vocabulary Dictionary hub with JLPT level filtering, part-of-speech tags, search, and pagination.
 * @module features/library/vocab
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
 Search,
 ChevronLeft,
 Loader2,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedVocab, PaginatedVocabResponse } from "@/actions/library.actions";

// Supporting Components
import { VocabCard } from "@/features/library/components/vocab/VocabCard";
import { VocabFlashcardView } from "@/features/library/components/vocab/VocabFlashcardView";
import { VocabHeader } from "@/features/library/components/vocab/VocabHeader";
import { VocabFilterPanel } from "@/features/library/components/vocab/VocabFilterPanel";
import { VocabPagination } from "@/features/library/components/vocab/VocabPagination";
import { useUIStore } from "@/store/useUIStore";
import { SmartJapanese } from "@/components/ui/japanese";
import { TTSReader } from "@/features/media";
import type { VocabItem } from "@/features/library/components/vocab/types";

// ======================
// EKSEKUSI UTAMA
// ======================

/** Number of items per page. */
const VOCAB_PAGE_SIZE = 50;

/** Default JLPT level filter. */
const DEFAULT_VOCAB_LEVEL = "N5";

/**
 * Normalize level parameter from URL.
 * @param value Raw level string.
 * @returns Normalized level string.
 */
function normalizeLevelParam(value: string | null) {
 if (!value) return DEFAULT_VOCAB_LEVEL;

 const lower = value.toLowerCase();
 if (lower === "all" || value === "Semua") return "Semua";
 if (lower === "umum") return "Umum";
 if (/^n[1-5]$/.test(lower)) return lower.toUpperCase();
 return value;
}

/**
 * Map UI level label to API query value.
 * @param label UI level label.
 * @returns API query string.
 */
function mapLevelToQuery(label: string) {
 if (label === "Semua") return "all";
 if (label === "Umum") return "umum";
 return label;
}

/**
 * Komponen VocabView: Menyediakan antarmuka direktori kamus kosakata interaktif 
 * dengan penyaringan level JLPT, jenis kata (Hinshi), pencarian instan, dan mode latihan flashcard.
 * 
 * @param {Object} props Properti komponen.
 * @param {PaginatedVocabResponse} props.initialData Data kosakata inisial dari server (RSC).
 * @returns {JSX.Element} Antarmuka direktori kosakata interaktif.
 */
export default function VocabView({
 initialData,
}: {
 initialData: PaginatedVocabResponse;
}) {
 const searchParams = useSearchParams();
 const router = useRouter();
 const pathname = usePathname();

 // Membaca nilai filter awal dari URL jika ada (kompatibel dengan bookmark)
 const initialLevel = normalizeLevelParam(searchParams.get("level"));
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

 const isFirstMount = useRef(true);
 const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";

 // Menyinkronkan status filter dengan parameter pencarian URL secara reaktif
 useEffect(() => {
 const params = new URLSearchParams(searchParams.toString());

 if (debouncedSearch) {
 params.set("search", debouncedSearch);
 } else {
 params.delete("search");
 }

 if (level === "Semua") {
 params.set("level", "all");
 } else {
 params.set("level", level);
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

 // Debounce search input to prevent excessive API calls
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

 // Reset page to 1 when filters change
 useEffect(() => {
 if (isFirstMount.current) {
 isFirstMount.current = false;
 return;
 }
 setCurrentPage(1);
 }, [level, hinshi]);

 // Fetch paginated vocabulary data from server action
 const { data, isFetching: loading } = useQuery({
 queryKey: ["vocab", currentPage, debouncedSearch, level, hinshi],
 queryFn: () => getPaginatedVocab(currentPage, VOCAB_PAGE_SIZE, debouncedSearch, mapLevelToQuery(level), hinshi),
 placeholderData: keepPreviousData,
 initialData: currentPage === 1 && debouncedSearch === "" && level === DEFAULT_VOCAB_LEVEL && hinshi === "all" ? initialData : undefined,
 });

 const vocabListRaw = useMemo(() => data?.data || [], [data?.data]);

 /** Type definition for raw vocabulary item from query. */
 type VocabItemType = (typeof vocabListRaw)[number];

 // Parse and normalize raw database fields into structured VocabItem format
 const vocabList = useMemo<VocabItem[]>(() => {
 const seen = new Set<string>();
 const mapped: VocabItem[] = [];

 for (const item of vocabListRaw as VocabItemType[]) {
 const key = item.word || item.id;
 if (seen.has(key)) continue;
 seen.add(key);

 // Safely parse related kanji array structure
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

 // Safely parse example sentences structure
 mapped.push({
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
 });
 }

 return mapped;
 }, [vocabListRaw]);
 const totalItems = data?.total || 0;
 const totalPages = Math.ceil(totalItems / VOCAB_PAGE_SIZE);

 // Mode Latihan Flashcard
 if (isFlashcardMode && vocabList.length > 0) {
 return (
 <VocabFlashcardView
 vocabList={vocabList}
 onBack={() => setIsFlashcardMode(false)}
 />
 );
 }

 /**
 * Handle page change and scroll to top.
 * @param page Target page number.
 */
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
 <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 rounded-4xl">
 <Loader2 className="size-10 animate-spin text-primary" />
 </div>
 )}
 {vocabList.length === 0 && !loading ? (
 <div
 className="py-24 text-center border border-dashed border-border rounded-xl bg-muted/20 neo-inset px-6"
 >
 <Search className="mx-auto mb-6 text-muted-foreground/30" size={48} aria-hidden="true" />
 <p className="text-muted-foreground font-bold text-xs md:text-sm uppercase tracking-widest">
 Kosakata nggak ketemu. Coba cari kata kunci lain ya.
 </p>
 </div>
 ) : layoutPreference === "grid" ? (
 <div
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
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
 <div className="w-full overflow-x-auto font-sans">
 <table className="w-full min-w-160 text-left border-collapse">
 <thead>
 <tr className="border-b-2 border-border/80 text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground/80 bg-muted/20">
 <th className="py-3 px-4 w-48">KOSAKATA</th>
 <th className="py-3 px-4">ARTI / DEFINISI</th>
 <th className="py-3 px-4 w-32">JENIS KATA</th>
 <th className="py-3 px-4 w-20 text-center">JLPT</th>
 <th className="py-3 px-4 w-28 text-right">AKSI</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30 font-sans">
 {vocabList.map((item) => (
 <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
 {/* KOSAKATA */}
 <td className="py-3.5 px-4 align-top">
 <span className="text-lg font-black text-foreground font-japanese group-hover:text-primary transition-colors block">
 <SmartJapanese word={item.word} furigana={item.furigana || undefined} />
 </span>
 {showRomaji && item.romaji && (
 <span className="block text-[10px] text-muted-foreground/60 font-mono font-bold uppercase mt-0.5">
 {item.romaji}
 </span>
 )}
 </td>

 {/* ARTI */}
 <td className="py-3.5 px-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed align-top">
 {item.meaning}
 </td>

 {/* HINSHI */}
 <td className="py-3.5 px-4 align-top">
 {item.hinshi?.[0] && (
 <span className="text-[9px] font-mono font-bold bg-muted px-2 py-0.5 rounded-full border border-border/50 uppercase text-muted-foreground inline-block">
 {item.hinshi[0]}
 </span>
 )}
 </td>

 {/* JLPT */}
 <td className="py-3.5 px-4 text-center align-top">
 {item.jlpt_level && (
 <span className="text-[9px] font-mono font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20 uppercase inline-block">
 {item.jlpt_level.toUpperCase()}
 </span>
 )}
 </td>

 {/* AKSI */}
 <td className="py-3.5 px-4 text-right align-top">
 <div className="flex items-center justify-end gap-2">
 <div onClick={(e) => e.preventDefault()} className="shrink-0">
 <TTSReader text={item.word} minimal={true} speaker="indah" audioUrl={item.audio_url} />
 </div>
 <Link href={`/library/vocab/${item.slug || item.id}`}>
 <Button
 variant="ghost"
 size="sm"
 className="px-3 h-8 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
 >
 Detail
 </Button>
 </Link>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
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
 <Button variant="ghost" className="w-full px-8 py-6 md:px-10 md:py-7 h-auto text-xs md:text-xs font-bold uppercase tracking-widest rounded-lg bg-muted border border-border neo-card shadow-none hover:bg-primary hover:text-primary-foreground transition-all gap-3 group">
 <ChevronLeft size={16} className="group-hover:-translate-x-1.5 transition-transform duration-300" aria-hidden="true" /> Kembali ke Pustaka
 </Button>
 </Link>
 </footer>
 </div>
 );
}