"use client";

/**
 * @file ReadingPageHeader.tsx
 * @description Header ramping halaman Graded Reading: badge kategori + level JLPT + judul.
 */

interface ReadingPageHeaderProps {
  /** Judul artikel bacaan. */
  title: string;
  /** Level JLPT artikel (opsional). */
  jlptLevel?: string;
}

/**
 * Header left-aligned untuk halaman membaca.
 */
export function ReadingPageHeader({ title, jlptLevel }: ReadingPageHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5 mb-10 pb-6 border-b border-border/40">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black uppercase tracking-wider text-primary">
          Graded Reading
        </span>
        {jlptLevel && (
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20">
            {jlptLevel}
          </span>
        )}
      </div>
      <h1 className="text-2xl md:text-4xl text-foreground tracking-tight leading-tight uppercase">
        {title}
      </h1>
    </div>
  );
}
