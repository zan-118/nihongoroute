/**
 * @file useLevelUpOverlay.ts
 * @description Hook kustom (Custom Hook) untuk mengontrol pemicuan overlay kenaikan level (Level Up).
 * Menyimpan informasi level terakhir di localStorage untuk mencegah pemicuan berulang dan memainkan efek suara keberhasilan.
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect } from "react";
import { sounds } from "@/lib/audio";

// ======================
// HOOK UTAMA
// ======================
export function useLevelUpOverlay(level: number) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level <= 1) return;

    // Periksa apakah kita sudah menampilkan level ini
    const lastSeenLevel = localStorage.getItem("nihongoroute_last_seen_level");
    
    if (!lastSeenLevel || parseInt(lastSeenLevel) < level) {
      setTimeout(() => setShow(true), 0);
      sounds?.playSuccess();
      
      // Tandai level ini sebagai telah dilihat
      localStorage.setItem("nihongoroute_last_seen_level", level.toString());

      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return { show, setShow };
}
