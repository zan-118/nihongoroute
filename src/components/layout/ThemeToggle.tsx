/**
 * @file ThemeToggle.tsx
 * @description Tombol interaktif untuk beralih antara tema Light, Dark, dan System.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Theme toggle button component.
 * Cycles theme: dark -> light -> system.
 * Prevents hydration mismatch.
 * 
 * @returns Theme toggle button or skeleton placeholder.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch
  // Delay mount state. Avoid hydration mismatch.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Render placeholder. Prevent layout shift before mount.
  if (!mounted) {
    return (
      <div className="skeleton-brand size-11 rounded-xl" />
    );
  }

  /**
   * Cycle theme state.
   * Dark to light, light to system, system to dark.
   */
  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="action-icon size-11 shadow-none focus-visible:ring-primary/50 focus-visible:ring-offset-0"
      aria-label={`Ganti Tema (Sekarang: ${theme})`}
      title="Ganti Tema"
    >
      {theme === "dark" ? (
        <Moon size={18} className="text-primary" />
      ) : theme === "light" ? (
        <Sun size={18} className="text-warning" />
      ) : (
        <Monitor size={18} className="text-muted-foreground" />
      )}
    </Button>
  );
}