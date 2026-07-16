import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const csvFilePath = path.resolve(process.cwd(), 'articles_rows_fixed.csv');

async function importArticles() {
  const results = [];
  
  console.log(`Membaca file CSV dari: ${csvFilePath}`);
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          // Parse individual fields
          const parsed = {
            id: data.id,
            category_id: data.category_id || null,
            title: data.title,
            slug: data.slug,
            order_number: data.order_number ? parseInt(data.order_number, 10) : null,
            summary: data.summary || null,
            quizzes: data.quizzes ? JSON.parse(data.quizzes) : [],
            estimated_minutes: data.estimated_minutes ? parseInt(data.estimated_minutes, 10) : null,
            is_premium: data.is_premium ? (data.is_premium.toLowerCase() === 'true') : false,
            is_published: data.is_published ? (data.is_published.toLowerCase() === 'true') : true,
            seo: data.seo ? JSON.parse(data.seo) : {},
            created_at: data.created_at || new Date().toISOString(),
            content: data.content || '',
            image_url: data.image_url || null
          };
          results.push(parsed);
        } catch (parseError) {
          console.error(`Gagal melakukan parse untuk baris dengan ID ${data.id || 'unknown'}:`, parseError.message);
          console.error("Data mentah:", data);
          reject(parseError);
        }
      })
      .on('end', () => {
        console.log(`Selesai membaca CSV. Ditemukan ${results.length} artikel.`);
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });

  if (results.length === 0) {
    console.error("Error: Tidak ada data ditemukan di CSV.");
    return;
  }

  // Jika argumen '--dry-run' dilewatkan, jangan lakukan mutasi database
  if (process.argv.includes('--dry-run')) {
    console.log("Menjalankan mode uji coba (dry-run). Tidak ada perubahan dilakukan ke database.");
    console.log("Contoh hasil parse artikel pertama:");
    console.log(JSON.stringify(results[0], null, 2));
    return;
  }

  // Hapus data lama di tabel articles
  console.log("Menghapus data lama dari tabel articles...");
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Hapus semua baris

  if (deleteError) {
    console.error("Gagal menghapus data lama:", deleteError.message);
    return;
  }
  console.log("Tabel articles berhasil dikosongkan.");

  // Batch insert ke Supabase (per 10 baris)
  const BATCH_SIZE = 10;
  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE);
    console.log(`Mengunggah batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} baris)...`);
    const { error: insertError } = await supabase
      .from('articles')
      .insert(batch);

    if (insertError) {
      console.error(`Gagal mengunggah batch pada indeks ${i}:`, insertError.message);
      return;
    }
  }

  console.log("🎉 Berhasil memperbarui semua artikel di tabel articles!");
}

importArticles().catch(err => {
  console.error("Error saat menjalankan import:", err);
});
