"use client";

import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Trophy, X, Zap } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { sounds } from "@/lib/audio";

interface AchievementNotification {
  id: string;
  type: string;
  title: string;
  message: string;
}

/**
 * AchievementToast Component
 * 
 * Komponen ini bertanggung jawab untuk menampilkan notifikasi pencapaian (lencana)
 * secara antrean (queue) dengan animasi premium, efek suara sukses, dan penutupan otomatis.
 * 
 * @component
 * @returns {JSX.Element | null} Elemen toast pencapaian yang aktif atau null jika antrean kosong.
 * 
 * @effects
 * 1. Notification Watcher: Memantau Zustand `useUIStore.notifications` dan menyaring notifikasi
 *    tipe "achievement" yang berumur kurang dari 15 detik, menghindari pemutaran ulang lencana lawas saat remounting.
 * 2. Queue Consumer: Memindahkan item pertama dari antrean (`queue`) ke `activeToast` dan memotong antrean.
 * 3. Toast Timer & Audio Player: Memutar suara sukses dan memulai timer auto-dismiss 6.5 detik untuk
 *    menghapus `activeToast`. Efek ini terisolasi dari perubahan antrean untuk stabilitas timer.
 * 
 * @store
 * - `useUIStore`: Mengakses state `notifications` untuk memantau lencana yang baru dibuka.
 */
export default function AchievementToast() {
  const notifications = useUIStore((state) => state.notifications);
  const shownIdsRef = useRef<Set<string>>(new Set());
  const [queue, setQueue] = useState<AchievementNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AchievementNotification | null>(null);

  // Efek 1: Notification Watcher - Menyaring notifikasi berumur < 15 detik dan memasukkannya ke queue
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const now = Date.now();
    const newAchievements = notifications.filter(
      (n) => n.type === "achievement" && !shownIdsRef.current.has(n.id) && now - n.timestamp < 15000
    ) as AchievementNotification[];

    if (newAchievements.length > 0) {
      // Instan tandai di ref sinkron untuk mencegah evaluasi ganda di siklus render yang sama
      newAchievements.forEach((a) => shownIdsRef.current.add(a.id));

      // Balik urutan jika ada beberapa lencana masuk bersamaan, agar yang terlama diproses lebih dulu
      const toQueue = [...newAchievements].reverse();
      setQueue((prev) => [...prev, ...toQueue]);
    }
  }, [notifications]);

  // Efek 2: Queue Consumer - Mengambil item terdepan dari queue ke activeToast dan memotong antrean
  useEffect(() => {
    if (!activeToast && queue.length > 0) {
      const nextToast = queue[0];
      requestAnimationFrame(() => {
        setActiveToast(nextToast);
        setQueue((prev) => prev.slice(1));
      });
    }
  }, [activeToast, queue]);

  // Efek 3: Toast Timer & Audio Player - Memutar suara sukses dan timer auto-dismiss 6.5 detik secara stabil
  useEffect(() => {
    if (!activeToast) return;

    // Putar audio sukses secara prosedural
    try {
      sounds?.playSuccess();
    } catch (err) {
      console.warn("Gagal memutar audio lencana:", err);
    }

    // Auto-dismiss setelah 6.5 detik secara stabil tanpa terganggu oleh perubahan queue
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6500);

    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  // Determine rarity level (Gold, Silver, Bronze) based on title or message
  const msgLower = (activeToast.message || "").toLowerCase();
  const titleLower = (activeToast.title || "").toLowerCase();
  const isGold = msgLower.includes("gold") || titleLower.includes("gold");
  const isSilver = msgLower.includes("silver") || titleLower.includes("silver");
  const isBronze = msgLower.includes("bronze") || titleLower.includes("bronze");

  let borderStyle = "border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]";
  let glowColor = "rgba(var(--primary-rgb), 0.3)";
  let badgeColor = "bg-primary/20 text-primary border-primary/30";
  let rarityLabel = "Bronze";

  if (isGold) {
    borderStyle = "border-[rgba(255,215,0,0.5)] shadow-[0_0_35px_rgba(255,215,0,0.25)] bg-[rgba(255,215,0,0.02)]";
    glowColor = "rgba(255, 215, 0, 0.4)";
    badgeColor = "bg-[rgba(255,215,0,0.15)] text-[rgba(255,215,0,1)] border-[rgba(255,215,0,0.3)]";
    rarityLabel = "Gold / Emas";
  } else if (isSilver) {
    borderStyle = "border-[rgba(192,192,192,0.5)] shadow-[0_0_30px_rgba(192,192,192,0.2)] bg-[rgba(192,192,192,0.02)]";
    glowColor = "rgba(192, 192, 192, 0.35)";
    badgeColor = "bg-[rgba(192,192,192,0.15)] text-[rgba(180,180,180,1)] border-[rgba(192,192,192,0.3)]";
    rarityLabel = "Silver / Perak";
  } else if (isBronze) {
    borderStyle = "border-[rgba(180,110,50,0.5)] shadow-[0_0_30px_rgba(180,110,50,0.15)] bg-[rgba(180,110,50,0.02)]";
    glowColor = "rgba(180, 110, 50, 0.3)";
    badgeColor = "bg-[rgba(180,110,50,0.15)] text-[rgba(190,120,60,1)] border-[rgba(180,110,50,0.3)]";
    rarityLabel = "Bronze / Perunggu";
  }

  return (
    <AnimatePresence>
      {activeToast && (
        <m.div
          initial={{ opacity: 0, y: 50, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className={`fixed bottom-24 right-4 md:bottom-10 md:right-10 z-[250] max-w-sm md:max-w-md w-full px-4`}
        >
          <div
            className={`w-full glass p-5 rounded-3xl border flex gap-4 relative overflow-hidden transition-all ${borderStyle}`}
            style={{
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px ${glowColor}`,
            }}
          >
            {/* Animated neon spotlight beam inside */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent pointer-events-none -translate-x-full animate-[shimmer_3s_infinite]" />

            {/* Close Button */}
            <button type="button"
              onClick={() => setActiveToast(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>

            {/* Glowing Icon Holder */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <m.div
                initial={{ rotate: -45, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring" }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${badgeColor}`}
              >
                <Trophy size={28} className="animate-pulse" />
              </m.div>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                Lencana
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 pr-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={10} className="text-warning animate-premium-bounce" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-warning animate-pulse">
                  Achievement Unlocked
                </span>
              </div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-wide leading-snug mb-1">
                {activeToast.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {activeToast.message}
              </p>
              
              <div className="mt-3 flex items-center gap-1.5">
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {rarityLabel}
                </span>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
