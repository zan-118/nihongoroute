/**
 * @file AchievementToast.tsx
 * @description Premium toast notification component to display user achievement badges.
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Trophy, X, Zap } from "@/components/ui/icons";
import { useUIStore } from "@/store/useUIStore";
import { sounds } from "@/lib/audio";

// ==========================================
// Component Props Interface
// ==========================================

/**
 * Structure of achievement notification payload.
 */
interface AchievementNotification {
 /** Unique identifier for notification */
 id: string;
 /** Type classification of notification */
 type: string;
 /** Title text of achievement */
 title: string;
 /** Description text of achievement */
 message: string;
}

/**
 * AchievementToast Component
 * 
 * Renders queue of unlocked achievement badges.
 * Plays success sound and handles auto-dismissal.
 * 
 * @returns Achievement toast element or null if queue empty.
 */
// ======================
// EKSEKUSI UTAMA
// ==========================================
// Main Component
// ==========================================
export default function AchievementToast() {
 // Get notifications from global UI store
 const notifications = useUIStore((state) => state.notifications);
 
 // Track processed notification IDs to prevent duplicate displays
 const shownIdsRef = useRef<Set<string>>(new Set());
 
 // Queue of pending achievements to display
 const [queue, setQueue] = useState<AchievementNotification[]>([]);
 
 // Currently active toast notification
 const [activeToast, setActiveToast] = useState<AchievementNotification | null>(null);

 // Effect 1: Notification Watcher - Filters notifications < 15s old and enqueues them
 useEffect(() => {
 if (!notifications || notifications.length === 0) return;

 const now = Date.now();
 // Filter achievements under 15 seconds old that have not been shown yet
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
 // Defer state update to next animation frame for smooth transition
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

 // Tentukan tingkat kelangkaan (Gold, Silver, Bronze) berdasarkan judul atau pesan
 const msgLower = (activeToast.message || "").toLowerCase();
 const titleLower = (activeToast.title || "").toLowerCase();
 const isGold = msgLower.includes("gold") || titleLower.includes("gold");
 const isSilver = msgLower.includes("silver") || titleLower.includes("silver");
 const isBronze = msgLower.includes("bronze") || titleLower.includes("bronze");

 let borderStyle = "border-primary/50 shadow-md";
 let glowColor = "hsl(var(--primary)/0.3)";
 let badgeColor = "bg-primary/20 text-primary border-primary/30";
 let rarityLabel = "Bronze";

 // Apply specific styles based on detected rarity
 if (isGold) {
 borderStyle = "border-warning/50 shadow-md bg-warning/5";
 glowColor = "hsl(var(--warning)/ 0.4)";
 badgeColor = "bg-[hsl(var(--warning)/0.15)] text-warning border-warning/30";
 rarityLabel = "Gold / Emas";
 } else if (isSilver) {
 borderStyle = "border-muted-foreground/50 shadow-md bg-muted";
 glowColor = "hsl(var(--muted-foreground)/ 0.35)";
 badgeColor = "bg-[hsl(var(--muted-foreground)/0.15)] text-muted-foreground border-muted-foreground/30";
 rarityLabel = "Silver / Perak";
 } else if (isBronze) {
 borderStyle = "border-destructive/50 shadow-md bg-destructive/5";
 glowColor = "hsl(var(--destructive)/ 0.3)";
 badgeColor = "bg-[hsl(var(--destructive)/0.15)] text-destructive border-destructive/30";
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
 className={`w-full glass p-5 rounded-xl border flex gap-4 relative overflow-hidden transition-all ${borderStyle}`}
 style={{
 boxShadow: `0 20px 50px hsl(var(--foreground)/ 0.3), 0 0 30px ${glowColor}`,
 }}
 >
 {/* Animated neon highlight effect on inner container */}
 <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

 {/* Close Button */}
 <button type="button"
 onClick={() => setActiveToast(null)}
 className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
 aria-label="Tutup notifikasi"
 >
 <X size={14} />
 </button>

 {/* Glowing Icon Container */}
 <div className="flex flex-col items-center justify-center shrink-0">
 <m.div
 initial={{ rotate: -45, scale: 0.5 }}
 animate={{ rotate: 0, scale: 1 }}
 transition={{ delay: 0.15, type: "spring" }}
 className={`w-14 h-14 rounded-lg flex items-center justify-center border shadow-inner ${badgeColor}`}
 >
 <Trophy size={28} className="text-warning" />
 </m.div>
 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-2">
 Lencana
 </span>
 </div>

 {/* Content Details */}
 <div className="flex-1 pr-6 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-1">
 <Zap size={10} className="text-warning animate-premium-bounce" />
 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-warning">
 Achievement Unlocked
 </span>
 </div>
 <h4 className="text-sm text-foreground uppercase tracking-wide leading-snug mb-1">
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