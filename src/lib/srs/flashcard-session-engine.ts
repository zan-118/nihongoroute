import { updateCardState, SRSState } from "@/lib/learning/srs";
import type { MasterCardData } from "@/features/review/flashcards/master/types";

/**
 * @file flashcard-session-engine.ts
 * @description Core domain engine seam untuk sesi latihan Flashcard & Spaced Repetition System (SRS).
 * Bebas dari ketergantungan React DOM/hooks sehingga 100% teruji via Vitest.
 */

export interface FlashcardSessionStats {
 known: number;
 learning: number;
 xpGained: number;
 combo: number;
 maxCombo: number;
 accuracy: number;
 totalAnswers: number;
}

export interface FlashcardAnswerResult {
 isCorrect: boolean;
 xpReward: number;
 newState: SRSState;
 stats: FlashcardSessionStats;
}

export class FlashcardSessionEngine {
 private cards: MasterCardData[];
 private currentIndex: number = 0;
 private mistakeIndices: Set<number> = new Set();
 private stats: FlashcardSessionStats = {
 known: 0,
 learning: 0,
 xpGained: 0,
 combo: 0,
 maxCombo: 0,
 accuracy: 100,
 totalAnswers: 0,
 };
 private isFinishedState: boolean = false;

 constructor(cards: MasterCardData[], initialIndex: number = 0) {
 this.cards = cards;
 this.currentIndex = initialIndex;
 }

 public getCards(): MasterCardData[] {
 return this.cards;
 }

 public getCurrentIndex(): number {
 return this.currentIndex;
 }

 public getCurrentCard(): MasterCardData | undefined {
 return this.cards[this.currentIndex];
 }

 public getStats(): FlashcardSessionStats {
 return { ...this.stats };
 }

 public getMistakeIndices(): number[] {
 return Array.from(this.mistakeIndices);
 }

 public isFinished(): boolean {
 return this.isFinishedState || this.cards.length === 0;
 }

 /**
 * Evaluates SRS answer grade (0: Again, 1: Hard, 2: Good, 3: Easy)
 */
 public processGrade(grade: number, currentState: SRSState): FlashcardAnswerResult {
 const card = this.getCurrentCard();
 const isCorrect = grade >= 2;
 const xpRewards = [5, 10, 15, 20];
 const xpReward = xpRewards[grade] ?? 15;

 // Update internal stats
 this.stats.totalAnswers += 1;
 if (isCorrect) {
 this.stats.known += 1;
 this.stats.combo += 1;
 if (this.stats.combo > this.stats.maxCombo) {
 this.stats.maxCombo = this.stats.combo;
 }
 this.stats.xpGained += xpReward;
 } else {
 this.stats.learning += 1;
 this.stats.combo = 0;
 this.mistakeIndices.add(this.currentIndex);
 }

 this.stats.accuracy = Math.round((this.stats.known / this.stats.totalAnswers) * 100);

 const newState = updateCardState(currentState, grade);

 return {
 isCorrect,
 xpReward,
 newState,
 stats: this.getStats(),
 };
 }

 public next(): boolean {
 if (this.currentIndex < this.cards.length - 1) {
 this.currentIndex += 1;
 return true;
 }
 this.isFinishedState = true;
 return false;
 }

 public resetSession(newCards?: MasterCardData[]): void {
 if (newCards) {
 this.cards = newCards;
 }
 this.currentIndex = 0;
 this.mistakeIndices.clear();
 this.isFinishedState = false;
 this.stats = {
 known: 0,
 learning: 0,
 xpGained: 0,
 combo: 0,
 maxCombo: 0,
 accuracy: 100,
 totalAnswers: 0,
 };
 }
}
