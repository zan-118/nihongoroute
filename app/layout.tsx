import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";

import FloatingSupport from "@/components/FloatingSupport";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#15171a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NihongoRoute | Belajar Bahasa Jepang Gratis",
  description:
    "Platform belajar bahasa Jepang dengan sistem terstruktur, gamifikasi, dan latihan interaktif.",
  keywords: [
    "belajar bahasa jepang",
    "JLPT N5",
    "hiragana",
    "katakana",
    "kanji",
    "flashcard",
    "nihongo",
  ],
  icons: {
    icon: "/logo-branding.png",
    apple: "/logo-branding.png",
  },
  // ✨ INI ADALAH KODE VERIFIKASI GOOGLE KAMU ✨
  verification: {
    google: "Niyl1z2v4hJgZZzRFLzMLOk4xlYNyvSNnEiCC-eK7N4",
  },
  openGraph: {
    title: "NihongoRoute | Misi Menguasai Bahasa Jepang",
    description:
      "Tingkatkan level bahasa Jepangmu! Belajar JLPT N5 dengan sistem Flashcard SRS, Quiz interaktif, dan kamus pintar.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.nihongoroute.my.id",
    siteName: "NihongoRoute",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NihongoRoute Dashboard",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NihongoRoute | Belajar Bahasa Jepang Gratis",
    description:
      "Platform e-learning bahasa Jepang gratis dengan gaya UI interaktif.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased bg-[#15171a] text-[#c4cfde] selection:bg-[#0ef] selection:text-[#15171a] overflow-x-hidden`}
      >
        <ProgressProvider>
          {/* Desktop Navbar - Sticky agar selalu terlihat saat scroll */}
          <div className="hidden md:block sticky top-0 z-50">
            <Navbar />
          </div>

          {/* Main Content */}
          <main className="min-h-screen pt-4 md:pt-20 pb-28 md:pb-12 max-w-[100vw] overflow-x-hidden">
            {children}
          </main>

          <FloatingSupport />

          {/* Mobile Nav - Pastikan z-index tinggi agar di atas konten */}
          <div className="md:hidden relative z-50">
            <MobileNav />
          </div>
        </ProgressProvider>
      </body>
    </html>
  );
}
