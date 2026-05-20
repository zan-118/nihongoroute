# 🌀 Ringkasan Arsitektur NihongoRoute

Dokumen ini menyajikan audit struktural yang komprehensif dari proyek NihongoRoute, merinci tumpukan teknologi, hubungan antar lapisan aplikasi, serta arsitektur alur data. File ini berfungsi sebagai rujukan teknis utama bagi para pengembang.

> **Catatan:** Seluruh kode sumber aplikasi berada di dalam direktori `src/`. Alias path `@/*` merujuk ke `./src/*` (dikonfigurasi di `tsconfig.json`).

---

## 1. Tumpukan Teknologi Utama

NihongoRoute dibangun menggunakan arsitektur modern yang berfokus pada sisi antarmuka (*frontend-heavy*) dan mudah diskalakan. Fokus utamanya adalah memberikan pengalaman yang dikendalikan oleh klien dengan kemampuan penggunaan luring (*offline-first*), didukung oleh sinkronisasi awan (*cloud*).

- **Kerangka Kerja (Framework):** Next.js 16 (App Router)
- **Bahasa Pemrograman:** TypeScript (Pengetikan ketat untuk keandalan)
- **Gaya Visual (Styling):** Tailwind CSS & Radix UI (Estetika *Cyber-Glass*: `backdrop-blur`, *glassmorphism*, dan aksen neon)
- **Manajemen Status (State Management):** Zustand (Penyimpanan tersegmentasi dengan persistensi IndexedDB melalui `idb-keyval`)
- **Status Server:** React Query (`@tanstack/react-query`) untuk pencadangan cerdas (*caching*) dan orkestrasi sinkronisasi awan.
- **Sisi Server & Autentikasi:** Supabase (PostgreSQL, RPC, Auth)
- **Manajemen Konten (Split-Source):** 
  - **Sanity CMS**: Sumber kebenaran utama untuk konten editorial (*Lessons*, *Reading*, *Listening*, *Exams*).
  - **Supabase**: Basis data terstruktur untuk entitas leksikal (*Kanji*, *Vocab*, *Grammar*) dan progres dinamis pengguna (*XP*, *SRS*).
- **Animasi:** Framer Motion (Transisi berbasis pegas yang sangat mulus)
- **Sinkronisasi Antar-Tab:** BroadcastChannel API (Memastikan konsistensi data di berbagai tab peramban)

---

## 2. Peta Rute & Tata Letak (`src/app/`)

Sistem perutean menggunakan App Router dari Next.js 16 dengan pemisahan tegas antara area utama aplikasi dan area yang terisolasi.

### Struktur Pohon Rute
```text
src/app/
├── (main)/                 # Grup Rute: Memerlukan Navigasi Samping & Atas
│   ├── courses/            # Katalog materi & detail pelajaran
│   ├── dashboard/          # Statistik pengguna & ringkasan kemajuan
│   ├── exams/              # Simulasi ujian JLPT
│   ├── library/            # Referensi tata bahasa & kamus
│   ├── review/             # Mesin utama pengulangan berkala (SRS)
│   ├── settings/           # Pengaturan profil & preferensi antarmuka
│   ├── share/              # Halaman publik untuk membagikan kemajuan
│   ├── social/             # Fitur sosial & papan peringkat
│   ├── support/            # Pusat bantuan & pertanyaan umum (FAQ)
│   └── tools/              # Alat bantu belajar tambahan
│       ├── flashcards/     # Mesin kartu pengingat dinamis
│       ├── kana/           # Latihan Hiragana & Katakana
│       └── writing/        # Mesin latihan menulis Kanji
├── api/                    # Endpoints API internal (furigana, admin, webhooks)
├── auth/                   # Alur masuk, daftar, & panggilan balik
├── login/                  # Halaman login
├── forgot-password/        # Pemulihan kata sandi
├── update-password/        # Pembaruan kata sandi
├── onboarding/             # Pengenalan bertahap (Terisolasi dari Tata Letak Utama)
├── privacy/                # Kebijakan privasi
├── terms/                  # Syarat & ketentuan
├── studio/                 # Sanity Studio (Embedded CMS)
├── globals.css             # Gaya dasar (Tailwind + Token Cyber-Glass)
├── layout.tsx              # Penyedia Utama (Autentikasi, Kueri, Tema)
└── page.tsx                # Halaman Utama (Pemasaran)
```

### Tujuan Tata Letak Khusus

* **`src/app/layout.tsx`**: Membungkus seluruh aplikasi dengan penyedia tema (`ThemeProvider`), kueri (`QueryClientProvider`), dan autentikasi (`AuthProvider`).
* **`src/app/(main)/layout.tsx`**: Menyediakan kerangka navigasi (Navigasi Samping, Navigasi Atas) yang seragam untuk pengalaman belajar.
* **`src/app/onboarding/`**: Menggunakan tata letak kosong (layar penuh) untuk meminimalkan gangguan saat pengguna pertama kali mengatur akun.

