import { describe, it, expect, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import FuriganaDisplay from "@/components/ui/japanese/FuriganaDisplay";
import { JapaneseText } from "@/components/ui/japanese/JapaneseText";
import { SmartJapanese } from "@/components/ui/japanese/SmartJapanese";
import { useUIStore } from "@/store/useUIStore";

/** Mutasi readingState global dibungkus act() agar update React tercatat rapi. */
const setReadingState = async (partial: {
 mode?: "kanji" | "furigana" | "hiragana";
}) => {
 await act(async () => useUIStore.getState().setReadingState(partial));
};

/** Reset readingState global agar antar-test tidak saling memengaruhi. */
const resetReadingState = async () =>
 act(async () => useUIStore.getState().setReadingState({ mode: "furigana" }));

describe("FuriganaDisplay Component Test", () => {
  afterEach(resetReadingState);

  it("harus merender teks Jepang dengan furigana rubi", () => {
    render(<FuriganaDisplay text="私" furigana="わたし" />);
    expect(screen.getByText("私")).toBeDefined();
    expect(screen.getByText("わたし")).toBeDefined();
  });

  it("mode kanji: furigana tidak muncul (hanya kanji)", () => {
    render(<JapaneseText text="私" furigana="わたし" mode="kanji" />);
    expect(screen.getByText("私")).toBeDefined();
    expect(screen.queryByText("わたし")).toBeNull();
  });

  it("mode hiragana: teks utama diganti hiragana, kanji disembunyikan", () => {
    render(<JapaneseText text="私" furigana="わたし" mode="hiragana" />);
    expect(screen.getByText("わたし")).toBeDefined();
    expect(screen.queryByText("私")).toBeNull();
  });

  it("tanpa prop mode: mengikuti mode global dari store (kanji)", async () => {
    await setReadingState({ mode: "kanji" });
    render(<JapaneseText text="私" furigana="わたし" />);
    expect(screen.getByText("私")).toBeDefined();
    expect(screen.queryByText("わたし")).toBeNull();
  });

  it("SmartJapanese tanpa mode mengikuti toggle global — regresi bug toggle topbar", async () => {
    await setReadingState({ mode: "kanji" });
    render(<SmartJapanese word="私" furigana="わたし" />);
    expect(screen.getByText("私")).toBeDefined();
    expect(screen.queryByText("わたし")).toBeNull();
  });

  it("prop mode eksplisit menimpa mode global store", async () => {
    await setReadingState({ mode: "kanji" });
    render(<JapaneseText text="私" furigana="わたし" mode="furigana" />);
    expect(screen.getByText("私")).toBeDefined();
    expect(screen.getByText("わたし")).toBeDefined();
  });
});
