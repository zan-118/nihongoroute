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
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import FeedbackWidget from "@/components/FeedbackWidget";
import { cn } from "@/lib/utils";

// ======================
// CONFIG / CONSTANTS
// ======================
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoJsonJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-jp",
});

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NihongoRoute",
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
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          notoJsonJP.variable,
          "font-sans antialiased bg-cyber-bg text-[#c4cfde] selection:bg-red-500 selection:text-white"
        )}
        suppressHydrationWarning
      >
        
        {children}
        <FeedbackWidget />
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(10, 12, 16, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              color: '#ffffff',
              borderRadius: '16px',
            },
            classNames: {
              success: "border-cyber-neon/50 shadow-[0_0_20px_rgba(0,238,255,0.2)]",
              error: "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}

