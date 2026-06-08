/**
 * @file route.ts
 * @description API Route Handler untuk pencarian data Supabase dari Sanity Studio (Admin).
 * Menyediakan endpoint pencarian lintas tabel (vocab, kanji, grammar) dengan CORS yang dikonfigurasi.
 */

// ======================
// IMPOR
// ======================
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateAdminApiRequest } from "@/lib/admin-api-auth";

// ======================
// KONSTANTA CORS
// ======================
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3333",
  "https://www.nihongoroute.my.id",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

const MAX_QUERY_LENGTH = 80;

function escapePostgrestSearchTerm(term: string) {
  return term
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, "")
    .replace(/,/g, " ");
}

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
    "Vary": "Origin",
    "Cache-Control": "no-store",
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
    const auth = validateAdminApiRequest(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const query = escapePostgrestSearchTerm(searchParams.get("query") || "");

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

      if (query) {
        queryBuilder = queryBuilder.or(
          `word.ilike."%${query}%",furigana.ilike."%${query}%",meaning_id.ilike."%${query}%",romaji.ilike."%${query}%"`
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

      if (query) {
        queryBuilder = queryBuilder.or(
          `character.ilike."%${query}%",meaning.ilike."%${query}%",onyomi.ilike."%${query}%",kunyomi.ilike."%${query}%",romaji.ilike."%${query}%"`
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

      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike."%${query}%",meaning.ilike."%${query}%",slug.ilike."%${query}%"`
        );
      }

      const { data, error } = await queryBuilder.limit(20);
      if (error) throw error;
      return NextResponse.json({ data }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: "Invalid search type" }, { status: 400, headers: corsHeaders });
  } catch (error: unknown) {
    console.error("Supabase Search Bridge Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json(
      { error: "Gagal memproses pencarian", details: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}
