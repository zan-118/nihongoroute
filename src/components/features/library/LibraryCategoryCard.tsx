"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LibraryCategoryCardProps {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  label: string;
  index: number;
  count?: number;
  isSanity?: boolean;
  /** RGB triplet untuk aksen warna unik per kartu, misal "59 130 246" */
  accentRgb?: string;
}

/**
 * Komponen kartu kategori untuk halaman pustaka.
 * Layout horizontal premium: icon kiri + konten kanan + angka besar.
 * Dioptimalkan tanpa JavaScript animation untuk performa ekstrem.
 */
export function LibraryCategoryCard({
  href,
  title,
  desc,
  icon,
  label,
  index,
  count,
  isSanity = false,
  accentRgb = "0 122 124",
}: LibraryCategoryCardProps) {
  return (
    <Link href={href} className="group flex h-full" aria-label={`Buka modul ${title}`}>
      <div className="w-full h-full rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm flex flex-row gap-5 p-6 md:p-7 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
        style={{
          boxShadow: `0 0 0 1px rgba(${accentRgb}, 0)`,
          transition: "box-shadow 0.3s ease, transform 0.3s ease, background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px rgba(${accentRgb}, 0.35), 0 8px 40px -8px rgba(${accentRgb}, 0.2)`;
          (e.currentTarget as HTMLDivElement).style.background = `rgba(${accentRgb}, 0.03)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px rgba(${accentRgb}, 0)`;
          (e.currentTarget as HTMLDivElement).style.background = "";
        }}
      >
        {/* Radial glow decoratif di pojok kiri atas */}
        <div
          className="absolute -top-10 -left-10 size-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, rgba(${accentRgb}, 0.12) 0%, transparent 70%)` }}
        />

        {/* Kolom Kiri — Ikon + Nomor Urut */}
        <div className="shrink-0 flex flex-col justify-between items-center py-1">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{
              background: `rgba(${accentRgb}, 0.12)`,
              color: `rgb(${accentRgb})`,
              boxShadow: `0 0 20px rgba(${accentRgb}, 0)`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px rgba(${accentRgb}, 0.25)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px rgba(${accentRgb}, 0)`;
            }}
          >
            {icon}
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-25 mt-auto">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Kolom Kanan — Konten */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Label kategori */}
          <span
            className="text-[9px] font-black uppercase tracking-[0.3em] mb-1 transition-opacity opacity-70 group-hover:opacity-100"
            style={{ color: `rgb(${accentRgb})` }}
          >
            {label}
          </span>

          {/* Judul */}
          <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h2>

          {/* Angka besar atau label Sanity CMS */}
          {count !== undefined ? (
            <div className="flex items-baseline gap-1.5 mb-2">
              <span
                className="text-2xl md:text-3xl font-black tabular-nums leading-none"
                style={{ color: `rgba(${accentRgb}, 0.85)` }}
              >
                {count.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                item
              </span>
            </div>
          ) : isSanity ? (
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-2">
              Dari Sanity CMS
            </p>
          ) : (
            <div className="mb-2" />
          )}

          {/* Deskripsi */}
          <p className="text-xs text-muted-foreground leading-relaxed font-medium group-hover:text-foreground/80 transition-colors line-clamp-2 flex-1">
            {desc}
          </p>

          {/* Footer CTA */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
              Akses Modul
            </span>
            <div
              className="size-6 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: `rgba(${accentRgb}, 0.12)`,
                color: `rgb(${accentRgb})`,
              }}
            >
              <ArrowRight size={11} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
