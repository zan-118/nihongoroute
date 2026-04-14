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
  themeColor: "#0a0c10", // Disamakan dengan warna gelap dominan di palet Anda
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Mencegah zoom paksa di iOS saat mengetik di input field (opsional namun sangat disarankan untuk Web App)
  userScalable: false,
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
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-branding.svg", // Lebih disarankan SVG/PNG untuk icon utama di Next.js App Router
    apple: "/logo-branding.png",
  },
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
        className={`${inter.className} antialiased bg-cyber-bg text-[#c4cfde] selection:bg-cyan-400 selection:text-black overflow-x-hidden min-h-screen flex flex-col`}
      >
        <ProgressProvider>
          {/* PERBAIKAN 1: Navbar sudah memiliki class 'fixed' di dalamnya, 
            jadi membungkusnya dengan 'sticky top-0' di sini adalah redundan 
            dan bisa merusak flow dokumen. Kita cukup panggil komponennya.
          */}
          <Navbar />

          {/* PERBAIKAN 2: Kita hapus pt (padding-top) dari main container, 
            karena setiap halaman (page.tsx) di dalam aplikasi ini sudah menangani 
            padding top-nya masing-masing (misal: pt-20, pt-24) untuk menyesuaikan 
            jarak dari Navbar.
          */}
          <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden flex flex-col">
            {children}
          </main>

          {/* Komponen Mengambang */}
          <FloatingSupport />
          <MobileNav />
        </ProgressProvider>
      </body>
    </html>
  );
}
