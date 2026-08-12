import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { WorkspaceTabs } from "@/features/library/listening/components/workspace/WorkspaceTabs";
import { QuizPanel } from "@/features/library/listening/components/workspace/QuizPanel";
import { QuizItem } from "@/features/library/listening/types";

// Icons & button primitives render as plain elements for stable queries.
vi.mock("@/components/ui/icons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui/icons")>();
  return {
    ...actual,
    Draft: () => <span data-testid="icon-draft">Draft</span>,
    Headphone: () => <span data-testid="icon-headphone">Headphone</span>,
    Pencil: () => <span data-testid="icon-pencil">Pencil</span>,
    Check: () => <span data-testid="icon-check">Check</span>,
    X: () => <span data-testid="icon-x">X</span>,
  };
});

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ComponentPropsWithoutRef<"button">) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => (
    <div {...props}>{children}</div>
  ),
}));

describe("WorkspaceTabs", () => {
  it("menampilkan tiga tab dan memicu onTabChange saat diklik", () => {
    const onTabChange = vi.fn();
    render(
      <WorkspaceTabs activeTab="study" onTabChange={onTabChange} hasDictation hasQuiz />
    );

    expect(screen.getByText(/Transkrip/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Dikte/));
    expect(onTabChange).toHaveBeenCalledWith("dictation");
    fireEvent.click(screen.getByText(/Kuis/));
    expect(onTabChange).toHaveBeenCalledWith("quiz");
  });

  it("menonaktifkan tab Dikte ketika tidak ada baris dikte", () => {
    render(<WorkspaceTabs activeTab="study" onTabChange={vi.fn()} hasDictation={false} hasQuiz />);
    expect(screen.getByText(/Dikte/).closest("button")).toBeDisabled();
  });

  it("menyembunyikan tab Kuis ketika tidak ada kuis", () => {
    render(<WorkspaceTabs activeTab="study" onTabChange={vi.fn()} hasDictation hasQuiz={false} />);
    expect(screen.queryByText(/Kuis/)).not.toBeInTheDocument();
  });
});

describe("QuizPanel", () => {
  const quiz: QuizItem[] = [
    {
      _id: "q1",
      question: "Apa arti 本?",
      options: [
        { text: "buku", isCorrect: true },
        { text: "pensil", isCorrect: false },
      ],
    },
    {
      _id: "q2",
      question: "Apa arti 水?",
      options: [
        { text: "api", isCorrect: false },
        { text: "air", isCorrect: true },
      ],
    },
  ];

  it("menghitung skor dengan benar dan memanggil onQuizComplete", () => {
    const onQuizComplete = vi.fn();
    render(<QuizPanel quiz={quiz} onQuizComplete={onQuizComplete} />);

    // Jawab q1 benar, q2 salah
    fireEvent.click(screen.getByText("buku"));
    fireEvent.click(screen.getByText("api"));
    fireEvent.click(screen.getByText("Kirim Jawaban Kuis"));

    expect(screen.getByText(/Hasil kuis: 1 \/ 2 Benar/)).toBeInTheDocument();
    expect(onQuizComplete).toHaveBeenCalledWith(1);
  });

  it("menampilkan penjelasan setelah submit", () => {
    const quizWithExplanation: QuizItem[] = [
      {
        _id: "q1",
        question: "Pertanyaan?",
        options: [{ text: "A", isCorrect: true }],
        explanation: "Karena A benar.",
      },
    ];
    render(<QuizPanel quiz={quizWithExplanation} onQuizComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Kirim Jawaban Kuis"));
    expect(screen.getByText(/Karena A benar\./)).toBeInTheDocument();
  });

  it("mengunci jawaban & tombol submit setelah submit, callback hanya sekali", () => {
    const onQuizComplete = vi.fn();
    render(<QuizPanel quiz={quiz} onQuizComplete={onQuizComplete} />);

    fireEvent.click(screen.getByText("buku"));
    fireEvent.click(screen.getByText("Kirim Jawaban Kuis"));

    // Tombol submit diganti panel hasil — tidak bisa dikirim dua kali
    expect(screen.queryByText("Kirim Jawaban Kuis")).not.toBeInTheDocument();
    expect(onQuizComplete).toHaveBeenCalledTimes(1);
    // Opsi jawaban terkunci
    expect(screen.getByText("api").closest("button")).toBeDisabled();
    // Tersedia tombol ulangi
    expect(screen.getByText("Ulangi Kuis")).toBeInTheDocument();
  });
});
