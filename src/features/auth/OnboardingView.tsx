/**
 * @file OnboardingView.tsx
 * @description Komponen utama pemandu onboarding (Onboarding Wizard) interaktif untuk profil awal pengguna.
 */

"use client";

// ======================
// IMPOR
// ======================
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Briefcase, Plane, Tv, ChevronRight, CheckCircle2, Loader2, Sparkles, ArrowLeft } from "@/components/ui/icons";
import { useOnboardingWizard } from "@/features/auth/onboarding/useOnboardingWizard";

// ======================
// KONSTANTA
// ======================
/** JLPT levels for user selection. */
const JLPT_LEVELS = [
  { id: "N5", label: "Pemula (N5)" },
  { id: "N4", label: "Dasar (N4)" },
  { id: "N3", label: "Menengah (N3)" },
  { id: "N2", label: "Lanjut (N2)" },
  { id: "N1", label: "Mahir (N1)" },
];

/** User motivations for learning Japanese. */
const MOTIVATIONS = [
  { id: "exam", icon: BookOpen, label: "Lulus Ujian JLPT" },
  { id: "hobby", icon: Tv, label: "Hobi / Anime" },
  { id: "career", icon: Briefcase, label: "Karir / Pekerjaan" },
  { id: "travel", icon: Plane, label: "Wisata ke Jepang" },
];

/**
 * Onboarding wizard component. Collects target JLPT level and motivation.
 * 
 * @returns Onboarding wizard UI.
 */
export default function OnboardingView() {
  // Get wizard state and handlers.
  const {
    step,
    setStep,
    targetLevel,
    setTargetLevel,
    motivation,
    setMotivation,
    isSubmitting,
    handleComplete,
  } = useOnboardingWizard();

  /** Framer motion variants for step transitions. */
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <main className="min-h-screen shell-ambient text-foreground flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background decorative elements. */}
      <div className="grid-overlay" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="size-[500px] bg-primary/10 rounded-full blur-[120px] opacity-40 absolute -top-12 -left-12" />
        <div className="size-[450px] bg-secondary/10 rounded-full blur-[100px] opacity-35 absolute -bottom-10 -right-10" />
      </div>

      <div className="max-w-2xl w-full relative z-10 flex flex-col justify-center min-h-[450px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <m.div
              key="step1"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center space-y-10"
            >
              <div className="space-y-4">
                <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.15)] animate-pulse">
                  <Sparkles className="text-primary" size={40} />
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-primary font-japanese tracking-tight">
                  ようこそ!
                </h1>
                <p className="text-sm md:text-base font-bold text-muted-foreground uppercase tracking-[0.3em]">
                  (Youkoso)
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight font-japanese">
                  Selamat Datang di NihongoRoute
                </h2>
                <p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                  Platform belajar bahasa Jepang yang pas buat kamu. Yuk, tentukan jalur belajarmu!
                </p>
              </div>

              <div className="pt-8">
                <Button 
                  onClick={() => setStep(2)}
                  className="brand-button rounded-2xl px-10 h-14 text-base"
                >
                  Mulai Yuk <ChevronRight className="ml-2" />
                </Button>
              </div>
            </m.div>
          )}

          {step === 2 && (
            <m.div
              key="step2"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight font-japanese">
                  Target JLPT-mu Apa?
                </h2>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  Pilih level yang pengen kamu capai sekarang.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {JLPT_LEVELS.map((level) => (
                  <div
                    key={level.id}
                    onClick={() => setTargetLevel(level.id)}
                    className={`rounded-[1.5rem] p-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      targetLevel === level.id 
                        ? "bg-primary/20 border border-primary/40 shadow-lg scale-[1.03]" 
                        : "bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 hover:border-primary/40"
                    }`}
                  >
                    <Card
                      className={`cursor-pointer p-6 border-none rounded-[calc(1.5rem-0.25rem)] flex flex-col items-center justify-center text-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        targetLevel === level.id 
                          ? "bg-primary/10" 
                          : "bg-card hover:bg-muted/30"
                      }`}
                    >
                      <span className={`text-3xl font-black tracking-tight mb-2 transition-colors duration-500 ${
                        targetLevel === level.id ? "text-primary" : "text-foreground group-hover:text-primary"
                      }`}>
                        {level.id}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {level.label.split(" ")[0]}
                      </span>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)} 
                  className="rounded-xl font-bold uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} className="mr-2" /> Kembali
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!targetLevel}
                  className="rounded-xl px-8 h-12 font-black uppercase tracking-widest bg-foreground text-background hover:opacity-90 duration-300 disabled:opacity-50"
                >
                  Lanjut <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </m.div>
          )}

          {step === 3 && (
            <m.div
              key="step3"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight font-japanese">
                  Apa yang Bikin Kamu Semangat?
                </h2>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  Alasan yang kuat bakal bantu kamu di saat materi terasa berat.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOTIVATIONS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setMotivation(item.id)}
                    className={`rounded-[1.5rem] p-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      motivation === item.id 
                        ? "bg-secondary/20 border border-secondary/40 shadow-lg scale-[1.03]" 
                        : "bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 hover:border-secondary/40"
                    }`}
                  >
                    <Card
                      className={`cursor-pointer p-6 border-none rounded-[calc(1.5rem-0.25rem)] flex items-center gap-5 group shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        motivation === item.id 
                          ? "bg-secondary/10" 
                          : "bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className={`p-4 rounded-2xl transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        motivation === item.id 
                          ? "bg-secondary text-secondary-foreground shadow-[0_0_15px_rgb(var(--secondary-rgb)/0.2)]" 
                          : "bg-muted text-muted-foreground group-hover:text-secondary group-hover:bg-secondary/5"
                      }`}>
                        <item.icon size={24} />
                      </div>
                      <span className={`font-bold text-base md:text-lg transition-colors duration-500 ${
                        motivation === item.id ? "text-secondary" : "text-foreground group-hover:text-secondary"
                      }`}>
                        {item.label}
                      </span>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(2)} 
                  className="rounded-xl font-bold uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} className="mr-2" /> Kembali
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={!motivation || isSubmitting}
                  className="brand-button rounded-xl px-8 h-12"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 size-4" /> Selesaikan Profil
                    </>
                  )}
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Render step progress indicators. */}
        <div className="mt-16 flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === i 
                  ? "w-12 bg-primary shadow-[0_0_10px_rgb(var(--primary-rgb)/0.5)]" 
                  : step > i 
                    ? "w-6 bg-primary/30" 
                    : "w-6 bg-border/80"
              }`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}