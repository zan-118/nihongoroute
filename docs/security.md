# Keamanan & Kepatuhan (Security Policy)

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

Kebijakan keamanan sistem NihongoRoute berfokus pada enkapsulasi rahasia server, proteksi integritas progres belajar pengguna terhadap kecurangan (*anti-cheat guard*), pembatasan akses data relasional via Row Level Security (RLS), dan perlindungan rute terhadap serangan berbasis analisis waktu (*timing attacks*).

## 1. Kebijakan Kredensial & Variabel Lingkungan

### Prefiks `NEXT_PUBLIC_`
Hanya variabel lingkungan yang diawali dengan prefiks **`NEXT_PUBLIC_`** yang diizinkan untuk diakses oleh kode yang terkompilasi ke browser klien. 

Seluruh variabel server-only di bawah ini **DILARANG KERAS** dibaca atau diimpor di dalam Client Component:
* `SUPABASE_SERVICE_ROLE_KEY`
* `ADMIN_API_SECRET`
* `SANITY_STUDIO_ADMIN_API_SECRET`
* `SANITY_API_READ_TOKEN` / `SANITY_API_WRITE_TOKEN`
* `GEMINI_API_KEY`
* `SAWERIA_WEBHOOK_SECRET` / `TRAKTEER_WEBHOOK_SECRET`

---

## 2. Autentikasi & Otorisasi Admin Bridge

Seluruh rute administrasi di bawah rute `/api/admin/*` menghubungkan antarmuka internal dengan kemampuan generasi AI dan pencarian basis data Supabase.

### Protokol Validasi Admin (`validateAdminApiRequest`):
1. **Header-Only Authorization**: Kredensial admin **hanya boleh** dikirim melalui header HTTP `Authorization: Bearer <ADMIN_API_SECRET>` atau `x-admin-api-secret`.
2. **Larangan URL Query String**: Token admin **dilarang keras** dikirimkan via parameter URL (seperti `?token=...`) karena parameter kueri URL rentan tercatat pada log server, riwayat browser, dan sistem pemantauan pihak ketiga.
3. **Pencocokan Timing-Safe**: Token admin divalidasi menggunakan fungsi pencocokan biner konstan untuk mencegah penyerang menebak token melalui analisis perbedaan waktu respon.

---

## 3. Keamanan Webhook Donasi (Anti-Timing Attacks)

Rute penerima webhook `/api/webhooks/saweria` dan `/api/webhooks/trakteer` menerima notifikasi pembayaran donatur.

### Verifikasi Tanda Tangan Webhook:
* **HMAC SHA256**: Webhook Saweria memvalidasi tanda tangan payload pada header `x-saweria-signature`.
* **Pencocokan Waktu Konstan**: Verifikasi hash rahasia wajib menggunakan `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` alih-alih perbandingan kesetaraan string biasa (`===` atau `!==`) guna mencegah serangan *timing attack*.

---

## 4. Keamanan Database & Row Level Security (RLS)

Seluruh 26 tabel database PostgreSQL yang terdefinisi di Supabase **wajib mengaktifkan Row Level Security (RLS)** secara *default*.

### Kebijakan Standar RLS:
1. **Data Publik (Library Tables)**: Tabel pustaka (`vocab`, `kanji`, `grammar`, `lessons`, `listening`, `reading`, `cheatsheets`, `jlpt_exam_templates`) memiliki kebijakan RLS publik untuk operasi kueri data (`SELECT USING (true)` atau `is_published = true`).
2. **Data Pribadi Pengguna**: Tabel yang menyimpan data progres (`profiles`, `user_srs`, `user_lessons`, `user_exam_sessions`, `notifications`) wajib menyertakan klausa kepemilikan baris data:
   ```sql
   USING ((select auth.uid()) = user_id)
   WITH CHECK ((select auth.uid()) = user_id);
   ```
3. **Service-Role Boundary**: Penggunaan klien admin Supabase (`createAdminClient()`) yang mengabaikan RLS dibatasi secara ketat hanya pada Server Actions dan Route Handlers, serta dilarang di-bundle ke browser klien.

---

## 5. Proteksi Integritas Progres (Anti-Cheat XP Guard)

Klien peramban tidak dipercaya untuk menentukan nilai akhir XP, level, atau streak pengguna. 

* Nilai XP final dihitung dan diverifikasi secara mutlak di sisi server database melalui fungsi RPC PostgreSQL `sync_user_progress`.
* RPC menolak mutasi yang mencoba menurunkan XP (`delta_xp < 0`) dan membatasi perolehan bonus XP harian kumulatif maksimal **150 XP per hari** untuk mencegah eksploitasi skrip otomatis dari sisi klien.
