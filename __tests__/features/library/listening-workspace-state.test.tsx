import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ListeningWorkspace from "@/features/library/listening/components/ListeningWorkspace";
import { QuizItem, TranscriptLine } from "@/features/library/listening/types";

vi.mock("@/components/ui/icons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui/icons")>();
  return {
    ...actual,
    Draft: () => <span>Draft</span>,
    Headphone: () => <span>Headphone</span>,
    Pencil: () => <span>Pencil</span>,
    Check: () => <span>Check</span>,
    X: () => <span>X</span>,
    VolumeUp: () => <span>VolumeUp</span>,
    Eye: () => <span>Eye</span>,
    EyeOff: () => <span>EyeOff</span>,
    LayoutGrid: () => <span>LayoutGrid</span>,
    PlayCircle: () => <span>PlayCircle</span>,
    PauseCircle: () => <span>PauseCircle</span>,
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

// StickerScene / IllustrationGallery / SmartJapanese / AudioController — stubs ringan
vi.mock("@/components/ui/StickerScene", () => ({
  StickerScene: () => <div data-testid="sticker-scene" />,
}));
vi.mock("@/components/ui/IllustrationGallery", () => ({
  IllustrationGallery: () => <div data-testid="illustration-gallery" />,
}));
vi.mock("@/components/ui/japanese", () => ({
  SmartJapanese: () => <span />,
}));
vi.mock("@/features/library/reading/components/AudioController", () => ({
  __esModule: true,
  default: () => <div data-testid="audio-controller" />,
}));
vi.mock("@/features/media", () => ({
  useLineTTS: () => ({
    speakingIndex: -1,
    loadingIndex: -1,
    speakLine: vi.fn(),
    stopLineTTS: vi.fn(),
    rate: "medium",
    setRate: vi.fn(),
    isPlayingPlaylist: false,
    playlistIndex: -1,
    playPlaylist: vi.fn(),
    pausePlaylist: vi.fn(),
  }),
}));

const transcript: TranscriptLine[] = [
  { _key: "l1", text: "こんにちは", startTime: 0, endTime: 2, speaker: "A", translation: "Halo" },
];

const quiz: QuizItem[] = [
  {
    _id: "q1",
    question: "Apa arti こんにちは?",
    options: [
      { text: "Halo", isCorrect: true },
      { text: "Selamat tinggal", isCorrect: false },
    ],
  },
];

const props = {
  transcript,
  activeIndex: 0,
  seekToLine: vi.fn(),
  quiz,
  onQuizComplete: vi.fn(),
  toolParams: "",
  title: "Percakapan",
};

describe("ListeningWorkspace — state lintas tab", () => {
  it("jawaban kuis bertahan setelah pindah tab dan kembali", () => {
    const onQuizComplete = vi.fn();
    render(
      <ListeningWorkspace {...props} onQuizComplete={onQuizComplete} />
    );

    // Buka tab kuis, jawab, submit
    fireEvent.click(screen.getByRole("button", { name: /KuisPemahaman/ }));
    fireEvent.click(screen.getByRole("button", { name: "Halo" }));
    fireEvent.click(screen.getByText("Kirim Jawaban Kuis"));
    expect(screen.getByText(/Hasil kuis: 1 \/ 1 Benar/)).toBeInTheDocument();

    // Pindah ke tab transkrip lalu kembali — hasil harus tetap ada
    // (panel tetap ter-mount: ini justru memastikan state kuis tidak di-reset)
    fireEvent.click(screen.getByRole("button", { name: /Belajar/ }));
    fireEvent.click(screen.getByRole("button", { name: /KuisPemahaman/ }));
    expect(screen.getByText(/Hasil kuis: 1 \/ 1 Benar/)).toBeInTheDocument();
    // Opsi jawaban tetap terkunci setelah kembali (name jadi "HaloCheck" pasca-submit)
    expect(screen.getByRole("button", { name: /Halo/ })).toBeDisabled();
  });
});
