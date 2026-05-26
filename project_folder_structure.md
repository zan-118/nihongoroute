# 📂 Struktur Folder Proyek NihongoRoute

Berikut adalah peta struktur folder dan berkas proyek NihongoRoute yang diperbarui sesuai kondisi aktual *codebase*. Struktur ini dirancang secara modular dan *offline-first* dengan menggunakan direktori `src/` sebagai wadah seluruh kode sumber. Alias path `@/*` merujuk ke `./src/*` (dikonfigurasi di `tsconfig.json`).

---

## 🌳 Pohon Direktori Utama

```text
nihongoroute/
├── .agents/                 # File dan instruksi untuk agen AI pengembang
├── src/                     # ══ SELURUH KODE SUMBER APLIKASI ══
│   │
│   ├── actions/             # Server Actions (Pengambilan data Supabase/Sanity)
│   │   ├── cheatsheets.actions.ts
│   │   ├── exams.actions.ts          # Simulasi ujian JLPT/JFT + resolusi kategori Supabase
│   │   ├── expressions.actions.ts    # Ungkapan umum bahasa Jepang
│   │   ├── flashcard.actions.ts
│   │   ├── grammar.actions.ts
│   │   ├── kanji.actions.ts
│   │   ├── lessons.actions.ts
│   │   ├── library.actions.ts        # Barrel re-export (hub semua action)
│   │   ├── library.counts.actions.ts # Penghitungan statistik entri perpustakaan
│   │   ├── library.detail.actions.ts # Detail item perpustakaan (vocab, kanji, grammar)
│   │   ├── listening.actions.ts
│   │   ├── reading.actions.ts
│   │   └── vocab.actions.ts
│   │
│   ├── app/                 # Rute Halaman (Next.js 16 App Router)
│   │   ├── (main)/          # ═ Area Utama (memerlukan navigasi samping/atas) ═
│   │   │   ├── courses/     # Halaman materi pelajaran & detail bab
│   │   │   │   ├── [categoryId]/     # Halaman kategori kursus dinamis
│   │   │   │   │   └── [slug]/       # Halaman pelajaran tunggal
│   │   │   │   ├── CoursesClient.tsx  # Klien interaktif daftar kursus
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/   # Statistik, rekor berturut-turut, & visualisasi XP
│   │   │   ├── exams/       # Simulasi ujian JLPT & JFT-Basic
│   │   │   │   ├── [id]/             # Halaman sesi ujian dinamis
│   │   │   │   ├── ExamsClient.tsx    # Klien interaktif daftar ujian
│   │   │   │   └── page.tsx
│   │   │   ├── library/     # Kamus, tata bahasa, kanji, & kosa kata
│   │   │   ├── review/      # Halaman mesin utama pengulangan berkala (SRS)
│   │   │   ├── settings/    # Pengaturan profil, tema, & furigana global
│   │   │   ├── share/       # Halaman publik berbagi progres belajar
│   │   │   ├── social/      # Papan peringkat & tantangan antar-pengguna
│   │   │   ├── support/     # Pusat bantuan, FAQ, & dompet digital
│   │   │   └── tools/       # Alat bantu (writing, kana, flashcards)
│   │   ├── api/             # Endpoints API internal (furigana, admin, webhooks)
│   │   ├── auth/            # Alur autentikasi (callback OAuth)
│   │   ├── login/           # Halaman login
│   │   ├── forgot-password/ # Pemulihan kata sandi
│   │   ├── update-password/ # Pembaruan kata sandi
│   │   ├── onboarding/      # Pengenalan interaktif pengguna baru
│   │   ├── privacy/         # Kebijakan privasi
│   │   ├── terms/           # Syarat & ketentuan
│   │   ├── studio/          # Sanity Studio (embedded CMS)
│   │   ├── globals.css      # Desain Semantik CSS (Cyber-Glass Token)
│   │   ├── layout.tsx       # Providers (QueryClient, Auth, Theme)
│   │   └── page.tsx         # Landing page pemasaran
│   │
│   ├── components/          # ══ KOMPONEN ANTARMUKA PENGGUNA (UI) ══
│   │   ├── features/        # ═ Fitur Spesifik Domain (Feature Cohesion) ═
│   │   │   ├── course/      # Tampilan halaman materi & navigasi antar bab
│   │   │   ├── dashboard/   # Grafik XP, cincin kemajuan, statistik
│   │   │   ├── exams/       # Mesin simulasi ujian JLPT/JFT
│   │   │   │   ├── mock-engine/      # ★ Mesin inti simulasi ujian
│   │   │   │   │   ├── MockExamEngine.tsx   # Orkestrator utama state machine
│   │   │   │   │   ├── ExamIntro.tsx        # Layar pengantar ujian
│   │   │   │   │   ├── ExamPlaying.tsx      # Layar bermain (soal, audio, grid)
│   │   │   │   │   ├── ExamResult.tsx       # Layar hasil dual-view (sertifikat)
│   │   │   │   │   ├── ExamReview.tsx       # Layar review jawaban
│   │   │   │   │   ├── useMockExamEngine.ts # Hook logic engine (timer, scoring, audio)
│   │   │   │   │   ├── types.ts             # Tipe ExamData, ExamQuestion, GameState
│   │   │   │   │   └── constants.ts         # Label seksi ujian
│   │   │   │   └── quiz-engine/      # Mesin kuis mini (di dalam pelajaran)
│   │   │   ├── feedback/    # Widget umpan balik pengguna
│   │   │   ├── flashcards/  # Mesin kartu pengingat dinamis
│   │   │   │   └── useFlashcardSession.ts # Hook logika sesi flashcard dinamis
│   │   │   ├── games/       # Mini-game edukasi interaktif
│   │   │   │   └── survival/  # Permainan kelangsungan hidup (survival game)
│   │   │   │       └── useSurvivalSetup.ts  # Hook pengaturan & status game survival
│   │   │   ├── gamification/# Animasi XP, lencana level, rekor beruntun
│   │   │   ├── global/      # Komponen fitur lintas-domain
│   │   │   ├── grammar/     # Struktur tata bahasa & contoh kalimat
│   │   │   ├── kanji/       # Visualisasi urutan coretan, radikal, mnemonik
│   │   │   ├── landing/     # Komponen halaman pemasaran (Hero, FeatureGrid)
│   │   │   ├── lessons/     # Tampilan konten pelajaran (VocabSection, ReadingSection)
│   │   │   ├── library/     # Komponen perpustakaan & detail entri
│   │   │   ├── listening/   # Pemutar audio & transkrip interaktif
│   │   │   ├── notifications/# Sistem pengingat & notifikasi
│   │   │   ├── onboarding/  # Komponen pengenalan pengguna baru
│   │   │   ├── pdf/         # Pembuatan & pengunduhan dokumen PDF
│   │   │   ├── reading/     # Mode membaca berdampingan (JP-ID) + TTS
│   │   │   ├── review/      # Ringkasan sesi latihan SRS
│   │   │   ├── srs/         # Tombol evaluasi (Sulit/Mudah) & jeda waktu
│   │   │   ├── tools/       # Alat bantu (audio, canvas, dictionary, kana, writing)
│   │   │   │   └── kana/      # Modul kana (Hiragana/Katakana)
│   │   │   │       └── useKanaQuiz.ts # Hook orkestrasi latihan & kuis kana
│   │   │   └── user/        # Komponen profil & manajemen akun pengguna
│   │   │       ├── useLoginPage.ts      # Hook logika masuk (login)
│   │   │       ├── useOnboarding.ts     # Hook logika onboarding
│   │   │       ├── usePasswordUpdate.ts # Hook logika pembaruan kata sandi
│   │   │       └── useSettingsActions.ts # Hook logika manajemen profil & preferensi UI
│   │   ├── layout/          # ═ Rangka Global Aplikasi ═
│   │   │   ├── hooks/       # Hook terintegrasi khusus layout
│   │   │   ├── navbar/      # Sub-komponen navigasi atas
│   │   │   ├── sidebar/     # Sub-komponen navigasi samping
│   │   │   ├── AppBreadcrumbs.tsx  # Jejak navigasi kontekstual
│   │   │   ├── MobileNav.tsx      # Tab bar navigasi mobile bawah
│   │   │   ├── NavWrapper.tsx     # Pembungkus navigasi responsif
│   │   │   ├── Sidebar.tsx        # Sidebar desktop utama
│   │   │   ├── ThemeToggle.tsx    # Tombol pengalih tema
│   │   │   └── Topbar.tsx         # Topbar status (XP, level, rekor)
│   │   ├── providers/       # Providers sisi klien
│   │   │   ├── ProgressProvider.tsx  # Orkestrasi sinkronisasi & auth listener
│   │   │   ├── QueryProvider.tsx     # React Query client
│   │   │   └── ThemeProvider.tsx     # next-themes provider
│   │   └── ui/              # ═ Komponen Primitif Atomik (Radix / Reusable) ═
│   │       ├── portable-text/       # Renderer Sanity Portable Text
│   │       ├── SmartJapanese.tsx     # Rendering teks Jepang cerdas
│   │       ├── FuriganaDisplay.tsx   # Tampilan Ruby 0.55em
│   │       ├── FuriganaInput.tsx     # Input dengan furigana otomatis
│   │       ├── useFurigana.ts        # Hook pendukung FuriganaInput
│   │       ├── button.tsx, card.tsx, dialog.tsx, ...  # shadcn/ui primitives
│   │       └── SanityMedia.tsx       # Renderer media dari Sanity CDN
│   │
│   ├── hooks/               # Custom React Hooks Global (Infrastruktur)
│   │   ├── useCachedAudio.ts    # Caching audio untuk pemutaran offline
│   │   ├── useCloudData.ts      # Mengambil data profil/SRS dari Supabase
│   │   ├── useCloudMutation.ts  # Mengirim mutasi "Dirty" ke Supabase RPC
│   │   ├── useSyncProgress.ts   # Mengawasi store Zustand & debouncing
│   │   └── useHasMounted.ts     # Mendeteksi status pemasangan komponen
│   │
│   ├── lib/                 # Utilitas murni & kueri (DILARANG berisi JSX/TSX!)
│   │   ├── supabase/        # Klien Supabase (client, server, admin, sync)
│   │   ├── utils/           # Utilitas tambahan (lesson-utils.ts)
│   │   ├── queries.ts       # Kueri GROQ universal ke Sanity CMS (dengan coalesce expansion)
│   │   ├── srs.ts           # Algoritma perhitungan jeda pengulangan memori (SM-2)
│   │   ├── sanitize.ts      # Utilitas sanitasi HTML (pencegahan XSS)
│   │   ├── routes.ts        # Peta navigasi rute aplikasi
│   │   ├── level.ts         # Logika konversi XP ke Level pengguna
│   │   ├── gamification.ts  # Logika streak, merge study days
│   │   ├── audio.ts         # SoundEngine untuk efek suara prosedural
│   │   ├── sanity.client.ts # Klien Sanity CMS & image URL builder
│   │   └── utils.ts         # Helper utilitas string/gaya visual (cn, slugify)
│   │
│   ├── store/               # Zustand Stores (Persistensi IndexedDB via idb-keyval)
│   │   ├── useAuthStore.ts  # Mengelola status token & sesi autentikasi
│   │   ├── useUserStore.ts  # Mengelola XP, rekor belajar, & pencadangan profil
│   │   ├── useSRSStore.ts   # Mengelola basis data kartu SRS lokal
│   │   ├── useUIStore.ts    # Mengelola preferensi Furigana & target harian
│   │   └── types.ts         # Definisi tipe TypeScript untuk Zustand store
│   │
│   └── types/               # Definisi tipe global
│       ├── database.ts      # Tipe skema database Supabase
│       └── library.ts       # Tipe domain perpustakaan
│
├── sanity/                  # ══ SKEMA & KOMPONEN SANITY CMS ══
│   ├── schemaTypes/         # Definisi skema dokumen konten
│   │   ├── index.ts         # Barrel export seluruh skema
│   │   ├── lesson.ts        # Skema pelajaran (content_blocks, quizzes, vocab/kanji)
│   │   ├── mockExam.ts      # Skema simulasi ujian (levelCode, choukaiAudio, questions[])
│   │   ├── readingMaterial.ts # Skema materi bacaan
│   │   └── listeningMaterial.ts # Skema materi menyimak
│   └── components/          # Komponen kustom Sanity Studio
│       ├── SupabaseCategorySelect.tsx  # Pemilih kategori dari Supabase
│       ├── SupabaseSelector.tsx        # Pemilih entitas Supabase generik
│       ├── AIAssistantBar.tsx          # Panel bantuan AI untuk editor
│       ├── FuriganaGeneratorInput.tsx  # Generator furigana otomatis
│       └── api.ts                      # Konfigurasi API bridge Sanity–Next.js
│
├── supabase/                # File konfigurasi, schema, & migrasi Supabase
│   └── migrations/          # File migrasi SQL
├── public/                  # Static assets (gambar, logo, PWA icons)
├── __tests__/               # Unit tests (Vitest)
│   ├── hooks/               # Test untuk custom hooks
│   ├── lib/                 # Test untuk utilitas murni (srs, level)
│   └── store/               # Test untuk Zustand stores
├── e2e/                     # End-to-end tests (Playwright)
├── scripts/                 # Skrip utilitas (migrasi data, seed)
│
├── ARCHITECTURE.md          # Audit arsitektur teknis lengkap
├── architecture_visual.md   # Diagram Mermaid arsitektur visual
├── project_folder_structure.md # Dokumen ini
├── README.md                # Dokumentasi utama proyek
│
└── [Konfigurasi Root]       # tailwind.config.js, next.config.ts, tsconfig.json,
                             # sanity.config.ts, sanity.cli.ts, components.json,
                             # vitest.config.ts, playwright.config.ts, eslint.config.mjs
```