---

## 3. Anatomi Komponen & Fitur Domain (`src/components/`)

Folder `src/components/features/` dikelompokkan berdasarkan area fungsional untuk menghindari ketergantungan yang rumit.

| Folder Fitur | Tanggung Jawab |
| --- | --- |
| `course` | Menangani tampilan halaman materi pelajaran dan navigasi antar bab. |
| `dashboard` | Ekstensi statistik, grafik pengalaman (XP), dan cincin kemajuan untuk ringkasan belajar. |
| `exams` | Logika pengatur waktu ujian, navigasi soal, dan penilaian otomatis JLPT. |
| `gamification` | Komponen visual untuk bilah pengalaman (XP), lencana naik level, dan animasi rekor berturut-turut (*streak*). |
| `grammar` | Menampilkan struktur tata bahasa beserta contoh kalimat dan penjelasan. |
| `kanji` | Visualisasi urutan coretan, radikal, dan mnemonik. |
| `listening` | Pemutar audio yang tersinkronisasi dengan transkrip interaktif. |
| `pdf` | Pembuatan dan pengunduhan dokumen PDF (Sertifikat, *Cheatsheet*, Materi Pelajaran). |
| `reading` | Mode membaca berdampingan (Jepang-Indonesia) dengan integrasi teks-ke-suara (TTS). |
| `review` | Ringkasan sesi setelah menyelesaikan latihan pengulangan berkala (SRS). |
| `srs` | Tombol evaluasi (Sulit/Mudah) dan perhitungan jeda waktu. |

### Komponen Kerangka Global (`src/components/layout/`)

* **`Sidebar.tsx`**: Navigasi utama (Desktop) dengan integrasi tautan legal di bagian bawah.
* **`Topbar.tsx`**: Pusat kendali pengguna (XP, Level, Rekor) dan menu profil.
* **`MobileNav.tsx`**: Navigasi bawah (Bilah tab) untuk perangkat seluler.
* **`NavWrapper.tsx`**: Pembungkus navigasi responsif yang menggabungkan Sidebar, Topbar, dan MobileNav.
* **`AppBreadcrumbs.tsx`**: Jejak navigasi kontekstual.
* **`ThemeToggle.tsx`**: Tombol pengalih tema terang/gelap.

---

## 4. Analisis Manajemen Status (`src/store/`)

NihongoRoute menggunakan Zustand yang dipadukan dengan persistensi IndexedDB untuk menjamin performa tinggi dan fungsionalitas luring (*offline*).

### Penyimpanan Utama & Logika

1. **`useAuthStore`**: Mengelola status autentikasi dan sesi pengguna.
2. **`useUserStore`**: Mengelola data gamifikasi (XP, Rekor), level, inventaris, serta daftar pelajaran yang diselesaikan dan yang belum tersinkronisasi (*dirty*).
3. **`useSRSStore`**: Mengelola basis data kartu pengulangan berkala (*srs*) dan melacak perubahan lokal yang belum tersinkronisasi (*dirtySrs*).
4. **`useUIStore`**: Mengelola status sementara seperti proses memuat, status sinkronisasi, notifikasi, serta pengaturan visual (Furigana, Target harian).

### Persistensi IndexedDB (`idb-keyval`)

Aplikasi menyimpan status ke peramban secara asinkron menggunakan kunci berikut:

* `nihongoroute_user_data`: Data profil dan riwayat belajar.
* `nihongoroute_srs_data`: Seluruh basis data pengulangan berkala (SRS) lokal.
* `nihongoroute_ui_data`: Pengaturan tema, furigana, dan status antarmuka sesi.

---

## 5. Alur Data & Sinkronisasi Awan

Sistem menggunakan arsitektur terpadu berbasis Supabase untuk semua jenis data, menggabungkan konten statis dengan kemajuan pengguna secara real-time.

### Langkah 1: Pengambilan Konten Paralel (Promise.all & Server Actions)

Data edukasi diambil secara paralel menggunakan arsitektur *Split-Source* melalui Server Actions yang berada di `src/actions/`. 
- **Sanity CMS** melayani pemanggilan konten editorial yang kaya (mis. `lessons.actions.ts`, `reading.actions.ts`).
- **Supabase** melayani pengambilan data kamus leksikal yang kaku (mis. `library.actions.ts`, `vocab.actions.ts`).
Proses pengambilan data ini secara ketat mengimplementasikan pola `Promise.all` untuk menghindari *waterfall latency*, memanfaatkan *fetch caching* bawaan Next.js alih-alih invalidasi waktu kaku.

### Langkah 2: Sinkronisasi Awan ke Lokal (Supabase → Zustand)

