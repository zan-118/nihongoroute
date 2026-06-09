import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { createNewCardState } from "@/lib/srs";
import { UserProgress } from "@/store/types";

describe("useSRSStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00Z").getTime());

    useSRSStore.getState().resetSRS();
    useUserStore.getState().resetUser();
    useUIStore.setState({ notifications: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memiliki state default yang benar", () => {
    const state = useSRSStore.getState();
    expect(state.srs).toEqual({});
    expect(state.dirtySrs.size).toBe(0);
  });

  it("addToSRS menambahkan kata baru ke dalam srs dengan state default", () => {
    useSRSStore.getState().addToSRS("word-1");

    const state = useSRSStore.getState();
    expect(state.srs["word-1"]).toBeDefined();
    expect(state.srs["word-1"].interval).toBe(1);
    expect(state.srs["word-1"].repetition).toBe(0);
    expect(state.dirtySrs.has("word-1")).toBe(true);
  });

  it("removeFromSRS menandai kartu isDeleted dan menambahkannya ke daftar dirty", () => {
    // Tambah dulu
    useSRSStore.getState().addToSRS("word-1");
    useSRSStore.getState().clearDirtySrs(); // Bersihkan dirty untuk pengujian remove

    useSRSStore.getState().removeFromSRS("word-1");

    const state = useSRSStore.getState();
    expect(state.srs["word-1"].isDeleted).toBe(true);
    expect(state.dirtySrs.has("word-1")).toBe(true);
  });

  it("updateProgress memicu penambahan XP pada user store", () => {
    const cardState = createNewCardState();
    
    // Memberikan XP baru = 100
    useSRSStore.getState().updateProgress(100, { "word-1": cardState });

    expect(useUserStore.getState().xp).toBe(100);
    expect(useSRSStore.getState().srs["word-1"]).toEqual(cardState);
    expect(useSRSStore.getState().dirtySrs.has("word-1")).toBe(true);
  });

  describe("mergeProgress (Cloud-Sync Merge Logic)", () => {
    it("mergeProgress menggabungkan data awan jika timestamp awan lebih baru", () => {
      // 1. Inisialisasi local srs dengan timestamp lama
      const localState = {
        ...createNewCardState(),
        interval: 3,
        updatedAt: Date.now() - 50000,
      };
      useSRSStore.setState({
        srs: { "word-1": localState },
        dirtySrs: new Set(["word-1"]),
      });

      // 2. Data dari cloud dengan timestamp baru
      const cloudState = {
        ...createNewCardState(),
        interval: 10,
        updatedAt: Date.now() - 1000,
      };

      const mockCloudData: UserProgress = {
        id: "user-123",
        isGuest: false,
        name: "Ahmad Cloud",
        xp: 1500,
        level: 6,
        streak: 12,
        todayReviewCount: 5,
        lastStudyDate: "2026-05-20",
        studyDays: { "2026-05-20": 1 },
        srs: { "word-1": cloudState },
        completedLessons: {},
        notifications: [],
        inventory: { streakFreeze: 2 },
        settings: { notificationsEnabled: true },
      };

      useSRSStore.getState().mergeProgress(mockCloudData);

      // Verifikasi data srs lokal di-update ke data cloud (karena cloud lebih baru)
      expect(useSRSStore.getState().srs["word-1"].interval).toBe(10);
      // Karena data cloud diaplikasikan, status dirty lokal dihapus
      expect(useSRSStore.getState().dirtySrs.has("word-1")).toBe(false);

      // Verifikasi data user store ter-update
      expect(useUserStore.getState().xp).toBe(1500);
      expect(useUserStore.getState().level).toBe(6);
      expect(useUserStore.getState().name).toBe("Ahmad Cloud");
    });

    it("mergeProgress mempertahankan data lokal jika timestamp lokal lebih baru dan menandainya dirty", () => {
      // 1. Inisialisasi local srs dengan timestamp baru
      const localState = {
        ...createNewCardState(),
        interval: 8,
        updatedAt: Date.now() - 1000,
      };
      useSRSStore.setState({
        srs: { "word-1": localState },
        dirtySrs: new Set(["word-1"]),
      });

      // 2. Data dari cloud dengan timestamp lama
      const cloudState = {
        ...createNewCardState(),
        interval: 3,
        updatedAt: Date.now() - 50000,
      };

      const mockCloudData: UserProgress = {
        id: "user-123",
        isGuest: false,
        name: "Ahmad Cloud",
        xp: 1500,
        level: 6,
        streak: 12,
        todayReviewCount: 5,
        lastStudyDate: "2026-05-20",
        studyDays: { "2026-05-20": 1 },
        srs: { "word-1": cloudState },
        completedLessons: {},
        notifications: [],
        inventory: { streakFreeze: 2 },
        settings: { notificationsEnabled: true },
      };

      useSRSStore.getState().mergeProgress(mockCloudData);

      // Verifikasi data srs lokal dipertahankan karena lebih baru
      expect(useSRSStore.getState().srs["word-1"].interval).toBe(8);
      // Status dirty harus tetap ada agar nanti disinkronkan ke cloud
      expect(useSRSStore.getState().dirtySrs.has("word-1")).toBe(true);
    });

    it("mergeProgress mempertahankan tombstone delete lokal jika kartu masih ada di awan", () => {
      const localState = {
        ...createNewCardState(),
        isDeleted: true,
        updatedAt: Date.now(),
      };
      useSRSStore.setState({
        srs: { "word-1": localState },
        dirtySrs: new Set(["word-1"]),
      });

      const cloudState = {
        ...createNewCardState(),
        interval: 7,
        updatedAt: Date.now() - 50000,
      };

      const mockCloudData: UserProgress = {
        id: "user-123",
        isGuest: false,
        name: "Ahmad Cloud",
        xp: 1500,
        level: 6,
        streak: 12,
        todayReviewCount: 5,
        lastStudyDate: "2026-05-20",
        studyDays: { "2026-05-20": 1 },
        srs: { "word-1": cloudState },
        completedLessons: {},
        notifications: [],
        inventory: { streakFreeze: 2 },
        settings: { notificationsEnabled: true },
      };

      useSRSStore.getState().mergeProgress(mockCloudData);

      const state = useSRSStore.getState();
      expect(state.srs["word-1"].isDeleted).toBe(true);
      expect(state.dirtySrs.has("word-1")).toBe(true);
    });
  });
});
