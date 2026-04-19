/**
 * @file XPPop.tsx
 * @description Komponen notifikasi visual yang muncul saat pengguna mendapatkan XP.
 * @module XPPop
 */

"use client";

// ======================
// IMPORTS
// ======================
import { motion, AnimatePresence } from "framer-motion";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen XPPop: Animasi teks melayang untuk feedback perolehan XP.
 * 
 * @param {Object} props - Properti komponen.
 * @param {boolean} props.show - Status tampilan animasi.
 * @param {number} props.amount - Jumlah XP yang didapatkan.
 * @returns {JSX.Element} Animasi perolehan XP.
 */
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
