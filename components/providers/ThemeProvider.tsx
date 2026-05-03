"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * @file ThemeProvider.tsx
 * @description Wrapper untuk next-themes yang menangani state tema (Light/Dark) di seluruh aplikasi.
 */

export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
