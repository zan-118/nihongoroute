import { createClient } from "@sanity/client";
import fs from "fs";
import readline from "readline";

const client = createClient({
  projectId: "qoczxvvo",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-04-12",
  token:
    "skGQitdyMZKAn1jukt7ThwtmTwqg6oOwerdSi7lv2B8cLCbBJGVGaYcymJW5KsIDWlXdsZdTOjE1Id9WI3njPGHVuCqpTLzWKRO99Fh0XARW3JRNg6Vm8HS2Bxdnhcn7f8j2T5tVMYEyw3pYBcAlIVnM0NB47M3USXUnKMAQI5lM26xXYP7U",
});

async function importBab1() {
  const fileStream = fs.createReadStream("./data.ndjson");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log("🚀 Memulai import materi Bab 1...");

  for await (const line of rl) {
    if (!line.trim()) continue;
    const doc = JSON.parse(line);
    try {
      await client.createOrReplace(doc);
      console.log(
        `✅ Sukses: [${doc._type}] ${doc.title || doc.word || doc._id}`,
      );
    } catch (err) {
      console.error(`❌ Gagal: ${doc._id}`, err.message);
    }
  }
  console.log("\n✨ Semua materi Bab 1 berhasil diunggah!");
}

importBab1();
