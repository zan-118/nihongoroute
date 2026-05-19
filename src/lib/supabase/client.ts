import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Supabase environment variables are missing!");
    // Return a dummy client or handle it gracefully to avoid 500
    return createBrowserClient("", ""); 
  }

  return createBrowserClient(url, key);
}
