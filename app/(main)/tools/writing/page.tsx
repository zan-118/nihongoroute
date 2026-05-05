/**
 * @file app/(main)/tools/writing/page.tsx
 * @description Halaman Kanvas Kosong untuk latihan menulis bebas.
 * @module FreeWritingPage
 */

"use client";

import React from "react";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import WritingCanvas from "@/components/features/tools/writing/WritingCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FreeWritingPage() {
  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-background transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

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
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight italic">
                Kanvas <span className="text-emerald-500">Bebas</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-md font-medium leading-relaxed">
                Ruang kosong untuk melatih guratan kanji, kana, atau sekadar coretan belajar. 
                Gunakan jari atau stylus untuk hasil terbaik.
              </p>
            </div>
            
            <div className="flex gap-2">
               <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                 Mode Bebas Aktif
               </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Canvas Area */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[500px]">
               <WritingCanvas 
                 strokeColor="#10b981" // Emerald color
                 className="max-w-[400px] md:max-w-[450px] mx-auto"
               />
            </div>
          </div>

          {/* Tips & Info Area */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm shadow-xl">
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-4">Tips Menulis</h3>
              <ul className="space-y-4">
                {[
                  "Gunakan garis bantu (grid) untuk mengatur proporsi huruf.",
                  "Fokus pada urutan guratan (stroke order) jika menulis Kanji.",
                  "Jangan ragu untuk menghapus dan mengulang jika bentuknya kurang pas.",
                  "Tarik garis dengan tegas untuk hasil guratan yang rapi."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs font-medium text-muted-foreground leading-relaxed">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                      {i + 1}
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="p-6 rounded-2xl border border-border bg-muted/30 text-center">
                  <div className="w-10 h-10 bg-background rounded-xl border border-border flex items-center justify-center mx-auto mb-3">
                     <Download size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Simpan Gambar</p>
               </Card>
               <Card className="p-6 rounded-2xl border border-border bg-muted/30 text-center">
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

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