---

## 🎯 Rujukan Penempatan Komponen & Berkas

Untuk memastikan kerapian struktur ini, seluruh tim pengembang wajib mematuhi aturan berikut:

### 1. Server Actions di `src/actions/`
   * Menjaga folder `app/` murni berisi modul rute yang bisa dipetakan oleh Next.js, menghindari berkas logika tindakan tidak sengaja terdaftar sebagai rute halaman.
   * `library.actions.ts` bertindak sebagai barrel file (hub re-export) tanpa directive `"use server"` sendiri. File action individual yang di-re-export sudah memiliki directive masing-masing.

### 2. Feature Cohesion untuk Hooks
   * Hook spesifik fitur dilarang ditaruh di folder `src/hooks/` global. Hook seperti `useReviewSession.ts` wajib ditaruh di `src/components/features/review/hooks/`.
   * Hook navigasi diletakkan di `src/components/layout/hooks/` karena langsung melayani tata letak navigasi global.
   * `useFurigana.ts` diletakkan di `src/components/ui/` agar berdampingan erat dengan komponen pendukungnya `FuriganaInput.tsx`.

### 3. Gunakan Path Absolute `@/`
   * Dengan konfigurasi `tsconfig.json`, `@/` menunjuk langsung ke `./src/*`.
   * Semua pemanggilan import wajib menggunakan `@/actions/...`, `@/components/...`, `@/hooks/...`, `@/lib/...` untuk menjamin tidak ada referensi rusak.

