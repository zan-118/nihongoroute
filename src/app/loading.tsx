"use client";

import { motion } from "framer-motion";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-colors duration-300">
      {/* Background Decor & Neural Grid */}
      <div className="neural-grid" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] opacity-30 absolute -top-10 -left-10" />
        <div className="w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[90px] opacity-25 absolute -bottom-10 -right-10" />
      </div>

      <div className="relative flex flex-col items-center z-10">
        {/* Futuristic Spinner */}
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-t-2 border-r-2 border-primary rounded-full animate-spin [animation-duration:1.2s]" />
          <div className="absolute inset-2 border-b-2 border-l-2 border-secondary rounded-full animate-spin [animation-duration:0.8s] [animation-direction:reverse]" />
          <div className="absolute inset-4 border-t-2 border-border rounded-full animate-spin [animation-duration:1.6s]" />
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground select-none"
        >
          Initializing NihongoRoute
        </motion.p>
      </div>
    </div>
  );
}
