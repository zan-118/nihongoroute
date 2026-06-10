#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const { buildJlptImportPlan, validateJlptImportPackage } = await import(
  "../src/lib/exams/import-pipeline.ts"
);

const EXAM_ASSETS_BUCKET = "exam-assets";

function printUsage() {
  console.error(
    [
      "Usage:",
      "  npm run exam:import:validate -- <file.json> [--asset-root <dir>] [--require-declared-assets] [--json] [--plan] [--apply]",
      "",
      "Examples:",
      "  npm run exam:import:validate -- docs/jlpt-import-sample.json",
      "  npm run exam:import:validate -- docs/jlpt-import-sample.json --plan",
      "  npm run exam:import:validate -- data/imports/n5-paket-1.json --asset-root public/exam-assets",
      "  npm run exam:import:validate -- data/imports/n5-paket-1.json --asset-root public/exam-assets --apply",
    ].join("\n")
  );
}

function parseArgs(args) {
  const options = {
    inputPath: null,
    assetRoot: null,
    requireDeclaredAssets: false,
    json: false,
    plan: false,
    apply: false,
    skipAssets: false,
    upsertAssets: true,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--asset-root") {
      options.assetRoot = args[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--require-declared-assets") {
      options.requireDeclaredAssets = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--plan") {
      options.plan = true;
      continue;
    }

    if (arg === "--apply") {
      options.apply = true;
      continue;
    }

    if (arg === "--skip-assets") {
      options.skipAssets = true;
      continue;
    }

    if (arg === "--no-upsert-assets") {
      options.upsertAssets = false;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (!options.inputPath) {
      options.inputPath = arg;
      continue;
    }

    throw new Error(`Argumen tidak dikenal: ${arg}`);
  }

  return options;
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) return;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });
}

function inferMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".ogg") return "audio/ogg";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function resolveAssetLocalPath(asset, inputDir, assetRoot) {
  if (asset.localPath) {
    return path.isAbsolute(asset.localPath)
      ? asset.localPath
      : path.resolve(inputDir, asset.localPath);
  }

  if (!assetRoot) return null;
  return path.join(assetRoot, asset.path);
}

function printPlanSummary(plan) {
  console.log(
    [
      `Rows planned:`,
      `- templates: 1`,
      `- passages: ${plan.rows.passages.length}`,
      `- questions: ${plan.rows.questions.length}`,
      `- template questions: ${plan.rows.templateQuestions.length}`,
      `Assets planned: ${plan.assets.length}`,
      `Template ID: ${plan.keyMap.templateId}`,
    ].join("\n")
  );
}

function printIssues(title, issues) {
  if (issues.length === 0) return;

  console.log(`\n${title}`);
  issues.forEach((issue) => {
    console.log(`- [${issue.code}] ${issue.path}: ${issue.message}`);
  });
}

async function createSupabaseAdminClient() {
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia untuk --apply."
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

async function uploadAssets(supabase, plan, options, inputDir, assetRoot) {
  if (options.skipAssets) {
    console.log("Skipping asset upload.");
    return;
  }

  for (const asset of plan.assets.filter((item) => item.referenced)) {
    const localPath = resolveAssetLocalPath(asset, inputDir, assetRoot);
    if (!localPath) {
      throw new Error(
        `Asset "${asset.path}" tidak punya localPath dan --asset-root tidak diberikan.`
      );
    }
    if (!fs.existsSync(localPath)) {
      throw new Error(`Asset "${asset.path}" tidak ditemukan di ${localPath}.`);
    }

    const body = fs.readFileSync(localPath);
    const { error } = await supabase.storage
      .from(EXAM_ASSETS_BUCKET)
      .upload(asset.path, body, {
        cacheControl: "31536000",
        contentType: asset.mimeType || inferMimeType(localPath),
        upsert: options.upsertAssets,
      });

    if (error) throw new Error(`Upload asset "${asset.path}" gagal: ${error.message}`);
    console.log(`Uploaded asset: ${asset.path}`);
  }
}

async function upsertRows(supabase, plan) {
  if (plan.rows.passages.length > 0) {
    const { error } = await supabase
      .from("jlpt_passages")
      .upsert(plan.rows.passages, { onConflict: "id" });
    if (error) throw new Error(`Upsert passages gagal: ${error.message}`);
  }

  if (plan.rows.questions.length > 0) {
    const { error } = await supabase
      .from("jlpt_questions")
      .upsert(plan.rows.questions, { onConflict: "id" });
    if (error) throw new Error(`Upsert questions gagal: ${error.message}`);
  }

  const { error: templateError } = await supabase
    .from("jlpt_exam_templates")
    .upsert(plan.rows.template, { onConflict: "id" });
  if (templateError) {
    throw new Error(`Upsert template gagal: ${templateError.message}`);
  }

  if (plan.rows.templateQuestions.length > 0) {
    const { error: deleteError } = await supabase
      .from("jlpt_exam_template_questions")
      .delete()
      .eq("template_id", plan.keyMap.templateId);
    if (deleteError) {
      throw new Error(`Reset template questions gagal: ${deleteError.message}`);
    }

    const { error: insertError } = await supabase
      .from("jlpt_exam_template_questions")
      .insert(plan.rows.templateQuestions);
    if (insertError) {
      throw new Error(`Insert template questions gagal: ${insertError.message}`);
    }
  }

  console.log("Supabase import applied.");
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (!options.inputPath) {
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(options.inputPath);
  const inputDir = path.dirname(inputPath);
  const assetRoot = options.assetRoot ? path.resolve(options.assetRoot) : null;
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const validateOptions = {
    requireDeclaredAssets: options.requireDeclaredAssets,
    assetExists: assetRoot
      ? (assetPath) => fs.existsSync(path.join(assetRoot, assetPath))
      : undefined,
  };
  const report = validateJlptImportPackage(raw, validateOptions);

  if (options.json && !options.plan) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `JLPT import validation: ${report.ok ? "OK" : "FAILED"}`,
        `Template: ${report.summary.templateSlug ?? "-"}`,
        `Level: ${report.summary.jlptLevel ?? "-"}`,
        `Mode: ${report.summary.generationMode ?? "-"}`,
        `Questions: ${report.summary.totalQuestions}`,
        `Passages: ${report.summary.totalPassages}`,
        `Template items: ${report.summary.totalTemplateQuestions}`,
        `Assets referenced: ${report.summary.assetReferences.length}`,
      ].join("\n")
    );
    printIssues("Errors", report.errors);
    printIssues("Warnings", report.warnings);
  }

  if (!report.ok) process.exit(1);

  if (options.plan || options.apply) {
    const plan = buildJlptImportPlan(raw, validateOptions);
    if (options.json || options.plan) {
      console.log(JSON.stringify(plan, null, 2));
    } else {
      printPlanSummary(plan);
    }

    if (options.apply) {
      const supabase = await createSupabaseAdminClient();
      await uploadAssets(supabase, plan, options, inputDir, assetRoot);
      await upsertRows(supabase, plan);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
