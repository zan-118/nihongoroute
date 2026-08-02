# Konfigurasi Sistem & Environment

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
> **Ruang Lingkup**: Environment Variables Matrix (Public vs Server-Only) & Files System Config  
> **Rujukan Utama**: [README.md](../README.md) | [SECURITY.md](SECURITY.md) | [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 📋 Daftar Isi

1. [Matrix Environment Variables](#1-matrix-environment-variables)
   - [Variabel Publik (Client-Side)](#variabel-publik-client-side)
   - [Variabel Rahasia (Server-Only)](#variabel-rahasia-server-only)
2. [Spesifikasi File Konfigurasi Proyek](#2-spesifikasi-file-konfigurasi-proyek)

---

## 1. Matrix Environment Variables

Variabel dikonfigurasi melalui file `.env.local` (development) atau environment settings di Vercel/Hosting (production).

> [!CAUTION]
> DILARANG menambahkan prefiks `NEXT_PUBLIC_` pada variabel yang menyimpan rahasia server (misal service role keys, admin secret, API keys pihak ketiga).

### Variabel Publik (Client-Side)

| Variabel | Tipe | Status | Deskripsi |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL | Wajib | URL dasar website. Digunakan untuk CORS dan metadata SEO. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Wajib | Endpoint Supabase API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT | Wajib | Kunci publik Supabase (anonim). |

### Variabel Rahasia (Server-Only)

| Variabel | Tipe | Status | Deskripsi |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | JWT | Wajib | Bypass RLS. Hanya di Server Actions / Route Handlers via `createAdminClient()`. |
| `ADMIN_API_SECRET` | string | Wajib | Token autentikasi rute admin API. |
| `GEMINI_API_KEY` | string | Wajib | Google Generative AI key. |
| `TRAKTEER_WEBHOOK_SECRET` | string | Opsional | Token verifikasi webhook Trakteer. |
| `SAWERIA_WEBHOOK_SECRET` | string | Opsional | Secret HMAC SHA256 verifikasi webhook Saweria. |

---

## 2. Spesifikasi File Konfigurasi Proyek

### `next.config.ts`
- **Security Headers**: HSTS, X-Content-Type-Options (`nosniff`), X-Frame-Options (`SAMEORIGIN`), Referrer-Policy (`strict-origin-when-cross-origin`).
- **Image Optimization**: AVIF/WebP enabled, Supabase & Cloudinary remote patterns.
- **External Packages**: `kuroshiro`, `kuroshiro-analyzer-kuromoji`, `msedge-tts`.

### `tailwind.config.js`
- Konfigurasi token warna, radius, dan animasi CSS (Tailwind v4 syntax).

### `tsconfig.json`
- Compiler options, strict mode, & path alias (`@/*` → `./src/*`).
