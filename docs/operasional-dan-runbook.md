# Panduan Operasional & Runbook

Dokumen ini menjelaskan standar kesiapan enterprise (Enterprise Readiness), konfigurasi build produksi, protokol deployment/rollback, prosedur backup/restore, penanganan insiden, serta utilitas skrip pemeliharaan NihongoRoute.

---

## 1. Kesiapan Enterprise & Konfigurasi Produksi

NihongoRoute dikonfigurasi untuk memenuhi standar operasional produksi skala industri:

### 1.1 Kepatuhan Kualitas Kode & CI Gate
Setiap perubahan kode ke cabang utama (`main`) wajib melewati workflow kualitas di `.github/workflows/quality.yml`:
* Menjalankan strict type checking (`npm run typecheck`).
* Menjalankan static analysis linting (`npm run lint`).
* Menjalankan seluruh rangkaian uji unit Vitest (`npm run test:unit`).
* Memeriksa kesesuaian konsolidasi berkas migrasi basis data tunggal (`npm run db:migrations:check`).
* Membangun bundel produksi Next.js (`npm run build`).

### 1.2 Konfigurasi `next.config.ts` Produksi
* **`output: "standalone"`**: Menginstruksikan Next.js untuk memaketkan aplikasi ke dalam kontainer mandiri (hanya menyertakan modul node_modules yang terpakai), meminimalkan ukuran gambar Docker untuk deployment server.
* **`poweredByHeader: false`**: Menyembunyikan tajuk HTTP `X-Powered-By: Next.js` untuk mengurangi risiko peretasan pengenalan sistem.
* **Security Headers**: Menyertakan tajuk keamanan ketat di setiap respons rute HTTP:
  * `X-Frame-Options: SAMEORIGIN` untuk mencegah serangan clickjacking.
  * `X-Content-Type-Options: nosniff`.
  * `Referrer-Policy: strict-origin-when-cross-origin`.
  * `Strict-Transport-Security` (HSTS) untuk memaksa enkripsi SSL/HTTPS di tingkat produksi.
  * `Permissions-Policy` dan `Cross-Origin-Opener-Policy` untuk kontrol akses fitur peramban.
* **Font Caching**: Menambahkan aturan `Cache-Control` permanen untuk aset font publik di `/fonts/:path*` (`public, max-age=31536000, immutable`).

---

## 2. Standar Deployment & Protokol Rollback

### 2.1 Alur Deployment Produksi
1. Gabungkan kode (merge PR) hanya jika seluruh tahapan integrasi CI kualitas kode lulus 100%.
2. Jika deployment melibatkan perubahan skema database Supabase, jalankan migrasi database di proyek pementasan (Staging) terlebih dahulu menggunakan CLI:
   ```bash
   supabase db reset --linked
   ```
3. Lakukan deploy aplikasi Next.js ke platform staging.
4. Lakukan pengujian manual terhadap fitur-fitur esensial: masuk log pengguna, pengerjaan kuis pelajaran, ulasan SRS, pemutaran suara TTS, dan pengerjaan simulasi ujian.
5. Jalankan verifikasi status rute API `/api/health`. Jika aman, promosikan kode aplikasi ke lingkungan Produksi.

### 2.2 Protokol Mundur (Rollback Standard)
1. Jika terjadi kegagalan fatal pada rilis baru, lakukan rollback aplikasi Next.js ke versi Git tag sebelumnya melalui platform hosting.
2. **Rollback Perubahan Database**:
   * **Jangan melakukan rollback migrasi SQL yang destruktif (drop column/table) di database produksi** jika tabel telah memuat data riil pengguna baru.
   * Seluruh perbaikan skema database wajib dikonsolidasikan langsung ke file migrasi utama `20260620130000_initial_schema.sql` (bukan membuat berkas baru dengan timestamp).
   * Lakukan penyuntingan dan penyesuaian skema secara langsung di dalam berkas migrasi utama tersebut.

---

## 3. Penanganan Insiden Operasional (Incident Runbook)

### 3.1 Insiden 1: Kegagalan Sinkronisasi Progres Pengguna (Sync Failure)
* **Gejala**: Pengguna mendapatkan popup pemberitahuan sinkronisasi gagal, dan daftar ulasan kotor tidak berkurang setelah 2000 ms.
* **Langkah Penanganan**:
  1. Periksa log server untuk melihat kesalahan RPC `sync_user_progress`.
  2. Buka Supabase SQL Editor, pastikan fungsi `sync_user_progress` terdaftar dan tipe argumen data sesuai dengan payload JSON yang dikirim dari klien (`buildSrsUpdates`).
  3. Periksa ketersediaan indeks unik gabungan di tabel `user_srs` dan `user_lessons` untuk menghindari kegagalan perintah `UPSERT` relasional.

### 3.2 Insiden 2: Akses Jembatan Admin Sanity Mengembalikan Status 401
* **Gejala**: Panel pencarian kosakata/kanji di Sanity Studio macet dan mengembalikan status `401 Unauthorized`.
* **Langkah Penanganan**:
  1. Periksa apakah nilai token rahasia `ADMIN_API_SECRET` di environment Next.js cocok dengan nilai `SANITY_STUDIO_ADMIN_API_SECRET` di lingkungan Sanity.
  2. Pastikan permintaan dari Sanity Studio mengirim token menggunakan header `Authorization: Bearer <secret>`. Tolak mentah-mentah jika token dikirim melalui query parameter URL.

### 3.3 Insiden 3: Kegagalan Penerimaan Webhook Supporter
* **Gejala**: Donatur Saweria/Trakteer mengeluhkan status supporter mereka tidak aktif di aplikasi.
* **Langkah Penanganan**:
  1. Cari log payload webhook masuk pada rute `/api/webhooks/saweria` atau `/api/webhooks/trakteer`.
  2. Periksa apakah kunci rahasia webhook (`SAWERIA_WEBHOOK_SECRET` / `TRAKTEER_WEBHOOK_SECRET`) di environment aplikasi Next.js telah diisi dengan benar.
  3. Coba lakukan simulasi replay kiriman payload webhook terenkripsi di lingkungan Staging menggunakan cURL untuk menguji validitas parsing respons JSON.

---

## 4. Prosedur Backup & Restore Database Supabase

* **Scheduled Backups**: Pastikan fitur backup otomatis harian Supabase PostgreSQL aktif untuk lingkungan produksi.
* **Manual Snapshot**: Sebelum melakukan migrasi database yang rumit atau berpotensi destruktif, lakukan backup manual melalui Supabase Studio.
* **Restore Drill Checklist (Simulasi Pemulihan)**:
  1. Sekali dalam beberapa bulan, lakukan uji coba pemulihan data menggunakan berkas backup terbaru ke proyek database kosong terpisah.
  2. Jalankan smoke tests menggunakan client autentikasi tiruan untuk membaca progress user.
  3. Periksa kesesuaian total jumlah baris data pada tabel-tabel utama (`profiles`, `user_srs`, `vocab`) untuk memastikan integritas data pasca-pemulihan 100% utuh.
