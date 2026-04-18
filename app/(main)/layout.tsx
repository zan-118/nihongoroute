import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";
import FloatingSupport from "@/components/FloatingSupport";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider>
      {/* Container Utama Aplikasi */}
      <div className="relative min-h-screen bg-[#080a0f] text-slate-300 flex flex-col overflow-x-hidden w-full">
        {/* Navbar Desktop di Atas */}
        <Navbar />

        {/* AREA KONTEN UTAMA
          - pt-24: Jarak aman dari Navbar Desktop di atas
          - pb-32: Jarak aman EKSTRA LUAS dari MobileNav di bawah (Hanya untuk Mobile)
          - md:pb-12: Reset jarak bawah karena navbar pindah ke atas di Desktop
        */}
        <main className="flex-1 w-full flex flex-col pt-24 pb-32 md:pb-12">
          {children}
        </main>

        <FloatingSupport />

        {/* Navbar Mobile di Bawah */}
        <MobileNav />
      </div>
    </ProgressProvider>
  );
}
