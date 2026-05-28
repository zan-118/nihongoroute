/**
 * @file app/(main)/library/grammar/page.tsx
 * @description Halaman indeks katalog panduan tata bahasa (Bunpou). Menggunakan teknik "Client-Side Fetching" untuk memfilter dan memuat daftar bab dari CMS secara asinkron berdasarkan level yang dipilih.
 * @module Client Component
 */

import { Suspense } from "react";
import { RotateCw } from "lucide-react";
import GrammarClient from "./GrammarClient";
import { getGrammarArticles } from "@/actions/library.actions";

export const metadata = {
  title: "Tata Bahasa Jepang | NihongoRoute",
  description: "Katalog lengkap tata bahasa Jepang (Bunpou) untuk level N5 hingga N1. Penjelasan mendalam dengan contoh kalimat dan audio.",
};

export default async function GrammarArticlesPage() {
  // Pre-fetch artikel di sisi server
  const grammarData = await getGrammarArticles("n5");


  return (
    <main className="w-full relative overflow-hidden flex flex-1 flex-col pb-24 px-4 md:px-8 lg:px-12 bg-background text-foreground transition-colors duration-300">
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <Suspense fallback={
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <RotateCw className="text-primary animate-spin" size={24} />
          <p className="text-xs font-bold uppercase tracking-widest font-mono animate-pulse">Memuat tata bahasa…</p>
        </div>
      }>
        <GrammarClient initialArticles={grammarData} />
      </Suspense>
    </main>
  );
}
