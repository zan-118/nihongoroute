"use client";

/**
 * @file ListeningHeader.tsx
 * @description Komponen header untuk halaman latihan Menyimak (Listening Comprehension).
 * Menampilkan judul, deskripsi, dan pengendali audio terintegrasi.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Headphones, Award, Compass } from "lucide-react";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface ListeningHeaderProps {
  title: string;
  description?: string;
  jlptLevel?: string;
  difficulty?: string;
}

// ==========================================
// KOMPONEN UTAMA: ListeningHeader
// ==========================================
/**
 * Komponen tajuk visual interaktif untuk kontrol audio latihan menyimak.
 *
 * @param {ListeningHeaderProps} props Properti untuk tajuk latihan menyimak.
 */
export function ListeningHeader({
  title,
  description,
  jlptLevel,
  difficulty,
}: ListeningHeaderProps) {
  return (
    <div className="relative w-full border-b border-border bg-card/50 backdrop-blur-md overflow-hidden">
      {/* Pendar Dekoratif Latar Belakang */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="flex flex-col gap-4 relative z-10">
          {/* Tag & Kategori */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Headphones size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Latihan Menyimak
            </span>
            {jlptLevel && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Award size={10} />
                {jlptLevel}
              </span>
            )}
            {difficulty && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                <Compass size={10} />
                {difficulty}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter leading-tight uppercase font-sans">
            {title}
          </h1>

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
