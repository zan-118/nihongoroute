import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHasMounted } from "@/hooks/useHasMounted";

describe("useHasMounted Hook Test", () => {
  it("harus mengembalikan true setelah komponen terpasang (mounted)", () => {
    const { result } = renderHook(() => useHasMounted());
    expect(result.current).toBe(true);
  });
});
