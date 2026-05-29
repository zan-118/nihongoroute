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
     * Silakan ubah pola ini untuk menyertakan lebih banyak jalur jika diperlukan.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
