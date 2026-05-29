# 📂 Peta Struktur Folder Proyek NihongoRoute
Dokumen Standar Pengorganisasian Kode Sumber | Versi 1.1 (Mei 2026)

---

## 🌳 1. Bagan Pohon Direktori Utama

Berikut adalah pohon direktori proyek NihongoRoute yang diperbarui secara presisi sesuai dengan keadaan aktual *codebase*. Alias path `@/*` menunjuk langsung ke direktori `./src/*` untuk menyederhanakan deklarasi impor.

```text
nihongoroute/
├── .agents/                 # Berkas panduan rekayasa dan instruksi agen AI
├── src/                     # ══ DIRECTORI UTAMA KODE SUMBER APLIKASI ══
│   │
│   ├── actions/             # Server Actions (Pengambilan & mutasi data transaksional)
│   │   ├── cheatsheets.actions.ts   # Kelola kueri data cheatsheets
│   │   ├── exams.actions.ts         # Simulasi ujian JLPT/JFT & kategori Supabase
│   │   ├── expressions.actions.ts   # Ungkapan harian bahasa Jepang
│   │   ├── flashcard.actions.ts     # Ambil koleksi flashcard luring
│   │   ├── grammar.actions.ts       # Kueri tata bahasa terstruktur
│   │   ├── kanji.actions.ts         # Kueri kanji terstruktur & radikal
│   │   ├── lessons.actions.ts       # Integrasi daftar silabus Sanity-Supabase
│   │   ├── library.actions.ts       # Hub barrel file ekspor tindakan perpustakaan
│   │   ├── library.counts.actions.ts# Perhitungan statistik perpustakaan
│   │   ├── library.detail.actions.ts# Detail modular entri kosakata/kanji/grammar
│   │   ├── listening.actions.ts     # Ambil kueri materi menyimak
│   │   ├── reading.actions.ts       # Ambil kueri materi membaca & TTS
│   │   └── vocab.actions.ts         # Kueri kosakata terstruktur
│   │
│   ├── app/                 # Rute Halaman Aplikasi (Next.js 16 App Router)
│   │   ├── (main)/          # Grup Rute Utama (Memakai NavWrapper: Sidebar/Topbar)
│   │   │   ├── courses/     # Katalog silabus kursus & halaman bab pelajaran
│   │   │   ├── dashboard/   # Dasbor visualisasi kemajuan belajar & grafik XP
│   │   │   ├── exams/       # Halaman simulasi ujian JLPT & JFT-Basic CBT
│   │   │   ├── library/     # Perpustakaan kamus leksikal komprehensif
│   │   │   ├── review/      # Sesi mesin tinjauan SRS harian
│   │   │   ├── settings/    # Pengaturan preferensi visual & furigana global
│   │   │   ├── share/       # Halaman publik bagikan progres belajar
│   │   │   ├── social/      # Papan peringkat & papan tantangan sosial
│   │   │   ├── support/     # Pusat FAQ & dompet donasi digital
│   │   │   └── tools/       # Peralatan (Kanji canvas, flashcards, kana quiz)
│   │   ├── api/             # API Endpoints internal (Furigana parser, dll.)
│   │   ├── auth/            # Gateway penanganan sesi autentikasi
│   │   ├── login/           # Layar masuk pengguna
│   │   ├── forgot-password/ # Layar pemulihan kata sandi
│   │   ├── update-password/ # Layar pembaruan kata sandi
│   │   ├── onboarding/      # Orientasi interaktif pengguna baru (Layar Penuh)
│   │   ├── privacy/         # Kebijakan privasi platform
│   │   ├── terms/           # Syarat dan ketentuan platform
│   │   ├── studio/          # Sanity Studio CMS (Embedded Studio)
│   │   ├── globals.css      # Gaya visual semantik (CSS Variables Cyber-Glass)
│   │   ├── layout.tsx       # Main Providers (Theme, Query, Auth)
│   │   └── page.tsx         # Landing page pemasaran utama
│   │
│   ├── components/          # ══ DIRECTORI SEPARASI KOMPONEN UI ══
│   │   ├── features/        # Komponen terisolasi khusus domain fitur
│   │   │   ├── course/      # Tampilan navigasi pelajaran & sidebar silabus
│   │   │   ├── dashboard/   # Grafik progres mingguan & cincin pencapaian
│   │   │   ├── exams/       # Mesin CBT ujian (MockExamEngine, ExamReview, dll.)
│   │   │   ├── feedback/    # Widget laporan bug & umpan balik pengguna
│   │   │   ├── flashcards/  # Mesin interaktif kartu flashcard
│   │   │   ├── games/       # Mini-games edukasi (survival mode)
│   │   │   ├── gamification/# Efek visual naik level, bilah XP, status streak
│   │   │   ├── global/      # Fitur lintas-domain generik
│   │   │   ├── grammar/     # Detail tata bahasa & bento card struktur
│   │   │   ├── kanji/       # Visual urutan coretan & add-to-srs button
│   │   │   ├── landing/     # Komponen halaman depan (Pahlawan, Fitur Utama)
│   │   │   ├── lessons/     # Halaman rendering pelajaran (Dialogue, Reading)
│   │   │   ├── library/     # Antarmuka direktori kamus & detail kosakata
│   │   │   ├── listening/   # Pemutar audio tersinkronisasi transkrip interaktif
│   │   │   ├── notifications/# Toast notifikasi lencana & status sync
│   │   │   ├── onboarding/  # Alur layar tur interaktif
│   │   │   ├── pdf/         # Generator sertifikat & lembar PDF
│   │   │   ├── reading/     # Tampilan samping berdampingan & text-to-speech
│   │   │   ├── review/      # Ringkasan statistik pasca-review
│   │   │   ├── srs/         # Panel tombol evaluasi SRS (Mudah/Sulit)
│   │   │   ├── tools/       # Komponen peralatan (canvas menulis, kuis kana)
│   │   │   └── user/        # Detail profil pengguna & kelola setelan
│   │   ├── layout/          # Rangka Layout Global (Sidebar, Topbar, MobileNav)
│   │   ├── providers/       # Lapisan pembungkus konteks (Theme, Query, Progress)
│   │   └── ui/              # Komponen atomik dapat digunakan ulang (Radix/shadcn)
│   │
│   ├── hooks/               # Custom React Hooks Global Infrastruktur
│   │   ├── useCachedAudio.ts# Manajemen caching luring berkas audio
│   │   ├── useCloudData.ts  # Mengambil progres & srs dari Supabase
│   │   ├── useCloudMutation.ts# Mengirim batch update kotor ke Supabase RPC
│   │   ├── useSyncProgress.ts# Orkestrasi sync asinkron & debounce
│   │   └── useHasMounted.ts # Cek hidrasi klien demi keamanan DOM
│   │
│   ├── lib/                 # Utilitas murni bebas JSX/TSX (Strict)
│   │   ├── supabase/        # Klien Supabase (client, server, middleware, sync)
│   │   ├── utils/           # Helper fungsional modular
│   │   ├── queries.ts       # Kueri GROQ universal Sanity (Aset Coalesce)
│   │   ├── srs.ts           # Algoritma memori spaced repetition (SM-2)
│   │   ├── sanitize.ts      # Filter pembersih serangan injeksi XSS
│   │   ├── routes.ts        # Peta navigasi rute universal
│   │   ├── level.ts         # Rumus kalkulasi level berdasarkan XP
│   │   ├── gamification.ts  # Logika streak & merge progres belajar
│   │   ├── audio.ts         # SoundEngine prosedural instan
│   │   ├── sanity.client.ts # Inisialisasi klien Sanity CMS
│   │   └── utils.ts         # Gabungan visual kelas Tailwind CSS (cn)
│   │
│   ├── store/               # Zustand Global Stores (IndexedDB Persisted)
│   │   ├── useAuthStore.ts  # Manajemen token & status sesi masuk
│   │   ├── useUserStore.ts  # Kelola XP, level, dan daftar pelajaran kotor
│   │   ├── useSRSStore.ts   # Kelola basis data kartu SRS & dirtySrs Set
│   │   ├── useUIStore.ts    # Kelola notifikasi, pref furigana, & ekspor data
│   │   └── types.ts         # Tipe statis data Zustand Store
│   │
│   └── types/               # Pengetikan Statis TypeScript Universal
│
├── sanity/                  # ══ DIRECTORI EDITORIAL SANITY CMS ══
│   ├── schemaTypes/         # Skema struktur dokumen Sanity (Exams, Lessons)
│   └── components/          # Komponen UI kustom editor Sanity Studio
│
├── supabase/                # Berkas konfigurasi skema & migrasi Supabase
│   └── migrations/          # Berkas migrasi database SQL (RLS, RPC)
├── __tests__/               # Unit Tests (Vitest)
└── e2e/                     # End-to-end Tests (Playwright)
```

