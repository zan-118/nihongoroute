import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

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