1. Saat aplikasi dimuat, `useCloudData` mengambil salinan data dari Supabase (profil, data SRS, status pelajaran).
2. Data digabungkan ke Zustand menggunakan strategi **Offline-First**. Penyelesaian konflik data didasarkan pada `updated_at` terbaru.

### Langkah 3: Interaksi Lokal & Dirty Marking

Setiap interaksi (XP bertambah, kartu SRS dijawab) akan langsung memperbarui status lokal di Zustand dan menandai ID tersebut sebagai "dirty". UI memberikan umpan balik instan (< 16ms) tanpa menunggu respon jaringan.

### Langkah 4: Penyimpanan Latar Belakang (3-Tier Sync)

1. **`useSyncProgress`**: Mengamati perubahan store dan melakukan debouncing paket data "dirty".
2. **`useCloudMutation`**: Mengeksekusi prosedur RPC `sync_user_progress` di Supabase.
3. **Konfirmasi**: Jika sukses, penanda *dirty* dihapus dan pesan `"SYNC_COMPLETE"` disiarkan melalui **BroadcastChannel** agar tab lain melakukan cache invalidation.

---

## 6. Batasan Arsitektur

1. **Akses Bebas 100% (Free Access Strategy):** Pengguna dapat menikmati seluruh konten dan fitur secara gratis tanpa harus membuat akun (*login*). *Middleware Auth* bekerja secara pasif (hanya mengelola penyegaran token jika ada), dan profil lokal diamankan di *IndexedDB* secara penuh. Pembuatan akun sepenuhnya bersifat opsional demi keperluan pencadangan ke *cloud*.
2. **Pemilihan Terperinci (*Atomic Selectors*):** Komponen WAJIB mengambil bagian data secara spesifik (contoh: `useUserStore(s => s.xp)`) untuk mencegah pemuatan ulang (*re-render*) yang tidak perlu.
3. **Keamanan Multi-Tab:** Ketidakkonsistenan data antar-tab dicegah dengan membatalkan memori sementara kueri (*Query Cache*) yang dipicu oleh BroadcastChannel API.
4. **Ketahanan Luring:** Semua penyimpanan utama dipertahankan di IndexedDB, memungkinkan pengguna belajar di area tanpa sinyal dan tersinkronisasi otomatis saat terhubung kembali.

---

## 7. Jalur Rendering Furigana & Interaksi

NihongoRoute menerapkan sistem rendering teks Jepang yang canggih dengan kontrol global dan interaksi kata yang cerdas.

### 7.1 Kontrol Mode Global (`useUIStore`)
Status pembacaan dikendalikan secara terpusat melalui `readingState`:
- **Kanji**: Hanya menampilkan Kanji asli.
- **Furigana**: Menampilkan Kanji dengan anotasi Ruby di atasnya.
- **Hiragana**: Mengonversi seluruh teks Jepang menjadi Hiragana.

### 7.2 Komponen Rendering Cerdas
- **`SmartJapanese`** (`src/components/ui/SmartJapanese.tsx`): Komponen utama yang mendeteksi teks Jepang dan membungkusnya dengan logika interaksi.
- **`FuriganaDisplay`** (`src/components/ui/FuriganaDisplay.tsx`): Mengelola tampilan visual (Ruby) berdasarkan mode yang aktif. Menggunakan `0.55em` untuk proporsi yang optimal.
- **`WordPopover`**: Muncul saat teks diklik, melakukan pencarian kosakata secara dinamis di Supabase/IDB untuk memberikan definisi, contoh, dan audio TTS.

---

## 8. Protokol Sinkronisasi 3-Tingkat (3-Tier Sync)

Untuk menjamin performa luring (*offline-first*) yang tangguh, NihongoRoute mengikuti protokol sinkronisasi tiga lapis:

1.  **Lapis UI (Zustand)**: Interaksi pengguna langsung memperbarui Zustand store di `src/store/` (`useUserStore`, `useSRSStore`) untuk umpan balik instan (< 16ms).
2.  **Lapis Orkestrasi (`useSyncProgress`)**: Hook di `src/hooks/useSyncProgress.ts` memantau perubahan store, melakukan *debouncing*, dan menyiapkan paket data untuk dikirim ke awan.
3.  **Lapis Persistensi Awan (`useCloudMutation`)**: Hook di `src/hooks/useCloudMutation.ts` menggunakan React Query untuk mengeksekusi mutasi ke Supabase RPC. Jika sukses, ia akan menyiarkan `"SYNC_COMPLETE"` melalui `BroadcastChannel` untuk sinkronisasi antar-tab.

---

## 9. Standardisasi Copywriting & Pedoman Antarmuka Ramah Pengguna (Language-Gap Elimination)

