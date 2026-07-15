/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute fungsional.
 * Menjadi Server Component untuk performa optimal, dengan logika client-side navigasi didelegasikan ke NavWrapper.
 * @module MainLayout
 */

// ======================
// IMPOR
// ======================
import { ReactNode } from "react";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import NavWrapper from "@/components/layout/NavWrapper";
import AppClientAddons from "@/components/providers/AppClientAddons";
import DeferredOnboardingTour from "@/components/providers/DeferredOnboardingTour";
import { createClient } from "@/lib/supabase/server";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Main layout component for functional route group.
 * Wraps children with navigation, progress tracking, and client-side addons.
 * 
 * @param props - Component props.
 * @param props.children - Child nodes to render.
 */
export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    /* ProgressProvider tracks page transition progress */
    <ProgressProvider initialSession={session}>
      {/* NavWrapper handles client-side navigation layout */}
      <NavWrapper>
        {children}
      </NavWrapper>
      {/* AppClientAddons mounts global client utilities */}
      <AppClientAddons />
      {/* DeferredOnboardingTour triggers user onboarding flow */}
      <DeferredOnboardingTour />
    </ProgressProvider>
  );
}