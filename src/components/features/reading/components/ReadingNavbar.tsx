/**
 * @file ReadingNavbar.tsx
 * @description Komponen bilah navigasi atas (top bar) halaman membaca artikel dengan opsi kembali ke perpustakaan, status level JLPT, mode switcher, dan tombol Mode Zen.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { m } from "framer-motion";
import { ChevronLeft, Maximize2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for ReadingNavbar component.
 */
interface ReadingNavbarProps {
  /** Article title. */
  title: string;
  /** JLPT difficulty level. */
  difficulty: string;
  /** Active reading mode ID. */
  mode: string;
  /** Available reading modes. */
  modes: { id: string; icon: React.ElementType; label: string }[];
  /** Callback when mode changes. */
  onModeChange: (id: string) => void;
  /** Callback to toggle Zen mode. */
  onZenModeToggle: () => void;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Navigation bar for reading page.
 * Provides back navigation, difficulty display, mode switching, and Zen mode toggle.
 */
export function ReadingNavbar({
  title,
  difficulty,
  mode,
  modes,
  onModeChange,
  onZenModeToggle,
}: ReadingNavbarProps) {
  return (
    <m.nav
      // Slide down animation on mount
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 inset-x-0 h-20 z-50 border-b border-border/40 glass flex items-center px-6 justify-between"
    >
      {/* Kiri: Navigasi balik + info judul */}
      <div className="flex items-center gap-6">
        <Link
          href="/library"
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all"
        >
          <div className="p-2 rounded-xl bg-muted/30 group-hover:bg-primary/10 border border-border group-hover:border-primary/30 transition-all">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
            Pustaka
          </span>
        </Link>
        <div className="h-6 w-px bg-border mx-2 hidden md:block" />
        <div className="flex flex-col">
          <h2 className="text-sm text-foreground truncate max-w-[200px] md:max-w-[400px]">
            {title}
          </h2>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Level {difficulty}
          </span>
        </div>
      </div>

      {/* Kanan: Mode switcher + Zen */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          onClick={onZenModeToggle}
          aria-label="Mode Zen"
        >
          <Maximize2 size={20} />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        {/* Desktop: tampilkan semua mode sebagai button */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border">
          {modes.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange(m.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 h-auto text-[10px] font-black uppercase tracking-wider",
                mode === m.id && "shadow-lg shadow-primary/20"
              )}
            >
              <m.icon size={14} className="mr-2" />
              {m.label}
            </Button>
          ))}
        </div>
        {/* Mobile: cycle button */}
        <button
          type="button"
          onClick={() => {
            // Cycle to next mode index on click
            const idx  = modes.findIndex(m => m.id === mode);
            const next = modes[(idx + 1) % modes.length];
            onModeChange(next.id);
          }}
          aria-label={`Mode ${mode} — ketuk untuk ganti`}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/30 border border-border text-[10px] font-black uppercase tracking-wider text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
        >
          {(() => {
            // Render icon for active mode
            const current = modes.find(m => m.id === mode);
            return current ? <current.icon size={14} /> : null;
          })()}
          <span>{mode}</span>
        </button>
      </div>
    </m.nav>
  );
}