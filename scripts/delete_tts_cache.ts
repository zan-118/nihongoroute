import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("Starting FAST Parallel TTS Cache cleanup...");
  const bucketName = 'tts-cache';
  
  let totalDeleted = 0;
  let hasMore = true;

  // Hapus dari database dlu biar sinkron
  console.log("Deleting all records from database table 'tts_cache'...");
  const { error: dbError } = await supabase
    .from('tts_cache')
    .delete()
    .neq('id', 'placeholder_prevent_accidental_empty_delete');

  if (dbError) {
    console.error("Failed to delete database records:", dbError);
  } else {
    console.log("Database table 'tts_cache' cleared successfully.");
  }

  while (hasMore) {
    console.log("Listing next 1000 files...");
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000 });

    if (listError) {
      console.error("Failed to list storage files:", listError);
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
    }

    if (!files || files.length === 0) {
      console.log("No more files found in bucket.");
      hasMore = false;
      break;
    }

    const fileNames = files.map(file => file.name);
    console.log(`Retrieved ${fileNames.length} files. Deleting in parallel batches...`);

    // Bagi 1000 file menjadi 10 batch berukuran 100
    const batchSize = 100;
    const batches: string[][] = [];
    for (let i = 0; i < fileNames.length; i += batchSize) {
      batches.push(fileNames.slice(i, i + batchSize));
    }

    // Jalankan penghapusan batch secara pararel
    const deletePromises = batches.map((batch, index) => {
      return supabase.storage
        .from(bucketName)
        .remove(batch)
        .then(({ data, error }) => {
          if (error) {
            console.error(`Batch ${index} failed:`, error.message);
            return 0;
          }
          return batch.length;
        });
    });

    const results = await Promise.all(deletePromises);
    const deletedInThisIteration = results.reduce((sum, val) => sum + val, 0);
    totalDeleted += deletedInThisIteration;

    console.log(`Completed iteration. Deleted ${deletedInThisIteration} files. Total deleted: ${totalDeleted}`);

    if (files.length < 1000) {
      hasMore = false;
    }
  }

  console.log(`FAST TTS Cache cleanup finished. Total files deleted: ${totalDeleted}`);
}

main().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
