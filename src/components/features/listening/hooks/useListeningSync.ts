/**
 * @file useListeningSync.ts
 * @description Hook kustom untuk menyinkronkan waktu pemutaran audio dengan baris transkrip aktif.
 * Mengelola pembaruan waktu audio (currentTime) dan navigasi linear (seekToLine).
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { useState, useCallback, useMemo } from "react";
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
  const [currentTime, setCurrentTime] = useState(0);
  const [externalSeek, setExternalSeek] = useState<number | undefined>(undefined);

  // Mencari baris yang sedang aktif secara efisien berdasarkan detik pemutaran audio saat ini
  const activeIndex = useMemo(() => {
    return transcript.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );
  }, [currentTime, transcript]);

  // Memperbarui waktu aktif pemutaran audio dan mereset lompatan eksternal
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    setExternalSeek(undefined);
  }, []);

  // Melompat ke baris tertentu berdasarkan waktu mulai baris transkrip tersebut
  const seekToLine = useCallback((startTime: number) => {
    setExternalSeek(startTime);
    setCurrentTime(startTime);
  }, []);

  return {
    currentTime,
    activeIndex,
    externalSeek,
    handleTimeUpdate,
    seekToLine,
  };
}

