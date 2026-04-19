/**
 * @file app/(main)/layout.tsx
 * @description Layout sekunder untuk grup rute fungsional (dashboard, library, courses, dsb). Menyediakan konteks pelacakan XP pengguna (ProgressProvider) serta menyusun tata letak navigasi responsif (Desktop/Seluler).
 * @module Server Component
 */

import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";
import FloatingSupport from "@/components/FloatingSupport";

/**
 * Komponen Layout Fungsional (Main Layout).
 * Membungkus seluruh halaman di dalam rute `(main)` dengan `ProgressProvider` agar komponen di dalamnya 
 * (seperti kuis atau flashcard) dapat membaca dan memperbarui data XP serta data memori Spaced Repetition (SRS).
 * 
 * @param {Object} props - Properti layout.
 * @param {ReactNode} props.children - Halaman atau rute turunan yang akan dirender di area konten utama.
 * @returns {JSX.Element} Antarmuka pembungkus (wrapper) yang mencakup navigasi tingkat tinggi dan area konten.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider>
      {/* Container Utama Aplikasi */}
      <div className="relative min-h-screen bg-[#080a0f] text-slate-300 flex flex-col overflow-x-hidden w-full">
        {/* Navbar Desktop menempel di posisi Atas */}
        <Navbar />

        {/* AREA KONTEN UTAMA
          - pt-24: Jarak aman (padding top) agar konten tidak tertutup oleh Navbar Desktop.
          - pb-32: Jarak aman ekstra (padding bottom) agar konten seluler tidak tertutup oleh MobileNav yang melayang (fixed).
          - md:pb-12: Mengurangi padding bottom pada tampilan Desktop karena navigasi pindah ke bagian atas.
        */}
        <main className="flex-1 w-full flex flex-col pt-24 pb-32 md:pb-12">
          {children}
        </main>

        <FloatingSupport />

        {/* Navbar Mobile menempel di posisi Bawah */}
        <MobileNav />
      </div>
    </ProgressProvider>
  );
}
