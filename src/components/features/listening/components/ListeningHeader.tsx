"use client";

/**
 * @file ListeningHeader.tsx
 * @description Komponen header untuk halaman latihan Menyimak (Listening Comprehension).
 * Menampilkan judul, deskripsi, dan pengendali audio terintegrasi.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Headphones, Award, Compass } from "@/components/ui/icons";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Properties for ListeningHeader component.
 */
interface ListeningHeaderProps {
  /** Title of the listening exercise. */
  title: string;
  /** Optional description text. */
  description?: string;
  /** Optional JLPT level (e.g., N3, N2). */
  jlptLevel?: string;
  /** Optional difficulty label. */
  difficulty?: string;
}

// ==========================================
// KOMPONEN UTAMA: ListeningHeader
// ==========================================
/**
 * Header component for listening comprehension exercises.
 * Displays title, description, and metadata badges.
 *
 * @param props - Component properties.
 */
export function ListeningHeader({
  title,
  description,
  jlptLevel,
  difficulty,
}: ListeningHeaderProps) {
  return (
    <div className="relative w-full border-b border-border bg-card/50  overflow-hidden">
      {/* Decorative background glow for visual depth */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[65px] rounded-full -translate-y-1/2 pointer-events-none ambient-glow will-change-transform" />

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="flex flex-col gap-4 relative z-10">
          {/* Tag & Kategori */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Icon container */}
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Headphones size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Latihan Menyimak
            </span>
            {/* Conditional JLPT level badge */}
            {jlptLevel && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Award size={10} />
                {jlptLevel}
              </span>
            )}
            {/* Conditional difficulty badge */}
            {difficulty && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                <Compass size={10} />
                {difficulty}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl text-foreground tracking-tighter leading-tight uppercase">
            {title}
          </h1>

          {/* Conditional description text */}
          {description && (
            <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}