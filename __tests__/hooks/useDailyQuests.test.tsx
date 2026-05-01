import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDailyQuests } from "@/components/features/dashboard/quests/useDailyQuests";
import { useProgressStore } from "@/store/useProgressStore";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock helpers
vi.mock("@/lib/helpers", () => ({
  getTodayDateString: () => "2026-05-02",
}));

describe("useDailyQuests", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: { xp: 500, level: 4, streak: 5, todayReviewCount: 25, lastStudyDate: "2026-05-02", studyDays: {}, srs: {} },
      loading: false,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });

    // Clear localStorage
    localStorage.clear();
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
    expect(result.current.getCurrentProgress("unknown" as any)).toBe(0);
  });

  it("handleClaim menambah XP dan menyimpan quest sebagai claimed", () => {
    const { result } = renderHook(() => useDailyQuests());

    const mockQuest = { id: "quest-1", title: "Review 10 Kata", type: "review" as const, target: 10, rewardXP: 50 };

    act(() => {
      result.current.handleClaim(mockQuest);
    });

    expect(result.current.claimedQuests["quest-1"]).toBe(true);
    expect(useProgressStore.getState().progress.xp).toBe(550); // 500 + 50
  });

  it("handleClaim tidak bisa claim quest yang sama dua kali", () => {
    const { result } = renderHook(() => useDailyQuests());

    const mockQuest = { id: "quest-1", title: "Review 10 Kata", type: "review" as const, target: 10, rewardXP: 50 };

    act(() => { result.current.handleClaim(mockQuest); });
    act(() => { result.current.handleClaim(mockQuest); }); // coba lagi

    // XP hanya bertambah sekali
    expect(useProgressStore.getState().progress.xp).toBe(550);
  });

  it("menyimpan claimed quests ke localStorage", () => {
    const { result } = renderHook(() => useDailyQuests());

    const mockQuest = { id: "quest-1", title: "Review 10 Kata", type: "review" as const, target: 10, rewardXP: 50 };

    act(() => { result.current.handleClaim(mockQuest); });

    const saved = localStorage.getItem("nihongo-quests-2026-05-02");
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved!)["quest-1"]).toBe(true);
  });

  it("memuat claimed quests dari localStorage pada mount", () => {
    localStorage.setItem("nihongo-quests-2026-05-02", JSON.stringify({ "quest-old": true }));

    const { result } = renderHook(() => useDailyQuests());

    expect(result.current.claimedQuests["quest-old"]).toBe(true);
  });
});
