import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMemoryStats } from "@/components/features/srs/stats/useMemoryStats";
import { useSRSAnalytics } from "@/components/features/srs/analytics/useSRSAnalytics";
import { useProgressStore } from "@/store/useProgressStore";
import { SRSState } from "@/lib/srs";

// Helper untuk membuat SRS state kustom
function makeSRS(interval: number, repetition: number, easeFactor: number): SRSState {
  return { interval, repetition, easeFactor, nextReview: Date.now() };
}

describe("useMemoryStats", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: {
        xp: 0, level: 1, streak: 0, todayReviewCount: 0, lastStudyDate: null, studyDays: {},
        srs: {
          "w1": makeSRS(35, 10, 2.8),  // master (interval >= 30)
          "w2": makeSRS(15, 5, 2.5),   // intermediate (rep>1, 7<=interval<30)
          "w3": makeSRS(3, 3, 2.2),    // learning (rep>1, interval<7)
          "w4": makeSRS(1, 0, 2.5),    // new (rep<=1)
          "w5": makeSRS(1, 1, 2.5),    // new (rep<=1)
          "w6": makeSRS(50, 15, 3.0),  // master
          "w7": makeSRS(10, 4, 2.3),   // intermediate
        },
      },
      loading: false,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });
  });

  it("menghitung jumlah kartu master dengan benar", () => {
    const { result } = renderHook(() => useMemoryStats());
    expect(result.current.stats.master).toBe(2); // w1, w6
  });

  it("menghitung jumlah kartu intermediate dengan benar", () => {
    const { result } = renderHook(() => useMemoryStats());
    expect(result.current.stats.intermediate).toBe(2); // w2, w7
  });

  it("menghitung jumlah kartu learning dengan benar", () => {
    const { result } = renderHook(() => useMemoryStats());
    expect(result.current.stats.learning).toBe(1); // w3
  });

  it("menghitung jumlah kartu new dengan benar", () => {
    const { result } = renderHook(() => useMemoryStats());
    expect(result.current.stats.new).toBe(2); // w4, w5
  });

  it("menghitung total entry dengan benar", () => {
    const { result } = renderHook(() => useMemoryStats());
    expect(result.current.total).toBe(7);
  });

  it("mengembalikan total = 1 saat SRS kosong (untuk menghindari divide by zero)", () => {
    useProgressStore.setState({
      progress: { xp: 0, level: 1, streak: 0, todayReviewCount: 0, lastStudyDate: null, studyDays: {}, srs: {} },
    });

    const { result } = renderHook(() => useMemoryStats());
    expect(result.current.total).toBe(1);
  });
});

describe("useSRSAnalytics", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: {
        xp: 0, level: 1, streak: 0, todayReviewCount: 0, lastStudyDate: null, studyDays: {},
        srs: {
          "a1": makeSRS(1, 0, 1.5),   // critical (ef < 1.7)
          "a2": makeSRS(1, 0, 1.3),   // critical
          "a3": makeSRS(5, 3, 2.0),   // fragile (1.7 <= ef < 2.2)
          "a4": makeSRS(10, 5, 2.5),  // stable (2.2 <= ef < 2.7)
          "a5": makeSRS(30, 10, 2.9), // master (ef >= 2.7)
          "a6": makeSRS(50, 15, 3.0), // master
        },
      },
      loading: false,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });
  });

  it("menghitung total kata dengan benar", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    expect(result.current.total).toBe(6);
  });

  it("mengkategorikan critical dengan benar", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    const criticalData = result.current.rawData.find(d => d.label === "Critical");
    expect(criticalData?.count).toBe(2); // a1, a2
  });

  it("mengkategorikan fragile dengan benar", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    const fragileData = result.current.rawData.find(d => d.label === "Fragile");
    expect(fragileData?.count).toBe(1); // a3
  });

  it("mengkategorikan stable dengan benar", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    const stableData = result.current.rawData.find(d => d.label === "Stable");
    expect(stableData?.count).toBe(1); // a4
  });

  it("mengkategorikan master dengan benar", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    const masterData = result.current.rawData.find(d => d.label === "Master");
    expect(masterData?.count).toBe(2); // a5, a6
  });

  it("menghitung maxCount dengan benar", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    // max dari [2, 1, 1, 2] = 2
    expect(result.current.maxCount).toBe(2);
  });

  it("rawData memiliki 4 kategori", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    expect(result.current.rawData).toHaveLength(4);
  });

  it("setiap kategori memiliki warna dan deskripsi", () => {
    const { result } = renderHook(() => useSRSAnalytics());
    result.current.rawData.forEach(d => {
      expect(d.color).toBeTruthy();
      expect(d.desc).toBeTruthy();
    });
  });
});
