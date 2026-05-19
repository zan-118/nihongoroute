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
import { Inter, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import FeedbackWidget from "@/components/features/feedback/FeedbackWidget";
import DictionaryPopup from "@/components/features/tools/dictionary/DictionaryPopup";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { cn } from "@/lib/utils";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';


// ======================
// CONFIG / CONSTANTS
// ======================
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoJsonJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-jp",
});
const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-serif-jp",
});

/**
 * Konfigurasi viewport untuk mengoptimalkan tampilan di perangkat seluler.
 * Mengizinkan user-scaling untuk memenuhi standar aksesibilitas WCAG 2.1 AA.
 */
export const viewport: Viewport = {
  themeColor: "#0a0c10",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

/**
 * Metadata SEO global untuk aplikasi.
 * Mengatur judul, deskripsi, OpenGraph, dan verifikasi mesin pencari.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.nihongoroute.my.id"), 
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
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.nihongoroute.my.id",
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
        suppressHydrationWarning
        className={cn(
          inter.variable,
          notoJsonJP.variable,
          notoSerifJP.variable,
          "font-sans antialiased text-foreground selection:bg-destructive selection:text-destructive-foreground transition-colors duration-300"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
          <FeedbackWidget />
          <DictionaryPopup />
          <Toaster 
            theme="dark"
            position="top-center"
            offset={80} // Offset to clear Topbar (64px + 16px)
            toastOptions={{
              style: {
                background: 'rgba(var(--background-rgb), 0.9)',
                border: '1px solid rgba(var(--foreground-rgb), 0.1)',
                backdropFilter: 'blur(16px)',
                color: 'var(--foreground)',
                borderRadius: '16px',
              },
              classNames: {
                success: "border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]",
                error: "border-destructive/50 shadow-[0_0_20px_rgba(var(--destructive-rgb),0.2)]",
              },
              duration: 4000,
            }}
          />
          {process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </ThemeProvider>
      </body>

    </html>
  );
}
