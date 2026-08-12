import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewHeader } from "@/features/exams/components/mock-engine/review/ReviewHeader";
import { ReviewFilterBar } from "@/features/exams/components/mock-engine/review/ReviewFilterBar";
import { ReviewRecommendations } from "@/features/exams/components/mock-engine/review/ReviewRecommendations";
import { ReviewStatsGrid } from "@/features/exams/components/mock-engine/review/ReviewStatsGrid";
import { ReviewQuestionOptions } from "@/features/exams/components/mock-engine/review/ReviewQuestionOptions";
import { ReviewWeakestSection } from "@/features/exams/components/mock-engine/review/ReviewWeakestSection";
import type { ExamReviewAnalysis, ExamReviewAction } from "@/lib/learning/exam-review-analysis";

// Mock next-themes & framer-motion agar test ringan.
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("framer-motion", () => ({
  m: {
    div: ({ children, ...props }: { children?: ReactNode }) => (
      <div>{children}</div>
    ),
  },
}));

function makeAnalysis(overrides: Partial<ExamReviewAnalysis> = {}): ExamReviewAnalysis {
  return {
    totalQuestions: 10,
    correctCount: 6,
    wrongCount: 3,
    unansweredCount: 1,
    accuracy: 60,
    insights: [],
    mistakes: [],
    sections: [
      { section: "vocabulary", total: 4, correct: 3, wrong: 1, unanswered: 0, accuracy: 75 },
      { section: "grammar", total: 6, correct: 3, wrong: 2, unanswered: 1, accuracy: 50 },
    ],
    weakestSection: { section: "grammar", total: 6, correct: 3, wrong: 2, unanswered: 1, accuracy: 50 },
    actions: [],
    ...overrides,
  };
}

describe("ReviewHeader", () => {
  it("memanggil onBack saat tombol Kembali diklik", () => {
    const onBack = vi.fn();
    render(<ReviewHeader onBack={onBack} />);
    fireEvent.click(screen.getByText("Kembali"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("menampilkan judul review", () => {
    render(<ReviewHeader onBack={() => {}} />);
    expect(screen.getByText("Jawaban")).toBeInTheDocument();
    expect(screen.getByText("Tinjau")).toBeInTheDocument();
  });
});

describe("ReviewStatsGrid", () => {
  it("menampilkan empat kartu statistik", () => {
    render(<ReviewStatsGrid analysis={makeAnalysis()} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("menampilkan detail akurasi", () => {
    render(<ReviewStatsGrid analysis={makeAnalysis()} />);
    expect(screen.getByText("6/10 benar")).toBeInTheDocument();
  });
});

describe("ReviewWeakestSection", () => {
  it("menampilkan section terlemah beserta akurasi", () => {
    render(<ReviewWeakestSection analysis={makeAnalysis()} />);
    expect(screen.getByText("Tata Bahasa (Bunpou)")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("menampilkan fallback bila tidak ada section", () => {
    render(
      <ReviewWeakestSection
        analysis={makeAnalysis({ weakestSection: null, sections: [] })}
      />
    );
    expect(screen.getByText("Belum ada data")).toBeInTheDocument();
  });
});

describe("ReviewFilterBar", () => {
  it("memanggil onFilterChange dengan 'all'", () => {
    const onFilterChange = vi.fn();
    render(
      <ReviewFilterBar
        effectiveFilter="mistakes"
        mistakeCount={3}
        totalCount={10}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.click(screen.getByText("Semua Soal (10)"));
    expect(onFilterChange).toHaveBeenCalledWith("all");
  });

  it("menonaktifkan tombol Soal Salah bila tidak ada kesalahan", () => {
    render(
      <ReviewFilterBar
        effectiveFilter="all"
        mistakeCount={0}
        totalCount={10}
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText("Soal Salah (0)")).toBeDisabled();
  });
});

describe("ReviewRecommendations", () => {
  const actions: ExamReviewAction[] = [
    {
      id: "flashcards",
      label: "Flashcards",
      href: "/tools/flashcards",
      reason: "Ulangi materi dengan sesi kartu cepat.",
    },
  ];

  it("merender aksi rekomendasi dengan link", () => {
    render(<ReviewRecommendations actions={actions} />);
    expect(screen.getByText("Flashcards")).toBeInTheDocument();
    expect(screen.getByText("Buka Latihan")).toBeInTheDocument();
  });
});

describe("ReviewQuestionOptions", () => {
  const question = {
    _key: "q1",
    section: "vocabulary" as const,
    options: ["Pilihan A", "Pilihan B", "Pilihan C"],
    correctAnswer: 0,
  };

  it("menandai jawaban benar dan pilihan user", () => {
    render(<ReviewQuestionOptions question={question} userAnswer={1} />);
    expect(screen.getByText("Pilihan A")).toBeInTheDocument();
    expect(screen.getByText("Pilihan B")).toBeInTheDocument();
    expect(screen.getByText("Pilihan C")).toBeInTheDocument();
  });
});
