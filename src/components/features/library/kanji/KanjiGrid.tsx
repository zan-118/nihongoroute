"use client";

/**
 * @file KanjiGrid.tsx
 * @description Komponen grid visualizer daftar karakter Kanji luring di NihongoRoute.
 * Menampilkan kartu-kartu kanji interaktif berdasarkan filter level JLPT dan kueri pencarian.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Loader2, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
export interface KanjiGridItem {
  id?: string;
  _id?: string;
  character: string;
  jlpt?: string;
  meaning?: string;
}

interface KanjiGridProps {
  kanjis: KanjiGridItem[];
  isFetching: boolean;
}

// ==========================================
// KOMPONEN UTAMA: KanjiGrid
// ==========================================
/**
 * Komponen bento grid interaktif untuk menampilkan karakter Kanji.
 * 
 * @param {KanjiGridProps} props Properti komponen grid kanji.
 */
export function KanjiGrid({ kanjis, isFetching }: KanjiGridProps) {
  return (
    <div className="relative font-sans">
      {/* Overlay Pemuat Visual (Glow Skeleton Blur) */}
      {isFetching && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[2rem]">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      )}
      
      {/* Kisi Bento Kartu Kanji */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[400px]">
        {kanjis.map((kanji, idx) => (
          <div
            key={kanji.id || kanji._id}
            className="transform hover:-translate-y-1 transition-all duration-300"
          >
            <Link href={`/library/kanji/${kanji.character}`}>
              <Card className="group relative aspect-square flex flex-col items-center justify-center p-4 bg-[rgba(var(--card-rgb),0.3)] backdrop-blur-3xl border border-border hover:border-[rgba(var(--primary-rgb),0.5)] transition-all duration-500 rounded-[2rem] overflow-hidden hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] cursor-pointer">
                {/* Efek Pendar Latar Belakang (Neon Glow Effect) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(var(--primary-rgb),0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Lencana Tingkat JLPT */}
                <div className="absolute top-4 right-4 text-[10px] font-black bg-[rgba(var(--primary-rgb),0.1)] text-primary px-2 py-0.5 rounded-full border border-[rgba(var(--primary-rgb),0.2)]">
                  {kanji.jlpt}
                </div>

                {/* Karakter Utama Kanji */}
                <span className="text-4xl md:text-5xl font-black text-foreground mb-2 group-hover:scale-110 transition-transform duration-500 font-japanese">
                  {kanji.character}
                </span>
                
                {/* Arti Kanji */}
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium text-center line-clamp-1">
                  {kanji.meaning}
                </span>

                {/* Tombol Akses Cepat */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={14} className="text-primary" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {/* Tampilan Keadaan Kosong (Empty State) */}
      {kanjis.length === 0 && !isFetching && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
             <Search size={32} className="text-muted-foreground/50" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Karakter Kanji Tidak Ditemukan</h3>
          <p className="text-muted-foreground font-medium text-sm mt-2">Silakan periksa kembali kata kunci atau sesuaikan filter level JLPT.</p>
        </div>
      )}
    </div>
  );
}

