/**
 * @file middleware.ts
 * @description Middleware server-side Supabase untuk pemeliharaan masa aktif sesi autentikasi (cookie refresh) pada aplikasi Next.js. Menjamin sesi pengguna tetap valid saat berpindah halaman.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ==========================================
// FUNGSI UTAMA MIDDLEWARE
// ==========================================
/**
 * Menyegarkan sesi autentikasi pengguna secara aman di sisi server menggunakan cookies.
 * 
 * @param {NextRequest} request - Permintaan HTTP masuk dari Next.js middleware
 * @returns {Promise<NextResponse>} Respons HTTP yang diperbarui dengan cookies sesi terbaru
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // PENTING: Hindari menulis logika apa pun di antara createServerClient dan
  // supabase.auth.getUser(). Kesalahan kecil dapat menyulitkan pelacakan (debugging)
  // masalah cookie lintas browser, misalnya di Safari.
  
  // Segarkan token autentikasi dengan memanggil getUser()
  await supabase.auth.getUser();

  return supabaseResponse;
}
