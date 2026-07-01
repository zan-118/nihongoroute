# Struktur Folder Proyek NihongoRoute
**Snapshot Audit: Juni 2026**

Dokumen ini memetakan tata letak repositori NihongoRoute secara lengkap untuk membantu pengembang memahami letak kode sumber, berkas konfigurasi, migrasi basis data, pengujian, serta skrip operasional.

---

## 1. Peta Repositori Utama (Top-Level Layout)

```text
nihongoroute/
├── .antigravitycli/             # Metadata status perkakas pembantu
├── .github/                     # Alur kerja integrasi (workflow quality CI)
├── .husky/                      # Pengait Git hooks (Husky)
├── docs/                        # Dokumentasi teknis modular (Bahasa Indonesia)
├── e2e/                         # Pengujian ujung-ke-ujung (E2E) Playwright
├── public/                      # Aset statis publik (font, manifest, opengraph)
├── sanity/                      # Definisi skema dan input kustom Sanity Studio
├── scripts/                     # Skrip pemeliharaan, generator ujian, dan VOICEVOX
├── src/                         # Kode sumber utama aplikasi Next.js
├── supabase/                    # Berkas migrasi database relasional
├── __tests__/                   # Pengujian unit dan integrasi (Vitest)
├── .env.example                 # Contoh kontrak variabel lingkungan
├── .gitignore                   # Aturan pengabaian berkas Git
├── ARCHITECTURE.md              # Dokumentasi arsitektur sistem utama
├── README.md                    # Ikhtisar proyek dan petunjuk instalasi
├── SECURITY.md                  # Kebijakan keamanan dan checklist rilis
├── sanity.cli.ts                # Konfigurasi CLI deployment Sanity
├── sanity.config.ts             # Konfigurasi Studio Sanity tertanam
├── schema.json                  # Ekspor artefak skema basis data
├── skills-lock.json             # Lockfile agent skills metadata
├── tailwind.config.js           # Konfigurasi tema dan gaya Tailwind CSS
├── tsconfig.json                # Aturan strict mode kompilasi TypeScript
├── vitest.config.ts             # Konfigurasi pengujian unit Vitest
```

---

## 2. Kode Sumber Aplikasi (`src/`)

```text
src/
├── actions/       # Server Actions Next.js (kueri kamus & progres database)
├── app/           # Folder rute Next.js App Router (Layouts, Pages, API Routes)
├── components/    # Komponen visual (features, layout chrome, providers, UI primitives)
├── hooks/         # React hooks kustom lintas fitur (sync progress, cached audio)
├── lib/           # Logika bisnis inti terdistribusi ke 10 subfolder (audio, constants, core, exams, gamification, japanese, learning, supabase, tools, utils)
├── proxy.ts       # Endpoint middleware proxy penyegaran cookie autentikasi
├── store/         # Penyimpanan status Zustand luring terintegrasi IndexedDB
└── types/         # Definisi tipe TypeScript terpusat (database & domain)
```

---

## 3. Rincian App Router (`src/app/`)

```text
src/app/
├── (main)/        # Rute terautentikasi (navigasi Sidebar, Topbar, ProgressProvider)
│   ├── courses/   # Kategori kelas dan halaman belajar interaktif
│   ├── dashboard/ # Dasbor statistik, heatmap, dan misi harian pengguna
│   ├── exams/     # Dasbor bank soal simulasi ujian dan mesin ujian klien
│   ├── library/   # Direktori pustaka kamus leksikal, materi membaca & menyimak
│   ├── review/    # Sesi peninjauan ulasan kartu spaced repetition (SRS)
│   ├── settings/  # Pengaturan profil, preferences, dan backup restore
│   ├── share/     # Fitur berbagi profil kemajuan belajar
│   ├── social/    # Forum diskusi komunitas dan papan peringkat (leaderboard)
│   ├── support/   # Halaman apresiasi supporter donasi (Saweria/Trakteer)
│   ├── tools/     # Direktori utilitas bantu (Kana, writing, dictation, flashcard)
│   ├── layout.tsx # Shell navigasi terautentikasi
│   └── loading.tsx
├── api/           # Endpoint rute API
│   ├── admin/     # Jembatan admin Studio Sanity ke Supabase & Gemini API
│   ├── cards/     # Resolusi ID flashcard ke data kosakata
│   ├── furigana/  # Pemrosesan konversi Furigana Kuroshiro
│   ├── health/    # Pemeriksaan kesehatan & variabel lingkungan rilis
│   ├── tts/       # Aliran data biner MP3 audio statis VOICEVOX
│   └── webhooks/  # Penerima webhook pembayaran Saweria & Trakteer
├── auth/          # Rute penanganan pertukaran token sesi OAuth
├── forgot-password/
├── login/
├── onboarding/
├── privacy/
├── studio/        # Dasbor CMS Studio Sanity tertanam di rute /studio
├── terms/
├── update-password/
├── globals.css    # Gaya global CSS dan variabel tema visual semantik
├── layout.tsx     # Shell HTML dasar aplikasi dan inisialisasi QueryClient
└── manifest.ts    # File manifes aplikasi web progresif (PWA)
```

---

## 4. Konvensi Penamaan dan Penempatan Kode

* **Server Actions**: Diletakkan di bawah `src/actions/` dengan sufiks nama berkas `*.actions.ts`. Wajib diawali dengan arahan `"use server"`.
* **Zustand Stores**: Diletakkan di bawah `src/store/` dengan penamaan file `useXStore.ts`.
* **UI Primitives**: Komponen dasar pakai ulang yang berukuran kecil (seperti button, card, input, dialog) diletakkan di `src/components/ui/`.
* **Feature Modules**: Komponen visual spesifik per-fitur diletakkan di `src/components/features/<nama_fitur>/`.
* **API Route Handlers**: Ditempatkan di folder `src/app/api/<nama_rute>/route.ts`.
* **Database SQL Migrations**: Seluruh migrasi database diletakkan di `supabase/migrations/`. Setiap berkas migrasi harus memiliki format penamaan terurut `<timestamp>_<nama_migrasi>.sql`.
