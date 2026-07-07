# Arsitektur NihongoRoute
**Snapshot Audit: Juni 2026**

Dokumen ini menjelaskan struktur arsitektur sistem, pembagian data (split-source), siklus sinkronisasi progres, logika bisnis pembelajaran, konfigurasi build, serta checklist pemeliharaan pada proyek NihongoRoute.

---

## 1. Ringkasan Sistem (System Summary)

NihongoRoute adalah platform pembelajaran Bahasa Jepang terstruktur berbasis Next.js App Router yang dirancang khusus untuk pelajar Indonesia dengan pendekatan **luring-utamakan (offline-first)**. Sistem memadukan:
* Konten pelajaran utama (lesson), data kamus leksikal, autentikasi, transaksi, media TTS, dan sinkronisasi progres belajar dari **Supabase (PostgreSQL)**.
* Konten editorial pelengkap (reading, listening) dan metadata simulasi ujian legacy dari **Sanity CMS**.
* Pengalaman belajar tanpa latensi di sisi klien (zero-latency client experience) menggunakan **Zustand** yang disimpan otomatis ke **IndexedDB** (`idb-keyval`).
* Penyelarasan terkoordinasi dan background sync via **TanStack Query**.

---

## 2. Komponen Utama Teknologi (Technology Stack)

### 2.1 Runtime Inti
* **Framework**: Next.js 16.2.2 (App Router).
* **Library UI**: React 19.2.2, Framer Motion (animasi), Sonner (notifikasi toast), Radix UI (primitives UI).
* **Bahasa**: TypeScript (Strict Mode aktif) dengan alias path `@/*` menunjuk ke `./src/*`.
* **Desain Gaya**: Tailwind CSS 3.4 dengan variabel visual tema semantik.

### 2.2 Integrasi Data & Status
* **Supabase Client**: `@supabase/ssr` untuk penanganan cookie sesi aman, serta `@supabase/supabase-js` untuk operasi biner.
* **Sanity Client**: `next-sanity`, `@sanity/client`, `@sanity/image-url` untuk pengolahan gambar.
* **State Management**: Zustand v5 terintegrasi dengan storage IndexedDB (`idb-keyval`).
* **Query Cache**: `@tanstack/react-query` v5.

### 2.3 Utilitas Bahasa & Pengujian
* **Furigana**: Kuroshiro + Kuromoji dictionary analyzer.
* **Audio TTS**: VOICEVOX generator offline & MsEdgeTTS fallback.
* **Pengujian Unit**: Vitest dengan tiruan DOM `jsdom`.
* **Pengujian E2E**: Playwright untuk visual peramban desktop & seluler.

---

## 3. Tanggung Jawab Pembagian Sumber Data (Split-Source Model)

Aplikasi menerapkan pemisahan data berdasarkan karakteristik dan keamanannya:

### 3.1 Repositori Supabase (Lesson, Lexical & User Data)
Supabase bertanggung jawab atas data utama aplikasi:
* **Konten pelajaran utama**: Tabel `lessons` menyimpan seluruh bab pelajaran N5–N1 lengkap dengan dialog Jepang-Indonesia, blok konten (`content_blocks` JSONB), kuis evaluasi (`quizzes` JSONB), referensi vocab/kanji/grammar (UUID array JSONB), metadata SEO, gambar sampul (`image_url`), dan konteks generasi AI (`generation_context` JSONB). Lesson dihasilkan oleh pipeline AI (`scripts/build_lessons_supabase.mjs`) dan diimpor oleh `scripts/import_lesson_draft.mjs`.
* Autentikasi pengguna (email, OAuth, status guest).
* Kamus utama: kosakata (`vocab`), kanji (`kanji`), dan tata bahasa (`grammar`).
* Log aktivitas: ekspresi harian (`expressions`), radikal kanji (`radicals`), dan kalimat dikte (`sentences`).
* Progres belajar pengguna: data profil (`profiles`), ulasan spaced repetition (`user_srs`), dan pelajaran diselesaikan (`user_lessons`).
* Sesi simulasi ujian: log jawaban (`user_exam_answers`) dan sesi aktif (`user_exam_sessions`).
* Fitur sosial: postingan diskusi (`community_posts`) dan komentar (`community_comments`).
* Transaksi & Feedback: data supporter pendukung (`supporters`), metadata TTS (`tts_cache`), biner MP3 (`tts-cache` bucket), dan laporan bug (`user_feedback`).

