import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seed() {
  const { data: level } = await supabase
    .from("levels")
    .select("id")
    .eq("code", "n5")
    .single();

  const lessons = Array.from({ length: 50 }).map((_, i) => ({
    level_id: level.id,
    slug: `n5-auto-${i + 1}`,
    title: `N5 Lesson ${i + 1}`,
    summary: "Draft lesson",
    content_html: "<p>Coming soon...</p>",
    order_number: 100 + i,
    category: "grammar",
  }));

  await supabase.from("lessons").insert(lessons);

  console.log("Seed complete");
}

seed();
