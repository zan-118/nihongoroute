# Overview Proyek

> Terakhir diperbarui: 31 Juli 2026

---

## 1. Tujuan

**NihongoRoute** adalah platform pembelajaran Bahasa Jepang mandiri berbasis web yang dirancang **offline-first**. Aplikasi memfasilitasi pengguna untuk mempelajari kosakata, tata bahasa, kanji, kalimat, latihan mendengar, membaca, dan mengikuti simulasi ujian JLPT secara mandiri tanpa jeda meskipun koneksi internet tidak stabil.

### Masalah yang Diselesaikan

1. **Kehilangan progres saat offline** — IndexedDB menyimpan seluruh aktivitas belajar secara lokal sebelum disinkronkan ke server.
2. **Latency API** — Data disinkronkan dalam satu batch mutasi kotor (dirty state) saat koneksi tersedia, bukan per-request.
3. **Biaya TTS** — MsEdgeTTS digunakan untuk sintesis audio gratis, dikombinasikan dengan caching di Supabase Storage dan fallback Web Speech API di browser.
4. **Anti-cheat XP** — Perolehan XP akhir dihitung dan divalidasi di sisi server (PostgreSQL RPC function), bukan dipercaya dari klien.

### Target Pengguna

- Pembelajar mandiri bahasa Jepang dari level N5 hingga N1.
- Pengguna yang sering belajar dalam kondisi mobilitas tinggi atau koneksi tidak stabil.

---

## 2. Tech Stack

Diekstrak langsung dari `package.json` pada 31 Juli 2026.

### Core Framework & Runtime

| Paket | Versi | Peran |
|-------|-------|-------|
| Node.js | 22.x (CI) | Runtime |
| Next.js | `16.2.12` | Framework (App Router, Server Actions, Route Handlers) |
| React | `19.2.8` | Library UI |
| React DOM | `19.2.8` | Rendering DOM |

### Database & Backend Service

| Paket | Versi | Peran |
|-------|-------|-------|
| Supabase | — | Platform (PostgreSQL + Auth + Storage) |
| `@supabase/supabase-js` | `^2.104.0` | Client library |
| `@supabase/ssr` | `^0.10.2` | Integrasi SSR Next.js |

**Ekstensi PostgreSQL aktif**: `uuid-ossp`, `pg_trgm`.

**Storage Buckets**: `asset`, `exam-assets`, `tts-cache`.

### State Management & Offline-First

| Paket | Versi | Peran |
|-------|-------|-------|
| `zustand` | `^5.0.12` | Global state (4 stores) |
| `idb-keyval` | `^6.2.2` | Persistensi IndexedDB |
| `@tanstack/react-query` | `^5.100.8` | Server state, mutation, retry |
| BroadcastChannel | — | Sinkronisasi multi-tab (`nihongoroute_sync`) |

### Pengolah Bahasa Jepang

| Paket | Versi | Peran |
|-------|-------|-------|
| `kuroshiro` | `^1.2.0` | Analisis morfologi + furigana |
| `kuroshiro-analyzer-kuromoji` | `^1.1.0` | Analyzer backend (kamus kuromoji) |
| `wanakana` | `^5.3.1` | Konversi kana ↔ romaji |
| `msedge-tts` | `^2.0.5` | Sintesis audio TTS |

### UI & Desain

| Paket | Versi | Peran |
|-------|-------|-------|
| Tailwind CSS | `^4.3.3` | Styling (v4, `@import "tailwindcss"` syntax) |
| `postcss` | `^8.5.22` | PostCSS pipeline |
| `autoprefixer` | `^10.5.4` | Vendor prefix |
| `clsx` | `^2.1.1` | Conditional classnames |
| `tailwind-merge` | `^3.5.0` | Merge Tailwind classes |
| `tailwindcss-animate` | `^1.0.7` | Animasi CSS |
| `class-variance-authority` | `^0.7.1` | Component variants |
| `@iconify/react` | `^6.0.2` | Ikon |
| `framer-motion` | `^12.38.0` | Animasi deklaratif |
| `sonner` | `^2.0.7` | Notifikasi toast |
| `next-themes` | `^0.4.6` | Theme switching (dark/light) |

**Radix UI Primitives** (di `package.json`): `react-dialog`, `react-dropdown-menu`, `react-progress`, `react-select`, `react-slot`, `react-switch`.

### Utilitas Lainnya

| Paket | Versi | Peran |
|-------|-------|-------|
| `zod` | `^4.4.3` | Validasi schema |
| `date-fns` | `^4.1.0` | Manipulasi tanggal |
| `@react-pdf/renderer` | `^4.5.1` | Render PDF (sertifikat/laporan) |
| `@google/generative-ai` | `^0.24.1` | Gemini API (generasi konten admin) |
| `@next/third-parties` | `16.2.12` | Integrasi third-party scripts |
| `@vercel/analytics` | `^2.0.1` | Analitik |
| `@vercel/speed-insights` | `^2.0.0` | Core Web Vitals monitoring |

### Pengujian & Quality Assurance

| Paket | Versi | Peran |
|-------|-------|-------|
| `vitest` | `^4.1.5` | Unit testing |
| `@testing-library/react` | `^16.3.2` | Render testing |
| `@testing-library/jest-dom` | `^6.9.1` | DOM matchers |
| `@playwright/test` | `^1.59.1` | E2E testing |
| `eslint` | `^9.16.0` | Linter |
| `eslint-config-next` | `16.2.12` | Next.js lint rules |
| `husky` | `^9.1.7` | Git hooks |
| `lint-staged` | `^16.4.0` | Pre-commit lint |

### Dev Utilities

| Paket | Versi | Peran |
|-------|-------|-------|
| `@next/bundle-analyzer` | `16.2.12` | Analisis ukuran bundle |
| `sharp` | `^0.35.3` | Optimasi image (Next.js) |
| `lighthouse` | `^13.4.0` | Performance audit |
| `dotenv` | `^17.4.2` | Environment variable loader (scripts) |
| `csv-parser` | `^3.2.1` | Parser CSV (import scripts) |
| `@gradio/client` | `^2.3.1` | Gradio API client (dev tooling) |
