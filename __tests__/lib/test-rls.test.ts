import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
  env[key] = val;
});

const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

describe("RLS Policies Integration Test", () => {
  it("should test RLS on user_exam_sessions", async () => {
    // 1. Get a test user email/password or create one
    const email = `test-rls-${Date.now()}@example.com`;
    const password = "password123";

    const { data: authData, error: signUpErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    expect(signUpErr).toBeNull();
    const testUser = authData.user;
    expect(testUser).toBeDefined();
    console.log(`Created temp user for RLS test: ${testUser.id}`);

    try {
      // 2. Sign in with the anon client
      const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
        email,
        password
      });
      expect(signInErr).toBeNull();
      expect(signInData.session).toBeDefined();
      console.log("Signed in with anon client successfully.");

      // 3. Fetch template using anon client
      const { data: template, error: tErr } = await anonClient
        .from("jlpt_exam_templates")
        .select("*")
        .eq("slug", "jlpt-n5-moji-goi-paket-1")
        .single();
      expect(tErr).toBeNull();
      expect(template).toBeDefined();
      console.log("Fetched template with anon client.");

      // 4. Try to insert user_exam_session
      const sessionId = "11111111-1111-1111-1111-111111111111";
      const { data: session, error: insertErr } = await anonClient
        .from("user_exam_sessions")
        .insert({
          id: sessionId,
          user_id: testUser.id,
          template_id: template.id,
          jlpt_level: "N5",
          status: "in_progress",
          question_order: [],
          payload_snapshot: {},
          answers_snapshot: {}
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Insert failed under RLS:", insertErr);
      }
      expect(insertErr).toBeNull();
      expect(session).toBeDefined();
      console.log("Successfully inserted session under RLS!");
    } finally {
      // Clean up temp user
      await adminClient.auth.admin.deleteUser(testUser.id);
      console.log("Cleaned up temp user.");
    }
  });
});
