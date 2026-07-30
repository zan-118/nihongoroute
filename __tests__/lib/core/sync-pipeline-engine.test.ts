import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  scheduleDebouncedSync,
  cancelPendingSyncTimer,
  broadcastMultiTabSync,
  reconcileAcceptedXp,
  dispatchSyncEvent,
  SYNC_CHANNEL_NAME,
} from "@/lib/core/sync-pipeline-engine";

describe("SyncPipelineEngine Unit Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cancelPendingSyncTimer();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("scheduleDebouncedSync & dispatchSyncEvent", () => {
    it("harus menunda eksekusi callback selama 2000ms secara default", () => {
      const callback = vi.fn();
      scheduleDebouncedSync(callback);

      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("harus membatalkan timer sebelumnya jika ada pemicuan baru", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      scheduleDebouncedSync(callback1);
      vi.advanceTimersByTime(1000);
      scheduleDebouncedSync(callback2);

      vi.advanceTimersByTime(1500);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("harus mengeksekusi via seam dispatchSyncEvent", () => {
      const triggerSync = vi.fn();
      dispatchSyncEvent({ triggerSync, debounceMs: 500 });

      vi.advanceTimersByTime(500);
      expect(triggerSync).toHaveBeenCalledTimes(1);
    });
  });

  describe("reconcileAcceptedXp (Anti-Cheat)", () => {
    it("harus memperbarui XP lokal jika accepted_xp valid", () => {
      const updateLocalXp = vi.fn();
      reconcileAcceptedXp(150, updateLocalXp);
      expect(updateLocalXp).toHaveBeenCalledWith(150);
    });

    it("tidak boleh memperbarui XP lokal jika accepted_xp undefined atau NaN", () => {
      const updateLocalXp = vi.fn();
      reconcileAcceptedXp(undefined, updateLocalXp);
      reconcileAcceptedXp(NaN, updateLocalXp);
      expect(updateLocalXp).not.toHaveBeenCalled();
    });
  });

  describe("broadcastMultiTabSync", () => {
    it("harus menembakkan pesan BroadcastChannel jika window.BroadcastChannel tersedia", () => {
      const postMessageMock = vi.fn();
      const closeMock = vi.fn();

      class MockBroadcastChannel {
        name: string;
        constructor(name: string) {
          this.name = name;
        }
        postMessage = postMessageMock;
        close = closeMock;
      }

      vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

      broadcastMultiTabSync("SYNC_COMPLETE");

      expect(postMessageMock).toHaveBeenCalledWith("SYNC_COMPLETE");
      expect(closeMock).toHaveBeenCalled();
    });
  });
});
