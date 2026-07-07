/**
 * @file page.tsx
 * @description Halaman pengaturan (Settings) NihongoRoute.
 * Menyediakan kerangka utama Server Component dengan ekspor metadata statis SEO.
 */

import { Metadata } from "next";
import SettingsClient from "./SettingsClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pengaturan Akun | NihongoRoute",
    description: "Atur profil dan preferensi belajarmu di NihongoRoute.",
    path: "/settings",
    noIndex: true,
  }),
};

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Premium Ambient Background Grid & Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 neural-grid opacity-[0.12] mix-blend-overlay" />
        <div className="absolute top-[10%] -left-[10%] size-[42%] bg-primary/8 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] -right-[10%] size-[42%] bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />
      </div>

      <SettingsClient />
    </div>
  );
}
