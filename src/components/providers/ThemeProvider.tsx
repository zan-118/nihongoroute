/**
 * @file ThemeProvider.tsx
 * @description Wrapper untuk next-themes yang menangani state tema (Light/Dark) di seluruh aplikasi.
 */

"use client";

// ======================
// IMPOR
// ======================
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// ======================
// EKSEKUSI UTAMA
// ======================
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
