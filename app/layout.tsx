/**
 * @file app/layout.tsx
 * @description Kerangka utama aplikasi yang mengatur struktur HTML dasar, font, metadata SEO, konfigurasi viewport, dan membungkus seluruh halaman dengan context provider.
 * @module Server Component
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";
import FloatingSupport from "@/components/FloatingSupport";

// Inisialisasi Font Inter dari Google Fonts untuk tipografi global
const inter = Inter({ subsets: ["latin"] });

/**
 * Konfigurasi layar (Viewport) lintas perangkat.
 * Mengunci opsi zoom (`userScalable: false`) untuk memberikan kesan native app pada perangkat seluler.
 */
export const viewport: Viewport = {
  themeColor: "#0a0c10", // Warna tema bar status di seluler (sesuai palet cyber-dark)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Pendefinisian Metadata SEO dan Protokol OpenGraph secara terpusat.
 * Data ini akan dibaca oleh *web crawlers* (Google, dsb) maupun saat tautan dibagikan via sosial media.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.nihongoroute.my.id"), 
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
    icon: "/logo-branding.svg",
    apple: "/logo-branding.png",
  },
  verification: {
    google: "Niyl1z2v4hJgZZzRFLzMLOk4xlYNyvSNnEiCC-eK7N4", 
  },
  openGraph: {
    title: "NihongoRoute | Misi Menguasai Bahasa Jepang",
    description:
      "Tingkatkan level bahasa Jepangmu! Belajar JLPT N5 dengan sistem Flashcard SRS, Quiz interaktif, dan kamus pintar.",
    url: "https://www.nihongoroute.my.id",
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

/**
 * Komponen Root Layout tingkat teratas di dalam ekosistem Next.js.
 * Membungkus semua struktur rute bersarang (nested routes) di seluruh platform.
 * 
 * @param {Object} props - Properti untuk Root Layout.
 * @param {ReactNode} props.children - Komponen rute turunan yang akan dirender di dalam kerangka HTML.
 * @returns {JSX.Element} Kerangka halaman global berisi tag html dan body dasar.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased bg-cyber-bg text-[#c4cfde] selection:bg-red-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
