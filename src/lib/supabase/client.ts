/**
 * @file client.ts
 * @description Klien inisiasi Supabase Browser untuk akses data secara luring-first di sisi klien (browser) dengan batasan RLS (Row Level Security) yang aman.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createBrowserClient } from "@supabase/ssr";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

// ==========================================
// INISIALISASI KLIEN BROWSER SUPABASE
// ==========================================
export function createClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Variabel lingkungan Supabase tidak ditemukan!");
    // Kembalikan client dummy atau tangani secara anggun untuk menghindari error 500
    return createBrowserClient("", ""); 
  }

  cachedClient = createBrowserClient(url, key);
  return cachedClient;
}
