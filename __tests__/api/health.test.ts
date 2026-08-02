import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";

describe("Health Check API Route Test (/api/health)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-valid",
      ADMIN_API_SECRET: "admin-secret-valid",
      SUPABASE_SERVICE_ROLE_KEY: "service-key-valid",
      GEMINI_API_KEY: "gemini-key-valid",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("harus mengembalikan status 200 'ok' saat seluruh variabel lingkungan wajib lengkap", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("harus mengembalikan status 503 'degraded' saat ada variabel wajib yang hilang", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("degraded");
  });
});
