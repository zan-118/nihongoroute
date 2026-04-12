"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function XPPop({
  show,
  amount,
}: {
  show: boolean;
  amount: number;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -80, scale: 1.2 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className="absolute pointer-events-none text-cyber-neon font-black italic text-2xl z-50 drop-shadow-[0_0_10px_rgba(0,255,239,0.8)]"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
