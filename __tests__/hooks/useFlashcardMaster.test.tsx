import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardMaster } from "@/components/features/flashcards/master/useFlashcardMaster";
import { useProgressStore } from "@/store/useProgressStore";
import { MasterCardData } from "@/components/features/flashcards/master/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock audio (browser API tidak tersedia di jsdom)
vi.mock("@/lib/audio", () => ({
  sounds: {
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playPop: vi.fn(),
  },
}));

const mockCards: MasterCardData[] = [
  { _id: "card-1", word: "食べる", meaning: "Makan", furigana: "たべる", romaji: "taberu" },
  { _id: "card-2", word: "飲む", meaning: "Minum", furigana: "のむ", romaji: "nomu" },
  { _id: "card-3", word: "読む", meaning: "Membaca", furigana: "よむ", romaji: "yomu" },
];

describe("useFlashcardMaster", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: { xp: 0, level: 1, streak: 0, todayReviewCount: 0, lastStudyDate: null, studyDays: {}, srs: {} },
      loading: false,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memulai dari index 0 dan tidak di-flip", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isFlipped).toBe(false);
  });

  it("menggunakan mode 'latihan' sebagai default", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));
    expect(result.current.studyMode).toBe("latihan");
  });

  it("bisa menerima initialMode 'ujian'", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards, initialMode: "ujian" }));
    expect(result.current.studyMode).toBe("ujian");
  });

  it("menambah XP +15 saat jawaban benar", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    act(() => {
      result.current.handleAnswer(true);
    });

    const { progress } = useProgressStore.getState();
    expect(progress.xp).toBe(15);
  });

  it("menambah XP +5 saat jawaban salah", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    act(() => {
      result.current.handleAnswer(false);
    });

    const { progress } = useProgressStore.getState();
    expect(progress.xp).toBe(5);
  });

  it("menghitung sessionStats dengan benar setelah jawaban benar", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    act(() => {
      result.current.handleAnswer(true);
    });

    expect(result.current.sessionStats.known).toBe(1);
    expect(result.current.sessionStats.learning).toBe(0);
    expect(result.current.sessionStats.xpGained).toBe(15);
  });

  it("menghitung sessionStats dengan benar setelah jawaban salah", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    act(() => {
      result.current.handleAnswer(false);
    });

    expect(result.current.sessionStats.known).toBe(0);
    expect(result.current.sessionStats.learning).toBe(1);
    expect(result.current.sessionStats.xpGained).toBe(5);
  });

  it("menyimpan state SRS kartu ke store", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    act(() => {
      result.current.handleAnswer(true);
    });

    const { srs } = useProgressStore.getState().progress;
    expect(srs["card-1"]).toBeDefined();
    expect(srs["card-1"].repetition).toBe(1);
  });

  it("pindah ke kartu berikutnya setelah handleAnswer (setelah delay)", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    act(() => {
      result.current.handleAnswer(true);
      vi.advanceTimersByTime(250);
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("menandai isFinished=true setelah kartu terakhir", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    // Jawab semua kartu
    act(() => {
      result.current.handleAnswer(true); // card-1
      vi.advanceTimersByTime(250);
    });
    act(() => {
      result.current.handleAnswer(true); // card-2
      vi.advanceTimersByTime(250);
    });
    act(() => {
      result.current.handleAnswer(true); // card-3 (terakhir)
      vi.advanceTimersByTime(250);
    });

    expect(result.current.isFinished).toBe(true);
  });

  it("handleRestart mereset semua state sesi", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    // Jawab dulu
    act(() => {
      result.current.handleAnswer(true);
      vi.advanceTimersByTime(250);
    });

    // Restart
    act(() => {
      result.current.handleRestart();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.sessionStats).toEqual({ known: 0, learning: 0, xpGained: 0 });
  });

  it("handleNav bergerak ke arah yang benar", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    // Jawab agar bisa pindah dulu
    act(() => {
      result.current.handleAnswer(true);
      vi.advanceTimersByTime(250);
    });

    // Sekarang di index 1, navigasi mundur
    act(() => {
      result.current.handleNav(-1);
      vi.advanceTimersByTime(250);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("handleNav tidak melampaui batas array", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockCards }));

    // Coba mundur dari index 0
    act(() => {
      result.current.handleNav(-1);
      vi.advanceTimersByTime(250);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("tidak melakukan apa-apa saat cards kosong", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: [] }));

    act(() => {
      result.current.handleAnswer(true);
    });

    // XP tetap 0 karena cards.length === 0
    expect(useProgressStore.getState().progress.xp).toBe(0);
  });
});
