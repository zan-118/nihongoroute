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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

describe("Supabase Integration Tests", () => {
  it("should fetch published templates and questions", async () => {
    const { data: template, error: tErr } = await supabase
      .from("jlpt_exam_templates")
      .select("*")
      .eq("slug", "jlpt-n5-moji-goi-paket-1")
      .single();

    expect(tErr).toBeNull();
    expect(template).toBeDefined();
    expect(template.is_published).toBe(true);

    const { data: questions, error: qErr } = await supabase
      .from("jlpt_exam_template_questions")
      .select("*, question:jlpt_questions!inner(*)")
      .eq("template_id", template.id)
      .eq("question.is_published", true);

    expect(qErr).toBeNull();
    expect(questions.length).toBeGreaterThan(0);
    console.log(`Verified template has ${questions.length} published questions.`);
  });

  it("should test user_exam_sessions insert with a dummy user id", async () => {
    // Let's find a user in auth.users first
    const { data: users, error: uErr } = await supabase.auth.admin.listUsers({
      limit: 1
    });
    expect(uErr).toBeNull();
    expect(users.users.length).toBeGreaterThan(0);

    const testUser = users.users[0];
    console.log(`Using test user: ${testUser.id} (${testUser.email})`);

    const { data: template } = await supabase
      .from("jlpt_exam_templates")
      .select("*")
      .eq("slug", "jlpt-n5-moji-goi-paket-1")
      .single();

    const sessionId = "00000000-0000-0000-0000-000000000000";
    
    // Clean up if it exists
    await supabase.from("user_exam_sessions").delete().eq("id", sessionId);

    // Try inserting a session
    const { data: session, error: sErr } = await supabase
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

    if (sErr) {
      console.error("Session insert error:", sErr);
    }
    expect(sErr).toBeNull();
    expect(session.id).toBe(sessionId);

    // Clean up
    await supabase.from("user_exam_sessions").delete().eq("id", sessionId);
    console.log("Insert session test passed successfully.");
  });
});
