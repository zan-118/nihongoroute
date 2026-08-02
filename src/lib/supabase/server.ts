/**
 * @file server.ts
 * @description Supabase Server-Side client initializer for Next.js Server Components, Route Handlers, and Server Actions with automatic cookie handling.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ==========================================
// Supabase Server Client Initializer
// ==========================================

/**
 * Creates Supabase client for server-side contexts (Server Components, Actions, Route Handlers).
 * Handles cookie storage automatically.
 * 
 * @returns Promise resolving to Supabase client instance.
 */
export async function createClient() {
 // Await Next.js cookie store for header manipulation
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
 // Apply cookies to response headers
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

/**
 * Klien Supabase statis bebas cookie untuk digunakan saat build time (generateStaticParams)
 * atau operasi pembacaan data publik tanpa context request HTTP.
 * 
 * @returns Supabase client instance.
 */
export function createStaticClient() {
 return createSupabaseClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 );
}