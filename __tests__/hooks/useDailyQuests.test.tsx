import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDailyQuests } from "@/components/features/dashboard/quests/useDailyQuests";
import { useUserStore } from "@/store/useUserStore";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock utils
vi.mock("@/lib/utils", () => ({
  getTodayDateString: () => "2026-05-02",
}));

describe("useDailyQuests Hook", () => {
  beforeEach(() => {
    useUserStore.setState({
      id: "guest",
      isGuest: true,
      name: null,
      xp: 500,
      level: 4,
      streak: 5,
      todayReviewCount: 25,
      lastStudyDate: "2026-05-02",
      studyDays: {},
      inventory: {
        streakFreeze: 0,
        claimedQuests: {
          date: "",
          quests: []
        }
      },
      completedLessons: {},
      dirtyLessons: new Set(),
    });
  });

  it("mengembalikan claimedQuests kosong di awal", () => {
    const { result } = renderHook(() => useDailyQuests());
    expect(result.current.claimedQuests).toEqual({});
  });

  it("getCurrentProgress mengembalikan todayReviewCount untuk tipe 'review'", () => {
    const { result } = renderHook(() => useDailyQuests());
    expect(result.current.getCurrentProgress("review")).toBe(25);
  });

  it("getCurrentProgress mengembalikan streak untuk tipe 'streak'", () => {
    const { result } = renderHook(() => useDailyQuests());
    expect(result.current.getCurrentProgress("streak")).toBe(5);
  });

  it("getCurrentProgress mengembalikan XP mod 1000 untuk tipe 'xp'", () => {
    const { result } = renderHook(() => useDailyQuests());
    // 500 % 1000 = 500
    expect(result.current.getCurrentProgress("xp")).toBe(500);
  });

  it("getCurrentProgress mengembalikan 0 untuk tipe yang tidak dikenal", () => {
    const { result } = renderHook(() => useDailyQuests());
    expect(result.current.getCurrentProgress("unknown" as unknown as "xp")).toBe(0);
  });

  it("handleClaim menambah XP dan menyimpan quest sebagai claimed", () => {
    const { result } = renderHook(() => useDailyQuests());

    const mockQuest = { id: "quest-1", title: "Review 10 Kata", type: "review" as const, target: 10, rewardXP: 50, icon: null };

    act(() => {
      result.current.handleClaim(mockQuest);
    });

    expect(result.current.claimedQuests["quest-1"]).toBe(true);
    expect(useUserStore.getState().xp).toBe(550); // 500 + 50
  });

  it("handleClaim tidak bisa claim quest yang sama dua kali", () => {
    const { result } = renderHook(() => useDailyQuests());

    const mockQuest = { id: "quest-1", title: "Review 10 Kata", type: "review" as const, target: 10, rewardXP: 50, icon: null };

    act(() => { result.current.handleClaim(mockQuest); });
    act(() => { result.current.handleClaim(mockQuest); }); // coba lagi

    // XP hanya bertambah sekali
    expect(useUserStore.getState().xp).toBe(550);
  });

  it("menyimpan claimed quests ke store", () => {
    const { result } = renderHook(() => useDailyQuests());

    const mockQuest = { id: "quest-1", title: "Review 10 Kata", type: "review" as const, target: 10, rewardXP: 50, icon: null };

    act(() => { result.current.handleClaim(mockQuest); });

    const claimed = useUserStore.getState().inventory.claimedQuests;
    expect(claimed?.date).toBe("2026-05-02");
    expect(claimed?.quests).toContain("quest-1");
  });

  it("memuat claimed quests dari store pada mount", () => {
    useUserStore.setState({
      inventory: {
        streakFreeze: 0,
        claimedQuests: {
          date: "2026-05-02",
          quests: ["quest-old"]
        }
      }
    });

    const { result } = renderHook(() => useDailyQuests());

    expect(result.current.claimedQuests["quest-old"]).toBe(true);
  });
});
