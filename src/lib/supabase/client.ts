/**
 * @file client.ts
 * @description Supabase Browser client initializer for offline-first client-side data access adhering to Row Level Security (RLS) policies.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { createBrowserClient } from "@supabase/ssr";

/** 
 * Cache Supabase browser client instance. Prevent multiple initializations.
 */
let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

// ==========================================
// Supabase Browser Client Initializer
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

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    try {
      new URL(url);
      cachedClient = createBrowserClient(url, key);
      return cachedClient;
    } catch {
      // Ignore URL parse error and fall back below
    }
  }

  // Fallback to valid dummy credentials during build time prerender shell to prevent ERR_INVALID_URL crash
  console.error("Variabel lingkungan Supabase tidak ditemukan atau tidak valid saat inisialisasi browser client!");
  return createBrowserClient("https://example.supabase.co", "ci-anon-key");
}