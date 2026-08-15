import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/indexnow/route";

const ADMIN_SECRET = "test-admin-secret-key-123";

vi.mock("@/lib/services/indexnow", () => ({
  submitIndexNow: vi.fn().mockResolvedValue({
    success: true,
    submittedCount: 5,
    message: "Successfully submitted 5 URL(s) to IndexNow",
  }),
}));

import { submitIndexNow } from "@/lib/services/indexnow";

function createRequest(options: { token?: string; body?: unknown } = {}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token !== undefined) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  return new Request("http://localhost/api/indexnow", {
    method: "POST",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

describe("POST /api/indexnow Route Handler", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_API_SECRET", ADMIN_SECRET);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails with 503 if ADMIN_API_SECRET is not configured", async () => {
    vi.stubEnv("ADMIN_API_SECRET", "");
    const response = await POST(createRequest({ token: "anything" }));
    expect(response.status).toBe(503);
  });

  it("fails with 401 on missing or invalid admin token", async () => {
    const response = await POST(createRequest({ token: "wrong-token" }));
    expect(response.status).toBe(401);
  });

  it("successfully triggers submission when authenticated", async () => {
    const response = await POST(
      createRequest({
        token: ADMIN_SECRET,
        body: { urls: ["/courses/n5", "/library/vocab"] },
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.submittedCount).toBe(5);
    expect(submitIndexNow).toHaveBeenCalledWith(["/courses/n5", "/library/vocab"]);
  });

  it("falls back to default canonical paths when no body is supplied", async () => {
    const response = await POST(createRequest({ token: ADMIN_SECRET }));
    expect(response.status).toBe(200);
    expect(submitIndexNow).toHaveBeenCalled();
  });
});
