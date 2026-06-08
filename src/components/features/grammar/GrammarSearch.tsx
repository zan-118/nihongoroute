/**
 * @file GrammarSearch.tsx
 * @description Komponen pencarian tata bahasa dengan toggle preferensi tata letak (grid vs list).
 * Menghubungkan pilihan pengguna ke useUIStore secara real-time.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React from "react";
import { Search, Grid3X3, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface GrammarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

// ==========================================
// KOMPONEN UTAMA: GrammarSearch
// ==========================================
/**
 * Komponen pencarian interaktif lengkap dengan penyesuai format baris tampilan.
 * 
 * @param {GrammarSearchProps} props Properti untuk komponen pencarian tata bahasa.
 * @stores Mengakses `useUIStore` untuk menyimpan dan membaca preferensi visual pengguna.
 */
export function GrammarSearch({ value, onChange }: GrammarSearchProps) {
  const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";
  const setLayoutPreference = useUIStore((s) => s.setLayoutPreference);

  return (
    <div className="mb-10 md:mb-16 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full font-sans">
      {/* Kolom Input Pencarian Pola Kalimat */}
      <div className="relative group flex-1">
        <div className="absolute inset-y-0 left-5 md:left-7 flex items-center pointer-events-none z-10">
          <Search aria-hidden="true" className="text-muted-foreground group-focus-within:text-primary transition-colors duration-300" size={20} />
        </div>
        <Input
          placeholder="Cari pola kalimat (contoh: ~te kureru)..."
          className="w-full pl-14 md:pl-16 pr-8 py-5 md:py-7 h-auto bg-[rgb(var(--card-rgb)/0.4)] backdrop-blur-xl border border-border rounded-2xl md:rounded-[2rem] text-sm md:text-lg text-foreground placeholder:text-muted-foreground/30 font-bold shadow-2xl focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all duration-500 font-sans"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
        {/* Cincin Pendar Dekoratif Fokus (Decorative Glow Ring) */}
        <div className="absolute inset-0 rounded-2xl md:rounded-[2rem] border border-primary/0 group-focus-within:border-primary/20 pointer-events-none transition-all duration-500 scale-[1.01]" />
      </div>

      {/* Tombol Preferensi Tata Letak (Grid vs Tabel List) */}
      <div className="flex p-1.5 bg-[rgb(var(--card-rgb)/0.4)] backdrop-blur-xl rounded-2xl border border-border h-[52px] sm:h-[60px] items-center gap-1.5 px-3 shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setLayoutPreference("grid")}
          className={`p-2 h-9 w-9 sm:h-11 sm:w-11 rounded-xl transition-all ${
            layoutPreference === "grid"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.3)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Tampilan Grid"
        >
          <Grid3X3 size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setLayoutPreference("list")}
          className={`p-2 h-9 w-9 sm:h-11 sm:w-11 rounded-xl transition-all ${
            layoutPreference === "list"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.3)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Tampilan Tabel Ringkas"
        >
          <LayoutList size={18} />
        </Button>
      </div>
    </div>
  );
}

