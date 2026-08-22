/**
 * @file admin.ts
 * @description Supabase Admin client initializer bypassing Row Level Security (RLS) via `SUPABASE_SERVICE_ROLE_KEY`.
 * SERVER-SIDE ONLY (Server Actions / Route Handlers). Must NEVER be imported into client components.
 */

// Import & Dependencies

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Supabase Admin Client Initializer

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