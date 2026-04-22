"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Mencegah banner bawaan browser agar kita bisa pakai banner custom
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Munculkan banner kita setelah 3 detik agar terasa natural
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-8 md:w-96"
        >
          <div className="bg-[#0a0c10]/90 backdrop-blur-xl border border-cyan-400/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <Download className="text-[#0a0c10]" size={24} />
            </div>
            
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm tracking-tight">Pasang NihongoRoute</h4>
              <p className="text-slate-400 text-xs leading-tight mt-1">Belajar lebih lancar & hemat kuota dengan aplikasi.</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleInstall}
                className="bg-cyan-400 text-[#0a0c10] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-white transition-colors"
              >
                INSTALL
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-slate-500 hover:text-white transition-colors flex justify-center"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
