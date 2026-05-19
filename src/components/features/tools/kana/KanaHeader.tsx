"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";

interface KanaHeaderProps {
  themeColor: string;
}

export function KanaHeader({ themeColor }: KanaHeaderProps) {
  return (
    <header className="mb-8">
      <nav className="mb-4">
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">
            Master <span className={themeColor}>Kana</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-2 max-w-md font-medium leading-relaxed">
            Kunci utama untuk bisa membaca teks Jepang. Kuasai Hiragana & 
            Katakana di sini sebelum mulai belajar kalimat dan tata bahasa.
          </p>
        </div>
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold uppercase tracking-widest ${themeColor}`}
        >
          <LayoutGrid size={12} /> Tampilan Penuh
        </div>
      </div>
    </header>
  );
}
