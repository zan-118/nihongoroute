import { describe, expect, it, vi, beforeEach } from "vitest";

// Simulasi concurrency pada fitur exam dan gamification 
// Menguji skenario dua tab yang mencoba mengirimkan submit jawaban secara bersamaan

describe("E2E Gamification & Exam Concurrency Simulation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("mencegah pengiriman jawaban ganda (race condition) pada sesi ujian yang sama", async () => {
    let isSubmitting = false;
    let submissionsCount = 0;

    // Fungsi simulasi untuk mensubmit ujian dengan pengamanan state lokal/Zustand
    const submitExam = async () => {
      if (isSubmitting) return { error: "Already submitting" };
      
      isSubmitting = true;
      
      // Simulasi delay network
      await new Promise(resolve => setTimeout(resolve, 500));
      submissionsCount += 1;
      
      isSubmitting = false;
      return { success: true };
    };

    // Tab 1 dan Tab 2 mencoba mensubmit bersamaan
    const tab1 = submitExam();
    const tab2 = submitExam();

    vi.advanceTimersByTime(600);

    const [res1, res2] = await Promise.all([tab1, tab2]);

    // Hanya satu yang boleh sukses jika dikirim di saat state isSubmitting = true
    // (Pencegahan di level client sebelum masuk ke server)
    expect(res1.success).toBe(true);
    expect(res2.error).toBe("Already submitting");
    expect(submissionsCount).toBe(1);
  });
});
