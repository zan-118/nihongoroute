# Overview Proyek

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

## 1. Tujuan Proyek

**NihongoRoute** adalah platform pembelajaran Bahasa Jepang mandiri (Self-Study Platform) berbasis web modern yang dirancang tangguh untuk skenario **offline-first** (prioritas luring). Aplikasi ini memfasilitasi pengguna untuk mempelajari kosakata (vocabulary), tata bahasa (grammar), kanji, menyusun kalimat, latihan mendengar (listening), membaca (reading), dan mengikuti simulasi ujian kompetensi JLPT secara mandiri tanpa jeda meskipun konektivitas internet tidak stabil.

### Masalah yang Diselesaikan:
1. **Kehilangan Progres Akibat Koneksi Terputus**: Sistem offline-first menggunakan IndexedDB di sisi klien untuk memastikan seluruh aktivitas belajar (SRS review, quiz, lesson completion) tersimpan secara lokal terlebih dahulu tanpa latency.
2. **Keterbatasan Kuota & Latency API**: Data pembelajaran statis di-cache dan disinkronkan secara cerdas dalam satu batch mutasi kotor (dirty status) saat koneksi tersedia.
3. **Ketergantungan Layanan Text-to-Speech (TTS) Berbayar**: Mengintegrasikan MsEdgeTTS (secara gratis via dynamic scraping/synthesis) dikombinasikan dengan caching database Supabase dan dynamic fallback ke Web Speech API di sisi browser untuk menekan biaya operasional API real-time.
4. **Sistem Anti-Cheat XP**: Menghalangi manipulasi XP/streak dari sisi klien dengan mengonfirmasi perolehan XP akhir melalui algoritma kalkulasi tersertifikasi di sisi server (PostgreSQL RPC function).

### Target Pengguna:
- Pemelajar mandiri bahasa Jepang dari level dasar (N5) hingga tingkat menengah/lanjut (N1).
- Pengguna yang sering belajar dalam kondisi mobilitas tinggi atau koneksi internet tidak stabil.

---

## 2. Tech Stack Lengkap & Versi Dependensi

Tech stack utama yang digunakan oleh NihongoRoute diekstrak langsung dari berkas konfigurasi repositori:

### Core Framework & Runtime
* **Runtime**: Node.js
* **Framework**: Next.js `16.2.2` (App Router, Server Actions, Route Handlers)
* **Library UI**: React `19.2.2` & React DOM `19.2.2`

### Database, Storage & Back-end Service
* **Platform**: Supabase
  * **Database**: PostgreSQL (dengan ekstensi `uuid-ossp` dan `pg_trgm`)
  * **Klien DB**: `@supabase/supabase-js` `^2.104.0`
  * **Integrasi SSR**: `@supabase/ssr` `^0.10.2`
  * **Storage Buckets**: `tts-cache` (untuk audio statis/cached) dan `exam-assets` (untuk materi ujian)
  * **Row Level Security (RLS)**: Diaktifkan secara penuh pada seluruh 26 tabel database.

### State Management & Caching (Offline-First)
* **Global Store**: Zustand `^5.0.12`
* **Local Persistence**: `idb-keyval` `^6.2.2` (IndexedDB Wrapper)
* **Server State & Sync**: `@tanstack/react-query` `^5.100.8` (React Query)
* **Komunikasi Multi-Tab**: HTML5 `BroadcastChannel` ("nihongoroute_sync")

### Pengolah Bahasa Jepang (Japanese Processing)
* **Analisis & Furigana**: `kuroshiro` `^1.2.0` dan `kuroshiro-analyzer-kuromoji` `^1.1.0` (kamus kuromoji dict)
* **Furigana IME & Conversion**: `wanakana` `^5.3.1`
* **Audio Synthesis (TTS)**: `msedge-tts` `^2.0.5`

### UI / UX & Desain
* **Styling**: Tailwind CSS `^3.4.1` dengan `postcss` `^8.5.6` dan `autoprefixer` `^10.4.24`
* **Utility CSS**: `clsx` `^2.1.1`, `tailwind-merge` `^3.5.0`, `tailwindcss-animate` `^1.0.7`, `class-variance-authority` `^0.7.1`
* **Icons**: `lucide-react` `^0.454.0`
* **Animasi**: `framer-motion` `^12.38.0`
* **Komponen Primitif**: Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-progress`, `@radix-ui/react-select`, `@radix-ui/react-slot`, `@radix-ui/react-switch`)
* **Notifikasi UI**: `sonner` `^2.0.7`
* **PDF Rendering**: `@react-pdf/renderer` `^4.5.1`

### AI Integration
* **Model AI**: `@google/generative-ai` `^0.24.1` (Gemini API untuk generate materi pelajaran/lessons secara dinamis di sisi admin)

### Pengujian & Linter (Testing & Quality Assurance)
* **Unit Testing**: Vitest `^4.1.5` dengan `@testing-library/react` `^16.3.2` dan `@testing-library/jest-dom` `^6.9.1`
* **E2E Testing**: Playwright `@playwright/test` `^1.59.1`
* **Linter**: ESLint `^9.16.0` dengan config `eslint-config-next` `16.2.2`
* **Git hooks**: `husky` `^9.1.7` dan `lint-staged` `^16.4.0`
