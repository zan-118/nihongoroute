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

// ======================
// EKSEKUSI UTAMA
// ======================
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider>
      <NavWrapper>
        {children}
      </NavWrapper>
    </ProgressProvider>
  );
}
