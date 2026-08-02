import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy request to update Supabase session.
 * @param request - Incoming Next.js request.
 * @returns Response with updated session headers.
 */
export async function proxy(request: NextRequest) {
 // Refresh session token in cookies
 return await updateSession(request);
}

/**
 * Middleware configuration.
 * Defines paths to run proxy middleware.
 */
export const config = {
 matcher: [
 /*
 * Cocokkan semua jalur permintaan kecuali yang dimulai dengan:
 * - _next/static (berkas statis)
 * - _next/image (berkas optimasi gambar)
 * - favicon.ico (berkas favicon)
 * - asset publik dan font
 * Silakan ubah pola ini untuk menyertakan lebih banyak jalur jika diperlukan.
 */
 "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mjs|otf|png|svg|ttf|txt|webp|woff|woff2|xml)$).*)",
 ],
};