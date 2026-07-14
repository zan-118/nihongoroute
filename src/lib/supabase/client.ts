/**
 * @file client.ts
 * @description Klien inisiasi Supabase Browser untuk akses data secara luring-first di sisi klien (browser) dengan batasan RLS (Row Level Security) yang aman.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createBrowserClient } from "@supabase/ssr";

/** 
 * Cache Supabase browser client instance. Prevent multiple initializations.
 */
let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

// ==========================================
// INISIALISASI KLIEN BROWSER SUPABASE
// ==========================================
/**
 * Create or return cached Supabase browser client.
 * Safe for client-side rendering environments.
 * 
 * @returns Supabase client instance.
 */
export function createClient() {
  // Return existing instance if already created.
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback to empty strings if env vars missing. Prevent crash.
  if (!url || !key) {
    console.error("Variabel lingkungan Supabase tidak ditemukan!");
    // Kembalikan client dummy atau tangani secara anggun untuk menghindari error 500
    return createBrowserClient("", ""); 
  }

  cachedClient = createBrowserClient(url, key);
  return cachedClient;
}