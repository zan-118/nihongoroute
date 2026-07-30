import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { AddToSRSButton } from "@/components/features/srs/actions/AddToSRSButton";
import { useSRSStore } from "@/store/useSRSStore";

// Mock icons
vi.mock("@/components/ui/icons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui/icons")>();
  return {
    ...actual,
    Plus: () => <span data-testid="plus-icon">Plus</span>,
    Check: () => <span data-testid="check-icon">Check</span>,
    Star: () => <span data-testid="star-icon">Star</span>,
  };
});

// Mock button primitive
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ComponentPropsWithoutRef<"button">) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe("AddToSRSButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSRSStore.setState({
      srs: {},
      addToSRS: vi.fn((wordId: string) => {
        const state = useSRSStore.getState();
        useSRSStore.setState({
          srs: {
            ...state.srs,
            [wordId]: {
              id: wordId,
              word: wordId,
              reading: "",
              meaning: "",
              level: 1,
              interval: 1,
              repetition: 0,
              easeFactor: 2.5,
              nextReview: new Date().toISOString(),
            },
          },
        });
      }),
    });
  });

  it("renders star variant by default and adds word on click", () => {
    render(<AddToSRSButton wordId="vocab-1" variant="star" />);

    // Advance requestAnimationFrame timer
    act(() => {
      vi.runAllTimers();
    });

    const button = screen.getByRole("button");
    expect(button).toBeDefined();

    // Click to add
    fireEvent.click(button);
    expect(useSRSStore.getState().srs["vocab-1"]).toBeDefined();
  });

  it("renders action variant when specified", () => {
    render(<AddToSRSButton wordId="vocab-2" variant="action" />);

    act(() => {
      vi.runAllTimers();
    });

    const button = screen.getByRole("button", { name: /Mulai Hafalkan Kata Ini/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(useSRSStore.getState().srs["vocab-2"]).toBeDefined();
  });
});
