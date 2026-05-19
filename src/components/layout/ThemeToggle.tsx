"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @file ThemeToggle.tsx
 * @description Tombol interaktif untuk beralih antara tema Light, Dark, dan System.
 */

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
    );
  }

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
      className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all neo-inset shadow-none border border-border focus-visible:ring-primary/50 focus-visible:ring-offset-0"
      aria-label={`Ganti Tema (Sekarang: ${theme})`}
      title="Ganti Tema"
    >
      {theme === "dark" ? (
        <Moon size={18} className="text-primary text-primary" />
      ) : theme === "light" ? (
        <Sun size={18} className="text-warning" />
      ) : (
        <Monitor size={18} className="text-muted-foreground" />
      )}
    </Button>
  );
}
