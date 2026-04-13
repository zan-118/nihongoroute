import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { ProgressProvider } from "@/context/UserProgressContext";
import FloatingSupport from "@/components/FloatingSupport";

// Font utama untuk kemudahan membaca
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Font monospace untuk aksen cyber/coding/angka
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NihongoRoute | Cyberpunk JLPT Learning",
  description: "Master Japanese with SRS and Cyberpunk aesthetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#0a0c10] text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <ProgressProvider>
          {/* Latar Belakang Cyber Grid Global */}
          <div className="fixed inset-0 z-[-1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,239,0.05),rgba(255,255,255,0))]" />

          <Navbar />

          {/* Wrapper utama agar tidak tertutup nav bottom di mobile */}
          <div className="min-h-screen pb-20 md:pb-0 pt-20">{children}</div>

          <MobileNav />
          <FloatingSupport />
        </ProgressProvider>
      </body>
    </html>
  );
}
