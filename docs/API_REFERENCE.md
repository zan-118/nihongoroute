# Referensi API & Route Handlers

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 14 Agustus 2026 - P0 auth/security audit lokal selesai  
> **Ruang Lingkup**: Spesifikasi 6 API Route Handlers Active & Server Action Files  
> **Rujukan Utama**: [README.md](../README.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | [SECURITY.md](SECURITY.md)

---

## 📋 Daftar Isi

1. [Rangkuman Endpoint API Route Handlers](#1-rangkuman-endpoint-api-route-handlers)
2. [Spesifikasi 6 API Route Handlers](#2-spesifikasi-6-api-route-handlers)
   - [1. `/api/tts` — Text-to-Speech](#1-apitts--text-to-speech)
   - [2. `/api/cards` — Flashcard Entity Resolver](#2-apicards--flashcard-entity-resolver)
   - [3. `/api/health` — Health Check Operasional](#3-apihealth--health-check-operasional)
   - [4. `/api/webhooks/saweria` — Webhook Donasi Saweria](#4-apiwebhookssaweria--webhook-donasi-saweria)
   - [5. `/api/webhooks/trakteer` — Webhook Donasi Trakteer](#5-apiwebhookstrakteer--webhook-donasi-trakteer)
   - [6. `/auth/callback` — OAuth Callback](#6-authcallback--oauth-callback)
3. [Daftar 19 Server Action Files (`src/actions/*.actions.ts`)](#3-daftar-19-server-action-files-srcactionsactionsts)
4. [Audit Auth & Ownership P0](#4-audit-auth--ownership-p0)

---

## 1. Rangkuman Endpoint API Route Handlers

NihongoRoute memiliki **6 endpoint aktif**: 4 API Route Handlers di `src/app/api/`, 2 webhook handlers, dan 1 auth callback di `src/app/auth/`.

| Path                     | Method   | Auth              | Cache Policy            | Deskripsi                              |
| ------------------------ | -------- | ----------------- | ----------------------- | -------------------------------------- |
| `/api/tts`               | GET      | Publik            | 307 Redirect / Cache-Control | Sintesis pelafalan suara (HTTP 307 Redirect ke Cloudflare R2 CDN) |
| `/api/cards`             | GET      | Publik            | `no-store`              | Resolusi entity ID kartu vocab/kanji   |
| `/api/health`            | GET/HEAD | Publik            | `no-store`              | Monitoring kesehatan server & env vars |
| `/api/webhooks/saweria`  | POST     | Webhook Signature | `no-store`              | Notifikasi donasi Saweria              |
| `/api/webhooks/trakteer` | POST     | Webhook Token     | `no-store`              | Notifikasi donasi Trakteer             |
| `/auth/callback`         | GET      | Auth Code         | Redirect                | Pertukaran OAuth code ke session       |

---

## 2. Spesifikasi 6 API Route Handlers

### 1. `/api/tts` — Text-to-Speech

- **Method**: `GET`
- **Autentikasi**: Publik
- **Runtime**: `nodejs` (`force-dynamic`)
- **Fungsi**: Sintesis audio pelafalan bahasa Jepang via MsEdgeTTS + `tts_cache` + Supabase Storage `tts-cache`.
- **Guard P0**: Batas panjang input `500` karakter dan burst limit `30 request/menit/IP`.

### 2. `/api/cards` — Flashcard Entity Resolver

- **Method**: `GET`
- **Autentikasi**: Publik
- **Fungsi**: Mengambil data kartu vocab & kanji dari ID campuran (UUID, slug, romaji legacy, kanji).

### 3. `/api/health` — Health Check Operasional

- **Method**: `GET`, `HEAD`
- **Cache**: `no-store`
- **Fungsi**: Audit kesehatan server & verifikasi keberadaan env vars (wajib & fitur).

### 4. `/api/webhooks/saweria` — Webhook Donasi Saweria

- **Method**: `POST`
- **Autentikasi**: HMAC SHA256 signature via header `x-saweria-signature`
- **Fungsi**: Menerima notifikasi donasi Saweria & menyimpan donatur ke `supporters`.

### 5. `/api/webhooks/trakteer` — Webhook Donasi Trakteer

- **Method**: `POST`
- **Autentikasi**: Token via `x-webhook-token`
- **Fungsi**: Menerima notifikasi donasi Trakteer & menyimpan donatur ke `supporters`.

### 6. `/auth/callback` — OAuth Callback

- **Method**: `GET`
- **Fungsi**: OAuth exchange code dari provider Supabase Auth ke session token.

---

## 3. Daftar 19 Server Action Files (`src/actions/*.actions.ts`)

Seluruh Server Action tersimpan di `src/actions/` dan bertindak sebagai layer tipis validasi sebelum memanggil domain services:

| No  | File Action                    | Ruang Lingkup Domain                                                                                                                                     |
| :-: | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | `vocab.actions.ts`             | Query & penyaringan data kosakata pustaka                                                                                                                |
| 02  | `kanji.actions.ts`             | Query & penyaringan data kanji & radikal                                                                                                                 |
| 03  | `grammar.actions.ts`           | Query & detail tata bahasa Jepang                                                                                                                        |
| 04  | `lessons.actions.ts`           | Hydration modul pelajaran & fallback artikel                                                                                                             |
| 05  | `listening.actions.ts`         | Data wacana & kuis listening                                                                                                                             |
| 06  | `reading.actions.ts`           | Data wacana & kuis reading                                                                                                                               |
| 07  | `cheatsheets.actions.ts`       | Lembar rangkuman & cheatsheet                                                                                                                            |
| 08  | `sentences.actions.ts`         | Pencarian contoh kalimat terjemahan                                                                                                                      |
| 09  | `expressions.actions.ts`       | Query ungkapan & frasa harian                                                                                                                            |
| 10  | `dictionary.actions.ts`        | Pencarian terpadu kamus (multi-category search) + `lookupDictionaryWordAction` (lookup detail kata per entri, dipakai `DictionaryPopup` & `WordPopover`) |
| 11  | `flashcard.actions.ts`         | Resolusi kartu flashcard & custom mnemonics                                                                                                              |
| 12  | `exams.actions.ts`             | Eksekusi & evaluasi sesi ujian JLPT                                                                                                                      |
| 13  | `jlpt-exams.actions.ts`        | Catalog & template ujian JLPT                                                                                                                            |
| 14  | `community.actions.ts`         | Forum komunitas: post, comment, & like                                                                                                                   |
| 15  | `support.actions.ts`           | Laporan feedback pengguna                                                                                                                                |
| 16  | `tools-integration.actions.ts` | Data integrasi tools (drill, shadowing, counter)                                                                                                         |
| 17  | `library.actions.ts`           | Pengambilan data agregat pustaka                                                                                                                         |
| 18  | `library-counts.actions.ts`    | Perhitungan jumlah item pustaka                                                                                                                          |
| 19  | `contact.actions.ts`           | Pengiriman pesan kontak (notifikasi via webhook/email admin)                                                                                             |

---

## 4. Audit Auth & Ownership P0

| Surface                       | Auth                       | Mutasi | Ownership / Guard                                                                                | Status |
| ----------------------------- | -------------------------- | -----: | ------------------------------------------------------------------------------------------------ | ------ |
| `/api/tts`                    | Publik                     |  Tidak | Batas panjang input `MAX_TTS_TEXT_LENGTH`; cache TTS via server; burst limit 30 request/menit/IP | OK     |
| `/api/cards`                  | Publik                     |  Tidak | Validasi `ids` via Zod; konten read-only melalui RLS publik                                      | OK     |
| `/api/health`                 | Publik                     |  Tidak | Detail env disembunyikan di production                                                           | OK     |
| `/api/webhooks/saweria`       | HMAC `x-saweria-signature` |     Ya | Raw-body signature, Zod payload, replay window, duplicate event guard                            | OK     |
| `/api/webhooks/trakteer`      | Token header timing-safe   |     Ya | Zod payload, replay window, duplicate event guard                                                | OK     |
| `/api/indexnow`               | Token `ADMIN_API_SECRET`   |  Tidak | Validasi token admin timing-safe; pemicu submission real-time IndexNow ke Bing & search engines  | OK     |
| `/auth/callback`              | OAuth code                 |     Ya | `exchangeCodeForSession`; redirect gagal ke login                                                | OK     |
| `community.actions.ts` mutasi | `auth.getUser()`           |     Ya | Insert pakai `user.id`; delete/update notif difilter `user_id`; admin client hanya setelah auth  | OK     |
| `flashcard.actions.ts`        | Session refresh            |  Tidak | Read-only library data                                                                           | OK     |
| `support.actions.ts`          | Publik                     |  Tidak | Read-only supporters; service role dipakai server-only                                           | OK     |

Regression test P0:

- Webhook Saweria tanpa signature wajib `401`.
- Webhook Trakteer dengan token salah wajib `401`.
- Mutasi community tanpa user wajib ditolak sebelum akses database/admin client.
- TTS burst request ke IP sama wajib `429` setelah limit.
