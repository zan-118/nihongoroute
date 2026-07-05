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
  Settings,
  Sparkles,
  Sliders
} from "lucide-react";

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

  // Mencegah hydration mismatch untuk visual tema
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
    <m.div variants={itemVariants}>
      <Card className="glass  border border-border/80 rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden group">
        {/* Background Decorative Gradient Glow */}
        <div className="absolute top-0 left-0 size-40 bg-primary/5 blur-[50px] rounded-full -ml-14 -mt-14 pointer-events-none group-hover:bg-primary/8 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 size-48 bg-secondary/5 blur-[60px] rounded-full -mr-20 -mb-20 pointer-events-none" />

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="size-12 rounded-lg bg-background/30 flex items-center justify-center border border-border/80 shadow-lg">
            <Sliders size={22} className="text-primary drop-shadow-[0_0_6px_rgb(var(--primary-rgb)/0.3)]" />
          </div>
          <div>
            <h2 className="text-xl uppercase italic tracking-tighter text-foreground">Preferensi Belajar</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
              Kustomisasi antarmuka dan target pencapaian harian
            </p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          {/* 1. FURIGANA & LAYOUT PREFERENCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Furigana Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
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
                aria-label={`Toggle Furigana (Sekarang: ${showFurigana ? 'Aktif' : 'Nonaktif'})`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out ${
                    showFurigana ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Library Layout Preference */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Tata Letak Pustaka</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Ubah tampilan menu daftar Pustaka</p>
                </div>
              </div>
              <div className="bg-background/40 glass p-1 rounded-xl flex gap-1 border border-border/60">
                <button
                  type="button"
                  onClick={() => setLayoutPreference("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    layoutPreference === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Tampilan Kisi (Grid)"
                  title="Tampilan Kisi"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutPreference("list")}
                  className={`p-1.5 rounded-lg transition-all ${
                    layoutPreference === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Tampilan Daftar (List)"
                  title="Tampilan Daftar"
                >
                  <LayoutList size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* 2. THEME SELECTOR */}
          {mounted && (
            <div className="p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {theme === "dark" ? (
                    <Moon size={18} />
                  ) : theme === "light" ? (
                    <Sun size={18} />
                  ) : (
                    <Monitor size={18} />
                  )}
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-foreground">Tema Tampilan</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Pilih tema antarmuka aplikasi</p>
                </div>
              </div>
              <div className="bg-background/40 glass p-1 rounded-xl flex gap-1 border border-border/60 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
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
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
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
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
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

          {/* 3. GAMIFICATION DAILY GOALS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Review Goal */}
            <div className="p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
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
                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
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

            {/* Daily Lesson Goal */}
            <div className="p-5 rounded-lg bg-background/25 border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
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
                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
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
