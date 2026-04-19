/**
 * LOKASI FILE: components/LevelUpOverlay.tsx
 * KONSEP: Mobile-First Neumorphic (Layar Naik Level)
 */

"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/audio";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function LevelUpOverlay({ level }: { level: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level > 1) {
      setShow(true);
      sounds?.playSuccess();

      const duration = 4 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ["#00eeee", "#ffffff", "#000000"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ["#00eeee", "#ffffff", "#000000"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      const timer = setTimeout(() => setShow(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-2xl"
          >
            <Card className="text-center p-8 md:p-16 lg:p-20 bg-[#0a0c10] rounded-[3rem] md:rounded-[4rem] border-cyber-neon/30 shadow-[0_0_80px_rgba(0,238,255,0.2)] neo-card relative overflow-hidden w-full">
              {/* Scanline and Glow Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
              <div className="absolute -top-16 -left-16 w-48 h-48 md:w-64 md:h-64 bg-cyber-neon/10 blur-[80px] md:blur-[100px] pointer-events-none" />

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
                className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-cyber-neon/10 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mb-8 md:mb-10 neo-inset shadow-none border border-cyber-neon/30"
              >
                <Trophy size={40} className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,238,255,0.6)] md:w-14 md:h-14" />
              </motion.div>

              <Badge variant="outline" className="text-cyber-neon text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-6 h-auto neo-inset px-6 py-2 md:px-8 md:py-2.5 border-cyber-neon/30 bg-cyber-neon/5 rounded-xl">
                Level Baru Tercapai
              </Badge>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter mb-6 md:mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                LEVEL <span className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,238,255,0.4)]">{level}</span>
              </h1>
              
              <div className="flex items-center justify-center gap-4 md:gap-8 mb-8 md:mb-12">
                 <div className="flex flex-col items-center">
                    <ShieldCheck size={20} className="text-emerald-400 mb-2 md:w-6 md:h-6" />
                    <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Selesai</span>
                 </div>
                 <div className="w-px h-8 md:h-10 bg-white/10" />
                 <div className="flex flex-col items-center">
                    <Zap size={20} className="text-amber-400 mb-2 md:w-6 md:h-6" />
                    <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kapasitas Maksimal</span>
                 </div>
              </div>

              <p className="text-slate-400 text-xs md:text-sm lg:text-base font-medium max-w-sm mx-auto mb-10 md:mb-12 leading-relaxed uppercase tracking-wide px-4 md:px-0">
                "Kapasitas kognitif Anda telah meningkat. Akses ke tingkat pembelajaran yang lebih tinggi kini terbuka."
              </p>

              <Button
                onClick={() => setShow(false)}
                className="h-auto w-full sm:w-auto px-10 py-5 md:px-14 md:py-6 bg-cyber-neon hover:bg-white text-black font-bold rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(0,238,255,0.5)] hover:scale-105 active:scale-95 border-none group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Lanjutkan Perjalanan <ArrowRight size={16} className="ml-3 group-hover:translate-x-1.5 transition-transform duration-300 md:w-5 md:h-5" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              
              <div className="absolute -bottom-16 -right-16 md:-bottom-20 md:-right-20 opacity-5 pointer-events-none scale-125 md:scale-150 rotate-12">
                <Star size={200} fill="white" className="md:w-[300px] md:h-[300px]" />
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
