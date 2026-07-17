# Konfigurasi Sistem (Environment Variables)

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

## 1. Daftar Environment Variables (.env)

Seluruh variabel lingkungan dikonfigurasi melalui berkas `.env.local` pada tahap pengembangan dan disuntikkan secara dinamis pada panel deployment cloud (Vercel/Docker) di tahap produksi.

### A. Variabel Sisi Klien (Public Browser-Safe)
Variabel di bawah ini aman diekspos ke browser karena memiliki prefiks `NEXT_PUBLIC_`.

| Nama Variabel | Tipe Data | Status | Default / Contoh | Deskripsi & Peruntukan |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | String (URL) | Wajib | `http://localhost:3000` | URL dasar website. Digunakan untuk routing CORS API dan metadata SEO canonical. |
| `NEXT_PUBLIC_SUPABASE_URL` | String (URL) | Wajib | `https://your-project.supabase.co` | Endpoint URL Supabase API dari dashboard proyek Supabase Anda. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String (JWT) | Wajib | `eyJhbGciOiJIUzI1NiIsInR...` | Kunci publik Supabase untuk otentikasi tingkat anonim dari browser klien. |

---

### B. Variabel Sisi Server (Server-Only Kredensial)
**DILARANG KERAS** memberi prefiks `NEXT_PUBLIC_` atau mengimpor variabel di bawah ini ke dalam Client Component browser.

| Nama Variabel | Tipe Data | Status | Default / Contoh | Deskripsi & Peruntukan |
| :--- | :--- | :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | String (JWT) | Wajib | `eyJhbGciOiJIUzI1NiIsInR...` | Kunci administrasi Supabase (Bypass RLS). Hanya digunakan di Server Actions/Route Handlers via `createAdminClient()`. |
| `ADMIN_API_SECRET` | String | Wajib | `replace-with-long-random-secret` | Token rahasia internal untuk mengamankan rute API administrasi `/api/admin/*`. |
| `GEMINI_API_KEY` | String | Wajib | `AIzaSy...` | Kunci otentikasi API Google Generative AI (Gemini) untuk pemrosesan AI Assistant. |
| `TRAKTEER_WEBHOOK_SECRET` | String | Opsional | `replace-with-trakteer-secret` | Kunci token verifikasi webhook donasi dari platform Trakteer. |
| `SAWERIA_WEBHOOK_SECRET` | String | Opsional | `replace-with-saweria-secret` | Kunci rahasia HMAC SHA256 verifikasi webhook donasi dari platform Saweria. |

---

## 2. File Konfigurasi Lainnya

Selain berkas `.env.local`, perilaku kompilasi, styling, dan optimasi NihongoRoute dipengaruhi oleh beberapa berkas konfigurasi berikut:

* **`next.config.ts`**:
  - Konfigurasi output build `standalone` untuk integrasi container Docker.
  - Mematikan header `poweredByHeader` untuk alasan keamanan.
  - Mengonfigurasi `securityHeaders` (CSP, Referrer-Policy, Frame-Options, HSTS).
  - Mengatur cache image optimal (`minimumCacheTTL` selama 30 hari) dan remote patterns domain gambar (Supabase, Cloudinary).
  - Menyatakan modul kustom seperti `kuroshiro`, `kuroshiro-analyzer-kuromoji`, dan `msedge-tts` sebagai `serverExternalPackages` agar tidak di-bundle ke sisi browser klien.
* **`tailwind.config.js`**:
  - Berisi konfigurasi token desain semantik proyek, radius, font-pairing, dan animasi Tailwind CSS.
* **`components.json`**:
  - Mengatur parameter dasar pustaka shadcn/ui untuk penempatan komponen visual di folder `src/components/ui/`.
* **`tsconfig.json`**:
  - Mengonfigurasi path alias TypeScript (misal: `@/*` memetakan langsung ke `src/*`) dan optimasi build compiler.
