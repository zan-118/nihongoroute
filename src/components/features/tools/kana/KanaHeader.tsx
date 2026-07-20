/**
 * @file KanaHeader.tsx
 * @description Komponen header untuk halaman Master Kana, menyediakan tombol navigasi kembali dan penjelasan ringkas mengenai Hiragana/Katakana.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Button } from "@/components/ui/button";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/lib/core/routes";
// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Properties for KanaHeader component.
 */
interface KanaHeaderProps {
  /** Tailwind text color class applied to highlighted text and icons. */
  themeColor: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Header component for Kana Master page.
 * Renders navigation link, page title, description, and layout indicator.
 * 
 * @param props - Component properties.
 * @param props.themeColor - Tailwind class for text color styling.
 */
export function KanaHeader({ themeColor }: KanaHeaderProps) {
  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <header className="mb-8">
      {/* Navigation bar containing back button */}
      <nav className="mb-4">
        <Button
          variant="outline"
          asChild
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-muted border-border"
        >
          <Link href={ROUTES.TOOLS.ROOT}>
            <ChevronLeft size={14} className="mr-2" /> Kembali ke Peralatan
          </Link>
        </Button>
      </nav>

      {/* Header content area with responsive layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl text-foreground uppercase tracking-tight">
            Master <span className={themeColor}>Kana</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-2 max-w-md font-medium leading-relaxed">
            Kunci utama untuk bisa membaca teks Jepang. Kuasai Hiragana & 
            Katakana di sini sebelum mulai belajar kalimat dan tata bahasa.
          </p>
        </div>
        {/* Layout indicator visible on medium screens and above */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold uppercase tracking-widest ${themeColor}`}
        >
          <LayoutGrid size={12} /> Tampilan Penuh
        </div>
      </div>
    </header>
  );
}