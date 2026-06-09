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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin client is not configured");
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey
  );
}
