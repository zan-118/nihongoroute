/**
 * @file route.ts
 * @description API Route Handler untuk memproses callback OAuth dari Supabase Auth.
 * Menukar authorization code menjadi sesi pengguna dan melakukan redirect ke halaman tujuan.
 */

// ======================
// IMPOR
// ======================
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ======================
// HANDLER
// ======================
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Auth callback error:", error);
    }
  }

  // Jika gagal, kembalikan ke halaman login
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
