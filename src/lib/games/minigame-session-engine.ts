/**
 * @file minigame-session-engine.ts
 * @description Core domain engine seam untuk mengelola mekanika minigame (Survival Mode, Sentence Builder, Drill),
 * mencakup manajemen nyawa (lives), kombo multiplier, penalti kesalahan, dan kalkulasi XP.
 * 100% bebas dari ketergantungan React DOM/hooks untuk keterujian murni via Vitest.
 */

export interface MiniGameConfig {
 initialLives?: number;
 baseScorePerCorrect?: number;
 maxComboMultiplier?: number;
}

export interface MiniGameStats {
 score: number;
 combo: number;
 maxCombo: number;
 lives: number;
 correctAnswers: number;
 totalAttempts: number;
}

export class MiniGameSessionEngine {
 private initialLives: number;
 private baseScorePerCorrect: number;
 private maxComboMultiplier: number;
 private stats: MiniGameStats;
 private isGameOverState: boolean = false;

 constructor(config: MiniGameConfig = {}) {
 this.initialLives = config.initialLives ?? 3;
 this.baseScorePerCorrect = config.baseScorePerCorrect ?? 100;
 this.maxComboMultiplier = config.maxComboMultiplier ?? 3.0;

 this.stats = {
 score: 0,
 combo: 0,
 maxCombo: 0,
 lives: this.initialLives,
 correctAnswers: 0,
 totalAttempts: 0,
 };
 }

 public getStats(): MiniGameStats {
 return { ...this.stats };
 }

 public isGameOver(): boolean {
 return this.isGameOverState || this.stats.lives <= 0;
 }

 public getMultiplier(): number {
 if (this.stats.combo < 3) return 1.0;
 if (this.stats.combo < 5) return 1.5;
 if (this.stats.combo < 10) return 2.0;
 return Math.min(3.0, this.maxComboMultiplier);
 }

 public recordAnswer(isCorrect: boolean): { pointsEarned: number; isGameOver: boolean } {
 if (this.isGameOver()) {
 return { pointsEarned: 0, isGameOver: true };
 }

 this.stats.totalAttempts += 1;

 if (isCorrect) {
 this.stats.correctAnswers += 1;
 this.stats.combo += 1;
 if (this.stats.combo > this.stats.maxCombo) {
 this.stats.maxCombo = this.stats.combo;
 }

 const multiplier = this.getMultiplier();
 const pointsEarned = Math.round(this.baseScorePerCorrect * multiplier);
 this.stats.score += pointsEarned;

 return { pointsEarned, isGameOver: false };
 } else {
 this.stats.combo = 0;
 this.stats.lives -= 1;

 if (this.stats.lives <= 0) {
 this.isGameOverState = true;
 }

 return { pointsEarned: 0, isGameOver: this.isGameOverState };
 }
 }

 public calculateRewardXP(): number {
 const accuracy = this.stats.totalAttempts > 0 ? this.stats.correctAnswers / this.stats.totalAttempts : 0;
 const baseXP = this.stats.correctAnswers * 15;
 const comboBonus = Math.min(50, this.stats.maxCombo * 5);
 const accuracyBonus = accuracy >= 0.8 && this.stats.totalAttempts >= 5 ? 25 : 0;

 return baseXP + comboBonus + accuracyBonus;
 }

 public resetGame(): void {
 this.isGameOverState = false;
 this.stats = {
 score: 0,
 combo: 0,
 maxCombo: 0,
 lives: this.initialLives,
 correctAnswers: 0,
 totalAttempts: 0,
 };
 }
}