### 3.2 Repositori Sanity CMS (Editorial Content — Pelengkap)
Sanity mengelola materi editorial pelengkap (bukan lagi sumber utama lesson):
* Dokumen `readingMaterial`: Artikel latihan membaca, terjemahan, dan kuis.
* Dokumen `listeningMaterial`: Teks karaoke menyimak, stempel waktu suara, dan kuis.
* Dokumen `mockExam`: Metadata simulasi ujian terstruktur (waktu, skor lulus, question pack) — dipertahankan sebagai fallback/legacy.

---

## 4. Sistem Sinkronisasi Progres Luring

Arsitektur offline-first diatur oleh hook `useSyncProgress` pada shell layout `ProgressProvider`:

```text
[Aktivitas User] -> Zustand Store -> Set Dirty IDs -> IndexedDB (Lokal)
                                                         │
                                               (Debounce 2000 ms)
                                                         │
                                                         ▼
                                          Panggil RPC sync_user_progress
                                                         │
                                             ┌───────────┴───────────┐
                                             ▼                       ▼
                                       [Valid / Sukses]        [Anti-Cheat XP]
                                             │                       │
                                    Hapus Dirty IDs        Gunakan accepted_xp
                                             │                       │
                                             └───────────┬───────────┘
                                                         │
                                                         ▼
                                       Broadcast Channel: SYNC_COMPLETE
                                                         │
                                        Invalidasi Query di Tab Lain
```

1. **Conflict Resolution (`mergeProgress`)**:
   * Saat memuat progres awal dari awan (`profiles`, `user_srs`, `user_lessons`), data diselaraskan dengan status lokal IndexedDB.
   * Progres gamifikasi (XP/Streak) digabungkan berdasarkan nilai tertinggi.
   * Kartu SRS diselaraskan dengan membandingkan stempel waktu `updatedAt`. Data dengan stempel waktu terbaru menang. Status hapus lokal (`isDeleted = true`) dikirim sebagai tombstone.
2. **Auto-Sync Debounce**:
   * Setiap ada kartu SRS yang dijawab atau bab pelajaran yang diselesaikan, status lokal diubah dan ID kartu dimasukkan ke Set `dirtySrs` atau `dirtyLessons`.
   * Timer debounce selama **2000 ms** diaktifkan. Jika tidak ada aktivitas baru, mutasi `useCloudMutation` mengirim payload ke database RPC `sync_user_progress`.
3. **Anti-Cheat & Capping di Database**:
   * Fungsi database `sync_user_progress` memvalidasi kenaikan XP dari payload.
   * Server menghitung XP teoretis maksimum (15 XP per SRS, 100 XP per pelajaran, dan nilai lencana prestasi yang sah).
   * Selisih XP sisa dikategorikan sebagai bonus harian dan dibatasi maksimal **150 XP per hari**.
   * XP yang disetujui server dikembalikan sebagai `accepted_xp` untuk ditulis ulang ke Zustand store lokal.
4. **Multi-Tab Broadcast**:
   * Setelah sukses sinkron, klien menyiarkan sinyal `"SYNC_COMPLETE"` melalui `BroadcastChannel`. Tab peramban lain menangkap sinyal dan membuang cache React Query secara instan.

---

## 5. Logika Bisnis Pembelajaran Inti

### 5.1 Algoritma Spaced Repetition (SRS)
* **SM-2 Modified**: Pengulangan kosakata/kanji diatur oleh nilai kualitas jawaban (grade 0-3).
* **Penalti Modern**: Jawaban salah (grade 0/1) mengurangi Ease Factor dan memotong interval belajar menjadi setengahnya (grade 0) atau berkurang 30% (grade 1). Batas minimal Ease Factor diatur **1.3**.
* **Due-Date Guard**: Interval kartu hanya bertambah jika diulas pada waktu jatuh tempo (`Date.now() >= nextReview - 6 jam`). Ulasan prematur tidak menaikkan interval belajar dan hanya memberikan penambahan Ease Factor mikro `0.02`.

### 5.2 Sintesis Suara VOICEVOX
* **Pre-generated Cache Only**: Panggilan API `/api/tts` melayani biner MP3 dari storage bucket `tts-cache` Supabase. Tidak ada proses sintesis suara real-time di rute API.
* **Web Speech Fallback**: Jika data suara bernilai 404 (cache miss), klien otomatis beralih memanggil `speechSynthesis` peramban klien berbahasa Jepang.
* **Casting Suara**: Fungsi `detectVoice` memetakan nama tokoh pembicara secara otomatis berdasarkan gender heuristik (suffix chan/kun) dan hash deterministik.

