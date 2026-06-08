"use client";

/**
 * @file OnboardingTour.tsx
 * @description Komponen modal panduan interaktif awal (onboarding tour wizard) bagi pengguna baru.
 * Menyediakan empat langkah pengenalan fitur utama NihongoRoute dengan indikator langkah belajar yang halus.
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// ======================
// ANTARMUKA & TIPE
// ======================
interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ======================
// KONSTANTA & ATURAN
// ======================
const steps: Step[] = [
  {
    title: "Selamat Datang!",
    description: "NihongoRoute adalah tempat asik buat belajar bahasa Jepang. Yuk, kenalan bentar sama fitur-fiturnya!",
    icon: <Sparkles className="text-primary" size={32} />,
  },
  {
    title: "Fokus Hari Ini",
    description: "Halaman Beranda itu pusat belajar kamu. Semua kata yang harus di-review ada di sini.",
    icon: <CheckCircle2 className="text-success" size={32} />,
  },
  {
    title: "Pantau Progres",
    description: "Di sini kamu bisa lihat sejauh mana perkembangan belajarmu, lengkap dengan grafik yang seru!",
    icon: <div className="text-primary text-2xl font-bold">📈</div>,
  },
  {
    title: "Koleksi Medali",
    description: "Selesaikan tantangan harian dan kumpulkan medali keren buat dipajang di koleksimu!",
    icon: <div className="text-warning text-2xl font-bold">🏆</div>,
  },
];

// ======================
// EKSEKUSI UTAMA
// ======================
export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("nihongoroute_tour_seen");
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("nihongoroute_tour_seen", "true");
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
        <m.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="relative p-8 md:p-10 rounded-[2.5rem] bg-card border border-primary/20 shadow-2xl overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <button
              type="button"
              onClick={handleClose}
              aria-label="Tutup onboarding"
              className="absolute top-5 right-5 size-10 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <m.div
                key={currentStep}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 p-6 bg-muted/50 rounded-3xl border border-border/50 shadow-inner"
              >
                {step.icon}
              </m.div>

              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mb-4 leading-none">
                {step.title}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed mb-10">
                {step.description}
              </p>

              <div className="flex flex-col gap-4 w-full">
                <Button 
                  onClick={handleNext}
                  className="w-full h-14 bg-primary hover:bg-foreground text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                >
                  {currentStep === steps.length - 1 ? "Mulai Belajar" : "Lanjut"}
                  <ArrowRight size={18} />
                </Button>
                
                <div className="flex justify-center gap-2">
                  {steps.map((_, i) => (
                    <div 
                      key={`step-dot-${i}`}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
