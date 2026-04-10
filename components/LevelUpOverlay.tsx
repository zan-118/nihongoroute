"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/audio";

export default function LevelUpOverlay({ level }: { level: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level > 1) {
      setShow(true);
      sounds?.playSuccess();

      // Ledakan kembang api digital
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#0ef", "#ffffff"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#0ef", "#ffffff"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f242d]/80 backdrop-blur-md"
        >
          <div className="text-center p-10 bg-[#1e2024] rounded-[3rem] border border-[#0ef]/30 shadow-[0_0_50px_rgba(0,255,239,0.2)]">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-7xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-[#0ef] text-[10px] font-black uppercase tracking-[0.5em] mb-2">
              Level Up!
            </h2>
            <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter">
              Level {level}
            </h1>
            <p className="text-white/40 text-sm mt-4 italic font-medium">
              Kamu semakin dekat dengan impianmu!
            </p>
            <button
              onClick={() => setShow(false)}
              className="mt-8 px-8 py-3 bg-[#0ef] text-[#1f242d] font-black rounded-xl text-[10px] uppercase tracking-widest"
            >
              Lanjutkan Perjuangan
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
