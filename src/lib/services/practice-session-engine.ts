/**
 * @file practice-session-engine.ts
 * @description Modul dalam (Deep Module) yang mengapsulasi seluruh logika penyusunan dek latihan interaktif,
 * pemilihan opsi distraksi adaptif (tanpa duplikasi jawaban benar), serta evaluasi skor dan perolehan XP sesi.
 */

export interface AssembleDeckOptions<T> {
 items: T[];
 limit?: number;
 shuffle?: boolean;
}

export interface AdaptiveDistractorOptions<T> {
 target: T;
 candidatePool: T[];
 getKey: (item: T) => string;
 count?: number;
}

export interface EvaluateSessionParams {
 totalQuestions: number;
 correctCount: number;
 durationSeconds?: number;
 xpPerCorrect?: number;
}

export interface SessionEvaluationResult {
 accuracy: number;
 totalXp: number;
 speedBonus: number;
 isPerfect: boolean;
}

/**
 * Fisher-Yates shuffle algorithm for arrays.
 */
export function shuffleArray<T>(array: T[]): T[] {
 const result = [...array];
 for (let i = result.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [result[i], result[j]] = [result[j], result[i]];
 }
 return result;
}

/**
 * Assemble practice deck with item limits and optional shuffling.
 *
 * @param options Options containing item pool, item limit, and shuffle flag.
 * @returns Array of practice items.
 */
export function assemblePracticeDeck<T>(options: AssembleDeckOptions<T>): T[] {
 const { items, limit, shuffle = true } = options;
 if (!items || items.length === 0) return [];

 let deck = shuffle ? shuffleArray(items) : [...items];

 if (limit && limit > 0 && limit < deck.length) {
 deck = deck.slice(0, limit);
 }

 return deck;
}

/**
 * Generate adaptive distractor choices without duplicating the correct target item.
 *
 * @param options Options containing target, candidate pool, key extractor, and distractor count.
 * @returns Array of distractor items.
 */
export function generateAdaptiveDistractors<T>(options: AdaptiveDistractorOptions<T>): T[] {
 const { target, candidatePool, getKey, count = 3 } = options;
 const targetKey = getKey(target);

 const validCandidates = candidatePool.filter((item) => getKey(item) !== targetKey);
 const shuffledCandidates = shuffleArray(validCandidates);

 // Deduplicate candidates by key
 const uniqueDistractors: T[] = [];
 const seenKeys = new Set<string>();

 for (const candidate of shuffledCandidates) {
 const key = getKey(candidate);
 if (!seenKeys.has(key)) {
 seenKeys.add(key);
 uniqueDistractors.push(candidate);
 }
 if (uniqueDistractors.length >= count) break;
 }

 return uniqueDistractors;
}

/**
 * Evaluate practice session performance, calculating accuracy percentage, total XP, and speed bonuses.
 *
 * @param params Session stats containing total questions, correct answers, and duration.
 * @returns Evaluation metrics object.
 */
export function evaluateSessionScore(params: EvaluateSessionParams): SessionEvaluationResult {
 const { totalQuestions, correctCount, durationSeconds = 0, xpPerCorrect = 10 } = params;

 if (totalQuestions <= 0) {
 return { accuracy: 0, totalXp: 0, speedBonus: 0, isPerfect: false };
 }

 const safeCorrect = Math.max(0, Math.min(correctCount, totalQuestions));
 const accuracy = Math.round((safeCorrect / totalQuestions) * 100);
 const isPerfect = safeCorrect === totalQuestions;

 const baseXp = safeCorrect * xpPerCorrect;

 // Calculate speed bonus if completed fast (< 5s per question on average)
 let speedBonus = 0;
 if (isPerfect && durationSeconds > 0 && durationSeconds < totalQuestions * 5) {
 speedBonus = 20;
 }

 const totalXp = baseXp + speedBonus + (isPerfect ? 10 : 0);

 return {
 accuracy,
 totalXp,
 speedBonus,
 isPerfect,
 };
}
