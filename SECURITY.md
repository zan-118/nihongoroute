# Kebijakan Keamanan (Security Policy)

Dokumen ini menjelaskan batas keamanan yang dilindungi pada sistem NihongoRoute, prosedur penanganan variabel lingkungan/token rahasia, pengujian keamanan pra-rilis, serta pelaporan celah keamanan.

---

## 1. Batas Keamanan yang Dilindungi (Protected Security Surface)

NihongoRoute melindungi permukaan produksi berikut sebagai batas keamanan tingkat pertama:
* **Autentikasi & Otorisasi**: Integrasi Supabase Auth dengan hak akses Row Level Security (RLS) pada tingkat tabel relasional database.
* **Progres Pengguna**: Perlindungan modifikasi progress belajar lewat RPC `sync_user_progress` yang memvalidasi perolehan XP dan streak di sisi server (anti-cheat guard).
* **Integrasi Klien Luring**: Keamanan status data lokal di IndexedDB (`idb-keyval`) peramban klien.
* **API Admin**: Endpoint di bawah `/api/admin/*` yang menghubungkan modul admin internal dengan database Supabase dan Gemini API.
* **Webhook Transaksi**: Rute webhook `/api/webhooks/*` penerima data supporter donasi dari Saweria dan Trakteer.
* **Secret Server-Only**: Enkapsulasi token Gemini dan service-role key Supabase agar murni berjalan di sisi server.

---

## 2. Penanganan Kredensial & Variabel Lingkungan (Secret Handling)

* **Prefiks Keamanan**: Jangan pernah mengekspos variabel lingkungan rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_SECRET`, webhook secrets, Gemini API keys) ke sisi browser klien. Hanya variabel lingkungan yang diawali dengan prefiks **`NEXT_PUBLIC_`** yang diizinkan untuk dibaca oleh kode sisi klien.
* **Otentikasi API Admin**: Permintaan API admin wajib melampirkan header `Authorization: Bearer <ADMIN_API_SECRET>` atau `x-admin-api-secret`.
* **Keamanan URL**: Rahasia admin dilarang keras dikirimkan melalui parameter kueri URL (*Query String*) karena URL umum tercatat pada log server, history peramban, dan tools pemantauan eksternal.
* **Berkas Lingkungan**: Jaga berkas `.env.local` tetap privat dan jangan pernah di-commit ke Git. Gunakan `.env.example` sebagai kontrak variabel yang diizinkan untuk dibagikan.

---

## 3. Pengecekan Keamanan Sebelum Rilis (Release Gate)

Sebelum mempromosikan kode ke lingkungan produksi, pengembang wajib menjalankan perintah verifikasi berikut di lokal:
```bash
npm run typecheck
npm run lint
npm run test:unit
npm run db:migrations:check
npm run build
```

Jika Supabase CLI telah terpasang dan terhubung dengan database proyek, jalankan pengecekan linter skema:
```bash
supabase db lint
supabase db reset
```

---

## 4. Keamanan Database & RLS Checklist

* Kebijakan Row Level Security (RLS) wajib diaktifkan pada setiap tabel database PostgreSQL yang menampung data progres pengguna atau data sensitif.
* Seluruh kueri kebijakan RLS wajib difilter dengan klausa kepemilikan pemilik baris data (`auth.uid() = user_id`).
* Penggunaan service-role client (`createAdminClient()`) dibatasi hanya untuk server route handlers, server actions, dan skrip pemeliharaan, serta dilarang diimpor ke dalam komponen klien.
* Fungsi pemicu database dengan deklarasi status `SECURITY DEFINER` tidak boleh menggunakan metadata yang dapat dimodifikasi oleh pengguna akhir untuk mengambil keputusan otorisasi.
* Verifikasi hash webhook menggunakan pencocokan waktu konstan (`crypto.timingSafeEqual`) untuk menghindari serangan berbasis analisis waktu (*timing attacks*).
* Endpoint pemeriksaan kesehatan (`/api/health`) dilarang membocorkan nama variabel rahasia yang hilang di lingkungan produksi.

---

## 5. Prosedur Pelaporan Celah Keamanan (Reporting Vulnerabilities)

Jika Anda menemukan celah keamanan (seperti kebocoran data pengguna, celah bypass RLS, eksploitasi XP anti-cheat, atau kebocoran API secret), mohon untuk melaporkannya secara privat terlebih dahulu kepada pemilik proyek dan jangan mempublikasikannya ke platform umum.
Sertakan informasi berikut saat melapor:
* Lokasi rute, tabel, kebijakan RLS, atau komponen yang terdampak.
* Langkah-langkah detail untuk mereproduksi celah tersebut.
* Hasil akses yang didapatkan versus hasil akses yang diharapkan.
