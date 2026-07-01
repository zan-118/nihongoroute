#!/usr/bin/env node

/**
 * @file check_voicevox_speakers.js
 * @description Script utilitas produksi (CommonJS) untuk memverifikasi koneksi ke server VOICEVOX lokal 
 * dan menampilkan daftar speaker (pengisi suara) beserta Style ID yang tersedia.
 * 
 * Penggunaan:
 *   node scripts/tts/check_voicevox_speakers.js
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

// Membaca file konfigurasi lokal .env.local
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

async function checkVoicevoxSpeakers() {
  loadEnvFile();
  const VOICEVOX_HOST = process.env.VOICEVOX_URL || "http://127.0.0.1:50021";

  console.log(`🔍 [VOICEVOX] Menghubungi server di ${VOICEVOX_HOST}...`);

  try {
    const response = await fetch(`${VOICEVOX_HOST}/speakers`);
    
    if (!response.ok) {
      console.error(`❌ [VOICEVOX] Server merespon dengan status: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const speakers = await response.json();
    
    if (!Array.isArray(speakers) || speakers.length === 0) {
      console.warn("⚠️ [VOICEVOX] Tidak ada speaker yang ditemukan di server.");
      process.exit(0);
    }

    console.log(`\n🎉 [VOICEVOX] Koneksi sukses! Ditemukan ${speakers.length} karakter pengisi suara:\n`);
    console.log("=".repeat(60));

    speakers.forEach((speaker) => {
      console.log(`🗣️  Karakter: "${speaker.name}" (UUID: ${speaker.speaker_uuid})`);
      
      if (Array.isArray(speaker.styles)) {
        speaker.styles.forEach((style) => {
          console.log(`   └─ Style: "${style.name}" (ID: ${style.id})`);
        });
      }
      console.log("-".repeat(60));
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\n❌ [VOICEVOX] Gagal terhubung ke server VOICEVOX.");
    console.error("Pastikan aplikasi VOICEVOX sudah dijalankan di background.");
    console.error(`Detail error: ${message}`);
    process.exit(1);
  }
}

checkVoicevoxSpeakers();
