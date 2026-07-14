# NihongoRoute - Dokumentasi Teknis Modular

Selamat datang di pusat dokumentasi teknis NihongoRoute. Seluruh dokumentasi di bawah ini telah ditulis ulang dalam Bahasa Indonesia dengan merujuk langsung pada kondisi aktual kode sumber (codebase).

## Daftar Dokumentasi Modular

1. **[Arsitektur Aplikasi](arsitektur-aplikasi.md)**
   - Ikhtisar Next.js App Router, pemisahan RSC vs RCC, serta manajemen status global luring memanfaatkan Zustand dan IndexedDB (`idb-keyval`).

2. **[Sinkronisasi Progres Luring (Offline Sync)](sinkronisasi-progres.md)**
   - Arsitektur sinkronisasi progres 3-tingkat, deteksi data kotor (dirty state), penggabungan data lokal/awan, sinkronisasi lintas tab (`BroadcastChannel`), dan sistem anti-cheat XP di tingkat server database.

3. **[Logika Spaced Repetition System (SRS) & Gamifikasi](logika-srs-dan-gamifikasi.md)**
   - Cara kerja algoritma pengulangan cerdas (SM-2 dengan modifikasi Modern Halving dan Due-Date Guard), formula leveling XP, rekor hari beruntun (streak), streak freeze, dan misi harian.

4. **[Sintesis Audio & Furigana](sintesis-audio-dan-furigana.md)**
   - Aliran data biner VOICEVOX TTS statis (caching Storage & DB, fallback Web Speech API), pencocokan gender suara pembicara dialog otomatis (`detectVoice`), Kuroshiro, dan pembelahan teks Kanji-Hiragana di `<SmartJapanese>`.

5. **[Skema Database & Row Level Security (RLS)](skema-database-dan-rls.md)**
   - Detail skema tabel relasional PostgreSQL Supabase, relasi, indeks, trigger, database function, grant hak akses, dan kebijakan RLS untuk perlindungan privasi.

6. **[Server Actions & API Routes](server-actions-dan-api.md)**
   - Spesifikasi fungsional Server Actions di `src/actions/` dan endpoint API Route Handlers di `src/app/api/`, termasuk perlindungan jembatan admin (`validateAdminApiRequest`).

7. **[Simulasi Ujian JLPT (Mock Exam)](simulasi-ujian-jlpt.md)**
   - Arsitektur simulasi ujian JLPT, skema berkas JSON bank soal, skrip generator CLI, adapter, dan UI engine.

8. **[Audit Kompatibilitas Ujian](audit-kompatibilitas-ujian.md)**
   - Jembatan adapter bank soal Supabase ke legacy engine dari audit kompatibilitas Fase 0.

9. **[Visualisasi Arsitektur](visualisasi-arsitektur.md)**
   - Diagram visual alur data, sync progress, runtime layer, status store Zustand, dan API handlers berbasis Mermaid.

10. **[Struktur Folder Proyek](struktur-folder-proyek.md)**
    - Pemetaan lengkap seluruh struktur folder repositori NihongoRoute.

11. **[Cetak Biru Ujian JLPT](cetak-biru-ujian-jlpt.md)**
    - Cetak biru implementasi pemindahan bank soal Supabase dan scoring server-side.

12. **[Panduan Fitur Aplikasi](fitur-aplikasi.md)**
    - Rincian fungsionalitas dan kapabilitas pembelajaran pengguna NihongoRoute.

13. **[Arsitektur Pengujian (Testing)](arsitektur-pengujian.md)**
    - Cakupan unit test Vitest (`__tests__/`) untuk menguji stores/hooks/lib dan pengujian ujung-ke-ujung (E2E) Playwright (`e2e/`).

14. **[Panduan Operasional & Runbook](operasional-dan-runbook.md)**
    - Kesiapan enterprise, standar deployment & rollback, prosedur backup & restore, penanganan insiden, dan manual pengerjaan skrip utilitas.

15. **[Panduan Pengelolaan Konten & Otomatisasi Skrip](panduan-pengelolaan-konten.md)**
    - Pengisian konten Sanity Studio, otomatisasi skrip seeding Supabase, prasyarat VOICEVOX audio generator, dan skrip validasi impor JLPT.

16. **[Optimalisasi Performa (Performance Engineering)](optimalisasi-performa.md)**
    - Panduan optimalisasi performa teknis seperti resize listener kondisional, controlled memoization timer, pencarian kamus cepat `.in()`, dan evaluasi gamifikasi berkecepatan tinggi.

17. **[Design System](design-system.md)**
    - Token warna semantik, aturan anti-AI-slop, dan contoh kode UI benar/salah — WAJIB dibaca setiap tugas menyentuh komponen visual.

---

📝 **Catatan Pengembang**: Saat melakukan modifikasi pada arsitektur sistem, peta perutean, manajemen status, atau skema basis data, harap perbarui juga dokumen modular terkait agar tetap sinkron dengan keadaan kode sumber teraktual. Jika ada dokumen baru ditambahkan ke folder ini, pastikan juga ditambahkan ke daftar ini **dan** ke daftar dokumentasi di `README.md` root — kedua indeks ini harus selalu sinkron.
