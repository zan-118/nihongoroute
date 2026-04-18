/**
 * LOKASI FILE: app/layout.tsx
 * DESKRIPSI:
 * Root Layout adalah kerangka utama yang membungkus seluruh halaman di aplikasi.
 * Berfungsi untuk mengatur struktur HTML dasar (html, body), memuat font global,
 * mendefinisikan metadata SEO, konfigurasi viewport, dan menyediakan context provider.
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
 * KONFIGURASI VIEWPORT:
 * Mengatur tampilan layar di berbagai perangkat.
 * 'userScalable: false' digunakan untuk mencegah zoom otomatis yang tidak diinginkan
 * pada elemen input di perangkat seluler agar terasa lebih seperti aplikasi native (Web App).
 */
export const viewport: Viewport = {
  themeColor: "#0a0c10", // Warna tema bar status di mobile (sesuai palet cyber-dark)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * METADATA SEO & SOSIAL MEDIA:
 * Mendefinisikan informasi situs untuk mesin pencari (Google) dan preview kartu
 * saat tautan dibagikan (OpenGraph untuk Facebook/WhatsApp, Twitter Card).
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.nihongoroute.my.id"), // Sesuaikan dengan domain asli nanti
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
  manifest: "/manifest.json", // Path untuk PWA (Progressive Web App)
  icons: {
    icon: "/logo-branding.svg",
    apple: "/logo-branding.png",
  },
  verification: {
    google: "Niyl1z2v4hJgZZzRFLzMLOk4xlYNyvSNnEiCC-eK7N4", // Kode verifikasi Google Search Console
  },
  openGraph: {
    title: "NihongoRoute | Misi Menguasai Bahasa Jepang",
    description:
      "Tingkatkan level bahasa Jepangmu! Belajar JLPT N5 dengan sistem Flashcard SRS, Quiz interaktif, dan kamus pintar.",
    url: "https://www.nihongoroute.my.id",
    siteName: "NihongoRoute",
    images: [
      {
        url: "/og-image.jpg", // Gambar preview saat link dishare
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
 * KOMPONEN ROOT LAYOUT
 * Layout ini merangkum seluruh hierarki komponen aplikasi.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased bg-cyber-bg text-[#c4cfde] selection:bg-cyan-400 selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
