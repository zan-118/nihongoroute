# Cetak Biru Implementasi Mesin Simulasi Ujian JLPT (Mock Exam)
**Versi 2.0 (Juni 2026)**

Dokumen ini mendokumentasikan cetak biru implementasi pemindahan bank soal simulasi ujian JLPT dari Sanity CMS ke database relasional PostgreSQL Supabase, penulisan adapter kompatibilitas klien, serta logika evaluasi ujian sisi server.

---

## 1. Ikhtisar Proyek (Project Overview)

Tujuan utama dari proyek ini adalah membangun **bank soal JLPT di Supabase/PostgreSQL** sebagai repositori dinamis untuk simulasi ujian, tanpa langsung menghapus skema dokumen `mockExam` di Sanity CMS. Konten Sanity tetap dipertahankan sebagai cadangan (fallback), sedangkan Supabase digunakan sebagai fondasi utama baru untuk:
1. Menyimpan ribuan soal ujian JLPT secara relasional berdasarkan tingkat kesulitan, seksi ujian, nomor mondai, nomor soal, teks bacaan (passage), serta aset visual & audio.
2. Menyusun paket simulasi ujian secara otomatis berdasarkan templat kuota soal dinamis.
3. Mencatat riwayat sesi ujian pengguna (`user_exam_sessions`) dan jawaban pilihan (`user_exam_answers`).
4. Memetakan soal-soal ujian yang dijawab salah oleh pengguna ke dalam basis data ulasan kelemahan pengguna (SRS weak points).
5. Memakai ulang komponen visual mesin ujian klien `MockExamEngine` yang sudah ada melalui modul adapter kompatibilitas.

---

## 2. Status Tahapan Implementasi (Implementation Status)

* **[x] Fase 0: Audit Kompatibilitas & Lapisan Pembatas Adapter**:
  * Memetakan kontrak data mesin ujian klien (`ExamData` & `ExamQuestion`).
  * Membangun modul adapter `src/lib/exams/supabase-adapter.ts` untuk mengonversi data paket soal Supabase (`SupabaseExamPackage`) ke bentuk data engine.
* **[x] Fase 1: Fondasi Skema Database & Penyimpanan Aset**:
  * Membuat migrasi SQL awal berisi tabel `jlpt_exam_templates`, `jlpt_passages`, `jlpt_questions`, dan tabel persimpangan `jlpt_exam_template_questions`.
  * Mengonfigurasi bucket penyimpanan storage `exam-assets` di Supabase.
* **[x] Fase 2: Aturan RLS, Indeks, & Keamanan Pra-Rilis**:
  * Mengaktifkan Row Level Security (RLS) pada seluruh tabel baru.
  * Menulis kebijakan (policies) select publik untuk bank soal yang diterbitkan (`is_published = true`) dan kebijakan kepemilikan user (`auth.uid() = user_id`) untuk sesi ujian.
  * Membuat indeks database untuk meningkatkan performa kueri pencarian seksi dan mondai.
* **[x] Fase 3: Generator Sesi & Logika Pengambilan Ujian**:
  * Membuat server actions di `src/actions/jlpt-exams.actions.ts` untuk memulai ujian (`startJlptMockSession`).
  * Mendukung dua mode templat ujian: mode `fixed` (soal tetap yang ditentukan templat) dan mode `random_by_quota` (soal acak yang dipilih secara dinamis memenuhi kuota per seksi).
* **[x] Fase 4: Integrasi Klien, Auto-Save, & Pengiriman Skor**:
  * Mengintegrasikan `MockExamEngine` dengan server action Supabase.
  * Mengaktifkan timer debounce selama **1200 ms** untuk auto-save jawaban ke database kolom `user_exam_sessions.answers_snapshot` menggunakan Server Action `saveJlptMockSessionAnswers` secara langsung.
  * Menulis fungsi evaluasi skor akhir ujian (`submitJlptMockSession`) di sisi server.
* **[x] Fase 5: Integrasi Ulasan Spaced Repetition (SRS)**:
  * Memetakan pertanyaan ujian yang dijawab salah oleh pengguna ke dalam tabel ulasan `user_srs` dengan status `learning` untuk melatih area kelemahan secara berulang.
