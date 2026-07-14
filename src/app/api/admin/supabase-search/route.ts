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
/**
 * Allowed origins for CORS validation.
 */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3333",
  "https://nihongoroute.my.id",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

/**
 * Maximum character length for search query.
 */
const MAX_QUERY_LENGTH = 80;

/**
 * Sanitizes search term for PostgREST query safety.
 * Escapes special characters and limits length.
 * 
 * @param term - Raw search query string.
 * @returns Sanitized search query string.
 */
function escapePostgrestSearchTerm(term: string) {
  return term
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    // Escape backslashes
    .replace(/\\/g, "\\\\")
    // Escape percentage signs
    .replace(/%/g, "\\%")
    // Escape underscores
    .replace(/_/g, "\\_")
    // Remove double quotes
    .replace(/"/g, "")
    // Replace commas with spaces
    .replace(/,/g, " ");
}

/**
 * Generates CORS headers based on request origin.
 * 
 * @param req - Incoming HTTP request.
 * @returns Object containing CORS headers.
 */
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  let allowOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    // Allow exact match or sanity.studio subdomains
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

/**
 * Handles CORS preflight OPTIONS requests.
 * 
 * @param req - Incoming HTTP request.
 * @returns NextResponse with CORS headers.
 */
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

/**
 * Handles GET search requests for categories, vocab, kanji, and grammar.
 * 
 * @param req - Incoming HTTP request.
 * @returns NextResponse containing search results or error message.
 */
export async function GET(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    // Validate admin authorization
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

    // Fetch course categories
    if (type === "category") {
      const { data, error } = await supabase
        .from("course_categories")
        .select("id, title, slug, type, description")
        .order("order_number", { ascending: true });

      if (error) throw error;
      return NextResponse.json({ data }, { headers: corsHeaders });
    }

    // Search vocabulary table
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

    // Search kanji table
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

    // Search grammar table
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