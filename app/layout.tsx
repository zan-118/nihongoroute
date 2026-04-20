/**
 * @file layout.tsx
 * @description Kerangka utama aplikasi (Root Layout) yang mengatur struktur dasar HTML, konfigurasi SEO global, 
 * inisialisasi font, dan pembungkusan context provider untuk seluruh aplikasi.
 * @module AppLayout
 */

// ======================
// IMPORTS
// ======================
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";

// ======================
// CONFIG / CONSTANTS
// ======================
const inter = Inter({ subsets: ["latin"] });

/**
 * Konfigurasi viewport untuk mengoptimalkan tampilan di perangkat seluler.
 * Menonaktifkan user-scaling untuk memberikan pengalaman aplikasi native.
 */
export const viewport: Viewport = {
  themeColor: "#0a0c10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Metadata SEO global untuk aplikasi.
 * Mengatur judul, deskripsi, OpenGraph, dan verifikasi mesin pencari.
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
        url: "/og-image.png", 
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
    images: ["/og-image.png"],
  },
};

// ======================
// MAIN EXECUTION
// ======================

/**
 * RootLayout: Komponen pembungkus utama aplikasi.
 * 
 * @param {Object} props - Properti komponen.
 * @param {ReactNode} props.children - Konten halaman yang akan dirender.
 * @returns {JSX.Element} Struktur dasar HTML aplikasi.
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
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(10, 12, 16, 0.95)',
              border: '1px solid rgba(0, 238, 255, 0.3)',
              backdropFilter: 'blur(12px)',
              color: '#ffffff',
            },
            className: 'rounded-2xl shadow-[0_0_20px_rgba(0,238,255,0.15)]',
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}

