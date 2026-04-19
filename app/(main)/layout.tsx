/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute fungsional (dashboard, library, courses, dsb). 
 * Menyediakan konteks pelacakan XP pengguna (ProgressProvider) serta menyusun tata letak navigasi responsif.
 * @module MainLayout
 */

// ======================
// IMPORTS
// ======================
import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";
import FloatingSupport from "@/components/FloatingSupport";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen MainLayout: Membungkus halaman fungsional dengan provider progress dan navigasi global.
 * 
 * @param {Object} props - Properti layout.
 * @param {ReactNode} props.children - Konten halaman yang akan dirender.
 * @returns {JSX.Element} Struktur layout dengan Navbar, MobileNav, dan Content Area.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider>
      <div className="relative min-h-screen bg-[#080a0f] text-slate-300 flex flex-col overflow-x-hidden w-full">
        {/* Navigasi Utama */}
        <Navbar />

        {/* Area Konten Utama */}
        <main className="flex-1 w-full flex flex-col pt-24 pb-32 md:pb-12">
          {children}
        </main>

        <FloatingSupport />

        {/* Navigasi Khusus Seluler */}
        <MobileNav />
      </div>
    </ProgressProvider>
  );
}

