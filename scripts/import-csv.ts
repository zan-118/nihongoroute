import fs from "fs";
import csv from "csv-parser";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function run() {
  const rows: any[] = [];

  fs.createReadStream("n5_vocab.csv")
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      const { data: level } = await supabase
        .from("levels")
        .select("id")
        .eq("code", "n5")
        .single();

      const formatted = rows.map((r) => ({
        level_id: level.id,
        word: r.word,
        meaning: r.meaning,
        romaji: r.romaji,
        type: r.type,
      }));

      await supabase.from("flashcards").insert(formatted);

      console.log("CSV Import Complete");
    });
}

run();
