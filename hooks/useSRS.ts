// hooks/useSRS.ts
import { useState, useEffect } from "react";

export interface SRSItem {
  wordId: string;
  level: number; // 0 sampai 5
  nextReview: number; // Timestamp (kapan harus di-review lagi)
}

// Interval kenaikan level (dalam milidetik)
const SRS_INTERVALS = [
  1000 * 60 * 60 * 24 * 1, // Level 0 -> 1 (Besok)
  1000 * 60 * 60 * 24 * 3, // Level 1 -> 2 (3 hari lagi)
  1000 * 60 * 60 * 24 * 7, // Level 2 -> 3 (1 minggu lagi)
  1000 * 60 * 60 * 24 * 14, // Level 3 -> 4 (2 minggu lagi)
  1000 * 60 * 60 * 24 * 30, // Level 4 -> 5 (1 bulan lagi)
];

export function useSRS() {
  const [srsData, setSrsData] = useState<SRSItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data dari LocalStorage saat pertama kali render
  useEffect(() => {
    const savedData = localStorage.getItem("nihongo_srs");
    if (savedData) {
      try {
        setSrsData(JSON.parse(savedData));
      } catch (e) {
        console.error("Gagal membaca data SRS", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save ke LocalStorage setiap kali ada perubahan pada srsData
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nihongo_srs", JSON.stringify(srsData));
    }
  }, [srsData, isLoaded]);

  // Tambahkan kata baru ke sistem SRS
  const addWord = (wordId: string) => {
    setSrsData((prev) => {
      // Cek apakah sudah ada
      if (prev.find((item) => item.wordId === wordId)) return prev;

      const newItem: SRSItem = {
        wordId,
        level: 0,
        nextReview: Date.now(), // Langsung bisa di-review hari ini
      };
      return [...prev, newItem];
    });
  };

  // Cek apakah sebuah kata sudah ada di SRS
  const isWordInSRS = (wordId: string) => {
    return srsData.some((item) => item.wordId === wordId);
  };

  // Ambil semua kata yang jadwal review-nya sudah jatuh tempo (hari ini atau lewat)
  const getDueItems = () => {
    const now = Date.now();
    return srsData.filter((item) => item.nextReview <= now);
  };

  // Update status kata setelah user menjawab kuis
  const reviewWord = (wordId: string, isCorrect: boolean) => {
    setSrsData((prev) =>
      prev.map((item) => {
        if (item.wordId !== wordId) return item;

        let newLevel = item.level;
        if (isCorrect) {
          // Naik level mentok di level 5
          newLevel = Math.min(item.level + 1, SRS_INTERVALS.length);
        } else {
          // Jika salah, turun perlahan atau reset ke 0. Kita reset ke 0 agar agresif.
          newLevel = 0;
        }

        // Tentukan jadwal review berikutnya
        const delay =
          newLevel < SRS_INTERVALS.length
            ? SRS_INTERVALS[newLevel]
            : SRS_INTERVALS[SRS_INTERVALS.length - 1]; // Jika lulus mentok, review 1 bulan sekali

        return {
          ...item,
          level: newLevel,
          nextReview: Date.now() + delay,
        };
      }),
    );
  };

  return {
    srsData,
    isLoaded,
    addWord,
    isWordInSRS,
    getDueItems,
    reviewWord,
  };
}