Untuk menjamin NihongoRoute dapat diakses dan dipahami dengan mudah oleh seluruh pembelajar dari berbagai latar belakang di Indonesia, seluruh komponen antarmuka wajib mematuhi panduan penulisan teks berikut:

### 9.1 Eliminasi Kesenjangan Bahasa & Istilah Teknis
Aplikasi ini melarang penggunaan jargon teknis, metafora berlebih (misalnya nuansa penerbangan *"Pilot's Cabin"* yang membingungkan), kata singkatan asing kaku, dan slang/jargon SaaS yang tidak ramah pemula.

### 9.2 Tabel Padanan Istilah Wajib (Kanonik)

| Konteks / Fitur | Hindari (Language Gap / Jargon) | Wajib Menggunakan (Bahasa Indonesia Ramah) |
| :--- | :--- | :--- |
| **Pengaturan Akun** | `The Pilot's Cabin`, `Identitas Belajar` | `Pengaturan Akun`, `Profil Pengguna` |
| **Halaman Utama / Buku** | `Buka Pustaka`, `Pustaka Data` | `Buka Perpustakaan`, `Perpustakaan` |
| **Pencegahan Biaya** | `Paywall` | `Biaya Tersembunyi`, `Langganan Tersembunyi` |
| **Rekor Belajar** | `Streak`, `Hari Streak` | `Hari Beruntun`, `Hari Berturut-turut` |
| **Progres Sinkronisasi** | `data tertahan di buffer lokal`, `Purge Database` | `data belum disinkronkan`, `Hapus Semua Data` |
| **Pusat Bantuan** | `E-Wallet`, `coding fitur / membasmi bug` | `Dompet Digital`, `mengembangkan fitur / memperbaiki masalah teknis` |
| **Gamifikasi** | `XP Points` | `Poin XP` |
| **Sertifikat & Tes** | `Evaluasi kompetensi`, `Tingkat akurasi` | `Ujian`, `Akurasi Jawaban` |
| **Algoritma Memori** | `Spaced Repetition (SRS)` | `pengulangan cerdas`, `Pengulangan Terjadwal` |

Setiap pengembang yang menambahkan fitur baru wajib menggunakan padanan kata yang ramah pemula dari tabel di atas guna menjaga keberlanjutan pengalaman pengguna (*user experience*) yang konsisten.

---

## 10. Mekanisme Keamanan, Sanitasi Konten, & Penanganan Kueri Dinamis

Untuk menjamin keandalan dan keamanan tingkat tinggi pada platform, NihongoRoute menerapkan protokol keamanan dan standar Next.js 16 di setiap tingkat aplikasi:

### 10.1 Perlindungan XSS & Sanitasi HTML (`src/lib/sanitize.ts`)
Aplikasi merender konten HTML dinamis (seperti ulasan kuis ujian dan konten tabel lembar contekan interaktif) secara aman menggunakan utilitas penyanitasi khusus:
- **`sanitizeHtml`**: Fungsi penyanitasi berbasis regex berkinerja tinggi yang menyaring tag-tag berbahaya (seperti `<script>`, `<iframe>`, `<object>`) serta atribut pemicu JavaScript (seperti `onload`, `onerror`, `onclick`).
- Integrasi visual dilakukan melalui pembungkusan React yang aman alih-alih merender mentah `dangerouslySetInnerHTML` secara langsung tanpa pembersihan.

### 10.2 Pencegahan SQL Injection Wildcard (Server Actions)
Setiap pemanggilan kueri teks pencarian dinamis (misalnya pencarian kamus kosakata pada `vocab.actions.ts`) wajib melewati pembersihan karakter khusus SQL:
- Karakter wildcard SQL (`%` dan `_`) di-escape dengan aman menggunakan tanda backslash sebelum kueri dikirim ke basis data Supabase PostgreSQL. Hal ini mencegah pengguna mengeksploitasi pencarian teks untuk membebani kinerja basis data.

### 10.3 Pembungkusan Suspense untuk Penanganan Kueri Dinamis (`useSearchParams`)
Mengikuti aturan Next.js 16 App Router, setiap halaman yang mengonsumsi kueri pencarian parameter dinamis pada sisi klien via hook `useSearchParams` (seperti halaman masuk `/login` dan alat kana `/tools/kana`) wajib dibungkus di dalam komponen `<Suspense>`. 
- Hal ini mencegah deoptimisasi build, sehingga Next.js tidak merender seluruh halaman secara dinamis di server saat build time yang dapat menghentikan pembuatan static pages.

### 10.4 Penyegaran Sesi Supabase Auth (`src/proxy.ts`)
Sesi autentikasi Supabase disinkronkan dan disegarkan secara berkala pada middleware perantara (Proxy) untuk memastikan akses token pengguna selalu valid di lingkungan SSR tanpa menimbulkan masalah *cookie mismatch* antar-tab.