/**
 * @file route.ts
 * @description API Route Handler untuk memproses callback OAuth dari Supabase Auth.
 * Menukar authorization code menjadi sesi pengguna dan melakukan redirect ke halaman tujuan.
 */

// IMPOR

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// HANDLER

/**
 * Handle OAuth callback.
 * Exchange code for session. Redirect to next page or login on error.
 * 
 * @param request - Incoming HTTP request.
 * @returns Redirect response.
 */
export async function GET(request: Request) {
 // Extract query params, origin URL.
 const { searchParams, origin } = new URL(request.url);
 // Get auth code from provider.
 const code = searchParams.get("code");
 // Fallback redirect path.
 const next = searchParams.get("next") ?? "/dashboard";

 if (code) {
 const supabase = await createClient();
 // Swap code for active session.
 const { error } = await supabase.auth.exchangeCodeForSession(code);
 
 if (!error) {
 return NextResponse.redirect(`${origin}${next}`);
 } else {
 console.error("Auth callback error:", error);
 }
 }

 // Jika gagal, kembalikan ke halaman login
 // Redirect to login if auth fail.
 return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}