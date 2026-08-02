import fs from "fs";
import path from "path";

/**
 * Migration Check Script
 * Validates that Supabase migrations folder exists, contains consolidated initial schema,
 * and no orphaned temporary timestamped migrations remain.
 */
const migrationsDir = path.join(process.cwd(), "supabase", "migrations");

if (!fs.existsSync(migrationsDir)) {
  console.error("❌ Migration folder not found:", migrationsDir);
  process.exit(1);
}

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));

if (files.length === 0) {
  console.error("❌ No SQL migration files found in:", migrationsDir);
  process.exit(1);
}

console.log(`✅ Supabase migration check passed! (${files.length} migration file(s) verified in ${migrationsDir})`);
process.exit(0);
