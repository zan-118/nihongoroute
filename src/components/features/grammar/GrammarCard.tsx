"use client";

/**
 * @file GrammarCard.tsx
 * @description Komponen kartu tampilan ringkas untuk tata bahasa (Grammar Card).
 * Menampilkan ringkasan pola kalimat, label level JLPT, dan link ke halaman detail tata bahasa.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/routes";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface GrammarCardProps {
  article: {
    id?: string;
    _id: string;
    title: string;
    slug: string;
  };
  index: number;
  selectedLevel: string;
}

// ==========================================
// KOMPONEN UTAMA: GrammarCard
// ==========================================
/**
 * Komponen kartu tata bahasa interaktif dengan efek transisi premium.
 * 
 * @param {GrammarCardProps} props Properti untuk komponen kartu tata bahasa.
 */
export function GrammarCard({ article, index, selectedLevel }: GrammarCardProps) {
  // Tentukan warna lencana berdasarkan level JLPT (Menggunakan variabel CSS semantik)
  const levelColors: Record<string, string> = {
    n5: "text-success border-[rgb(var(--success-rgb)/0.2)] bg-[rgb(var(--success-rgb)/0.05)]",
    n4: "text-primary border-[rgb(var(--primary-rgb)/0.2)] bg-[rgb(var(--primary-rgb)/0.05)]",
    n3: "text-secondary border-[rgb(var(--secondary-rgb)/0.2)] bg-[rgb(var(--secondary-rgb)/0.05)]",
    n2: "text-warning border-[rgb(var(--warning-rgb)/0.2)] bg-[rgb(var(--warning-rgb)/0.05)]",
    n1: "text-destructive border-[rgb(var(--destructive-rgb)/0.2)] bg-[rgb(var(--destructive-rgb)/0.05)]",
  };

  const currentLevelColor = levelColors[selectedLevel.toLowerCase()] || levelColors.n5;

  return (
    <div
      className="group h-full transform hover:-translate-y-1 transition-all duration-300"
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '0 200px',
      }}
    >
      <Link href={ROUTES.LIBRARY.GRAMMAR(article.slug || article.id || article._id)} className="block h-full">
        <Card className="h-full p-6 sm:p-8 bg-[rgb(var(--card-rgb)/0.35)]  border border-border rounded-2xl md:rounded-3xl transition-all duration-500 flex flex-col cursor-pointer hover:border-[rgb(var(--primary-rgb)/0.45)] hover:bg-[rgb(var(--card-rgb)/0.55)] shadow-[0_0_30px_rgba(var(--primary-rgb),0.015)] relative overflow-hidden glass">
          {/* Efek Pendar Saat Kursor Di Atas (Glow Effect) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary-rgb)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Baris Atas: Ikon Penanda & Level */}
            <div className="flex justify-between items-start mb-6">
              <div className="size-10 rounded-lg bg-[rgb(var(--muted-rgb)/0.5)] border border-border flex items-center justify-center group-hover:border-[rgb(var(--primary-rgb)/0.3)] group-hover:bg-[rgb(var(--primary-rgb)/0.1)] transition-all duration-500">
                <Bookmark
                  size={18}
                  className="text-muted-foreground group-hover:text-primary transition-colors duration-500"
                />
              </div>
              <Badge 
                variant="outline" 
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-xl h-auto border ${currentLevelColor}`}
              >
                {selectedLevel.toUpperCase()}
              </Badge>
            </div>
            
            {/* Bagian Judul Tata Bahasa */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors duration-300 mb-3 line-clamp-3 font-japanese">
                {article.title}
              </h2>
              <div className="flex items-center gap-2">
                <div className="size-1 rounded-full bg-[rgb(var(--primary-rgb)/0.4)]" />
                <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest group-hover:text-primary/50 transition-colors">
                  Pola Kalimat
                </span>
              </div>
            </div>

            {/* Bagian Bawah: Navigasi Aksi */}
            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] group-hover:text-primary transition-colors">
                Pelajari Modul
              </span>
              <div className="size-9 rounded-xl bg-[rgb(var(--muted-rgb)/0.5)] border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-500">
                 <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}

