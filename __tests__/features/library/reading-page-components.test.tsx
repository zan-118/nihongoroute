import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReadingPageHeader } from "@/features/library/reading/components/ReadingPageHeader";
import { ReadingVisuals } from "@/features/library/reading/components/ReadingVisuals";
import { ReadingControlBar } from "@/features/library/reading/components/ReadingControlBar";
import { VocabularyDrawer } from "@/features/library/reading/components/VocabularyDrawer";
import { ReadingQuizSection } from "@/features/library/reading/components/ReadingQuizSection";

// Mock komponen berat agar test ringan & fokus pada wiring props.
vi.mock("@/features/library/reading/components/ReadingVocabularyCollector", () => ({
  ReadingVocabularyCollector: () => <div data-testid="vocab-collector" />,
}));

vi.mock("@/features/exams/components/quiz-engine/QuizEngine", () => ({
  default: ({ questions, lessonId }: { questions: unknown[]; lessonId?: string }) => (
    <div data-testid="quiz-engine">{questions.length} soal • {lessonId}</div>
  ),
}));

vi.mock("@/features/library/reading/components/AudioController", () => ({
  default: () => <div data-testid="audio-controller" />,
}));

describe("ReadingPageHeader", () => {
  it("menampilkan judul dan badge level JLPT", () => {
    render(<ReadingPageHeader title="Hikari" jlptLevel="N4" />);
    expect(screen.getByText("Hikari")).toBeInTheDocument();
    expect(screen.getByText("N4")).toBeInTheDocument();
  });

  it("tidak menampilkan badge bila level tidak ada", () => {
    render(<ReadingPageHeader title="Hikari" />);
    expect(screen.getByText("Hikari")).toBeInTheDocument();
    expect(screen.queryByText(/N[0-9]/)).not.toBeInTheDocument();
  });
});

describe("ReadingVisuals", () => {
  it("menampilkan tombol toggle sesuai status", () => {
    const { rerender } = render(
      <ReadingVisuals illustrations={[]} title="A" showVisuals={false} onToggleVisuals={() => {}} />
    );
    expect(
      screen.getByText("Lihat Ilustrasi Cerita (AI Generated)")
    ).toBeInTheDocument();

    rerender(
      <ReadingVisuals illustrations={[]} title="A" showVisuals={true} onToggleVisuals={() => {}} />
    );
    expect(screen.getByText("Sembunyikan Ilustrasi Cerita")).toBeInTheDocument();
  });

  it("memanggil onToggleVisuals saat tombol diklik", () => {
    const onToggle = vi.fn();
    render(
      <ReadingVisuals illustrations={[]} title="A" showVisuals={false} onToggleVisuals={onToggle} />
    );
    fireEvent.click(screen.getByText("Lihat Ilustrasi Cerita (AI Generated)"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe("ReadingControlBar", () => {
  const modes = [
    { id: "kanji" as const, label: "Kanji" },
    { id: "furigana" as const, label: "Furigana" },
  ];

  const defaultProps = {
    elapsedSeconds: 65,
    readingPace: 120,
    readingCompletionPercent: 42,
    modes,
    mode: "kanji" as const,
    fontSize: "large" as const,
    isVocabOpen: false,
    showTranslation: false,
    onModeChange: vi.fn(),
    onFontSizeChange: vi.fn(),
    onToggleVocab: vi.fn(),
    onToggleTranslation: vi.fn(),
    onZenMode: vi.fn(),
  };

  it("menampilkan durasi, pace, dan persentase", () => {
    render(<ReadingControlBar {...defaultProps} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("memanggil onModeChange saat mode lain diklik", () => {
    const onModeChange = vi.fn();
    render(<ReadingControlBar {...defaultProps} onModeChange={onModeChange} />);
    fireEvent.click(screen.getByText("Furigana"));
    expect(onModeChange).toHaveBeenCalledWith("furigana");
  });

  it("memanggil onZenMode saat tombol ZEN diklik", () => {
    const onZenMode = vi.fn();
    render(<ReadingControlBar {...defaultProps} onZenMode={onZenMode} />);
    fireEvent.click(screen.getByText("ZEN"));
    expect(onZenMode).toHaveBeenCalledTimes(1);
  });

  it("tidak merender AudioController bila tidak ada audio", () => {
    render(<ReadingControlBar {...defaultProps} />);
    expect(screen.queryByTestId("audio-controller")).not.toBeInTheDocument();
  });

  it("merender AudioController bila ada audioUrl", () => {
    render(<ReadingControlBar {...defaultProps} audioUrl="https://example.com/a.mp3" />);
    expect(screen.getByTestId("audio-controller")).toBeInTheDocument();
  });
});

describe("VocabularyDrawer", () => {
  it("menampilkan kolektor kosakata saat terbuka", () => {
    render(<VocabularyDrawer open={true} onClose={() => {}} lessonId="l1" />);
    expect(screen.getByText("Kosakata Terkumpul")).toBeInTheDocument();
    expect(screen.getByTestId("vocab-collector")).toBeInTheDocument();
  });

  it("memanggil onClose saat tombol Tutup diklik", () => {
    const onClose = vi.fn();
    render(<VocabularyDrawer open={true} onClose={onClose} lessonId="l1" />);
    fireEvent.click(screen.getByText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ReadingQuizSection", () => {
  const quizzes = [
    { id: "q1", question: "Pertanyaan?" },
    { id: "q2", question: "Lain?" },
  ];

  it("merender kuis dengan jumlah soal dan lessonId", () => {
    render(<ReadingQuizSection quizzes={quizzes as never} lessonId="l1" />);
    expect(screen.getByText("Kuis Pemahaman")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-engine")).toHaveTextContent("2 soal");
    expect(screen.getByTestId("quiz-engine")).toHaveTextContent("l1");
  });
});
