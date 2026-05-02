"use client";

import { motion } from "framer-motion";

/**
 * @file loading.tsx
 * @description Root Loading State.
 */

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-colors duration-300">
      <div className="relative flex flex-col items-center">
        {/* Futuristic Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
          <div className="absolute inset-2 border-t-2 border-red-500 rounded-full animate-spin [animation-duration:1s]" />
          <div className="absolute inset-4 border-t-2 border-border rounded-full animate-spin [animation-duration:2s]" />
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground"
        >
          Initializing NihongoRoute
        </motion.p>
      </div>
    </div>
  );
}