### 5.3 SmartJapanese Furigana
* **Ruby Split**: Komponen `<SmartJapanese>` menganalisis string, mengisolasi blok Kanji dari Hiragana, dan merender teks pelafalan di atas Kanji menggunakan tag `<ruby>` dengan rasio ukuran `<rt>` relatif **`0.55em`**.
* **CPU Guard**: Pemindaian pencocokan dibatasi area buffer maksimal 10 karakter untuk menghindari loop komputasi tak terhingga pada teks panjang.

---

## 6. Konfigurasi Produksi, Build & Pengujian

### 6.1 next.config.ts & Security
* Standalone build output diaktifkan (`output: "standalone"`).
* Security headers diinjeksikan secara global (CSP, HSTS, Frame-Options, XSS protection).
* Cache eksternal Font diatur permanen.

### 6.2 Unit & E2E Testing
* Uji unit dijalankan oleh Vitest di bawah folder `__tests__/` untuk memverifikasi logika spaced repetition, state stores, kuis/exam engine, dan hooks sync.
* Uji fungsional visual dijalankan oleh Playwright di folder `e2e/` untuk memastikan kestabilan alur navigasi, autentikasi, dan pengerjaan materi pelajaran di browser desktop maupun mobile.

---

## 7. Checklist Pemeliharaan (Maintenance Checklist)

Saat melakukan modifikasi pada kode sumber:
1. **Perubahan Skema**: Konsolidasikan seluruh perubahan skema database secara langsung ke dalam berkas migrasi tunggal public schema utama: `supabase/migrations/20260620130000_initial_schema.sql`. Jalankan typegen untuk memperbarui `src/types/supabase.generated.ts` dan selaraskan tipe data manual di `src/types/database.ts`.
2. **Kueri Baru**: Selalu pastikan kueri SQL baru dilindungi oleh aturan RLS (Row Level Security) yang sesuai di database.
3. **Penyelarasan Sanity**: Jika schema Sanity untuk materi pelengkap (reading, listening, mockExam) berubah, perbarui kueri GROQ di `src/lib/core/queries.ts`, Server Actions terkait, dan perender UI klien bersamaan. **Catatan**: Lesson tidak lagi dikelola di Sanity — lesson dibaca langsung dari tabel `lessons` Supabase.
4. **Modifikasi Payload Sync**: Jika struktur data Zustand store berubah, perbarui logika deserializer di middleware persist, payload builder di `src/lib/core/cloud-sync-payload.ts`, dan argumen RPC `sync_user_progress` bersama-sama.
5. **Pipeline Generasi Lesson**: Lesson dihasilkan oleh `scripts/build_lessons_supabase.mjs` (memerlukan kurikulum standar JSON di folder scratch) dan diimpor oleh `scripts/import_lesson_draft.mjs`. Jika skema tabel `lessons` berubah, kedua skrip ini harus diperbarui bersamaan.

---

## 8. Panduan Pembuatan Konten AI (AI Content Generation)

Saat menggunakan script generator AI (seperti `generate-lessons.mjs` atau proses *enrichment* lainnya), perhatikan pedoman kurikulum berikut (berdasarkan audit kurikulum Juli 2026):
1. **Penanganan Duplikasi Pola/Varian**: Di level tinggi (N3-N1), AI sering mengelompokkan pola grammar yang mirip dalam satu bab (contoh: `～ことだ` dan `～こと`, atau `～際` dan `～ところ`). Script deskripsi *lesson* **wajib** ditekankan untuk secara eksplisit menjelaskan **perbedaan nuansa** antar varian tersebut, bukan sekadar mengulang arti yang sama.
2. **UX Pembagian Level Besar**: Level transisi seperti N3 memiliki jumlah bab yang membengkak (mencapai 36+ bab). Secara data relasional tetap berada di level N3, namun secara UI/UX di peramban, daftar bab harus dipecah/dipaginasi menjadi "N3 Part 1" dan "N3 Part 2" agar pelajar mandiri (self-study) tidak merasa terbebani (overwhelmed).
3. **Gaya Bahasa *Can-do Statement***: Di level N2 dan N1, pernyataan *can-do* secara natural menjadi lebih abstrak (akademis/bisnis). Pastikan *prompt* *copywriting* AI tetap menginstruksikan penggunaan bahasa Indonesia yang membumi, ringkas, dan mudah dicerna oleh pelajar self-study. Hindari kalimat *can-do* yang lebih rumit dari materi tata bahasanya sendiri.
4. **Validasi Referensi JSON**: Jangan pernah menerima data ID (seperti referensi Grammar ID dari Supabase) yang tidak melalui validasi database. Cegah masuknya *placeholder* UUID halusinasi (seperti `[ID tidak ditemukan: ...]`) ke CMS Sanity.
