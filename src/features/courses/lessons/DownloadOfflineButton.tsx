/**
 * @file DownloadOfflineButton.tsx
 * @description Tombol interaktif berdesain Cyber-Glass untuk mengunduh seluruh aset pelajaran (audio skenario, audio bacaan, TTS kosakata, dan SVG KanjiVG) ke cache lokal peramban secara offline-first.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useEffect, useCallback } from "react";
import { Download, Loader2, Check, Cloud } from "@/components/ui/icons";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

import {
 extractLessonAssetUrls,
 checkLessonCacheStatus,
 downloadLessonAssets,
 type LessonDataPayload,
} from "@/lib/lessons/lesson-offline-adapter";

export type LessonData = LessonDataPayload;

/**
 * Component props.
 */
interface DownloadOfflineButtonProps {
 lesson: LessonDataPayload;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Cyber-Glass button. Download lesson assets for offline use.
 */
export default function DownloadOfflineButton({ lesson }: DownloadOfflineButtonProps) {
 const [status, setStatus] = useState<"idle" | "downloading" | "completed" | "error">("idle");
 const [progress, setProgress] = useState(0);

 // Cari aset yang bisa di-cache dalam lesson
 const getAssetUrls = useCallback(() => {
 return extractLessonAssetUrls(lesson);
 }, [lesson]);

 // Cek pada mount apakah berkas utama sudah ada di cache
 useEffect(() => {
 if (typeof window === "undefined" || !lesson) return;

 const checkCache = async () => {
 const assetUrls = getAssetUrls();
 const isCached = await checkLessonCacheStatus(assetUrls);
 if (isCached) {
 setStatus("completed");
 setProgress(100);
 }
 };

 checkCache();
 }, [lesson, getAssetUrls]);

 /**
 * Download all assets and save to cache.
 */
 const handleDownload = async () => {
 if (status === "downloading" || status === "completed") return;

 sounds?.playPop();
 setStatus("downloading");
 setProgress(0);

 try {
 const assetUrls = getAssetUrls();
 await downloadLessonAssets(assetUrls, (percent) => {
 setProgress(percent);
 });

 setStatus("completed");
 setProgress(100);
 sounds?.playSuccess();
 if ("vibrate" in navigator) {
 navigator.vibrate([10, 50, 10]);
 }
 } catch (err) {
 console.error("Gagal mengunduh aset luring bab:", err);
 setStatus("error");
 sounds?.playError();
 }
 };

 return (
 <button type="button"
 onClick={handleDownload}
 disabled={status === "downloading"}
 aria-label={
 status === "completed"
 ? "Pelajaran siap diakses luring"
 : status === "downloading"
 ? `Mengunduh aset kelas... ${progress}%`
 : "Unduh materi untuk luring"
 }
 className={cn(
 "relative overflow-hidden flex items-center justify-center gap-3 px-6 py-3 rounded-lg rounded-br-none text-xs font-black uppercase tracking-widest transition-all duration-500 shadow-sm",
 "border bg-card border-border/80 active:scale-95",
 status === "completed" && "bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.2)] text-success cursor-default active:scale-100",
 status === "downloading" && "border-[hsl(var(--primary)/0.3)] text-primary cursor-default",
 status === "error" && "border-[hsl(var(--destructive)/0.2)] text-destructive bg-[hsl(var(--destructive)/0.05)] hover:bg-[hsl(var(--destructive)/0.1)]"
 )}
 >
 {/* Efek Pendar Latar Belakang Pemuat Visual */}
 {status === "downloading" && (
 <div 
 className="absolute inset-0 transition-all duration-300 self-start h-full" 
 style={{ width: `${progress}%`, backgroundColor: "hsl(var(--primary)/0.05)" }}
 />
 )}

 {/* Render Ikon & Keterangan teks berdasarkan state */}
 {status === "idle" && (
 <>
 <Download size={14} className="animate-premium-bounce" />
 <span>Simpan Bab Luring</span>
 </>
 )}

 {status === "downloading" && (
 <>
 <Loader2 size={14} className="animate-spin text-primary" />
 <span className="font-mono">{progress}% Mengunduh…</span>
 </>
 )}

 {status === "completed" && (
 <>
 <Check size={14} className="text-success animate-in zoom-in duration-300" />
 <span className="flex items-center gap-1.5">
 Luring Aktif
 <Cloud size={12} className="animate-pulse" />
 </span>
 </>
 )}

 {status === "error" && (
 <>
 <Download size={14} />
 <span>Gagal, Coba Lagi</span>
 </>
 )}
 </button>
 );
}