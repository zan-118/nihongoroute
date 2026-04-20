"use client";

import React, { useState, useEffect } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Lock, X } from "lucide-react";
import Link from "next/link";

export default function CloudSyncPromo() {
  const { progress, isAuthenticated, loading } = useProgress();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Tampilkan jika belum login, sudah mencapai level 3, dan belum di-dismiss
    if (!loading && !isAuthenticated && progress.level >= 3) {
      const dismissed = localStorage.getItem("nihongo_promo_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [progress.level, isAuthenticated, loading]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("nihongo_promo_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
      >
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            aria-label="Tutup promo"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Cloud size={24} />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Amankan Progresmu!
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Kamu sudah mencapai Level {progress.level}! Jangan sampai progres dan koleksi kartu SRS kamu hilang. Login sekarang untuk menyimpan secara otomatis ke Cloud.
              </p>
              
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  <Lock size={16} />
                  Login / Daftar
                </Link>
                <button
                  onClick={handleDismiss}
                  className="text-sm text-slate-400 hover:text-white transition-colors py-2"
                >
                  Nanti saja
                </button>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
