import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using SERVICE_ROLE_KEY for privileged operations.
 * USE ONLY IN SERVER ACTIONS OR API ROUTES.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
