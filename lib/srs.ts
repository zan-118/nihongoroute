/* ============================= */
/* TYPES */
/* ============================= */

export interface SRSState {
  interval: number; // Dalam satuan hari (days)
  repetition: number;
  easeFactor: number;
  nextReview: number; // Timestamp (ms)
}

/* ============================= */
/* CONSTANTS */
/* ============================= */

const DAY = 24 * 60 * 60 * 1000;
const MIN_EASE_FACTOR = 1.3;

/* ============================= */
/* CREATE NEW CARD */
/* ============================= */

export function createNewCardState(): SRSState {
  return {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  };
}

/* ============================= */
/* UPDATE CARD STATE (Modern SM-2) */
/* ============================= */

export function updateCardState(state: SRSState, correct: boolean): SRSState {
  let { repetition, interval, easeFactor } = state;

  if (!correct) {
    // MODERN PENALTY LOGIC
    // Alih-alih mereset interval ke 1, kita bagi dua (halving).
    // Mencegah frustrasi jika user lupa kartu "Master" yang intervalnya sudah puluhan hari.
    interval = Math.max(1, Math.floor(interval / 2));

    // Repetition direset ke 0 agar combo terputus,
    // tapi perhitungan interval selanjutnya tetap menggunakan sisa memori mereka.
    repetition = 0;

    // Penalti easeFactor (kartu akan muncul sedikit lebih sering dari biasanya)
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    repetition += 1;

    // Logika untuk kartu yang baru pertama kali dipelajari atau intervalnya memang masih 1
    if (repetition === 1 && interval === 1) {
      interval = 1;
    } else if (repetition === 2 && interval === 1) {
      interval = 3;
    } else {
      // Pertumbuhan interval yang natural berdasarkan easeFactor
      interval = Math.round(interval * easeFactor);
    }

    // Sedikit reward karena menjawab benar
    easeFactor += 0.05;
  }

  const nextReview = Date.now() + interval * DAY;

  return {
    repetition,
    interval,
    easeFactor,
    nextReview,
  };
}
