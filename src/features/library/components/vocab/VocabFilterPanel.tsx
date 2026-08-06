"use client";

/**
 * @file VocabFilterPanel.tsx
 * @description Komponen panel filter untuk halaman Pustaka Kosakata (Vocabulary Library).
 * Menyediakan filter level JLPT, pencarian interaktif, selektor jenis kata (hinshi), serta toggle romaji dan layout.
 */

import { Search, LayoutGrid } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LEVELS, HINSHI } from "./types";
import { useUIStore } from "@/store/useUIStore";

interface VocabFilterPanelProps {
 /** Current search query. */
 search: string;
 /** Update search query. */
 setSearch: (val: string) => void;
 /** Selected JLPT level. */
 level: string;
 /** Update JLPT level. */
 setLevel: (val: string) => void;
 /** Selected part of speech. */
 hinshi: string;
 /** Update part of speech. */
 setHinshi: (val: string) => void;
 /** Romaji visibility state. */
 showRomaji: boolean;
 /** Update romaji visibility. */
 setShowRomaji: (val: boolean) => void;
}

/**
 * Filter panel component with Double-Bezel glass architecture.
 * 
 * @param props Component properties.
 * @returns Filter panel element.
 */
export function VocabFilterPanel({
 search,
 setSearch,
 level,
 setLevel,
 hinshi,
 setHinshi,
 showRomaji,
 setShowRomaji,
}: VocabFilterPanelProps) {
 const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";
 const setLayoutPreference = useUIStore((s) => s.setLayoutPreference);

 return (
 <div className="mb-12 md:mb-16 p-2 rounded-[2.25rem] bg-card/40 dark:bg-card/20 backdrop-blur-xl border border-border/60 dark:border-white/10 shadow-sm font-sans">
 {/* ── INNER CORE ── */}
 <div className="w-full h-full rounded-[calc(2.25rem-0.5rem)] p-6 sm:p-8 dark:from-[#080d14]/90 dark:to-[#05080e]/95 border border-border/30 dark:border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col gap-6 md:gap-8">
 
 {/* Search Bar */}
 <div className="relative group w-full">
 <Search
 className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10"
 size={18}
 aria-hidden="true"
 />
 <Input
 placeholder="Cari kanji, kana, romaji, atau arti kata..."
 className="w-full pl-12 pr-6 py-4 h-14 bg-background/60 dark:bg-[#03060a]/60 border-border/60 dark:border-white/10 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/60 font-medium focus-visible:ring-primary/30 font-sans shadow-inner transition-all duration-300"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>

 {/* Filters Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
 {/* JLPT Level Selector */}
 <div className="lg:col-span-8 space-y-3">
 <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 font-mono block">
 FILTER LEVEL JLPT
 </span>
 <div className="flex flex-wrap gap-2">
 {LEVELS.map((l) => (
 <Button
 key={l}
 variant="ghost"
 onClick={() => setLevel(l)}
 className={`px-4 py-2.5 h-auto rounded-full text-xs font-mono font-bold transition-all duration-300 ${
 level === l
 ? "bg-primary text-primary-foreground border-none shadow-md shadow-primary/20 scale-105"
 : "bg-muted/50 border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
 }`}
 >
 {l}
 </Button>
 ))}
 </div>
 </div>

 {/* Part of Speech Dropdown */}
 <div className="lg:col-span-4 space-y-3">
 <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 font-mono block">
 JENIS KATA (HINSHI)
 </span>
 <select
 value={hinshi}
 onChange={(e) => setHinshi(e.target.value)}
 className="w-full px-4 py-3 h-11 bg-background/60 dark:bg-[#03060a]/60 border border-border/60 dark:border-white/10 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
 >
 {HINSHI.map((h) => (
 <option key={h.value} value={h.value} className="bg-card py-2 font-sans font-bold">
 {h.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* View Controls & Toggles Bar */}
 <div className="pt-4 border-t border-border/40 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 {/* Romaji Toggle */}
 <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-background/40 dark:bg-[#03060a]/40 border border-border/40 rounded-2xl">
 <div className="flex flex-col">
 <span className="text-[10px] font-black uppercase tracking-wider font-mono text-foreground">Tampilkan Romaji</span>
 <span className="text-[9px] font-medium text-muted-foreground">Panduan abjad Latin</span>
 </div>
 <Switch checked={showRomaji} onCheckedChange={setShowRomaji} className="data-[state=checked]:bg-primary" />
 </div>

 {/* Layout Preference Toggle */}
 <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-background/40 dark:bg-[#03060a]/40 border border-border/40 rounded-2xl">
 <span className="text-[10px] font-black uppercase tracking-wider font-mono text-foreground">Format Tampilan</span>
 <div className="flex p-1 bg-muted/60 rounded-xl border border-border/40">
 <Button
 type="button"
 variant="ghost"
 onClick={() => setLayoutPreference("grid")}
 className={`p-1.5 h-7 w-7 rounded-lg transition-all ${
 layoutPreference === "grid"
 ? "bg-primary text-primary-foreground shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 }`}
 aria-label="Tampilan Grid"
 >
 <LayoutGrid size={14} />
 </Button>
 <Button
 type="button"
 variant="ghost"
 onClick={() => setLayoutPreference("list")}
 className={`p-1.5 h-7 w-7 rounded-lg transition-all ${
 layoutPreference === "list"
 ? "bg-primary text-primary-foreground shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 }`}
 aria-label="Tampilan Tabel Ringkas"
 >
 <LayoutGrid size={14} />
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}