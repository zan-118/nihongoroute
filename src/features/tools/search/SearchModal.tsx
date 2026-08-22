/**
 * @file SearchModal.tsx
 * @description Global search overlay modal component featuring local static navigation search and real-time Supabase dictionary queries for vocabulary, grammar, and kanji.
 */

// Import & Dependencies

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, CommandLine, BookOpen, Trophy, Stack, Brain, Heart, Settings, Share, ArrowRight, Zap, Loader, FileText, Hashtag } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

// Types & Interfaces

/**
 * Search item structure.
 */
interface SearchItem {
 id: string;
 title: string;
 description: string;
 href: string;
 icon: React.ElementType;
 category: "Platform" | "Belajar" | "Sistem" | "Aksi Cepat" | "Kosakata" | "Tata Bahasa" | "Kanji" | "Pelajaran" | "Bacaan" | "Menyimak" | "Alat";
}

// DATA STATIS NAVIGASI PLATFORM

/**
 * Static navigation items.
 */
const SEARCH_ITEMS: SearchItem[] = [
 { id: "dash", title: "Dasbor", description: "Ringkasan progres dan statistikmu", href: "/dashboard", icon: Zap, category: "Platform" },
 { id: "materi", title: "Materi", description: "Jalur belajar JLPT dan Topik Umum", href: "/courses", icon: BookOpen, category: "Platform" },
 { id: "ujian", title: "Ujian", description: "Simulasi JLPT dan Test Mandiri", href: "/exams", icon: Trophy, category: "Platform" },
 { id: "pustaka", title: "Pustaka", description: "Daftar kata benda, kata kerja, dan kanji", href: "/library", icon: Stack, category: "Belajar" },
 { id: "hafalan", title: "Peninjauan", description: "Latihan SRS untuk ingatan jangka panjang", href:ROUTES.REVIEW, icon: Brain, category: "Belajar" },
 { id: "sosial", title: "Papan Skor", description: "Peringkat global dan komunitas", href:ROUTES.SOCIAL, icon: Trophy, category: "Belajar" },
 { id: "dukungan", title: "Dukungan", description: "Bantuan dan panduan penggunaan", href: "/support", icon: Heart, category: "Sistem" },
 { id: "pengaturan", title: "Pengaturan", description: "Kelola profil dan preferensi aplikasi", href:ROUTES.SETTINGS, icon: Settings, category: "Sistem" },
 { id: "bagikan", title: "Bagikan", description: "Ajak teman belajar bersama di NihongoRoute", href:ROUTES.SHARE, icon: Share, category: "Sistem" },
 { id: "quick-review", title: "Review Sekarang", description: "Mulai sesi review SRS yang tertunda", href:ROUTES.REVIEW, icon: Zap, category: "Aksi Cepat" },
 { id: "quick-kana", title: "Belajar Kana", description: "Latihan dasar Hiragana & Katakana", href:ROUTES.TOOLS.KANA, icon: BookOpen, category: "Aksi Cepat" },
];

/**
 * Filtered quick action items.
 */
const QUICK_ACTIONS = SEARCH_ITEMS.filter((item) => item.category === "Aksi Cepat");

/**
 * Cache for database search results.
 */
const searchCache = new Map<string, SearchItem[]>();

// FUNGSI PENCARIAN DATABASE (SUPABASE)

import { searchGlobal, flattenToolSearchResult } from "@/lib/tools/tools-search";

import { ROUTES } from "@/lib/core/routes";
/**
 * Query Supabase for all categories.
 * @param query Search term.
 * @returns Array of matching search items.
 */
async function searchSupabase(query: string): Promise<SearchItem[]> {
 const normalizedQuery = query.trim().toLowerCase();
 // Return cached results if available
 const cached = searchCache.get(normalizedQuery);
 if (cached) return cached;

 const result = await searchGlobal(query, 3);
 const flatItems = flattenToolSearchResult(result);

 const categoryMap: Record<string, SearchItem["category"]> = {
 vocab: "Kosakata",
 grammar: "Tata Bahasa",
 kanji: "Kanji",
 lesson: "Pelajaran",
 reading: "Bacaan",
 listening: "Menyimak",
 tool: "Alat"
 };

 const mapped: SearchItem[] = flatItems.map((item) => ({
 id: item.id,
 title: item.title,
 description: item.description,
 href: item.href,
 icon: item.icon,
 category: categoryMap[item.category] || "Belajar"
 }));

 // Save results to cache
 searchCache.set(normalizedQuery, mapped);
 return mapped;
}

// Main Component

/**
 * Global search modal component.
 * @param props Component properties.
 * @param props.isOpen Modal visibility state.
 * @param props.onClose Callback to close modal.
 */
