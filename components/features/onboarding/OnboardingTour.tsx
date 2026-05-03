"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Selamat Datang!",
    description: "NihongoRoute adalah ekosistem belajar bahasa Jepang modern. Mari kita keliling sebentar!",
    icon: <Sparkles className="text-primary" size={32} />,
  },
  {
    title: "Fokus Harian",
    description: "Tab Beranda adalah pusat aktivitasmu. Di sini kamu bisa melihat sesi review yang jatuh tempo.",
    icon: <CheckCircle2 className="text-emerald-500" size={32} />,
  },
  {
    title: "Pantau Progres",
    description: "Gunakan tab Progres untuk melihat statistik detail dan penguasaan kanji kamu secara visual.",
    icon: <div className="text-blue-500 text-2xl font-bold">📈</div>,
  },
  {
    title: "Koleksi Trophy",
    description: "Selesaikan quest dan raih prestasi untuk mengoleksi badge keren di tab Koleksi.",
    icon: <div className="text-amber-500 text-2xl font-bold">🏆</div>,
  },
];

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="relative p-8 md:p-10 rounded-[2.5rem] bg-card border border-primary/20 shadow-2xl overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 p-6 bg-muted/50 rounded-3xl border border-border/50 shadow-inner"
              >
                {step.icon}
              </motion.div>

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
                  {currentStep === steps.length - 1 ? "Mulai Belajar" : "Lanjut Tour"}
                  <ArrowRight size={18} />
                </Button>
                
                <div className="flex justify-center gap-2">
                  {steps.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
