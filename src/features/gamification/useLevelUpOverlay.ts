/**
 * @file useLevelUpOverlay.ts
 * @description Hook kustom (Custom Hook) untuk mengontrol pemicuan overlay kenaikan level (Level Up).
 * Menyimpan informasi level terakhir di localStorage untuk mencegah pemicuan berulang dan memainkan efek suara keberhasilan.
 */

// IMPOR

import { useState, useEffect } from "react";
import { sounds } from "@/lib/audio";

// HOOK UTAMA

/**
 * Hook kelola tampilan overlay naik level.
 * Bandingkan level sekarang dengan level terakhir di localStorage.
 * Putar suara sukses jika level naik.
 * 
 * @param level - Level pengguna saat ini.
 * @returns Objek kontrol status tampilan overlay.
 */
export function useLevelUpOverlay(level: number) {
 const [show, setShow] = useState(false);

 useEffect(() => {
 // Abaikan level awal. Hanya proses kenaikan level dari level 2 ke atas.
 if (level <= 1) return;

 // Ambil data level terakhir yang tersimpan di lokal.
 const lastSeenLevel = localStorage.getItem("nihongoroute_last_seen_level");
 
 // Jika level baru lebih tinggi, picu overlay.
 if (!lastSeenLevel || parseInt(lastSeenLevel) < level) {
 // Tunda eksekusi sedikit untuk hindari konflik render React.
 setTimeout(() => setShow(true), 0);
 // Putar efek suara sukses.
 sounds?.playSuccess();
 
 // Simpan level baru ke lokal agar tidak muncul berulang.
 localStorage.setItem("nihongoroute_last_seen_level", level.toString());

 // Tutup overlay otomatis setelah 8 detik.
 const timer = setTimeout(() => setShow(false), 8000);
 return () => clearTimeout(timer);
 }
 }, [level]);

 return { show, setShow };
}
