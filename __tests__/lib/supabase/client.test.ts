import { describe, it, expect, afterEach } from "vitest";
import { createClient } from "@/lib/supabase/client";

describe("Supabase Client Initializer (client.ts)", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it("should initialize client without throwing when env vars exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hubqetausiziocdlbdmd.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => createClient()).not.toThrow();
  });

  it("should auto-prepend https:// if scheme is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "hubqetausiziocdlbdmd.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => createClient()).not.toThrow();
  });
});