export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 const [query, setQuery] = useState("");
 const [results, setResults] = useState<SearchItem[]>(QUICK_ACTIONS);
 const [isSearching, setIsSearching] = useState(false);
 const [activeIndex, setActiveIndex] = useState(0);
 const router = useRouter();
 const requestIdRef = useRef(0);

 // Handle debounced search query execution
 useEffect(() => {
 if (!isOpen) return;
 const trimmedQuery = query.trim();
 const requestId = ++requestIdRef.current;

 if (trimmedQuery === "") {
 return;
 }

 const timer = setTimeout(async () => {
 setIsSearching(true);
 try {
 // Search local static items
 const localMatches = SEARCH_ITEMS.filter(item =>
 item.title.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
 item.description.toLowerCase().includes(trimmedQuery.toLowerCase())
 );
 // Search remote database items
 const dbResults = await searchSupabase(trimmedQuery);
 // Prevent state update if request is stale
 if (requestId !== requestIdRef.current) return;
 setResults([...localMatches, ...dbResults]);
 } catch (err) {
 if (requestId !== requestIdRef.current) return;
 console.error("Gagal melakukan pencarian:", err);
 } finally {
 if (requestId === requestIdRef.current) setIsSearching(false);
 }
 }, 400);
 return () => clearTimeout(timer);
 }, [query, isOpen]);

 // Handle item selection and navigation
 const handleSelect = useCallback((href: string) => {
 router.push(href);
 onClose();
 }, [router, onClose]);

 const trimmedQuery = query.trim();
 // Determine which results to display based on query presence
 const displayedResults = useMemo(
 () => trimmedQuery === "" ? QUICK_ACTIONS : results,
 [results, trimmedQuery]
 );
 const showSearching = trimmedQuery !== "" && isSearching;

 // Handle keyboard navigation and shortcuts
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 // Toggle modal on Ctrl+K or Cmd+K
 if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (isOpen) onClose(); }
 if (!isOpen) return;
 if (e.key === "Escape") onClose();
 // Navigate down list
 if (e.key === "ArrowDown" && displayedResults.length > 0) { e.preventDefault(); setActiveIndex(prev => (prev + 1) % displayedResults.length); }
 // Navigate up list
 if (e.key === "ArrowUp" && displayedResults.length > 0) { e.preventDefault(); setActiveIndex(prev => (prev - 1 + displayedResults.length) % displayedResults.length); }
 // Select active item
 if (e.key === "Enter") { e.preventDefault(); if (displayedResults[activeIndex]) handleSelect(displayedResults[activeIndex].href); }
 };
 window.addEventListener("keydown", handleKeyDown);
 return () => window.removeEventListener("keydown", handleKeyDown);
 }, [isOpen, onClose, displayedResults, activeIndex, handleSelect]);

 // RENDER KOMPONEN

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 md:pt-[15vh]">
 <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/60 " onClick={onClose} />
 <m.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="w-full max-w-2xl bg-card/85 border border-border shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden relative z-10">
 <div className="p-6 border-b border-border flex items-center gap-4">
 {showSearching ? <Loader className="text-primary animate-spin" size={24} /> : <Search className="text-primary animate-pulse" size={24} />}
 <input autoFocus placeholder="Cari kosakata, tata bahasa, atau navigasi..." className="flex-1 bg-transparent border-none outline-none text-lg md:text-xl font-bold text-foreground placeholder:text-muted-foreground/40" value={query} onChange={e => { setQuery(e.target.value); setActiveIndex(0); if (e.target.value.trim() === "") setIsSearching(false); }} />
 <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-muted border border-border rounded-lg text-xs font-black text-muted-foreground uppercase tracking-wider"><CommandLine size={10} /> K</div>
 <button onClick={onClose} aria-label="Tutup pencarian" className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><X size={20} /></button>
 </div>
 <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
 {displayedResults.length > 0 ? (
 <div className="space-y-2">
 {displayedResults.map((item, index) => (
 <div key={item.id + index} onMouseEnter={() => setActiveIndex(index)} onClick={() => handleSelect(item.href)}
 className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-300 relative group ${index === activeIndex ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-muted/50 border border-transparent'}`}>
 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${index === activeIndex ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-muted text-muted-foreground'}`}><item.icon size={24} /></div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3">
 <h4 className={`font-black text-sm md:text-base uppercase tracking-wider ${index === activeIndex ? 'text-foreground' : 'text-primary/70'}`}>{item.title}</h4>
 <span className="text-[8px] font-bold text-primary/50 uppercase tracking-wider">{item.category}</span>
 </div>
 <p className="text-xs text-muted-foreground font-medium truncate mt-1">{item.description}</p>
 </div>
 <ArrowRight size={18} className={`transition-all duration-300 ${index === activeIndex ? 'text-primary translate-x-0 opacity-100' : 'opacity-0 -translate-x-4'}`} />
 </div>
 ))}
 </div>
 ) : (
 <div className="py-20 text-center">
 <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6 border border-border/50"><Search className="text-muted-foreground/20" size={32} /></div>
 <h3 className="text-lg uppercase tracking-wider text-foreground mb-2">Data Tidak Ditemukan</h3>
 <p className="text-sm text-muted-foreground max-w-xs mx-auto">Coba gunakan kata kunci lain atau cari melalui navigasi utama.</p>
 </div>
 )}
 </div>
 <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground">
 <div className="flex items-center gap-4">
 <span className="flex items-center gap-1.5"><ArrowRight size={10} className="rotate-90" /> Navigasi</span>
 <span className="flex items-center gap-1.5"><CommandLine size={10} className="rotate-90" /> Pilih</span>
 </div>
 <span className="opacity-50">Pencarian Global v2.0</span>
 </div>
 </m.div>
 </div>
 )}
 </AnimatePresence>
 );
}