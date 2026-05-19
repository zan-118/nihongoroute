import { describe, it, expect } from "vitest";
import { getBoxStyle } from "@/components/features/dashboard/heatmap/useHeatmap";

describe("useHeatmap - getBoxStyle", () => {
  it("mengembalikan style inactive untuk value 0", () => {
    const style = getBoxStyle(0);
    expect(style).toContain("opacity-30");
    expect(style).toContain("bg-background/40");
  });

  it("mengembalikan style inactive untuk value undefined/null", () => {
     
    const style = getBoxStyle(undefined as unknown as number);
    expect(style).toContain("opacity-30");
  });

  it("mengembalikan style level rendah untuk value 1-9", () => {
    const style = getBoxStyle(5);
    expect(style).toContain("bg-primary/20");
  });

  it("mengembalikan style level sedang untuk value 10-29", () => {
    const style = getBoxStyle(15);
    expect(style).toContain("bg-primary/50");
  });

  it("mengembalikan style level tinggi untuk value >= 30", () => {
    const style = getBoxStyle(50);
    expect(style).toContain("bg-primary");
    expect(style).toContain("border-border");
  });

  it("mengembalikan style level rendah untuk value tepat 1", () => {
    const style = getBoxStyle(1);
    expect(style).toContain("bg-primary/20");
  });

  it("mengembalikan style level sedang untuk value tepat 10", () => {
    const style = getBoxStyle(10);
    expect(style).toContain("bg-primary/50");
  });

  it("mengembalikan style level tinggi untuk value tepat 30", () => {
    const style = getBoxStyle(30);
    expect(style).toContain("bg-primary");
  });
});
