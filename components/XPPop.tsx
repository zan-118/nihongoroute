/**
 * LOKASI FILE: components/XPPop.tsx
 * KONSEP: Cyber-Dark Neumorphic (XP Notification)
 */

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
          animate={{ opacity: 1, y: -100, scale: 1.5 }}
          exit={{ opacity: 0, scale: 2 }}
          className="absolute pointer-events-none text-red-500 font-black italic text-4xl z-50 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] tracking-tighter"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
