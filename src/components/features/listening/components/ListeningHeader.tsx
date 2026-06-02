"use client";

/**
 * @file ListeningHeader.tsx
 * @description Komponen header untuk halaman latihan Menyimak (Listening Comprehension).
 * Menampilkan judul, deskripsi, dan pengendali audio terintegrasi.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Headphones } from "lucide-react";
import AudioController from "@/components/features/reading/components/AudioController";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface ListeningHeaderProps {
  title: string;
  description?: string;
  audioUrl: string;
  textToSpeak: string;
  onTimeUpdate: (time: number) => void;
  externalSeek: number;
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
  audioUrl,
  textToSpeak,
  onTimeUpdate,
  externalSeek,
}: ListeningHeaderProps) {
  return (
    <div className="relative w-full border-b border-border bg-card overflow-hidden">
      {/* Pendar Dekoratif Latar Belakang */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          {/* Sisi Kiri: Informasi Latihan */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Headphones size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                Latihan Menyimak
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-tight uppercase drop-shadow-sm font-sans">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>

          {/* Sisi Kanan: Pengendali Audio */}
          <div className="flex items-center">
            <AudioController
              audioUrl={audioUrl}
              textToSpeak={textToSpeak}
              onTimeUpdate={onTimeUpdate}
              externalSeek={externalSeek}
              header={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
