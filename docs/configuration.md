# Konfigurasi Sistem

> Terakhir diperbarui: 24 Juli 2026

---

## 1. Environment Variables

Dikonfigurasi melalui `.env.local` (development) atau panel deployment (production).

### Variabel Klien (`NEXT_PUBLIC_`)

| Variabel | Tipe | Status | Deskripsi |
|----------|------|--------|-----------|
| `NEXT_PUBLIC_SITE_URL` | URL | Wajib | URL dasar website. Digunakan untuk CORS dan metadata SEO. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Wajib | Endpoint Supabase API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT | Wajib | Kunci publik Supabase (anonim). |

### Variabel Server-Only

| Variabel | Tipe | Status | Deskripsi |
|----------|------|--------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | JWT | Wajib | Bypass RLS. Hanya di Server Actions / Route Handlers via `createAdminClient()`. |
| `ADMIN_API_SECRET` | string | Wajib | Token autentikasi rute admin API. |
| `GEMINI_API_KEY` | string | Wajib | Google Generative AI key. |
| `TRAKTEER_WEBHOOK_SECRET` | string | Opsional | Token verifikasi webhook Trakteer. |
| `SAWERIA_WEBHOOK_SECRET` | string | Opsional | Secret HMAC SHA256 verifikasi webhook Saweria. |

---

## 2. File Konfigurasi

### `next.config.ts`

| Fitur | Detail |
|-------|--------|
| `poweredByHeader` | `false` |
| `reactStrictMode` | `true` |
| Security headers | X-DNS-Prefetch-Control, X-Content-Type-Options (`nosniff`), X-Frame-Options (`SAMEORIGIN`), Referrer-Policy (`strict-origin-when-cross-origin`), Permissions-Policy, Cross-Origin-Opener-Policy (`same-origin-allow-popups`), HSTS (production only) |
| Image optimization | Format AVIF/WebP, cache 30 hari, remote patterns: Supabase (`hubqetausiziocdlbdmd.supabase.co`), Cloudinary (`res.cloudinary.com`) |
| `serverExternalPackages` | `kuroshiro`, `kuroshiro-analyzer-kuromoji`, `msedge-tts`, `isomorphic-ws`, `ws` |
| `transpilePackages` | `@react-pdf/renderer` |
| `optimizePackageImports` | Radix UI (6 paket), `@iconify/react`, `framer-motion`, `date-fns`, `sonner`, `wanakana` |
| Bundle analyzer | Aktif jika `ANALYZE=true` via `@next/bundle-analyzer` |
| Redirect | `/learning-hub` → `/dashboard` (permanent) |

### `tailwind.config.js`

Token desain semantik, radius, font-pairing, dan animasi. Menggunakan Tailwind CSS v4 (`@import "tailwindcss"` syntax di `globals.css`).

### `components.json`

Konfigurasi shadcn/ui — penempatan komponen di `src/components/ui/`.

### `tsconfig.json`

Path alias `@/*` → `src/*`, optimasi compiler TypeScript.

### `vitest.config.ts`

Konfigurasi unit test dengan jsdom environment.

### `playwright.config.ts`

Konfigurasi E2E test.

### `eslint.config.mjs`

ESLint flat config dengan `eslint-config-next`.
