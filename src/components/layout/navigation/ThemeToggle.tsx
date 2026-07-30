/**
 * @file ThemeToggle.tsx
 * @description Komponen sakelar mode gelap/terang.
 */

"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return <div className="size-9" />;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="action-icon size-9 rounded-xl text-muted-foreground hover:text-foreground transition-all"
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
    >
      {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
    </Button>
  );
}
