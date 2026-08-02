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