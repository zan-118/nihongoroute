# 📂 Struktur Folder Proyek NihongoRoute

Berikut adalah peta struktur folder dan berkas proyek NihongoRoute. Struktur ini dirancang secara modular dan offline-first, mematuhi panduan `ARCHITECTURE.md` secara ketat.

---

## 🌳 Pohon Direktori Utama

```text
nihongoroute/
├── .agents/                 # File dan instruksi untuk agen AI pengembang
├── app/                     # Rute Halaman (Next.js 16 App Router)
│   ├── (main)/              # Area Utama (memerlukan navigasi samping/atas)
│   │   ├── courses/         # Halaman materi pelajaran & detail bab
│   │   ├── dashboard/       # Statistik, rekor berturut-turut, & visualisasi XP
│   │   ├── exams/           # Simulasi ujian JLPT
│   │   ├── library/         # Kamus, tata bahasa, kanji, & kosa kata
│   │   ├── review/          # Halaman mesin utama pengulangan berkala (SRS)
│   │   ├── settings/        # Pengaturan profil, tema, & furigana global
│   │   ├── share/           # Halaman publik berbagi progres belajar
│   │   ├── social/          # Papan peringkat & tantangan antar-pengguna
│   │   ├── support/         # Pusat bantuan, FAQ, & dompet digital
│   │   └── tools/           # Alat bantu (writing, kana, flashcards)
│   ├── actions/             # Server Actions (Pengambilan data Supabase/Sanity)
│   │   ├── exams.actions.ts
│   │   ├── grammar.actions.ts
│   │   ├── kanji.actions.ts
│   │   ├── lessons.actions.ts
│   │   ├── library.actions.ts
│   │   ├── reading.actions.ts
│   │   └── vocab.actions.ts
│   ├── api/                 # Endpoints API internal
│   ├── auth/                # Alur autentikasi (masuk, daftar, callback)
│   ├── onboarding/          # Pengenalan interaktif pengguna baru
│   ├── studio/              # Sanity Studio (embedded CMS)
│   ├── globals.css          # Desain Semantik CSS (Cyber-Glass Token)
│   ├── layout.tsx           # Providers (QueryClient, Auth, Theme)
│   └── page.tsx             # Landing page pemasaran
├── components/              # Komponen Antarmuka Pengguna (UI)
│   ├── features/            # Fitur Spesifik Domain (Dilarang bercampur!)
│   │   ├── course/
│   │   ├── dashboard/
│   │   ├── exams/
│   │   ├── gamification/    # Animasi XP, lencana level, rekor beruntun
│   │   ├── grammar/
│   │   ├── kanji/
│   │   ├── lessons/
│   │   ├── library/
│   │   ├── reading/
│   │   ├── review/          # Evaluasi kartu & perhitungan jeda waktu
│   │   ├── srs/             # Logika tombol penilaian SRS (Mudah/Sulit)
│   │   └── tools/
│   ├── layout/              # Rangka global aplikasi
│   │   ├── Sidebar.tsx      # Sidebar desktop utama
│   │   ├── Topbar.tsx       # Topbar status (XP, level, rekor harian)
│   │   └── MobileNav.tsx    # Tab bar navigasi mobile bawah
│   ├── providers/           # Providers sisi klien
│   └── ui/                  # Komponen Primitif Atomik (Radix / Reusable)
├── hooks/                   # Custom React Hooks
│   ├── useCloudData.ts      # Mengambil data profil/SRS dari Supabase
│   ├── useCloudMutation.ts  # Mengirim mutasi "Dirty" ke Supabase RPC via React Query
│   ├── useSyncProgress.ts   # Mengawasi store Zustand & debouncing perubahan lokal
│   ├── useFurigana.ts       # Mengelola pembacaan & interaksi huruf Jepang
│   └── useReviewSession.ts  # Mengelola state aktif latihan SRS
├── lib/                     # Utilitas murni & kueri (DILARANG berisi JSX/TSX!)
│   ├── supabase/            # Klien Supabase & konfigurasi middleware
│   ├── queries.ts           # Pemanggilan kueri data ke Sanity CMS
│   ├── srs.ts               # Algoritma perhitungan jeda pengulangan memori
│   ├── routes.ts            # Peta navigasi rute aplikasi
│   ├── level.ts             # Logika konversi XP ke Level pengguna
│   └── utils.ts             # Helper utilitas string/gaya visual
├── store/                   # Zustand Stores (Persistensi IndexedDB)
│   ├── useAuthStore.ts      # Mengelola status token & sesi autentikasi
│   ├── useUserStore.ts      # Mengelola XP, rekor belajar, & pencadangan profil
│   ├── useSRSStore.ts       # Mengelola basis data kartu SRS lokal
│   ├── useUIStore.ts        # Mengelola preferensi Furigana & target harian
│   └── types.ts             # Definisi tipe TypeScript untuk Zustand store
├── supabase/                # File konfigurasi, schema, & migrasi Supabase
├── sanity/                  # Skema dan konfigurasi konten Sanity CMS
├── types/                   # File TypeScript global (.d.ts)
└── [Konfigurasi Root]       # tailwind.config.js, next.config.ts, tsconfig.json
```

---

## 🎯 Rujukan Penempatan Komponen & Berkas

Untuk memastikan kerapian struktur ini, seluruh tim pengembang wajib mematuhi aturan berikut:

1. **Komponen Halaman vs Fitur**:
   * Kode di dalam folder `app/(main)/[page]/page.tsx` hanya bertindak sebagai orkestrator yang memanggil komponen fitur.
   * Logika antarmuka spesifik harus diletakkan di `components/features/[domain]`.

2. **Pisahkan JSX dari `lib/`**:
   * Segala fungsi yang menghasilkan markup visual (seperti fungsionalitas Furigana atau popover kosa kata Jepang) wajib ditempatkan di `components/features/` (misalnya di `components/features/reading/SmartJapanese.tsx`), **bukan** di dalam folder `lib/`. Folder `lib/` secara ketat hanya berisi kode JavaScript/TypeScript murni tanpa elemen visual React.

3. **Orkestrasi Aliran Data**:
   * Data statis editorial diambil secara paralel menggunakan `Promise.all` di Server Actions (`app/actions/`) memanggil API Sanity (`lib/queries.ts`).
   * Sinkronisasi data dinamis SRS & XP ditangani oleh hooks (`hooks/useSyncProgress.ts`) yang mengirim data Zustand (`store/`) ke database awan Supabase via RPC.
