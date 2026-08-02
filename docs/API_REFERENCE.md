# Referensi API & Rute Server

> Terakhir diperbarui: 31 Juli 2026

---

NihongoRoute memiliki **7 endpoint aktif**: 5 API Route Handlers di `src/app/api/`, 2 webhook handlers, dan 1 auth callback di `src/app/auth/`.

---

## 1. `/api/tts` — Text-to-Speech

Mengambil atau menyintesis audio pelafalan bahasa Jepang menggunakan MsEdgeTTS dengan caching di tabel `tts_cache` dan storage bucket `tts-cache`.

- **Method**: `GET`
- **Autentikasi**: Publik
- **Runtime**: `nodejs` (`force-dynamic`)

### Parameter Kueri

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `text` | string | Ya | — | Teks Jepang (maks 500 karakter) |
| `voice` | string | Tidak | `zundamon` | Voice identifier (dipetakan via `SPEAKER_MAP` ke Edge Neural Voice) |
| `rate` | string | Tidak | `medium` | Kecepatan pelafalan |

### Respons

| Status | Deskripsi |
|--------|-----------|
| `200` | `audio/mpeg` — Cache hit: `Cache-Control: public, max-age=604800, immutable`. Cache miss: `Cache-Control: no-store` |
| `400` | Parameter `text` kosong atau melebihi 500 karakter |
| `500` | Gagal sintesis Edge TTS (timeout 10 detik) |

---

## 2. `/api/furigana` — Konversi Furigana

Mengonversi teks kanji/campuran Jepang menjadi bacaan hiragana menggunakan Kuroshiro + Kuromoji analyzer.

- **Method**: `POST`
- **Autentikasi**: Publik (dibatasi CORS)
- **Content-Type**: `application/json`

### Request Body

```json
{
  "text": "日本語を勉強します",
  "mode": "furigana"
}
```

| Field | Tipe | Wajib | Default | Deskripsi |
|-------|------|-------|---------|-----------|
| `text` | string | Ya | — | Teks Jepang yang akan dikonversi |
| `mode` | string | Tidak | `normal` | Mode konversi: `normal`, `furigana`, `okurigana`, `roma` |

### Respons

| Status | Body |
|--------|------|
| `200` | `{ "hiragana": "<ruby>日本語<rt>にほんご</rt></ruby>..." }` |
| `500` | `{ "error": "Gagal mengonversi teks ke Hiragana", "details": "..." }` |

Jika `text` kosong, endpoint mengembalikan `{ "hiragana": "" }` dengan status 200.

---

## 3. `/api/cards` — Flashcard Entity Resolver

Mengambil data kartu vocab dan kanji berdasarkan daftar ID campuran (UUID, slug, romaji legacy, atau karakter kanji tunggal).

- **Method**: `GET`
- **Autentikasi**: Publik (via Supabase server client)

### Parameter Kueri

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `ids` | string | Ya | Daftar ID dipisah koma. Contoh: `ids=n5-noun-hon,4a8b...,日` |

### Resolusi ID

| Pola | Tipe |
|------|------|
| UUID v4 | Query by `id` |
| `n5-*` / `n4-*` | Legacy romaji ID — strip prefix, cari di `vocab.romaji` |
| 1 karakter | Karakter kanji — cari di `kanji.character` |
| Lainnya | Slug — cari di `vocab.slug` |

### Respons

| Status | Body |
|--------|------|
| `200` | `FormattedCard[]` — Array kartu terformat |
| `400` | Parameter `ids` tidak disertakan |
| `500` | Gagal query database |

---

## 4. `/api/health` — Health Check

Menyediakan status kesehatan operasional dan verifikasi environment variables.

- **Method**: `GET`, `HEAD`
- **Autentikasi**: Publik
- **Cache**: `no-store`

### Environment Variables yang Diperiksa

| Kategori | Variables |
|----------|-----------|
| **Wajib** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` |
| **Fitur** | `ADMIN_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` |

### Respons

| Status | Kondisi |
|--------|---------|
| `200` | Semua variabel wajib lengkap (`status: "ok"`) |
| `503` | Ada variabel wajib yang hilang (`status: "degraded"`) |

Di production, hanya `missingRequiredCount` dan `missingFeatureCount` yang dikembalikan — nama variabel disembunyikan untuk mencegah kebocoran informasi.

---

## 5. `/api/webhooks/saweria` — Webhook Donasi Saweria

Menerima notifikasi pembayaran dari Saweria dan menyimpan data donatur ke tabel `supporters`.

- **Method**: `POST`
- **Autentikasi**: HMAC SHA256 signature via header `x-saweria-signature`, atau secret via URL query/body `secret`

### Tier Lencana

| Jumlah | Tier |
|--------|------|
| ≥ 100.000 | Gold |
| ≥ 50.000 | Silver |
| < 50.000 | Bronze |

### Respons

| Status | Deskripsi |
|--------|-----------|
| `200` | `{ "success": true, "message": "Donator successfully processed and saved" }` |
| `401` | Signature/secret tidak valid |
| `400` | Payload transaksi tidak lengkap |

---

## 6. `/api/webhooks/trakteer` — Webhook Donasi Trakteer

Menerima notifikasi dukungan dari Trakteer.

- **Method**: `POST`
- **Autentikasi**: Token via header `x-webhook-token`, `x-trakteer-token`, atau body `key`

### Respons

| Status | Deskripsi |
|--------|-----------|
| `200` | `{ "success": true, "message": "Donator successfully processed and saved" }` |
| `401` | Token webhook tidak cocok |

Jika `transaction_id` mengandung "test" atau `net_amount ≤ 0`, endpoint mengembalikan sukses tanpa menyimpan ke database (ping test).
---

## 7. `/auth/callback` — OAuth Callback

Menangani callback setelah otentikasi OAuth via Supabase Auth.

- **Method**: `GET`
- **Autentikasi**: Publik (menggunakan authorization code)

### Parameter Kueri

| Parameter | Tipe | Wajib | Default | Deskripsi |
|-----------|------|-------|---------|-----------|
| `code` | string | Ya | — | Authorization code dari provider |
| `next` | string | Tidak | `/dashboard` | Path tujuan setelah login berhasil |

### Respons

| Status | Kondisi |
|--------|---------|
| `302` (redirect) | Sukses → `${origin}${next}` |
| `302` (redirect) | Gagal → `/login?error=auth-callback-failed` |
