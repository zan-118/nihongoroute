/**
 * @file layout.tsx
 * @description Layout wrapper for public information pages (/about, /contact, etc.) featuring clean LandingHeader and LandingFooter without dashboard sidebar.
 * @module PublicLayout
 */

import React from "react";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { LandingFooter } from "@/features/landing/LandingFooter";

/**
 * PublicLayout component.
 * Provides a unified public layout header & footer for marketing and information pages.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/30 overflow-x-clip w-full relative transition-colors duration-500">
      <LandingHeader />
      <main className="flex-1 w-full">{children}</main>
      <LandingFooter />
    </div>
  );
}
