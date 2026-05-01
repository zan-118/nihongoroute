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
import { ProgressProvider } from "@/components/providers/ProgressProvider";
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
        {/* Aksesibilitas: Skip to Content */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-[100] focus:px-6 focus:py-3 focus:bg-cyan-400 focus:text-black focus:font-black focus:rounded-xl focus:shadow-[0_0_30px_rgba(34,211,238,0.5)] outline-none transition-all"
        >
          Skip to Content
        </a>

        {/* Navigasi Utama */}
        <Navbar />

        {/* Area Konten Utama */}
        <main id="main-content" className="flex-1 w-full flex flex-col pt-24 pb-28 md:pb-12 outline-none">
          {children}
        </main>

        <FloatingSupport />

        {/* Navigasi Khusus Seluler */}
        <MobileNav />
      </div>
    </ProgressProvider>
  );
}

