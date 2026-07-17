# Panduan Kontribusi (Contribution Guide)

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

Seluruh kontributor proyek NihongoRoute **wajib** mengikuti pedoman pengembangan dan siklus hidup rekayasa perangkat lunak berikut untuk meminimalkan bug regresi serta menjaga keamanan basis data.

## 1. Aturan Penulisan Kode (Coding Conventions)

### A. TypeScript Ketat (Strict Typecheck)
* **Dilarang keras** menggunakan tipe data `any`. Selalu nyatakan tipe data secara eksplisit menggunakan tipe domain yang didefinisikan di `src/types/database.ts` atau `src/types/library.ts`.
* Gunakan JSDoc untuk menjelaskan masukan (*input*), keluaran (*output*), efek samping (*side-effects*), serta state Zustand yang diakses pada setiap hook kustom (`src/hooks/*`) atau helper bisnis baru.

### B. Desain UI & Semantik CSS
* Desain antarmuka wajib mengikuti semantik token warna brand di `src/app/globals.css`.
* Gunakan utilitas kelas CSS yang sudah terkonfigurasi (seperti `.glass`, `.premium-surface`, `.btn-cyber`) alih-alih merancang paduan warna Tailwind kustom baru secara *ad hoc*.

---

## 2. Alur Pengembangan Fitur & Git Branching

1. Buat branch baru dari `main` dengan konvensi penamaan:
   - `feat/nama-fitur` untuk fitur baru.
   - `fix/nama-bug` untuk perbaikan bug.
2. Tulis kode fungsional beserta unit test pendukung di folder `__tests__/`.
3. Jalankan linter dan validator tipe secara lokal sebelum melakukan commit:
   ```bash
   npm run lint
   npm run typecheck
   ```

---

## 3. Protokol Pembuatan & Siklus Hidup Migrasi SQL

Jika perubahan fitur memerlukan penambahan tabel atau modifikasi kolom pada basis data Supabase, ikuti **5 langkah wajib** siklus hidup migrasi database berikut secara runtut:

1. **Buat File Migrasi Sementara**: 
   - Tulis perubahan skema Anda sebagai berkas baru dengan format nama `<timestamp>_<nama_migrasi>.sql` di direktori `supabase/migrations/`.
   - **Dilarang** mengedit langsung berkas skema utama `20260620130000_initial_schema.sql` pada tahap ini.
2. **Aktifkan RLS By Default**:
   - Setiap pembuatan tabel baru **wajib** mengaktifkan Row Level Security (RLS).
   - Buat minimal satu kebijakan (policy) akses (misalnya membatasi pembacaan/penulisan hanya untuk pemilik data dengan filter `auth.uid() = user_id`).
3. **Validasi Lokal**:
   - Jalankan `npm run db:migrations:check` untuk memastikan timestamp berkas unik dan tidak memiliki error sintaksis.
4. **Konfirmasi Produksi**:
   - Terapkan migrasi tersebut pada database nyata dan pastikan lolos dari pengujian aplikasi.
5. **Lebur & Bersihkan (Migration Folding)**:
   - Setelah migrasi berhasil dikonfirmasi di server, **wajib** melebur (*fold*) seluruh perubahan SQL dari berkas migrasi sementara tadi ke dalam satu berkas skema utama `supabase/migrations/20260620130000_initial_schema.sql`.
   - Hapus berkas migrasi sementara yang ber-timestamp tersebut dari repositori Git Anda.
   - **Kondisi Akhir**: Hanya boleh ada satu-satunya file migrasi skema di repositori (`20260620130000_initial_schema.sql`).

> [!WARNING]
> **TODO: perlu verifikasi** — Peleburan (folding) migrasi harus dilakukan dengan hati-hati. Pastikan tidak ada script destruktif (seperti `DROP TABLE`) yang tidak sengaja terlebur yang dapat menghapus data di database produksi.

---

## 4. Konvensi Commit (Commit Messages)

Pesan commit Git harus mengikuti format **Conventional Commits**:
* `feat(srs): add custom mnemonics to flashcards`
* `fix(tts): handle connection timeout on edge tts synthesis`
* `docs(readme): update deployment instructions`
* `test(gamification): add unit tests for daily xp cap`
