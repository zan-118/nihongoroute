"use client";

/**
 * @file ExamCountdown.tsx
 * @description Komponen timer mundur ujian yang ticking secara lokal (per detik) tanpa
 * memicu re-render pada komponen induk (ExamPlaying). Sebelumnya, `timeLeft` di-update di
 * level hook `useMockExamEngine` sehingga SELURUH pohon komponen ujian (soal, pilihan jawaban,
 * animasi framer-motion, dsb) ikut re-render setiap detik selama pengerjaan ujian. Dengan
 * memindahkan ticking ke komponen leaf ini, hanya elemen timer yang re-render tiap detik.
 */

import { memo, useEffect, useRef, useState } from "react";
import { Clock } from "@/components/ui/icons";
import { formatTime } from "@/lib/core/utils";

interface ExamCountdownProps {
 /** Timestamp (ms) kapan ujian berakhir. Nilai ini stabil/tidak berubah selama sesi berjalan. */
 endAt: number;
 /** Total durasi ujian dalam detik, dipakai untuk menghitung progres bar. */
 timeLimitSeconds: number;
 /** Dipanggil sekali saat waktu habis. */
 onExpire: () => void;
 /** Varian tampilan: pill ringkas (mobile) atau kartu lengkap dengan progress bar (sidebar desktop). */
 variant: "compact" | "card";
}

function computeSecondsLeft(endAt: number) {
 return Math.max(0, Math.round((endAt - Date.now()) / 1000));
}

export const ExamCountdown = memo(function ExamCountdown({
 endAt,
 timeLimitSeconds,
 onExpire,
 variant,
}: ExamCountdownProps) {
 const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(endAt));
 const hasExpiredRef = useRef(false);

 useEffect(() => {
 hasExpiredRef.current = false;
 setSecondsLeft(computeSecondsLeft(endAt));

 const tick = () => {
 const remaining = computeSecondsLeft(endAt);
 setSecondsLeft(remaining);
 if (remaining <= 0 && !hasExpiredRef.current) {
 hasExpiredRef.current = true;
 onExpire();
 }
 };

 const timer = setInterval(tick, 1000);
 return () => clearInterval(timer);
 }, [endAt, onExpire]);

 const isTimeCritical = secondsLeft < 300;

 if (variant === "compact") {
 return (
 <div className="flex items-center gap-3 shrink-0 lg:hidden">
 <div
 className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
 isTimeCritical
 ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse"
 : "bg-background border-border text-muted-foreground"
 }`}
 >
 <Clock size={14} aria-hidden="true" />
 <span className="font-mono font-bold text-xs">{formatTime(secondsLeft)}</span>
 </div>
 </div>
 );
 }

 return (
 <div
 className={`p-5 rounded-lg border transition-all glass ${
 isTimeCritical
 ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse"
 : "bg-card border-border text-card-foreground shadow-sm"
 }`}
 >
 <div className="flex items-center gap-2 mb-2 text-muted-foreground">
 <Clock size={16} />
 <span className="text-[10px] font-bold uppercase tracking-wider">Sisa Waktu</span>
 </div>
 <div className="text-3xl font-black font-mono tracking-tight text-foreground">
 {formatTime(secondsLeft)}
 </div>
 <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
 <div
 className="h-full rounded-full bg-destructive transition-all duration-1000"
 style={{
 width: `${Math.max(0, Math.min(100, (secondsLeft / timeLimitSeconds) * 100))}%`,
 }}
 />
 </div>
 </div>
 );
});
