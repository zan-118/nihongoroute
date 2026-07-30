/**
 * @file page.tsx
 * @description Halaman pengaturan (Settings) NihongoRoute.
 * Menyediakan kerangka utama Server Component dengan ekspor metadata statis SEO.
 */

import { Metadata } from "next";
import SettingsView from "@/features/settings/SettingsView";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/**
 * SEO metadata configuration.
 * Disables indexing for privacy.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pengaturan Akun | NihongoRoute",
    description: "Atur profil dan preferensi belajarmu di NihongoRoute.",
    path:ROUTES.SETTINGS,
    noIndex: true, // Prevent search engine indexing
  }),
};

/**
 * Settings page layout wrapper.
 * Renders ambient background and client settings component.
 */
export default function SettingsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Premium Ambient Background Grid & Glows */}
      {/* Background container with pointer events disabled to allow clicks through */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 grid-overlay opacity-[0.12] mix-blend-overlay" />
        <div className="absolute top-[10%] -left-[10%] size-[42%] bg-primary/8 blur-[80px] rounded-full pointer-events-none ambient-glow will-change-transform" />
        <div className="absolute bottom-[10%] -right-[10%] size-[42%] bg-secondary/5 blur-[80px] rounded-full pointer-events-none ambient-glow will-change-transform" />
      </div>

      <SettingsView />
    </div>
  );
}