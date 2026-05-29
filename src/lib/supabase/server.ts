/**
 * @file server.ts
 * @description Klien inisiasi Supabase Server-Side untuk Server Components, Route Handlers, dan Server Actions di Next.js dengan penanganan otomatis pembacaan/penulisan cookies.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ==========================================
// INISIALISASI KLIEN SERVER SUPABASE
// ==========================================
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Metode `set` dipanggil dari Server Component.
            // Hal ini dapat diabaikan jika Anda memiliki middleware yang menyegarkan sesi pengguna.
          }
        },
      },
    }
  );
}
