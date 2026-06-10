#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const { validateJlptImportPackage } = await import(
  "../src/lib/exams/import-pipeline.ts"
);

function printUsage() {
  console.error(
    [
      "Usage:",
      "  npm run exam:import:validate -- <file.json> [--asset-root <dir>] [--require-declared-assets] [--json]",
      "",
      "Examples:",
      "  npm run exam:import:validate -- docs/jlpt-import-sample.json",
      "  npm run exam:import:validate -- data/imports/n5-paket-1.json --asset-root public/exam-assets",
    ].join("\n")
  );
}

function parseArgs(args) {
  const options = {
    inputPath: null,
    assetRoot: null,
    requireDeclaredAssets: false,
    json: false,
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

function printIssues(title, issues) {
  if (issues.length === 0) return;

  console.log(`\n${title}`);
  issues.forEach((issue) => {
    console.log(`- [${issue.code}] ${issue.path}: ${issue.message}`);
  });
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (!options.inputPath) {
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(options.inputPath);
  const assetRoot = options.assetRoot ? path.resolve(options.assetRoot) : null;
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const report = validateJlptImportPackage(raw, {
    requireDeclaredAssets: options.requireDeclaredAssets,
    assetExists: assetRoot
      ? (assetPath) => fs.existsSync(path.join(assetRoot, assetPath))
      : undefined,
  });

  if (options.json) {
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
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
