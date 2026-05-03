"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useLevelUpOverlay } from "./levelup/useLevelUpOverlay";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function LevelUpOverlay({ level }: { level: number }) {
  const { show, setShow } = useLevelUpOverlay(level);

  useEffect(() => {
    if (show) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [show]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-2xl p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-lg h-auto max-h-[90vh] flex items-center justify-center"
          >
            <Card className="text-center py-6 px-4 md:py-10 md:px-12 bg-background dark:bg-[#0a0c10] rounded-[2rem] md:rounded-[3rem] border border-primary/30 shadow-2xl neo-card relative overflow-hidden w-full h-auto flex flex-col items-center">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20 dark:opacity-40" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-bloom pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
              
              <div className="absolute -top-16 -left-16 w-48 h-48 md:w-64 md:h-64 bg-primary/10 blur-[80px] md:blur-[100px] pointer-events-none" />

              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 md:w-28 md:h-28 mx-auto bg-primary/10 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-10 neo-inset shadow-none border border-primary/30"
              >
                <Trophy size={40} className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(0,238,255,0.6)] md:w-14 md:h-14" />
              </motion.div>

              <Badge variant="outline" className="text-primary text-[9px] md:text-[11px] font-bold uppercase tracking-widest mb-4 md:mb-6 h-auto neo-inset px-4 py-1.5 md:px-8 md:py-2.5 border-primary/30 bg-primary/5 rounded-xl">
                Level Baru Tercapai
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground uppercase tracking-tighter mb-4 md:mb-6 drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                LEVEL <span className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(0,238,255,0.4)]">{level}</span>
              </h1>
              
              <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-12">
                 <div className="flex flex-col items-center">
                    <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 mb-2 md:w-6 md:h-6" />
                    <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Target Selesai</span>
                 </div>
                 <div className="w-px h-8 md:h-10 bg-border dark:bg-white/10" />
                 <div className="flex flex-col items-center">
                    <Zap size={20} className="text-amber-600 dark:text-amber-400 mb-2 md:w-6 md:h-6" />
                    <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Kapasitas Maksimal</span>
                 </div>
              </div>

              <p className="text-muted-foreground text-[10px] md:text-sm lg:text-base font-medium max-w-sm mx-auto mb-8 md:mb-12 leading-relaxed uppercase tracking-wide px-4 md:px-0">
                &quot;Selamat! Kemampuan bahasamu semakin meningkat. Pintu ke tantangan yang lebih sulit kini telah terbuka untukmu.&quot;
              </p>

              <Button
                onClick={() => setShow(false)}
                className="h-auto w-full sm:w-auto px-8 py-4 md:px-12 md:py-5 bg-primary hover:bg-foreground text-white dark:text-black font-bold rounded-[1.2rem] md:rounded-[1.5rem] text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 border-none group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Lanjutkan Perjalanan <ArrowRight size={16} className="ml-3 group-hover:translate-x-1.5 transition-transform duration-300 md:w-5 md:h-5" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              
              <div className="absolute -bottom-16 -right-16 md:-bottom-20 md:-right-20 opacity-5 pointer-events-none scale-125 md:scale-150 rotate-12">
                <Star size={200} fill="currentColor" className="text-foreground md:w-[300px] md:h-[300px]" />
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
