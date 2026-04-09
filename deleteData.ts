import { getCliClient } from "sanity/cli";

async function main() {
  // Mendapatkan akses ke database kamu
  const client = getCliClient();

  // Mencari HANYA ID dari semua flashcard
  const query = `*[_type == "flashcard"]._id`;

  console.log("🔍 Mencari flashcard...");
  const ids = await client.fetch(query);

  if (!ids.length) {
    console.log("✅ Tidak ada flashcard yang ditemukan. Dapur sudah bersih!");
    return;
  }

  console.log(`🗑️ Ditemukan ${ids.length} flashcard. Mulai menghapus...`);

  // Proses hapus satu per satu secara otomatis
  for (const id of ids) {
    await client.delete(id);
    console.log(`Terhapus: ${id}`);
  }

  console.log("🎉 Penghapusan massal selesai!");
}

main().catch(console.error);