### 4. Pisahkan JSX dari `lib/`
   * Segala fungsi yang menghasilkan markup visual wajib ditempatkan di `components/`, **bukan** di dalam folder `lib/`. Folder `lib/` secara ketat hanya berisi kode TypeScript murni tanpa elemen visual React.

### 5. Komponen Halaman vs Fitur
   * Kode di dalam folder `app/(main)/[page]/page.tsx` hanya bertindak sebagai orkestrator yang memanggil komponen fitur.
   * Logika antarmuka spesifik harus diletakkan di `components/features/[domain]`.

### 6. Direktif `"use client"` untuk Sub-Komponen Interaktif
   * Sub-komponen visual yang memiliki event handlers (seperti `onMouseEnter`, `onMouseLeave`, `onClick`) wajib diletakkan di `components/features/[domain]/` dan disematkan direktif `"use client";` untuk mencegah error *hydration* Server Components di Next.js 16.

### 7. Wajib `aria-label` untuk Tombol Ikon
   * Tombol-tombol navigasi/aksi yang hanya berisi ikon grafis tanpa teks visual (misal di komponen pagination) **WAJIB** memiliki atribut `aria-label` deskriptif yang terlokalisasi dalam Bahasa Indonesia.

### 8. Kueri GROQ Sanity dengan Asset Expansion
   * Setiap kueri GROQ yang melibatkan field bertipe `file` atau `image` dari Sanity **WAJIB** menggunakan ekspansi `coalesce` (contoh: `"audioUrl": coalesce(audioUrl.asset->url, audioUrl)`) untuk memastikan URL string bersih dikirim ke komponen visual klien, bukan referensi objek internal Sanity.

### 9. Resolusi Dinamis UUID Kategori Supabase
   * Field `category_id` pada dokumen Sanity `mockExam` dapat berisi UUID Supabase atau slug teks. Server Action `getExamByIdOrSlug` wajib mendeteksi format UUID via regex dan melakukan pencarian slug asli ke tabel `course_categories` Supabase secara dinamis untuk mencegah rute 404 pada navigasi klien.

### 10. Pemisahan Logika Halaman (No God Files di `app/`)
   * Setiap berkas `page.tsx` di dalam folder `app/` **TIDAK BOLEH** mencampur logika pengelolaan state, effect, atau hook Zustand secara langsung jika logika tersebut kompleks.
   - Seluruh logika tersebut **WAJIB** diekstraksi ke dalam custom hook domain spesifik di bawah folder fitur yang bersangkutan (`src/components/features/[domain]/use[Feature].ts`). Berkas `page.tsx` hanya bertindak sebagai orkestrator yang memanggil custom hook tersebut untuk merender UI murni.
