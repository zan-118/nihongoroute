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
/**
 * Theme provider component. Wraps application to enable theme switching.
 * 
 * @param props - Component properties.
 * @param props.children - Child elements.
 * @returns Theme provider context wrapper.
 */
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Pass props to next-themes provider
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}