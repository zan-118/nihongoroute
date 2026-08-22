/**
 * @file middleware.ts
 * @description Supabase server-side middleware maintaining authentication session lifecycle (cookie refresh) in Next.js.
 * Ensures user sessions remain active across page navigations.
 */

// Import & Dependencies

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Main Middleware Function

/**
 * Safely refreshes user authentication session on the server side via cookies.
 * 
 * @param {NextRequest} request Incoming Next.js HTTP request.
 * @returns {Promise<NextResponse>} Updated HTTP response with refreshed session cookies.
 */
export async function updateSession(request: NextRequest) {
 // Initialize response object
 let supabaseResponse = NextResponse.next({
 request,
 });

 // Create Supabase client configured for server-side cookie handling
 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 /**
 * Get cookies from request.
 * @returns Array of request cookies.
 */
 getAll() {
 return request.cookies.getAll();
 },
 /**
 * Sync cookies to request and response.
 * @param cookiesToSet - Cookies to apply.
 * @param headersToSet - Headers to apply.
 */
 setAll(cookiesToSet, headersToSet) {
 // Update request cookies. Keep downstream routes in sync.
 cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
 // Recreate response. Apply new headers.
 supabaseResponse = NextResponse.next({
 request,
 });
 // Set cookies on response.
 cookiesToSet.forEach(({ name, value, options }) =>
 supabaseResponse.cookies.set(name, value, options)
 );
 // Set headers on response.
 Object.entries(headersToSet).forEach(([key, value]) =>
 supabaseResponse.headers.set(key, value)
 );
 },
 },
 }
 );

 // IMPORTANT: Avoid writing logic between createServerClient and
 // supabase.auth.getClaims(). Minor issues can complicate cross-browser
 // cookie debugging, especially on Safari.
 
 // Refresh token and validate JWT. getClaims() utilizes JWKS cache,
 // making it significantly lighter than getUser() which always hits Auth server.
 await supabase.auth.getClaims();

 return supabaseResponse;
}