---

## 💎 2. Sepuluh Standar Emas Penempatan Berkas & Modularitas

Seluruh pengembang di NihongoRoute wajib mematuhi aturan pengorganisasian kode berikut guna menghindari kekacauan arsitektur (*spaghetti code*):

1.  **Server Actions Wajib Berada di `src/actions/`**:
    Seluruh berkas tindakan server wajib diisolasi di folder `src/actions/` guna menjaga keselarasan rute Next.js 16. Direktori rute `app/` murni hanya berisi file rute visual, mencegah file tindakan tidak sengaja terdaftar sebagai endpoint halaman.
2.  **Isolasi Hooks Berdasarkan Domain Fitur (*Feature Cohesion*)**:
    Hook yang melayani fitur tertentu **DILARANG** diletakkan di folder global `src/hooks/`. Misalnya, hook `useFlashcardSession.ts` wajib ditempatkan di bawah folder fiturnya sendiri (`src/components/features/flashcards/`). Folder `src/hooks/` global murni hanya digunakan untuk hooks infrastruktur lintas-domain (seperti `useSyncProgress.ts` dan `useCachedAudio.ts`).
3.  **Folder `src/lib/` Wajib Bebas JSX/TSX**:
    Direktori `src/lib/` secara ketat hanya diperuntukkan bagi berkas TypeScript murni, utilitas, fungsi matematika, kueri GROQ, dan logika enkripsi/sanitasi. Fungsi apa pun yang menghasilkan markup visual (elemen JSX/TSX) wajib ditempatkan di bawah direktori `components/`.
