import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const root = process.cwd();

describe("100% Documentation Integrity & Codebase Sync Audit", () => {
  it("harus memiliki seluruh 13 dokumen teknis UPPERCASE di /docs/", () => {
    const docsFiles = [
      "README.md",
      "OVERVIEW.md",
      "GETTING_STARTED.md",
      "ARCHITECTURE.md",
      "DATA_MODEL.md",
      "API_REFERENCE.md",
      "CONFIGURATION.md",
      "SECURITY.md",
      "DEPLOYMENT.md",
      "DESIGN_SYSTEM.md",
      "TROUBLESHOOTING.md",
      "CONTRIBUTING.md",
      "ADR.md",
    ];

    docsFiles.forEach((file) => {
      const exists = fs.existsSync(path.join(root, "docs", file));
      expect(exists, `Dokumen /docs/${file} tidak ditemukan`).toBe(true);
    });
  });

  it("harus memiliki seluruh 5 dokumen root-level & community", () => {
    const rootFiles = ["README.md", "CONTRIBUTING.md", "LICENSE", "CHANGELOG.md", "ROADMAP.md"];
    rootFiles.forEach((file) => {
      const exists = fs.existsSync(path.join(root, file));
      expect(exists, `Dokumen root ${file} tidak ditemukan`).toBe(true);
    });
  });

  it("harus memiliki seluruh 28 tabel database yang tertulis di DATA_MODEL.md di skema migrasi", () => {
    const schemaPath = path.join(root, "supabase/migrations/20260620130000_initial_schema.sql");
    expect(fs.existsSync(schemaPath)).toBe(true);

    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const tables = [
      "profiles",
      "user_srs",
      "user_lessons",
      "user_xp_ledger",
      "user_feedback",
      "course_categories",
      "lessons",
      "articles",
      "kanji",
      "vocab",
      "grammar",
      "radicals",
      "sentences",
      "expressions",
      "cheatsheets",
      "listening",
      "reading",
      "jlpt_exam_templates",
      "jlpt_passages",
      "jlpt_questions",
      "jlpt_exam_template_questions",
      "user_exam_sessions",
      "user_exam_answers",
      "community_posts",
      "community_comments",
      "notifications",
      "tts_cache",
      "supporters",
    ];

    tables.forEach((table) => {
      const match =
        schemaContent.includes(`CREATE TABLE public.${table}`) ||
        schemaContent.includes(`CREATE TABLE ${table}`);
      expect(match, `Tabel DB '${table}' dari DATA_MODEL.md tidak ditemukan di skema SQL`).toBe(true);
    });
  });

  it("harus memiliki seluruh 6 API Route Handlers yang tertulis di API_REFERENCE.md", () => {
    const apiRoutes = [
      "src/app/api/tts/route.ts",
      "src/app/api/cards/route.ts",
      "src/app/api/health/route.ts",
      "src/app/api/webhooks/saweria/route.ts",
      "src/app/api/webhooks/trakteer/route.ts",
      "src/app/auth/callback/route.ts",
    ];

    apiRoutes.forEach((route) => {
      const exists = fs.existsSync(path.join(root, route));
      expect(exists, `API Route '${route}' dari API_REFERENCE.md tidak ditemukan`).toBe(true);
    });
  });

  it("harus memiliki seluruh 19 Server Action files di src/actions/", () => {
    const actions = [
      "vocab.actions.ts",
      "kanji.actions.ts",
      "grammar.actions.ts",
      "lessons.actions.ts",
      "listening.actions.ts",
      "reading.actions.ts",
      "cheatsheets.actions.ts",
      "sentences.actions.ts",
      "expressions.actions.ts",
      "dictionary.actions.ts",
      "flashcard.actions.ts",
      "exams.actions.ts",
      "jlpt-exams.actions.ts",
      "community.actions.ts",
      "support.actions.ts",
      "tools-integration.actions.ts",
      "library.actions.ts",
      "library-counts.actions.ts",
      "contact.actions.ts",
    ];

    actions.forEach((file) => {
      const exists = fs.existsSync(path.join(root, "src/actions", file));
      expect(exists, `Server Action '${file}' dari API_REFERENCE.md tidak ditemukan`).toBe(true);
    });
  });

  it("harus memiliki seluruh 22 modul feature domain di src/features/", () => {
    const features = [
      "auth",
      "courses",
      "dashboard",
      "ecosystem",
      "exams",
      "games",
      "gamification",
      "landing",
      "library",
      "media",
      "notifications",
      "pdf",
      "review",
      "settings",
      "share",
      "social",
      "srs",
      "support",
      "tools",
      "user",
      "about",
      "contact",
    ];

    features.forEach((feat) => {
      const exists = fs.existsSync(path.join(root, "src/features", feat));
      expect(exists, `Feature Domain '${feat}' dari ARCHITECTURE.md tidak ditemukan`).toBe(true);
    });
  });

  it("harus memiliki 4 Zustand store files di src/store/", () => {
    const stores = ["useUserStore.ts", "useSRSStore.ts", "useUIStore.ts", "useAuthStore.ts"];
    stores.forEach((store) => {
      const exists = fs.existsSync(path.join(root, "src/store", store));
      expect(exists, `Store '${store}' dari ARCHITECTURE.md tidak ditemukan`).toBe(true);
    });
  });
});
