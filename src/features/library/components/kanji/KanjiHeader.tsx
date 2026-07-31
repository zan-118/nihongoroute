/**
 * @file KanjiHeader.tsx
 * @description Komponen tajuk untuk halaman pencarian dan pustaka Kanji.
 * Menyediakan filter tingkat kesulitan JLPT, pencarian instan, serta toggle preferensi layout.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Search, Grid3X3, LayoutList } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Props for the KanjiHeader component.
 */
interface KanjiHeaderProps {
  /** Current search query string. */
  search: string;
  /** Callback function triggered when search query changes. */
  onSearchChange: (value: string) => void;
  /** Selected JLPT level filter. Null represents no filter. */
  levelFilter: string | null;
  /** Callback function triggered when JLPT level filter changes. */
  onLevelFilterChange: (level: string | null) => void;
}

// ==========================================
// KOMKOMPONEN UTAMA: KanjiHeader
// ==========================================
/**
 * Header component for the Kanji library.
 * Renders search input, JLPT level filter buttons, and layout view toggles.
 *
 * @param props - Component properties.
 */
export function KanjiHeader({
  search,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
}: KanjiHeaderProps) {
  // Available JLPT levels for filtering
  const levels = ["N5", "N4", "N3", "N2", "N1"];
  
  // Retrieve layout preference state and setter from UI store
  const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";
  const setLayoutPreference = useUIStore((s) => s.setLayoutPreference);

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Judul Utama & Sub-judul */}
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl uppercase tracking-tight text-foreground mb-4">
          Pustaka <span className="text-primary">Kanji</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Pelajari struktur dan cara penulisan kanji standar JLPT. Gunakan filter level untuk memfokuskan target pembelajaranmu.
        </p>
      </div>

      {/* Kontrol Filter & Pencarian */}
      <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
        {/* Kolom Input Pencarian */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" aria-hidden="true" />
          <Input 
            placeholder="Cari kanji, arti, atau cara baca..." 
            className="pl-12 h-14 bg-card/40  border border-border rounded-lg text-lg shadow-2xl focus:ring-primary/20 font-sans font-bold"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {/* Grup Pilihan Level JLPT & Preferensi Layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tombol Level JLPT */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {levels.map(lvl => (
              <Button
                key={lvl}
                variant={levelFilter === lvl ? "default" : "outline"}
                className={`h-14 px-6 rounded-lg font-bold transition-all duration-300 ${
                  levelFilter === lvl 
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgb(var(--primary-rgb)/0.3)]" 
                    : "bg-card/40 border border-border hover:bg-muted"
                }`}
                // Toggle filter off if clicked again, otherwise set new level
                onClick={() => onLevelFilterChange(levelFilter === lvl ? null : lvl)}
              >
                {lvl}
              </Button>
            ))}
          </div>

          {/* Toggle Tata Letak (Grid vs List) */}
          <div className="flex p-1 bg-card/40  rounded-lg border border-border h-14 items-center gap-1 px-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLayoutPreference("grid")}
              className={`p-2 h-10 w-10 rounded-xl transition-all ${
                layoutPreference === "grid"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.3)]"
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
              className={`p-2 h-10 w-10 rounded-xl transition-all ${
                layoutPreference === "list"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.3)]"
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
  );
}