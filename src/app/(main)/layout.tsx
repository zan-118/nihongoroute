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
import dynamic from "next/dynamic";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import NavWrapper from "@/components/layout/NavWrapper";

const AppClientAddons = dynamic(() => import("@/components/providers/AppClientAddons"));
const DeferredOnboardingTour = dynamic(() => import("@/components/providers/DeferredOnboardingTour"));

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
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    /* ProgressProvider tracks page transition progress */
    <ProgressProvider>
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