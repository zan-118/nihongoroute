"use client";

import { motion } from "framer-motion";

/**
 * @file loading.tsx
 * @description State loading global untuk Route Group (main).
 * Memberikan feedback visual premium saat transisi antar halaman atau fetching data Sanity/Supabase.
 */

export default function MainLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="relative flex flex-col items-center">
        {/* Animated Logo / Icon Shell */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 mb-8"
        >
          {/* Inner Glow Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-[ping_2s_infinite]" />
          
          {/* Main Visual */}
          <div className="absolute inset-0 neo-card flex items-center justify-center rounded-full bg-card border border-border shadow-xl">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-3xl"
            >
              🌀
            </motion.div>
          </div>
        </motion.div>

        {/* Textual Feedback */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground mb-2">
            NihongoRoute
          </h2>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
          </div>
        </motion.div>
      </div>

      {/* Progress Line at bottom */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-muted">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg"
        />
      </div>
    </div>
  );
}
