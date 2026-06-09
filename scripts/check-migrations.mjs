#!/usr/bin/env node

import fs from "fs";
import path from "path";
import process from "process";

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const migrationPattern = /^\d{14}_[a-z0-9_]+\.sql$/;

if (!fs.existsSync(migrationsDir)) {
  console.error("Missing supabase/migrations directory.");
  process.exit(1);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No Supabase migration files found.");
  process.exit(1);
}

const invalidNames = files.filter((file) => !migrationPattern.test(file));
if (invalidNames.length > 0) {
  console.error("Invalid migration filenames:");
  invalidNames.forEach((file) => console.error(`- ${file}`));
  console.error("Expected format: YYYYMMDDHHMMSS_descriptive_name.sql");
  process.exit(1);
}

const seenVersions = new Set();
const duplicateVersions = [];

for (const file of files) {
  const version = file.slice(0, 14);
  if (seenVersions.has(version)) {
    duplicateVersions.push(version);
  }
  seenVersions.add(version);
}

if (duplicateVersions.length > 0) {
  console.error("Duplicate migration timestamps:");
  duplicateVersions.forEach((version) => console.error(`- ${version}`));
  process.exit(1);
}

console.log(`Validated ${files.length} Supabase migration files.`);
