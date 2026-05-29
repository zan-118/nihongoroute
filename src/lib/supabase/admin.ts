/**
 * @file admin.ts
 * @description Klien inisiasi Supabase Administrator bypass RLS menggunakan SERVICE_ROLE_KEY. HANYA BOLEH DIJALANKAN DI LINGKUNGAN SERVER (Server Actions/API Routes) dan tidak boleh diekspos ke klien/browser.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ==========================================
// INISIALISASI KLIEN ADMIN SUPABASE
// ==========================================
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