* **[x] Fase 6: Perkakas Impor Data (Data Import Pipeline)**:
  * Membuat skrip CLI validator & importer `scripts/validate-jlpt-import.mjs` untuk mengunggah file JSON soal dan file audio ke storage bucket.
  * Membuat skrip generator draf soal otomatis (`scripts/generate-jlpt-moji-goi.mjs`, dll) memanfaatkan Gemini API.
* **[x] Fase 7: Pengujian Unit & Verifikasi Skema**:
  * Menulis rangkaian pengujian unit Vitest untuk memverifikasi logika adapter, pengumpulan soal kuota, dan scoring.

---

## 3. Detail Kontrak Data & Pemetaan Adapter

Lapisan adapter `src/lib/exams/supabase-adapter.ts` memetakan properti `SupabaseExamPackage` ke `ExamData` untuk dikonsumsi klien:

| Properti Supabase | Properti Legacy UI | Aturan Normalisasi |
| :--- | :--- | :--- |
| `sessionId \|\| templateId` | `id` | Menggunakan ID sesi jika ujian sedang aktif berjalan. |
| `timeLimitMinutes` | `timeLimit` | Konversi durasi menit. |
| `jlptLevel` | `levelCode` | Dikonversi ke huruf kecil (contoh: "n5"). |
| `choices` (JSONB array) | `options` | Konversi: Pilihan teks langsung disalin, pilihan gambar dikonversi sementara ke string label visual `alt` sebagai fallback. |
| `choices` (original) | `choices` | Struktur biner pilihan tetap dipertahankan untuk pemetaan lanjutan. |
| `correctChoiceIndex` | `correctAnswer` | Indeks jawaban benar 0-based. |
| `passage` | `passage` | Teks bacaan/transkrip choukai yang dihidrasi bersama pertanyaan. |

---

## 4. Logika Evaluasi Skor Akhir & Kelulusan Seksi

Prosedur pengumpulan skor akhir dihitung secara terpusat di server melalui action `submitJlptMockSession` dengan aturan kelulusan ketat:
1. **Skala Nilai Resmi**: Jumlah jawaban benar dikonversi proporsional ke dalam skala maksimal nilai JLPT resmi yaitu **`180`**.
2. **Ambang Kelulusan Bagian (Sectional Cut-Off)**:
   * Pengguna wajib memenuhi akurasi minimal **`32%`** untuk setiap bagian ujian (`vocabulary`, `grammar`, `reading`, `listening`).
   * Jika akurasi salah satu seksi di bawah 32%, status kelulusan peserta otomatis dinyatakan **Gagal (isPassed = false)** meskipun akumulasi skor total melampaui target nilai lulus (`passingScore`).
3. **Pemberian Reward**: Pengguna mendapatkan XP berdasarkan performa ujian: **10 XP per jawaban benar** dan tambahan **50 XP jika lulus simulasi**.

---

## 5. Panduan Impor Paket Soal Simulasi Ujian

Untuk memasukkan paket simulasi ujian baru ke database Supabase, ikuti prosedur berikut:

### 5.1 Format Berkas JSON Ujian
Berkas JSON harus mengikuti skema properti templat, aset biner, teks bacaan (passages), pertanyaan (questions), dan relasi posisi soal. Contoh berkas terdapat di `docs/jlpt-import-sample.json`.

### 5.2 Perintah Validasi & Dry Run
Jalankan pengecekan format berkas tanpa menulis ke database produksi:
```bash
npm run exam:import:validate -- data/imports/n5-paket-1.json --plan
```

### 5.3 Perintah Eksekusi Impor (Apply)
Jalankan pengunggahan aset MP3/gambar ke storage bucket `exam-assets` Supabase dan simpan data relasional ke database Supabase:
```bash
npm run exam:import:validate -- data/imports/n5-paket-1.json --asset-root data/imports/assets --apply
```
* **Upsert Guard**: Generator menggunakan UUID deterministik berbasis string slug. Menjalankan perintah impor ulang pada file yang sama akan memperbarui (update) baris data yang ada tanpa melipatgandakan data di database.
