import { describe, expect, it } from "vitest";
import { securityHeaders } from "../../next.config";

describe("security headers", () => {
  it("allows same-origin microphone access for recorder features", () => {
    const permissionsPolicy = securityHeaders.find((header) => header.key === "Permissions-Policy");

    expect(permissionsPolicy?.value).toContain("microphone=(self)");
    expect(permissionsPolicy?.value).not.toContain("microphone=()");
  });
});
