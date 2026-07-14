/**
 * @file app/(main)/tools/writing/page.tsx
 * @description Halaman Kanvas Kosong untuk latihan menulis bebas dan terpandu dengan koreksi guratan.
 * @module FreeWritingPage
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { Suspense } from "react";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WritingCanvas from "@/components/features/tools/writing/WritingCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Free writing canvas content.
 * Renders canvas and tips. Reads target character from URL.
 */
function FreeWritingContent() {
  // Extract target character from URL query parameter.
  const searchParams = useSearchParams();
  const character = searchParams.get("char") || "";

  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-transparent transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] h-[320px] bg-primary/10 blur-[55px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        <header className="mb-12">
          <nav className="mb-6">
            <Button
              variant="outline"
              asChild
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-muted border-border"
            >
              <Link href="/tools">
                <ChevronLeft size={14} className="mr-2" /> Kembali ke Peralatan
              </Link>
            </Button>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl text-foreground uppercase tracking-tight italic">
                {character ? (
                  <>
                    Kanji <span className="brand-text-gradient">{character}</span>
                  </>
                ) : (
                  <>
                    Kanvas <span className="brand-text-gradient">Bebas</span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-md font-medium leading-relaxed">
                {character ? (
                  `Latih menulis karakter "${character}". Sistem akan menganalisis arah dan urutan guratan secara real-time.`
                ) : (
                  "Ruang kosong untuk melatih guratan kanji, kana, atau sekadar coretan belajar. Gunakan jari atau stylus untuk hasil terbaik."
                )}
              </p>
            </div>

            <div className="flex gap-2">
               <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                 {character ? `Menulis: ${character}` : "Mode Bebas Aktif"}
               </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Area Kanvas Utama */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[500px]">
               {/* Render canvas with selected character and custom stroke color. */}
               <WritingCanvas
                 character={character}
                 strokeColor="rgb(var(--brand-cyan-rgb))"
                 className="max-w-[400px] md:max-w-[450px] mx-auto"
               />
            </div>
          </div>

          {/* Area Tips & Informasi */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 rounded-[2rem] border border-border bg-card/50  shadow-xl">
              <h3 className="text-lg uppercase tracking-tight text-foreground mb-4">Tips Menulis</h3>
              <ul className="space-y-4">
                {[
                  "Gunakan garis bantu (grid) untuk mengatur proporsi huruf.",
                  "Fokus pada urutan guratan (stroke order) jika menulis Kanji.",
                  "Jangan ragu untuk menghapus dan mengulang jika bentuknya kurang pas.",
                  "Tarik garis dengan tegas untuk hasil guratan yang rapi."
                ].map((tip, i) => (
                  <li key={`tip-${i}`} className="flex gap-3 text-xs font-medium text-muted-foreground leading-relaxed">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {i + 1}
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="p-6 rounded-lg border border-border bg-muted/30 text-center">
                  <div className="w-10 h-10 bg-background rounded-xl border border-border flex items-center justify-center mx-auto mb-3">
                     <Download size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Simpan Gambar</p>
               </Card>
               <Card className="p-6 rounded-lg border border-border bg-muted/30 text-center">
                  <div className="w-10 h-10 bg-background rounded-xl border border-border flex items-center justify-center mx-auto mb-3">
                     <Share2 size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bagikan Karya</p>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Free writing page root.
 * Wraps content in Suspense. Prevents build errors from search params.
 */
export default function FreeWritingPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex-1 flex items-center justify-center bg-transparent">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Memuat Kanvas...</p>
      </div>
    }>
      <FreeWritingContent />
    </Suspense>
  );
}