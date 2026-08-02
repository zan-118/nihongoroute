import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import FuriganaDisplay from "@/components/ui/japanese/FuriganaDisplay";

describe("FuriganaDisplay Component Test", () => {
  it("harus merender teks Jepang dengan furigana rubi", () => {
    render(<FuriganaDisplay text="私" furigana="わたし" />);
    expect(screen.getByText("私")).toBeDefined();
    expect(screen.getByText("わたし")).toBeDefined();
  });
});
