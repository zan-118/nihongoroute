# Kebijakan Keamanan & Proteksi Data

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
> **Ruang Lingkup**: Kebijakan Secret Handling, Admin API Auth, Webhook Signature, RLS Matrix, & Anti-Cheat XP  
> **Rujukan Utama**: [README.md](../README.md) | [DATA_MODEL.md](DATA_MODEL.md) | [CONFIGURATION.md](CONFIGURATION.md)

---

## 📋 Daftar Isi

1. [Kebijakan Kredensial & Secrets](#1-kebijakan-kredensial--secrets)
2. [Autentikasi Admin API & Timing-Safe Check](#2-autentikasi-admin-api--timing-safe-check)
3. [Verifikasi Webhook Signature (Saweria & Trakteer)](#3-verifikasi-webhook-signature-saweria--trakteer)
4. [Row Level Security (RLS) Matrix 28 Tabel](#4-row-level-security-rls-matrix-28-tabel)
5. [Anti-Cheat XP Engine Guard](#5-anti-cheat-xp-engine-guard)
6. [Pelaporan Kerentanan (Vulnerability Disclosure)](#6-pelaporan-kerentanan-vulnerability-disclosure)

---

## 1. Kebijakan Kredensial & Secrets

### Variabel Publik (`NEXT_PUBLIC_`)
Hanya variabel dengan prefiks `NEXT_PUBLIC_` yang diizinkan untuk diakses di browser:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Variabel Rahasia (Server-Only)
Variabel berikut **DILARANG KERAS** diberi prefiks `NEXT_PUBLIC_` atau diimpor di Client Component:

| Variabel | Peran & Ruang Lingkup |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Akses admin Supabase (Bypass RLS) |
| `ADMIN_API_SECRET` | Autentikasi endpoint rute admin API |
| `GEMINI_API_KEY` | Token Google Generative AI API |
| `SAWERIA_WEBHOOK_SECRET` | HMAC Secret verifikasi webhook Saweria |
| `TRAKTEER_WEBHOOK_SECRET` | Token verifikasi webhook Trakteer |

---

## 2. Autentikasi Admin API & Timing-Safe Check

Validasi admin menggunakan `validateAdminApiRequest()` di `src/lib/core/admin-api-auth.ts`.

- **Header-Only**: Token wajib dikirim melalui header `Authorization: Bearer <secret>` atau `x-admin-api-secret`. Dilarang dikirim melalui query parameter URL.
- **Timing-Safe Comparison**: Perbandingan rahasia **WAJIB** menggunakan `crypto.timingSafeEqual` via fungsi `safeEqual()`. Dilarang menggunakan perbandingan string biasa (`===`) untuk mencegah *side-channel timing attacks*.

---

## 3. Verifikasi Webhook Signature (Saweria & Trakteer)

### Saweria (`/api/webhooks/saweria`)
- **HMAC SHA256**: Menghitung digest dari raw body menggunakan `SAWERIA_WEBHOOK_SECRET`, lalu dibandingkan dengan header `x-saweria-signature` menggunakan `safeEqual()`.

### Trakteer (`/api/webhooks/trakteer`)
- **Token Verification**: Memeriksa token dari header `x-webhook-token` atau `x-trakteer-token` via timing-safe check.

---

## 4. Row Level Security (RLS) Matrix 28 Tabel

Seluruh **28 tabel** PostgreSQL mengaktifkan Row Level Security (RLS).

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE RLS SECURITY MATRIX                   │
├────────────────────────────┬─────────────────────────────────────────────┤
│ Kategori Tabel             │ Kebijakan RLS (Policy)                      │
├────────────────────────────┼─────────────────────────────────────────────┤
│ Pustaka Konten Statis      │ SELECT USING (true) — Publik Read-Only      │
│ Data Ujian & Soal          │ SELECT USING (is_published = true)          │
│ Progres & Profil Pengguna  │ SELECT/INSERT/UPDATE/DELETE (auth.uid() = user_id) │
│ Feedback User              │ INSERT (true), SELECT (owner / admin only)  │
└────────────────────────────┴─────────────────────────────────────────────┘
```

> [!CAUTION]
> Inisiasi `createAdminClient()` (service-role client) HANYA diizinkan di Server Actions dan Route Handlers. Dilarang diimpor ke Client Components.

---

## 5. Anti-Cheat XP Engine Guard

Klien tidak pernah dipercaya menentukan perolehan XP akhir.
- **Validasi Server**: Perhitungan XP final dieksekusi secara terpusat oleh RPC PostgreSQL `sync_user_progress`.
- **Constraint**: Menolak perolehan delta XP negatif (`delta_xp < 0`).
- **Limit**: Batas bonus XP harian kumulatif maksimal **150 XP/hari**.
- **Reconcile**: Klien menerima `accepted_xp` terverifikasi dari RPC dan menyesuaikan state lokal.

---

## 6. Pelaporan Kerentanan (Vulnerability Disclosure)

Jika Anda menemukan celah keamanan pada proyek ini:
- Mohon **JANGAN** membuat publik issue terbuka di GitHub.
- Kirimkan detail laporan kerentanan secara privat ke tim pengembang atau buat laporan via `user_feedback` privat.
