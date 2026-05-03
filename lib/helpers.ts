/**
 * @file helpers.ts
 * @description Koleksi fungsi murni (pure functions) untuk manipulasi data, string, atau tanggal.
 */

/**
 * Mengembalikan string tanggal hari ini dalam format YYYY-MM-DD.
 * Berguna untuk key local storage yang bersifat harian.
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
};

/**
 * Memformat jumlah detik menjadi string waktu MM:SS.
 */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Mengacak urutan elemen dalam sebuah array.
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
