/**
 * @file layout.tsx
 * @description Application Root Layout component configuring HTML structure, global SEO metadata, font initializations, and provider wrappers.
 * @module AppLayout
 */

// ==========================================
// Import & Dependencies
// ==========================================
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { LazyMotion, domAnimation } from "framer-motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@next/third-parties/google";
import VercelAnalytics from "@/components/providers/VercelAnalytics";

/**
 * Noto Sans JP font configuration.
 * Sets up sans-serif Japanese typography.
 */
const notoSansJp = Noto_Sans_JP({
 subsets: ["latin"],
 weight: ["400", "700"],
 variable: "--font-noto-jp",
 display: "swap",
});

/**
 * Noto Serif JP font configuration.
 * Sets up serif Japanese typography.
 */
const notoSerifJp = Noto_Serif_JP({
 subsets: ["latin"],
 weight: ["400", "700"],
 variable: "--font-noto-serif-jp",
 display: "swap",
 preload: false,
});
import {
 DEFAULT_DESCRIPTION,
 DEFAULT_OG_IMAGE,
 DEFAULT_TITLE,
 SITE_NAME,
 absoluteUrl,
 organizationJsonLd,
 websiteJsonLd,
} from "@/lib/seo";

// ======================
// KONFIGURASI / KONSTANTA
// ======================

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
 title: DEFAULT_TITLE,
 description: DEFAULT_DESCRIPTION,
 metadataBase: new URL(absoluteUrl("/")),
 keywords: [
 "belajar bahasa jepang",
 "JLPT N5",
 "JLPT N4",
 "JLPT N3",
 "JLPT N2",
 "JLPT N1",
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
 manifest: "/manifest.webmanifest",
 openGraph: {
 description: DEFAULT_DESCRIPTION,
 images: [
 {
 alt: `${SITE_NAME} preview`,
 height: 630,
 url: absoluteUrl(DEFAULT_OG_IMAGE),
 width: 1200,
 },
 ],
 locale: "id_ID",
 siteName: SITE_NAME,
 title: "NihongoRoute | Platform Belajar Bahasa Jepang",
 type: "website",
 url: absoluteUrl("/"),
 },
 twitter: {
 card: "summary_large_image",
 description: DEFAULT_DESCRIPTION,
 images: [absoluteUrl(DEFAULT_OG_IMAGE)],
 title: DEFAULT_TITLE,
 },
};

// ======================
// EKSEKUSI UTAMA
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
 // Get Google Analytics ID from environment variables.
 const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

 return (
 <html lang="id" className={`${notoSansJp.variable} ${notoSerifJp.variable}`} suppressHydrationWarning>
 <body
 suppressHydrationWarning
 className="font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary"
 >
 {/* Inject Google Analytics if ID is configured */}
 {gaId && <GoogleAnalytics gaId={gaId} />}
 {/* Inject structured JSON-LD data for SEO */}
 <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
 {/* Provide theme context (light/dark/system) to application */}
 <ThemeProvider
 attribute="class"
 defaultTheme="system"
 enableSystem
 disableTransitionOnChange
 >
 {/* Enable lazy-loaded Framer Motion animations to reduce bundle size */}
 <LazyMotion features={domAnimation}>
 {/* Provide React Query client context for data fetching */}
 <QueryProvider>
 {children}
 </QueryProvider>
 </LazyMotion>
 {/* Global toast notification container with custom styling */}
 <Toaster
 theme="system"
 position="top-center"
 offset={80} // Ofset untuk membersihkan Topbar (64px + 16px)
 toastOptions={{
 style: {
 background: "hsl(var(--background)/0.9)",
 border: "1px solid hsl(var(--foreground)/0.1)",
 backdropFilter: "blur(16px)",
 color: "hsl(var(--foreground))",
 borderRadius: "16px",
 },
 classNames: {
 success:
 "border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
 error:
 "border-destructive/50 shadow-[0_0_20px_hsl(var(--destructive)/0.2)]",
 },
 duration: 4000,
 }}
 />
 {/* Load Vercel analytics and Speed Insights */}
 <VercelAnalytics />
 </ThemeProvider>
 </body>
 </html>
 );
}