import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore } from "@/store/useProgressStore";
import { createNewCardState } from "@/lib/srs";

describe("store/useProgressStore", () => {
  // Reset store sebelum setiap test
  beforeEach(() => {
    useProgressStore.setState({
      progress: {
        xp: 0,
        level: 1,
        streak: 0,
        todayReviewCount: 0,
        lastStudyDate: null,
        studyDays: {},
        srs: {},
      },
      loading: true,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });
  });

  // ========================================
  // State Awal
  // ========================================
  describe("state awal", () => {
    it("memiliki progress default", () => {
      const { progress } = useProgressStore.getState();
      expect(progress.xp).toBe(0);
      expect(progress.level).toBe(1);
      expect(progress.streak).toBe(0);
    });

    it("memiliki loading = true", () => {
      expect(useProgressStore.getState().loading).toBe(true);
    });

    it("memiliki isAuthenticated = false", () => {
      expect(useProgressStore.getState().isAuthenticated).toBe(false);
    });
  });

  // ========================================
  // setProgress
  // ========================================
  describe("setProgress", () => {
    it("mengupdate seluruh objek progress", () => {
      const newProgress = {
        xp: 500,
        level: 4,
        streak: 5,
        todayReviewCount: 10,
        lastStudyDate: "2026-05-01",
        studyDays: { "2026-05-01": 10 },
        srs: {},
      };

      useProgressStore.getState().setProgress(newProgress);
      expect(useProgressStore.getState().progress).toEqual(newProgress);
    });
  });

  // ========================================
  // setLoading
  // ========================================
  describe("setLoading", () => {
    it("mengubah status loading", () => {
      useProgressStore.getState().setLoading(false);
      expect(useProgressStore.getState().loading).toBe(false);
    });
  });

  // ========================================
  // setAuth
  // ========================================
  describe("setAuth", () => {
    it("mengatur status autentikasi", () => {
      useProgressStore.getState().setAuth(true, "Taro Yamada");
      const state = useProgressStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.userFullName).toBe("Taro Yamada");
    });

    it("bisa di-set ke false/null", () => {
      useProgressStore.getState().setAuth(true, "Taro");
      useProgressStore.getState().setAuth(false, null);
      const state = useProgressStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userFullName).toBeNull();
    });
  });

  // ========================================
  // updateProgress
  // ========================================
  describe("updateProgress", () => {
    it("mengupdate XP dan menghitung level otomatis", () => {
      useProgressStore.getState().updateProgress(200, {});
      const { progress } = useProgressStore.getState();
      expect(progress.xp).toBe(200);
      // calculateLevel(200) = floor(sqrt(200/50)) + 1 = floor(2) + 1 = 3
      expect(progress.level).toBe(3);
    });

    it("menambah todayReviewCount saat SRS berubah", () => {
      const newSrs = { word1: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().progress.todayReviewCount).toBe(1);
    });

    it("menambah streak saat hari pertama belajar", () => {
      const newSrs = { word1: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().progress.streak).toBe(1);
    });

    it("menambah streak saat belajar hari berturut-turut", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Simulasi state kemarin
      useProgressStore.setState({
        progress: {
          ...useProgressStore.getState().progress,
          streak: 3,
          lastStudyDate: yesterdayStr,
        },
      });

      const newSrs = { word1: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().progress.streak).toBe(4);
    });

    it("mereset streak jika bolos lebih dari sehari", () => {
      // Set lastStudyDate ke 3 hari lalu
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

      useProgressStore.setState({
        progress: {
          ...useProgressStore.getState().progress,
          streak: 10,
          lastStudyDate: threeDaysAgoStr,
        },
      });

      const newSrs = { word1: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().progress.streak).toBe(1);
    });

    it("menandai word ID sebagai dirty saat SRS berubah", () => {
      const newSrs = { word1: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().dirtySrs.has("word1")).toBe(true);
    });

    it("tidak menambah todayReviewCount saat SRS tidak berubah", () => {
      // Update dengan SRS kosong (tidak ada perubahan)
      useProgressStore.getState().updateProgress(100, {});
      expect(useProgressStore.getState().progress.todayReviewCount).toBe(0);
    });

    it("mengupdate studyDays dengan hitungan aktivitas", () => {
      const today = new Date().toISOString().split("T")[0];
      const newSrs = { word1: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().progress.studyDays[today]).toBe(1);
    });

    it("mengakumulasi hitungan studyDays di hari yang sama", () => {
      const today = new Date().toISOString().split("T")[0];

      // Set lastStudyDate ke hari ini agar tidak reset streak
      useProgressStore.setState({
        progress: {
          ...useProgressStore.getState().progress,
          lastStudyDate: today,
          studyDays: { [today]: 5 },
        },
      });

      const newSrs = { word2: createNewCardState() };
      useProgressStore.getState().updateProgress(10, newSrs);
      expect(useProgressStore.getState().progress.studyDays[today]).toBe(6);
    });
  });

  // ========================================
  // addToSRS
  // ========================================
  describe("addToSRS", () => {
    it("menambahkan kartu baru ke SRS", () => {
      useProgressStore.getState().addToSRS("kanji-fire");
      const { srs } = useProgressStore.getState().progress;
      expect(srs["kanji-fire"]).toBeDefined();
      expect(srs["kanji-fire"].interval).toBe(1);
      expect(srs["kanji-fire"].repetition).toBe(0);
    });

    it("tidak menimpa kartu yang sudah ada", () => {
      const existingState = createNewCardState();
      existingState.repetition = 5;
      existingState.interval = 20;

      useProgressStore.setState({
        progress: {
          ...useProgressStore.getState().progress,
          srs: { "kanji-fire": existingState },
        },
      });

      useProgressStore.getState().addToSRS("kanji-fire");
      expect(useProgressStore.getState().progress.srs["kanji-fire"].repetition).toBe(5);
    });
  });

  // ========================================
  // importData / exportData
  // ========================================
  describe("importData", () => {
    it("mengimpor data valid dan mengembalikan true", () => {
      const data = JSON.stringify({ xp: 999, level: 5, streak: 3, todayReviewCount: 0, lastStudyDate: null, studyDays: {}, srs: {} });
      const result = useProgressStore.getState().importData(data);
      expect(result).toBe(true);
      expect(useProgressStore.getState().progress.xp).toBe(999);
    });

    it("menolak data tanpa field xp", () => {
      const data = JSON.stringify({ streak: 3 });
      const result = useProgressStore.getState().importData(data);
      expect(result).toBe(false);
    });

    it("menolak data dengan xp non-numerik", () => {
      const data = JSON.stringify({ xp: "not a number" });
      const result = useProgressStore.getState().importData(data);
      expect(result).toBe(false);
    });

    it("menolak JSON yang rusak", () => {
      const result = useProgressStore.getState().importData("{invalid-json}}}");
      expect(result).toBe(false);
    });
  });

  // ========================================
  // clearDirtySrs
  // ========================================
  describe("clearDirtySrs", () => {
    it("mengosongkan set dirtySrs", () => {
      useProgressStore.setState({ dirtySrs: new Set(["a", "b", "c"]) });
      useProgressStore.getState().clearDirtySrs();
      expect(useProgressStore.getState().dirtySrs.size).toBe(0);
    });
  });
});
