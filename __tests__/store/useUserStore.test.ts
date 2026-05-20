import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore, STREAK_FREEZE_COST } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";

describe("useUserStore", () => {
  beforeEach(() => {
    // Reset stores to default state
    useUserStore.getState().resetUser();
    useUIStore.setState({
      notifications: [],
    });
  });

  it("memiliki state default yang benar", () => {
    const state = useUserStore.getState();
    expect(state.id).toBe("guest");
    expect(state.isGuest).toBe(true);
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.todayReviewCount).toBe(0);
    expect(state.inventory.streakFreeze).toBe(0);
    expect(state.completedLessons).toEqual({});
    expect(state.dirtyLessons.size).toBe(0);
  });

  it("updateProfileName mengubah nama pengguna", () => {
    useUserStore.getState().updateProfileName("Ahmad");
    expect(useUserStore.getState().name).toBe("Ahmad");
  });

  it("addXP menambah XP dan menaikkan level dengan benar serta memicu notifikasi", () => {
    // XP 0 -> Level 1
    // Tambah 50 XP -> Level 2
    useUserStore.getState().addXP(50);
    expect(useUserStore.getState().xp).toBe(50);
    expect(useUserStore.getState().level).toBe(2);

    // Verifikasi notifikasi Level Up terpicu di useUIStore
    const notifications = useUIStore.getState().notifications;
    expect(notifications.length).toBe(1);
    expect(notifications[0].title).toBe("Level Up!");
    expect(notifications[0].type).toBe("achievement");
  });

  it("buyStreakFreeze gagal jika XP tidak mencukupi", () => {
    // Harga Streak Freeze = 500 XP. XP saat ini = 0.
    const success = useUserStore.getState().buyStreakFreeze();
    expect(success).toBe(false);
    expect(useUserStore.getState().inventory.streakFreeze).toBe(0);
  });

  it("buyStreakFreeze berhasil memotong XP dan menambah stok jika XP cukup", () => {
    // Beri user 600 XP terlebih dahulu
    useUserStore.getState().setGamification({ xp: 600, level: 4 });

    const success = useUserStore.getState().buyStreakFreeze();
    expect(success).toBe(true);
    expect(useUserStore.getState().xp).toBe(600 - STREAK_FREEZE_COST); // 100 XP sisa
    expect(useUserStore.getState().inventory.streakFreeze).toBe(1);

    const notifications = useUIStore.getState().notifications;
    expect(notifications.some(n => n.title === "Pembelian Berhasil!")).toBe(true);
  });

  it("claimQuest menyimpan quest yang diklaim dan memberikan reward XP", () => {
    useUserStore.getState().claimQuest("quest-vocabulary", "2026-05-20", 100);

    const claimed = useUserStore.getState().inventory.claimedQuests;
    expect(claimed?.date).toBe("2026-05-20");
    expect(claimed?.quests).toContain("quest-vocabulary");
    expect(useUserStore.getState().xp).toBe(100); // 0 + 100
  });

  it("claimQuest mengabaikan klaim ganda untuk quest yang sama di hari yang sama", () => {
    useUserStore.getState().claimQuest("quest-vocabulary", "2026-05-20", 100);
    useUserStore.getState().claimQuest("quest-vocabulary", "2026-05-20", 100); // Klaim ganda

    expect(useUserStore.getState().xp).toBe(100); // Tetap 100, bukan 200
  });

  it("completeLesson menambahkan pelajaran ke daftar selesai dan menandainya kotor (dirty)", () => {
    useUserStore.getState().completeLesson("lesson-1");

    const completed = useUserStore.getState().completedLessons;
    expect(completed["lesson-1"]).toBeDefined();
    expect(completed["lesson-1"].isDeleted).toBe(false);
    expect(useUserStore.getState().dirtyLessons.has("lesson-1")).toBe(true);
  });

  it("clearDirtyLessons menghapus item pelajaran kotor yang sudah disinkronisasi", () => {
    useUserStore.getState().completeLesson("lesson-1");
    useUserStore.getState().completeLesson("lesson-2");

    expect(useUserStore.getState().dirtyLessons.size).toBe(2);

    // Hapus lesson-1 saja dari dirty list
    useUserStore.getState().clearDirtyLessons(["lesson-1"]);
    expect(useUserStore.getState().dirtyLessons.has("lesson-1")).toBe(false);
    expect(useUserStore.getState().dirtyLessons.has("lesson-2")).toBe(true);

    // Hapus semua
    useUserStore.getState().clearDirtyLessons();
    expect(useUserStore.getState().dirtyLessons.size).toBe(0);
  });

  it("syncUserData memperbarui data profil pengguna", () => {
    useUserStore.getState().syncUserData({
      id: "user-123",
      isGuest: false,
      name: "Budi",
    });

    expect(useUserStore.getState().id).toBe("user-123");
    expect(useUserStore.getState().isGuest).toBe(false);
    expect(useUserStore.getState().name).toBe("Budi");
  });
});
