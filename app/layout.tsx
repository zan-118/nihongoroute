import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NihongoPath | Belajar Bahasa Jepang Gratis",
  description:
    "Platform belajar bahasa Jepang dengan sistem terstruktur, gamifikasi, dan latihan interaktif.",
  metadataBase: new URL("https://nihongopath-nine.vercel.app"),
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased bg-[#1f242d] text-[#c4cfde] selection:bg-[#0ef] selection:text-[#1f242d]`}
      >
        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="min-h-screen pt-8  pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </body>
    </html>
  );
}
