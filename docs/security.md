# Keamanan

> Terakhir diperbarui: 31 Juli 2026

---

## 1. Kebijakan Kredensial

### Variabel Klien (Prefiks `NEXT_PUBLIC_`)

Hanya variabel dengan prefiks `NEXT_PUBLIC_` yang boleh diakses dari kode browser:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Variabel Server-Only

Variabel berikut **dilarang keras** diberi prefiks `NEXT_PUBLIC_` atau diimpor di Client Component:

| Variabel | Peran |
|----------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Akses admin Supabase (bypass RLS) |
| `ADMIN_API_SECRET` | Autentikasi rute admin API |
| `GEMINI_API_KEY` | Google Generative AI |
| `SAWERIA_WEBHOOK_SECRET` | Verifikasi webhook Saweria |
| `TRAKTEER_WEBHOOK_SECRET` | Verifikasi webhook Trakteer |

---

## 2. Autentikasi Admin API

Validasi admin menggunakan `validateAdminApiRequest()` di `src/lib/core/admin-api-auth.ts`.

### Protokol

1. **Header-only**: Token dikirim via `Authorization: Bearer <secret>` atau `x-admin-api-secret`.
2. **Dilarang via URL query**: Token tidak boleh dikirim via parameter URL.
3. **Timing-safe comparison**: Token divalidasi menggunakan `crypto.timingSafeEqual` melalui fungsi `safeEqual()` untuk mencegah timing attacks.

---

## 3. Verifikasi Webhook Donasi

Webhook donasi memverifikasi keaslian pengirim menggunakan `safeEqual()` (timing-safe comparison).

### Saweria (`/api/webhooks/saweria`)

- **Mekanisme primer**: HMAC SHA256 — menghitung hash dari raw body dengan `SAWERIA_WEBHOOK_SECRET`, dibandingkan dengan header `x-saweria-signature` menggunakan perbandingan timing-safe.
- **Mekanisme fallback**: Jika header signature tidak ada, memeriksa `secret` dari URL query atau body payload dengan timing-safe.

### Trakteer (`/api/webhooks/trakteer`)

- **Mekanisme**: Token diperiksa dari header `x-webhook-token`, `x-trakteer-token`, atau body `key`, dan diverifikasi menggunakan timing-safe comparison.

---

## 4. Row Level Security (RLS)

Seluruh **28 tabel** database PostgreSQL mengaktifkan RLS. Kebijakan per kategori:

### Data Publik (SELECT `USING (true)`)

Tabel library yang bisa dibaca siapa saja: `vocab`, `kanji`, `grammar`, `lessons`, `articles`, `listening`, `reading`, `cheatsheets`, `course_categories`, `expressions`, `radicals`, `sentences`, `supporters`, `tts_cache`, `community_posts`, `community_comments`.

### Data Publik Terbatas (SELECT `USING (is_published = true)`)

Tabel ujian yang hanya bisa dibaca jika `is_published = true`: `jlpt_exam_templates`, `jlpt_passages`, `jlpt_questions`.

`jlpt_exam_template_questions` menggunakan policy JOIN yang memeriksa `is_published` pada template dan question.

### Data Pribadi (SELECT/INSERT/UPDATE/DELETE `USING (auth.uid() = user_id)`)

Tabel yang datanya hanya bisa diakses oleh pemilik:

| Tabel | Operasi |
|-------|---------|
| `profiles` | SELECT (public + own), INSERT/UPDATE (own only) |
| `user_srs` | SELECT, INSERT, UPDATE, DELETE (own only) |
| `user_lessons` | ALL (own only) |
| `user_exam_sessions` | SELECT, INSERT, UPDATE (own only) |
| `user_exam_answers` | SELECT, INSERT, UPDATE (own only, via session JOIN) |
| `notifications` | SELECT, UPDATE, DELETE (own only) |

### Khusus

- `user_feedback`: INSERT terbuka (`true`), SELECT hanya pemilik (`auth.uid() = user_id`), admin SELECT terpisah (`false` — hanya service role).

### Service-Role Boundary

`createAdminClient()` (bypass RLS) hanya boleh digunakan di Server Actions dan Route Handlers. Dilarang diimpor ke Client Component.

---

## 5. Anti-Cheat XP Guard

Klien tidak dipercaya menentukan nilai akhir XP.

- Nilai XP final dihitung oleh RPC `sync_user_progress` di PostgreSQL.
- RPC menolak penurunan XP (`delta_xp < 0`).
- Bonus XP harian dibatasi maksimal **150 XP per hari**.
- Klien menerima `accepted_xp` dari RPC dan memperbarui store lokal sesuai nilai ini.
