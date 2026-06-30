# Server Actions & API Routes

Dokumen ini memetakan fungsionalitas sisi server aplikasi NihongoRoute, mendokumentasikan antrean Server Actions dan endpoint API Route Handlers.

---

## 1. Next.js Server Actions (`src/actions/*`)

Server Actions adalah modul asinkron Next.js yang mengeksekusi logika di sisi server, memungkinkan komponen klien memanggil fungsi database secara langsung tanpa membuat endpoint HTTP terpisah.

* **`vocab.actions.ts` & `kanji.actions.ts` & `grammar.actions.ts`**:
  * Menggunakan klien Supabase statis (`createStaticClient`) untuk melayani pembacaan data publik berkecepatan tinggi tanpa pemindaian cookie sesi.
  * Mendukung pemuatan data terpaginasi (paginated), pencarian string teks penuh, dan penyaringan tingkat kesulitan JLPT.
* **`library.detail.actions.ts`**:
  * Menyelesaikan detail item pustaka secara individual (kanji, kosakata, tata bahasa, materi membaca, mendengarkan, pelajaran, dan ujian).
  * Bertanggung jawab melakukan hidrasi data antar-platform. Contoh: memuat data kosakata, lalu mencari daftar materi membaca Sanity terkait yang memuat kata tersebut di dalam teksnya menggunakan GROQ query.
* **`lessons.actions.ts`**:
  * Menggabungkan data kategori kursus dari Supabase dengan susunan materi pelajaran Sanity CMS.
* **`exams.actions.ts`**:
  * Memproses detail mock exam dari Sanity atau Supabase.
* **`library.counts.actions.ts`**:
  * Menghitung total entri pustaka lintas sumber: menghitung jumlah kosakata/kanji/tata bahasa di database Supabase, serta membaca total dokumen membaca/mendengarkan/simulasi ujian yang diterbitkan di Sanity CMS secara real-time.
* **`jlpt-exams.actions.ts`**:
  * Mengelola state transaksional sesi ujian JLPT: memulai sesi ujian (`startJlptMockSession`), menyimpan jawaban berkala pengguna (`saveJlptMockSessionAnswers`), dan mengirimkan hasil akhir ujian (`submitJlptMockSession`) ke database Supabase.
* **`tools-integration.actions.ts`**:
  * Mengoordinasikan integrasi tools bantuan seperti menulis kanji dan latihan dikte.

---

## 2. Next.js API Route Handlers (`src/app/api/*`)

API Route Handlers melayani interaksi HTTP standar untuk integrasi eksternal atau proses rendering dinamis:

* **`/api/tts` (GET)**:
  * Melayani audio statis buatan VOICEVOX dari Supabase Storage.
  * Menerima teks, voice, dan rate. Menghitung MD5 hash sebagai kunci pencarian di tabel `tts_cache`. Jika ditemukan, mengalirkan biner MP3 dari storage. Jika tidak, mengembalikan 404 (memicu klien menggunakan browser Web Speech API).
* **`/api/furigana` (POST)**:
  * Generator furigana instan berbasis pustaka Kuroshiro + Kuromoji analyzer.
  * CORS diaktifkan untuk menerima permintaan dari localhost (pengembangan Sanity Studio) dan domain utama produksi.
* **`/api/cards` (GET/POST)**:
  * Menyelesaikan array ID/UUID flashcard menjadi representasi objek data kamus yang siap dirender di klien.
* **`/api/health` (GET)**:
  * Pemeriksaan status kesehatan aplikasi. Menguji keberadaan variabel lingkungan esensial (`NEXT_PUBLIC_SUPABASE_URL`, dll.) dan mengembalikan status `200` jika lengkap, atau `503` jika ada yang kurang.
  * **Security Guard**: Di lingkungan produksi, API ini dilarang membocorkan nama variabel rahasia yang hilang. Ia hanya mengembalikan total jumlah variabel yang tidak terkonfigurasi.
* **`/api/webhooks/saweria` & `/api/webhooks/trakteer` (POST)**:
  * Menerima notifikasi instan dukungan donasi dari Saweria atau Trakteer.
  * Memvalidasi tanda tangan hash (HMAC) menggunakan kunci rahasia webhook (`SAWERIA_WEBHOOK_SECRET` / `TRAKTEER_WEBHOOK_SECRET`) untuk mencegah pemalsuan transaksi.
  * Jika tanda tangan valid, skrip memperbarui status level donatur pada profil pengguna di Supabase.
* **`/auth/callback` (GET)**:
  * Endpoint pertukaran kode otorisasi OAuth (Google, dll) ke dalam cookie sesi autentikasi Supabase.

---

## 3. Keamanan Jembatan Admin (Admin Bridge Protection)

Sanity Studio memerlukan data dari Supabase untuk menghubungkan konten editorial dengan data kosakata/kanji. Integrasi ini dilayani oleh API jembatan admin:
* **`/api/admin/supabase-search`**: Digunakan oleh pemilih input di Sanity Studio untuk mencari kosakata/kanji/tata bahasa di database Supabase.
* **`/api/admin/ai-assistant`**: Menghubungkan asisten AI di Sanity dengan Gemini API untuk otomatisasi pembuatan konten bab pelajaran dan furigana.

### Mekanisme Proteksi Jembatan (`validateAdminApiRequest`):
* Seluruh endpoint `/api/admin/*` diamankan menggunakan helper otentikasi di `src/lib/admin-api-auth.ts`.
* API menolak permintaan jika token rahasia dikirimkan melalui parameter kueri URL (*Query String*) untuk menghindari kebocoran di log server.
* API wajib menerima token via header `Authorization: Bearer <ADMIN_API_SECRET>`.
* Pencocokan token menggunakan fungsi perbandingan waktu konstan (`crypto.timingSafeEqual`) untuk meminimalkan risiko serangan analisis waktu (*timing attacks*).
