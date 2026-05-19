import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3333",
  "https://www.nihongoroute.my.id",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  let allowOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".sanity.studio")) {
      allowOrigin = origin;
    }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function GET(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const query = searchParams.get("query") || "";
    const secret = searchParams.get("secret");

    // Authenticate using the secret token
    if (secret !== "d5a7a32586755e828a338457a2524288") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const supabase = createAdminClient();

    if (type === "category") {
      const { data, error } = await supabase
        .from("course_categories")
        .select("id, title, slug, type, description")
        .order("order_number", { ascending: true });

      if (error) throw error;
      return NextResponse.json({ data }, { headers: corsHeaders });
    }

    if (type === "vocab") {
      let queryBuilder = supabase
        .from("vocab")
        .select("id, word, furigana, meaning_id, jlpt_level, slug");

      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `word.ilike.%${query}%,furigana.ilike.%${query}%,meaning_id.ilike.%${query}%,romaji.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder.limit(20);
      if (error) throw error;
      return NextResponse.json({ data }, { headers: corsHeaders });
    }

    if (type === "kanji") {
      let queryBuilder = supabase
        .from("kanji")
        .select("id, character, meaning, jlpt_level");

      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `character.ilike.%${query}%,meaning.ilike.%${query}%,onyomi.ilike.%${query}%,kunyomi.ilike.%${query}%,romaji.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder.limit(20);
      if (error) throw error;
      return NextResponse.json({ data }, { headers: corsHeaders });
    }

    if (type === "grammar") {
      let queryBuilder = supabase
        .from("grammar")
        .select("id, title, meaning, jlpt_level, slug");

      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,meaning.ilike.%${query}%,slug.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder.limit(20);
      if (error) throw error;
      return NextResponse.json({ data }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: "Invalid search type" }, { status: 400, headers: corsHeaders });
  } catch (error: any) {
    console.error("Supabase Search Bridge Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pencarian", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
