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
import { ChevronLeft, Download, Share2 } from "@/components/ui/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WritingCanvas from "@/features/tools/stroke-canvas/WritingCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ROUTES } from "@/lib/core/routes";
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-160 h-80 bg-primary/10 blur-[55px] rounded-full pointer-events-none ambient-glow will-change-transform" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        <header className="mb-12">
          <nav className="mb-6">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2 border-border bg-card/50 "
            >
              <Link href={ROUTES.TOOLS.ROOT}>
                <ChevronLeft size={16} />
                <span>Kembali ke Peranti</span>
              </Link>
            </Button>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl text-foreground tracking-tight mb-2">
                Kanvas Menulis
              </h1>
              <p className="text-muted-foreground text-sm max-w-lg">
                Latih ingatan motorik dan urutan guratan Kanji atau Kana secara bebas langsung di atas kanvas digital interaktif.
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Visual & Motorik
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Area Kanvas Utama */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-125">
               {/* Render canvas with selected character and custom stroke color. */}
               <WritingCanvas
                 character={character}
                 strokeColor="rgb(var(--brand-cyan-rgb))"
                 className="max-w-100 md:max-w-112.5 mx-auto"
               />
            </div>
          </div>

          {/* Area Tips & Informasi */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 rounded-4xl border border-border bg-card/50  shadow-xl">
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

function FreeWritingSkeleton() {
  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-transparent pt-12 pb-24 px-4 md:px-8 animate-pulse">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-160 h-80 bg-primary/5 blur-[55px] rounded-full pointer-events-none ambient-glow will-change-transform" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        {/* Navigation Mock */}
        <header className="mb-12">
          <div className="mb-6">
            <div className="w-40 h-9 bg-muted border border-border/40 rounded-xl" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3 flex-1">
              {/* Title Placeholder */}
              <div className="w-64 h-10 bg-muted rounded-xl" />
              {/* Description Placeholder */}
              <div className="w-full max-w-md h-5 bg-muted rounded-lg" />
              <div className="w-5/6 max-w-sm h-5 bg-muted rounded-lg" />
            </div>
            {/* Badge Placeholder */}
            <div className="w-32 h-8 bg-muted rounded-xl" />
          </div>
        </header>

        {/* Content Layout Grid Mock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Canvas Box Placeholder */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-125 flex justify-center">
              <div className="w-full max-w-100 md:max-w-112.5 aspect-square rounded-2xl border border-border bg-muted/20 dark:bg-card/20" />
            </div>
          </div>

          {/* Sidebar Placeholders */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tips Card Placeholder */}
            <div className="h-64 rounded-4xl border border-border bg-muted/10" />

            {/* Action Cards Placeholder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 rounded-lg border border-border bg-muted/10" />
              <div className="h-24 rounded-lg border border-border bg-muted/10" />
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
    <Suspense fallback={<FreeWritingSkeleton />}>
      <FreeWritingContent />
    </Suspense>
  );
}