import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";

import FloatingSupport from "@/components/FloatingSupport";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NihongoRoute | Belajar Bahasa Jepang Gratis",
  description:
    "Platform belajar bahasa Jepang dengan sistem terstruktur, gamifikasi, dan latihan interaktif.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased bg-[#1f242d] text-[#c4cfde] selection:bg-[#0ef] selection:text-[#1f242d] overflow-x-hidden`}
      >
        <ProgressProvider>
          {/* Desktop Navbar - Sticky agar selalu terlihat saat scroll */}
          <div className="hidden md:block sticky top-0 z-50">
            <Navbar />
          </div>

          {/* Main Content: 
            - pt-16 agar tidak tertutup Navbar Desktop
            - pb-28 di mobile agar elemen terakhir tidak tertutup MobileNav yang melayang
          */}
          <main className="min-h-screen pt-4 md:pt-20 pb-28 md:pb-12 max-w-[100vw] overflow-x-hidden">
            {children}
          </main>
          <FloatingSupport />

          {/* Mobile Nav - Pastikan z-index tinggi agar di atas konten */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </ProgressProvider>
      </body>
    </html>
  );
}
