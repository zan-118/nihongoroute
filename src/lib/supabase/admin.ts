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
/**
 * Create Supabase client with service role key.
 * Bypass RLS. Server-side only. Do not expose to client.
 * @returns Supabase client instance.
 * @throws Error if environment variables missing.
 */
export function createAdminClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate credentials exist
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin client is not configured");
  }

  // Initialize client with service role key to bypass RLS
  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey
  );
}