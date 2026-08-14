import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260620130000_initial_schema.sql"),
  "utf8",
);

describe("Supabase migration security", () => {
  it("keeps public views under table RLS", () => {
    expect(migration).toContain("public.leaderboard_profiles WITH (security_invoker = true)");
    expect(migration).not.toContain("security_invoker = false");
  });

  it("does not leave security definer functions executable by default", () => {
    expect(migration).toContain("REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;");
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.sync_user_progress(text, integer, integer, integer, text, jsonb, jsonb, jsonb, jsonb, jsonb) TO authenticated;",
    );
  });

  it("enables RLS on all documented public tables", () => {
    const enabledTables = [...migration.matchAll(/ALTER TABLE public\.([a-z_]+) ENABLE ROW LEVEL SECURITY;/g)]
      .map((match) => match[1])
      .sort();

    expect(enabledTables).toHaveLength(28);
    expect(new Set(enabledTables).size).toBe(28);
  });
});