4.  **Gunakan Path Absolut `@/` Secara Konsisten**:
    Hindari impor relatif yang dalam (seperti `../../../../components/`). Semua deklarasi impor wajib memanfaatkan alias path absolut terstruktur, seperti `@/actions/...`, `@/components/...`, `@/hooks/...`, dan `@/lib/...`.
5.  **Pemisahan Logika Halaman di `app/` (*Orchestrator Pattern*)**:
    Setiap berkas `page.tsx` di dalam direktori `app/` tidak boleh memuat pengelolaan state, efek samping, atau logika Zustand yang kompleks (*God Files*). File `page.tsx` hanya bertindak sebagai orkestrator yang memicu data loading di server dan memanggil komponen Client-Side utama yang mengonsumsi kustom hook domain spesifik.
6.  **Kewajiban Penggunaan Direktif `"use client"`**:
    Setiap komponen visual yang memiliki event handler dari React (seperti `onClick`, `onMouseEnter`, `onMouseLeave`) wajib disematkan direktif `"use client";` di baris paling pertama berkas. Hal ini mencegah kegagalan hidrasi Server Components di lingkungan Next.js 16.
7.  **Pemasangan `aria-label` Terlokalisasi pada Tombol Ikon**:
    Untuk menjaga kepatuhan aksesibilitas internasional (A11y/screen reader), seluruh tombol aksi yang murni hanya berisi simbol grafis (ikon Lucide) tanpa teks tertulis wajib menyertakan atribut `aria-label` deskriptif dalam Bahasa Indonesia.
8.  **Ekspansi Aset Sanity di Sisi Server (GROQ)**:
    Setiap pengambilan berkas media (audio chōkai atau gambar soal) dari Sanity CMS wajib menggunakan format kueri ekspansi `coalesce` di file `queries.ts` (misalnya: `"audioUrl": coalesce(audioUrl.asset->url, audioUrl)`). Ini memastikan URL string absolut dikirim ke komponen visual, bukan representasi objek internal Sanity.
9.  **Resolusi Dinamis UUID Kategori Supabase**:
    Server Action pemroses ujian wajib mendeteksi dan menyelesaikan parameter `category_id` dinamis (bisa berupa UUID Supabase atau slug teks Sanity) menggunakan deteksi ekspresi reguler. Jika terdeteksi UUID, sistem harus menerjemahkannya ke slug kategori lewat kueri tabel `course_categories` Supabase guna menghindari patah navigasi klien (rute 404).
10. **Pencegahan Error Hidrasi (requestAnimationFrame)**:
    Saat melakukan perubahan state otomatis di dalam efek samping inisialisasi awal klien (seperti mendeteksi status tautan atau membuka popup otomatis), perubahan state tersebut **WAJIB** dibungkus di dalam `requestAnimationFrame` guna memastikan peramban menyelesaikan hidrasi DOM awal sebelum state diubah.
