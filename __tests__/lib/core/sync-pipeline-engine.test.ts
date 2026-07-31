import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  scheduleDebouncedSync,
  broadcastMultiTabSync,
  reconcileAcceptedXp,
  ProgressSyncEngine,
} from "@/lib/core/sync-pipeline-engine";

describe("Sync Pipeline Engine Seam", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("scheduleDebouncedSync", () => {
    it("harus menunda eksekusi callback sesuai delay debounce", () => {
      const callback = vi.fn();
      scheduleDebouncedSync(callback, 2000);

      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("harus membatalkan timer sebelumnya jika ada pemicuan baru", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      scheduleDebouncedSync(callback1, 2000);
      vi.advanceTimersByTime(1000);

      scheduleDebouncedSync(callback2, 2000);
      vi.advanceTimersByTime(2000);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("reconcileAcceptedXp (Anti-Cheat)", () => {
    it("harus memperbarui XP lokal jika accepted_xp valid", () => {
      const updateLocalXp = vi.fn();
      reconcileAcceptedXp(150, updateLocalXp);

      expect(updateLocalXp).toHaveBeenCalledWith(150);
    });

    it("harus mengabaikan accepted_xp jika bernilai undefined/NaN", () => {
      const updateLocalXp = vi.fn();
      reconcileAcceptedXp(undefined, updateLocalXp);
      reconcileAcceptedXp(NaN, updateLocalXp);

      expect(updateLocalXp).not.toHaveBeenCalled();
    });
  });

  describe("ProgressSyncEngine", () => {
    it("harus mengelola penjadwalan dan pembatalan sync terpusat", async () => {
      const engine = new ProgressSyncEngine({ debounceMs: 1000 });
      const task = vi.fn().mockResolvedValue(undefined);

      engine.scheduleSync(task);
      expect(task).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);
      expect(task).toHaveBeenCalledTimes(1);
      expect(engine.getLastSyncedAt()).not.toBeNull();

      engine.dispose();
    });

    it("harus mengeksekusi sync secara langsung dengan executeSync dan menyiarkan sinyal", async () => {
      const engine = new ProgressSyncEngine();
      const task = vi.fn().mockResolvedValue(undefined);

      expect(engine.isSyncing()).toBe(false);
      const promise = engine.executeSync(task);
      expect(engine.isSyncing()).toBe(true);

      await promise;
      expect(engine.isSyncing()).toBe(false);
      expect(engine.getLastSyncedAt()).toBeGreaterThan(0);

      engine.dispose();
    });

    it("harus mengabstraksikan rekonsiliasi XP anti-cheat", () => {
      const engine = new ProgressSyncEngine();
      const mockUpdate = vi.fn();

      engine.reconcileAntiCheatXp(250, mockUpdate);
      expect(mockUpdate).toHaveBeenCalledWith(250);

      engine.dispose();
    });

    it("harus membersihkan timer saat dispose dipanggil", () => {
      const engine = new ProgressSyncEngine({ debounceMs: 1000 });
      const task = vi.fn();

      engine.scheduleSync(task);
      engine.dispose();

      vi.advanceTimersByTime(1000);
      expect(task).not.toHaveBeenCalled();
    });
  });
});
