import { describe, it, expect } from "vitest";
import { MiniGameSessionEngine } from "@/lib/games/minigame-session-engine";

describe("MiniGameSessionEngine Seam", () => {
  it("harus menginisialisasi state minigame dan nyawa awal", () => {
    const engine = new MiniGameSessionEngine({ initialLives: 3 });
    const stats = engine.getStats();

    expect(stats.lives).toBe(3);
    expect(stats.score).toBe(0);
    expect(stats.combo).toBe(0);
    expect(engine.isGameOver()).toBe(false);
    expect(engine.getMultiplier()).toBe(1.0);
  });

  it("harus meningkatkan kombo multiplier saat jawaban benar berturut-turut", () => {
    const engine = new MiniGameSessionEngine({ baseScorePerCorrect: 100 });

    // 2 jawaban benar pertama (multiplier 1.0x)
    engine.recordAnswer(true);
    engine.recordAnswer(true);
    expect(engine.getStats().combo).toBe(2);
    expect(engine.getMultiplier()).toBe(1.0);

    // Jawaban benar ke-3 (multiplier 1.5x)
    const res3 = engine.recordAnswer(true);
    expect(res3.pointsEarned).toBe(150);
    expect(engine.getMultiplier()).toBe(1.5);

    // Jawaban benar ke-5 (multiplier 2.0x)
    engine.recordAnswer(true);
    const res5 = engine.recordAnswer(true);
    expect(res5.pointsEarned).toBe(200);
    expect(engine.getMultiplier()).toBe(2.0);
  });

  it("harus mengurai nyawa saat salah dan memicu game over saat nyawa habis", () => {
    const engine = new MiniGameSessionEngine({ initialLives: 2 });

    const res1 = engine.recordAnswer(false);
    expect(res1.isGameOver).toBe(false);
    expect(engine.getStats().lives).toBe(1);
    expect(engine.getStats().combo).toBe(0);

    const res2 = engine.recordAnswer(false);
    expect(res2.isGameOver).toBe(true);
    expect(engine.getStats().lives).toBe(0);
    expect(engine.isGameOver()).toBe(true);
  });

  it("harus menghitung bonus XP berdasarkan akurasi dan max combo", () => {
    const engine = new MiniGameSessionEngine();
    for (let i = 0; i < 5; i++) {
      engine.recordAnswer(true);
    }

    const xp = engine.calculateRewardXP();
    // 5 * 15 = 75 (base) + 25 (max combo 5 * 5) + 25 (accuracy 100%) = 125 XP
    expect(xp).toBe(125);
  });
});
