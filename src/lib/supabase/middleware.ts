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
  // Initialize response object
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client configured for server-side cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Get cookies from request.
         * @returns Array of request cookies.
         */
        getAll() {
          return request.cookies.getAll();
        },
        /**
         * Sync cookies to request and response.
         * @param cookiesToSet - Cookies to apply.
         * @param headersToSet - Headers to apply.
         */
        setAll(cookiesToSet, headersToSet) {
          // Update request cookies. Keep downstream routes in sync.
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          // Recreate response. Apply new headers.
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies on response.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // Set headers on response.
          Object.entries(headersToSet).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // PENTING: Hindari menulis logika apa pun di antara createServerClient dan
  // supabase.auth.getClaims(). Kesalahan kecil dapat menyulitkan pelacakan (debugging)
  // masalah cookie lintas browser, misalnya di Safari.
  
  // Segarkan token dan validasi JWT. getClaims() dapat memanfaatkan JWKS cache,
  // sehingga lebih ringan daripada getUser() yang selalu memanggil Auth server.
  await supabase.auth.getClaims();

  return supabaseResponse;
}