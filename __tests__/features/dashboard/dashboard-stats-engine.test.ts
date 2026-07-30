import { describe, it, expect } from "vitest";
import {
  formatUserIdentifier,
  buildProgressSummary,
} from "@/features/dashboard/dashboard-stats-engine";

describe("DashboardStatsEngine", () => {
  it("format ID pengguna terautentikasi dengan benar", () => {
    const formatted = formatUserIdentifier("abc12345-6789-0000", true);
    expect(formatted).toBe("ST-ABC12345");
  });

  it("format ID tamu dengan benar", () => {
    const formatted = formatUserIdentifier("NP-GUEST1", false);
    expect(formatted).toBe("NP-GUEST1");
  });

  it("membangun ringkasan progres dengan nilai default jika input kosong", () => {
    const summary = buildProgressSummary({});
    expect(summary.id).toBe("guest");
    expect(summary.name).toBe("Pelajar");
    expect(summary.xp).toBe(0);
    expect(summary.level).toBe(1);
    expect(summary.inventory.streakFreeze).toBe(0);
  });
});
