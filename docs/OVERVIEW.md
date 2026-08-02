# Overview Proyek NihongoRoute

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
> **Ruang Lingkup**: Visi Produk, Masalah yang Diselesaikan, Target Pengguna, & Tech Stack  
> **Rujukan Utama**: [README.md](../README.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 📋 Daftar Isi

1. [Tujuan & Visi Produk](#1-tujuan--visi-produk)
2. [Masalah yang Diselesaikan](#2-masalah-yang-diselesaikan)
3. [Target Pengguna](#3-target-pengguna)
4. [Teknologi & Dependensi (Tech Stack)](#4-teknologi--dependensi-tech-stack)

---

## 1. Tujuan & Visi Produk

**NihongoRoute** adalah platform pembelajaran Bahasa Jepang mandiri berbasis web yang dirancang **offline-first**. Aplikasi memfasilitasi pengguna untuk mempelajari kosakata, tata bahasa, kanji, kalimat, latihan mendengar, membaca, dan mengikuti simulasi ujian JLPT secara mandiri tanpa jeda meskipun koneksi internet tidak stabil.

---

## 2. Masalah yang Diselesaikan

1. **Kehilangan progres saat offline** — IndexedDB menyimpan seluruh aktivitas belajar secara lokal sebelum disinkronkan ke server.
2. **Latency API** — Data disinkronkan dalam satu batch mutasi kotor (*dirty state*) saat koneksi tersedia, bukan per-request.
3. **Biaya TTS** — MsEdgeTTS digunakan untuk sintesis audio gratis, dikombinasikan dengan caching di Supabase Storage dan fallback Web Speech API di browser.
4. **Anti-cheat XP** — Perolehan XP akhir dihitung dan divalidasi di sisi server (PostgreSQL RPC function), bukan dipercaya dari klien.

---

## 3. Target Pengguna

- Pembelajar mandiri Bahasa Jepang dari level N5 hingga N1.
- Pengguna yang sering belajar dalam kondisi mobilitas tinggi atau koneksi tidak stabil.

---

## 4. Teknologi & Dependensi (Tech Stack)

### Core Framework & Runtime

| Paket | Versi | Peran |
|---|---|---|
| Node.js | 22.x (CI) | Runtime Environment |
| Next.js | `16.2.12` | Framework (App Router, Server Actions, Route Handlers) |
| React | `19.2.8` | Library UI |
| React DOM | `19.2.8` | Rendering DOM |

### Database & Backend Service

| Paket | Versi | Peran |
|---|---|---|
| Supabase | Platform | Database PostgreSQL + Auth + Storage |
| `@supabase/supabase-js` | `^2.104.0` | Client library |
| `@supabase/ssr` | `^0.10.2` | Integrasi SSR Next.js |

- **Ekstensi PostgreSQL aktif**: `uuid-ossp`, `pg_trgm`.
- **Storage Buckets**: `asset`, `exam-assets`, `tts-cache`.

### State Management & Offline-First

| Paket | Versi | Peran |
|---|---|---|
| `zustand` | `^5.0.12` | Global state management (4 stores) |
| `idb-keyval` | `^6.2.2` | Persistensi IndexedDB |
| `@tanstack/react-query` | `^5.100.8` | Server state, mutation, & retry |
| BroadcastChannel | Browser Standard | Sinkronisasi multi-tab (`nihongoroute_sync`) |

### Pengolah Bahasa Jepang

| Paket | Versi | Peran |
|---|---|---|
| `kuroshiro` | `^1.2.0` | Analisis morfologi + furigana |
| `kuroshiro-analyzer-kuromoji` | `^1.1.0` | Analyzer backend (kamus kuromoji) |
| `wanakana` | `^5.3.1` | Konversi kana ↔ romaji |
| `msedge-tts` | `^2.0.5` | Sintesis audio TTS |

### UI & Desain

| Paket | Versi | Peran |
|---|---|---|
| Tailwind CSS | `^4.3.3` | Styling (v4, `@import "tailwindcss"` syntax) |
| `postcss` | `^8.5.22` | PostCSS pipeline |
| `autoprefixer` | `^10.5.4` | Vendor prefix |
| `clsx` | `^2.1.1` | Conditional classnames |
| `tailwind-merge` | `^3.5.0` | Merge Tailwind classes |
| `tailwindcss-animate` | `^1.0.7` | Animasi CSS |
| `class-variance-authority` | `^0.7.1` | Component variants |
| `@iconify/react` | `^6.0.2` | Iconography |
| `framer-motion` | `^12.38.0` | Animasi deklaratif |
| `sonner` | `^2.0.7` | Notifikasi toast |
| `next-themes` | `^0.4.6` | Theme switching (dark/light) |

**Radix UI Primitives**: `react-dialog`, `react-dropdown-menu`, `react-progress`, `react-select`, `react-slot`, `react-switch`.

### Pengujian & Quality Assurance

| Paket | Versi | Peran |
|---|---|---|
| `vitest` | `^4.1.5` | Unit testing framework |
| `@testing-library/react` | `^16.3.2` | React component testing |
| `@playwright/test` | `^1.59.1` | E2E testing framework |
| `eslint` | `^9.16.0` | Code linter |
| `husky` & `lint-staged` | `^9.1.7` / `^16.4.0` | Git pre-commit hooks |
