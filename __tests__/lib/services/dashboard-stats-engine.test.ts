import { describe, it, expect } from "vitest";
import {
  formatUserIdentifier,
  buildProgressSummary,
  calculateDashboardLevelMetrics,
  calculateDashboardStreakMetrics,
  calculateDashboardGoalMetrics,
} from "@/features/dashboard/dashboard-stats-engine";

describe("DashboardStatsEngine Seam", () => {
  describe("formatUserIdentifier", () => {
    it("harus memformat ID terautentikasi dengan awalan ST-", () => {
      expect(formatUserIdentifier("abcdef123456", true)).toBe("ST-ABCDEF12");
    });

    it("harus mengembalikan rawId jika tidak terautentikasi", () => {
      expect(formatUserIdentifier("guest-id-1", false)).toBe("guest-id-1");
    });
  });

  describe("buildProgressSummary", () => {
    it("harus menyusun summary progres pengguna dengan nilai fallback yang aman", () => {
      const summary = buildProgressSummary({ xp: 120, name: "Taro" });

      expect(summary.name).toBe("Taro");
      expect(summary.xp).toBe(120);
      expect(summary.level).toBeGreaterThan(1);
      expect(summary.inventory.streakFreeze).toBe(0);
    });
  });

  describe("calculateDashboardLevelMetrics", () => {
    it("harus menghitung level, ambang XP, dan persentase progres level dengan benar", () => {
      const metrics = calculateDashboardLevelMetrics(100);

      expect(metrics.currentLevel).toBe(2);
      expect(metrics.currentLevelXp).toBe(50);
      expect(metrics.nextLevelXp).toBe(200);
      // (100 - 50) / (200 - 50) = 50 / 150 = 33.33% -> 33%
      expect(metrics.progressPercent).toBe(33);
    });
  });

  describe("calculateDashboardStreakMetrics", () => {
    it("harus mendeteksi status belajar hari ini", () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const streakMetrics = calculateDashboardStreakMetrics(5, todayStr, 2);

      expect(streakMetrics.streak).toBe(5);
      expect(streakMetrics.hasStudiedToday).toBe(true);
      expect(streakMetrics.streakFreezeCount).toBe(2);
    });
  });

  describe("calculateDashboardGoalMetrics", () => {
    it("harus menghitung persentase target harian dan status pencapaian", () => {
      const goal = calculateDashboardGoalMetrics(15, 20);

      expect(goal.todayReviewCount).toBe(15);
      expect(goal.dailyTarget).toBe(20);
      expect(goal.goalPercent).toBe(75);
      expect(goal.isTargetReached).toBe(false);

      const perfectGoal = calculateDashboardGoalMetrics(25, 20);
      expect(perfectGoal.goalPercent).toBe(100);
      expect(perfectGoal.isTargetReached).toBe(true);
    });
  });
});
