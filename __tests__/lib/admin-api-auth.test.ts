import { afterEach, describe, expect, it } from "vitest";
import { validateAdminApiRequest } from "@/lib/admin-api-auth";

describe("validateAdminApiRequest", () => {
  afterEach(() => {
    delete process.env.ADMIN_API_SECRET;
  });

  it("menolak request jika ADMIN_API_SECRET tidak dikonfigurasi", () => {
    const result = validateAdminApiRequest(new Request("https://example.test/api/admin"));

    expect(result).toEqual({
      ok: false,
      status: 503,
      error: "Admin API secret is not configured",
    });
  });

  it("menerima secret lewat bearer token", () => {
    process.env.ADMIN_API_SECRET = "super-secret";

    const result = validateAdminApiRequest(
      new Request("https://example.test/api/admin", {
        headers: {
          Authorization: "Bearer super-secret",
        },
      })
    );

    expect(result).toEqual({ ok: true, status: 200 });
  });

  it("menerima secret lewat x-admin-api-secret", () => {
    process.env.ADMIN_API_SECRET = "super-secret";

    const result = validateAdminApiRequest(
      new Request("https://example.test/api/admin", {
        headers: {
          "x-admin-api-secret": "super-secret",
        },
      })
    );

    expect(result).toEqual({ ok: true, status: 200 });
  });

  it("menolak secret di query string agar tidak bocor lewat URL log", () => {
    process.env.ADMIN_API_SECRET = "super-secret";

    const result = validateAdminApiRequest(
      new Request("https://example.test/api/admin?secret=super-secret")
    );

    expect(result).toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized",
    });
  });
});
