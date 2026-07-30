/**
 * @file PreferencesSection.tsx
 * @description Komponen seksi preferensi pada halaman pengaturan.
 * @module features/settings/components
 */

"use client";

import { useEffect, useState } from "react";
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useUIStore } from "@/store/useUIStore";
import { useTheme } from "next-themes";
import { 
  Eye, 
  BookOpen, 
  Sun, 
  Moon, 
  Monitor, 
  LayoutGrid, 
  LayoutList, 
  Sparkles,
  Sliders
} from "@/components/ui/icons";

interface PreferencesSectionProps {
  itemVariants: Variants;
}

export default function PreferencesSection({ itemVariants }: PreferencesSectionProps) {
  const settings = useUIStore((state) => state.settings);
  const toggleFurigana = useUIStore((state) => state.toggleFurigana);
  const setLayoutPreference = useUIStore((state) => state.setLayoutPreference);
  const updateSettings = useUIStore((state) => state.updateSettings);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const dailyReviewGoal = settings?.dailyReviewGoal ?? 50;
  const dailyLessonGoal = settings?.dailyLessonGoal ?? 10;
  const showFurigana = settings?.showFurigana ?? true;
  const layoutPreference = settings?.layoutPreference ?? "grid";

  const REVIEW_GOALS = [10, 25, 50, 100, 150] as const;
  const LESSON_GOALS = [2, 5, 10, 15, 20] as const;

  return (
    <m.div variants={itemVariants} className="relative group">
      <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
        <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
        <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
      </div>

      <Card className="bg-card border border-border/50 dark:border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden">

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="size-12 rounded-lg bg-background/50 flex items-center justify-center border border-border/80 shadow-sm">
            <Sliders size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl uppercase italic tracking-tighter text-foreground font-bold">Preferensi Belajar</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
              Kustomisasi antarmuka dan target pencapaian harian
            </p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Eye size={18} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Tampilkan Furigana</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Tampilkan cara baca di atas huruf Kanji</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFurigana(!showFurigana)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  showFurigana ? "bg-primary" : "bg-muted/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showFurigana ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Layout Pustaka</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Tampilan default daftar kata & kanji</p>
                </div>
              </div>
              <div className="bg-background/40 p-1 rounded-lg flex gap-1 border border-border/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setLayoutPreference("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    layoutPreference === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid Layout"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutPreference("list")}
                  className={`p-1.5 rounded-lg transition-all ${
                    layoutPreference === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="List Layout"
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {mounted && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {theme === "light" ? <Sun size={18} /> : theme === "dark" ? <Moon size={18} /> : <Monitor size={18} />}
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Tema Aplikasi</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Pilih gaya visual antarmuka sistem</p>
                </div>
              </div>
              <div className="bg-background/40 p-1 rounded-lg flex gap-1 border border-border/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                    theme === "light"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun size={12} /> Terang
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                    theme === "dark"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon size={12} /> Gelap
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                    theme === "system"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor size={12} /> Sistem
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Target Ulasan Harian</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Target review hafalan (SRS) per hari</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {REVIEW_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => updateSettings({ dailyReviewGoal: goal })}
                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      dailyReviewGoal === goal
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background/30 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    {goal} Kartu
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Target Pelajaran Harian</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Target menyelesaikan materi per hari</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LESSON_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => updateSettings({ dailyLessonGoal: goal })}
                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      dailyLessonGoal === goal
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background/30 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    {goal} Materi
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </m.div>
  );
}
