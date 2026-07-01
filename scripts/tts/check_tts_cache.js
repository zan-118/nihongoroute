#!/usr/bin/env node

/**
 * @file check_tts_cache.js
 * @description Script utilitas produksi (CommonJS) untuk memantau status cache TTS (Text-to-Speech) 
 * di database Supabase (tabel tts_cache). Menampilkan statistik total baris, 
 * pembagian per voice agent (paginasi dinamis), dan daftar entri cache terbaru.
 * 
 * Penggunaan:
 *   node scripts/tts/check_tts_cache.js
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { createClient } = require("@supabase/supabase-js");

// Membaca file konfigurasi lokal .env.local
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ [Env] File .env.local tidak ditemukan.");
    process.exit(1);
  }

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

async function checkTtsCache() {
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    process.exit(1);
  }

  console.log(`🔌 [Supabase] Menghubungkan ke ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Hitung total baris cache
    const { count: totalCache, error: countError } = await supabase
      .from("tts_cache")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(`Gagal menghitung tts_cache: ${countError.message}`);
    }

    console.log(`📊 [Cache] Total baris di tabel 'tts_cache': ${totalCache}`);

    // 2. Ambil semua unique voice secara dinamis lewat paginasi data ringan
    console.log("🔍 [Database] Menganalisis distribusi suara secara dinamis...");
    const voiceStats = {};
    let page = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("tts_cache")
        .select("voice")
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        data.forEach((row) => {
          const v = row.voice || "Unknown";
          voiceStats[v] = (voiceStats[v] || 0) + 1;
        });
        page += 1;
        if (data.length < limit) {
          hasMore = false;
        }
      }
    }

    console.log("\n👥 Distribusi Pengisi Suara (Voice Agent):");
    console.log("=".repeat(40));
    Object.entries(voiceStats).forEach(([voice, count]) => {
      console.log(`-  ${voice.padEnd(20)} : ${count} audio`);
    });
    console.log("=".repeat(40));

    // 3. Tampilkan 15 item cache terbaru
    const { data: recents, error: recentError } = await supabase
      .from("tts_cache")
      .select("id, text, voice, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    if (recentError) {
      throw new Error(`Gagal memuat entri terbaru: ${recentError.message}`);
    }

    console.log("\n🆕 15 Entri Audio Cache Terbaru:");
    console.log("=".repeat(80));
    console.log(`| ${"ID/MD5 Hash".padEnd(32)} | ${"Voice".padEnd(12)} | ${"Text".padEnd(25)} |`);
    console.log("=".repeat(80));
    
    recents.forEach((item) => {
      const hashStr = item.id.substring(0, 30) + "...";
      const voiceStr = item.voice ? item.voice.substring(0, 11) : "None";
      const textStr = item.text ? (item.text.length > 22 ? item.text.substring(0, 21) + "..." : item.text) : "";
      console.log(`| ${hashStr.padEnd(32)} | ${voiceStr.padEnd(12)} | ${textStr.padEnd(25)} |`);
    });
    console.log("=".repeat(80));

  } catch (error) {
    console.error("❌ [Error] Gagal menjalankan pemeriksaan cache:", error.message || error);
    process.exit(1);
  }
}

checkTtsCache();
