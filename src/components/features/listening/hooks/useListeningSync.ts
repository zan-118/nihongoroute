/**
 * @file useListeningSync.ts
 * @description Hook kustom untuk menyinkronkan waktu pemutaran audio dengan baris transkrip aktif.
 * Mengelola pembaruan waktu audio (currentTime) dan navigasi linear (seekToLine).
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { useState, useCallback, useRef } from "react";
import { TranscriptLine } from "../types";

// ==========================================
// HOOK UTAMA: useListeningSync
// ==========================================
/**
 * Hook kustom untuk sinkronisasi waktu karaoke latihan menyimak.
 * 
 * @param {TranscriptLine[]} transcript Array baris transkrip beserta metadata waktunya.
 * @returns {Object} State dan aksi sinkronisasi menyimak:
 *  - `currentTime`: Detik aktif waktu audio saat ini.
 *  - `activeIndex`: Indeks baris transkrip yang sedang diucapkan.
 *  - `externalSeek`: Target waktu pemutaran baru (jika ada lompatan audio).
 *  - `handleTimeUpdate`: Handler untuk memperbarui state detik audio.
 *  - `seekToLine`: Fungsi lompat pemutaran audio ke awal baris transkrip tertentu.
 */
export function useListeningSync(transcript: TranscriptLine[]) {
  const currentTimeRef = useRef(0);
  const activeIndexRef = useRef(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [externalSeek, setExternalSeek] = useState<number | undefined>(undefined);

  const syncActiveIndex = useCallback((time: number, forceTimeUpdate = false) => {
    const nextIndex = transcript.findIndex(
      (line) => time >= line.startTime && time <= line.endTime
    );

    if (forceTimeUpdate) {
      setCurrentTime(time);
    }

    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      if (!forceTimeUpdate) {
        setCurrentTime(time);
      }
      setActiveIndex(nextIndex);
    }
  }, [transcript]);

  // Memperbarui waktu aktif pemutaran audio dan mereset lompatan eksternal
  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time;
    syncActiveIndex(time);
    setExternalSeek((current) => current === undefined ? current : undefined);
  }, [syncActiveIndex]);

  // Melompat ke baris tertentu berdasarkan waktu mulai baris transkrip tersebut
  const seekToLine = useCallback((startTime: number) => {
    setExternalSeek(startTime);
    currentTimeRef.current = startTime;
    syncActiveIndex(startTime, true);
  }, [syncActiveIndex]);

  return {
    currentTime,
    activeIndex,
    externalSeek,
    handleTimeUpdate,
    seekToLine,
  };
}
