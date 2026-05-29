"use client";

/**
 * @file VocabFilterPanel.tsx
 * @description Komponen panel filter untuk halaman Pustaka Kosakata (Vocabulary Library).
 * Menyediakan filter level JLPT, pencarian interaktif, selektor jenis kata (hinshi), serta toggle romaji dan layout.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Search, Grid3X3, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LEVELS, HINSHI } from "./types";
import { useUIStore } from "@/store/useUIStore";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface VocabFilterPanelProps {
  search: string;
  setSearch: (val: string) => void;
  level: string;
  setLevel: (val: string) => void;
  hinshi: string;
  setHinshi: (val: string) => void;
  showRomaji: boolean;
  setShowRomaji: (val: boolean) => void;
}

// ==========================================
// KOMPONEN UTAMA: VocabFilterPanel
// ==========================================
/**
 * Komponen panel filter interaktif untuk pengelolaan daftar kosakata.
 * 
 * @param {VocabFilterPanelProps} props Properti komponen panel filter kosakata.
 * @stores Mengakses `useUIStore` untuk mengelola preferensi visual baris tata letak.
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
    <div className="mb-10 md:mb-16 bg-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-border neo-card shadow-sm font-sans">
      <div className="flex flex-col gap-6 md:gap-8">
        
        {/* Kolom Pencarian Kosakata */}
        <div className="relative group w-full">
          <Search
            className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10"
            size={20}
            aria-hidden="true"
          />
          <Input
            placeholder="Masukkan kanji, kana, romaji, atau definisi..."
            className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 h-auto bg-muted/30 border-border rounded-2xl md:rounded-[2rem] text-sm md:text-base text-foreground placeholder:text-muted-foreground font-medium neo-inset shadow-none focus-visible:ring-primary/30 font-sans"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Baris Grid: Filter Level JLPT & Jenis Kata (Hinshi) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Selektor Level JLPT */}
          <div className="space-y-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
              Level JLPT
            </span>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {LEVELS.map((l) => (
                <Button
                  key={l}
                  variant="ghost"
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 md:px-6 md:py-3 h-auto rounded-xl text-xs md:text-xs font-bold transition-all border ${
                    level === l
                      ? "bg-primary text-primary-foreground border-none shadow-lg"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>

          {/* Selektor Kelas Kata (Hinshi) */}
          <div className="space-y-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
              Jenis Kata
            </span>
            <select
              value={hinshi}
              onChange={(e) => setHinshi(e.target.value)}
              className="w-full px-5 md:px-6 py-3 md:py-4 bg-muted border border-border rounded-xl md:rounded-2xl text-xs md:text-xs font-bold uppercase tracking-widest text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              {HINSHI.map((h) => (
                <option key={h.value} value={h.value} className="bg-card py-2 uppercase tracking-widest font-sans font-bold">
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris Bawah: Pengendali Tampilan Romaji & Format Layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Kontrol Toggle Romaji */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-4 px-4 py-3 bg-muted/20 border border-border rounded-xl md:rounded-2xl neo-inset">
            <div className="flex flex-col pr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Tampilkan Romaji</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">
                Pemandu bacaan Latin
              </span>
            </div>
            <Switch checked={showRomaji} onCheckedChange={setShowRomaji} className="data-[state=checked]:bg-primary" />
          </div>

          {/* Kontrol Toggle Format Layout (Grid vs List) */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-4 px-4 py-3 bg-muted/20 border border-border rounded-xl md:rounded-2xl neo-inset">
            <div className="flex flex-col pr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Tampilan Pustaka</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">
                Grid / Tabel Ringkas
              </span>
            </div>
            <div className="flex p-1 bg-background/60 rounded-xl border border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLayoutPreference("grid")}
                className={`p-2 h-8 w-8 rounded-lg transition-all ${
                  layoutPreference === "grid"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Tampilan Grid"
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLayoutPreference("list")}
                className={`p-2 h-8 w-8 rounded-lg transition-all ${
                  layoutPreference === "list"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Tampilan Tabel Ringkas"
              >
                <LayoutList size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

