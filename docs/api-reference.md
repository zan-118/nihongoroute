# Referensi API & Rute Server

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

NihongoRoute menggunakan 9 API Route Handlers aktif yang diimplementasikan di bawah direktori `src/app/api/*` dan `src/app/auth/*`.

## 1. `/api/tts` (Text-to-Speech Audio Stream)

Mengambil atau menyintesis audio pelafalan bahasa Jepang secara dinamis menggunakan MsEdgeTTS dengan caching pada database `tts_cache` dan storage bucket `tts-cache`.

* **Method**: `GET`
* **Autentikasi**: Publik (Tidak memerlukan token)
* **Runtime**: `nodejs` (Dynamic Force)

### Parameter Kueri (Query Parameters):
| Parameter | Tipe Data | Wajib | Default | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `text` | String | Ya | - | Teks bahasa Jepang yang ingin diubah menjadi suara (Maksimal 500 karakter). |
| `voice` | String | Tidak | `zundamon` | Pengenal suara yang dipetakan ke Microsoft Edge Neural Voice (mis. `ja-JP-NanamiNeural` untuk wanita atau `ja-JP-KeitaNeural` untuk pria). |
| `rate` | String | Tidak | `medium` | Kecepatan pelafalan audio. |

### Kode Status & Respons:
* `200 OK`: Mengembalikan stream berkas audio biner dengan header `Content-Type: audio/mpeg`.
* `400 Bad Request`: Parameter `text` kosong atau melebihi 500 karakter.
* `500 Internal Server Error`: Kegagalan sintesis pada Edge TTS service.

---

## 2. `/api/furigana` (Japanese Text to Furigana Annotation)

Mengonversi teks kanji/campuran bahasa Jepang menjadi notasi bacaan hiragana (furigana/HTML ruby structure) menggunakan engine `kuroshiro` dan `kuromoji analyzer`.

* **Method**: `POST`
* **Autentikasi**: Publik (Dibatasi oleh konfigurasi CORS)
* **Content-Type**: `application/json`

### Request Body:
```json
{
  "text": "日本語を勉強します",
  "mode": "furigana",
  "to": "hiragana"
}
```

### Kode Status & Respons:
* `200 OK`:
```json
{
  "result": "<ruby>日本語<rt>にほんご</rt></ruby>u0020...を...<ruby>勉強<rt>べんきょう</rt></ruby>します"
}
```
* `400 Bad Request`: Payload teks kosong.

---

## 3. `/api/cards` (Flashcard Entity Resolver)

Mengambil data kartu kosakata (vocab) dan kanji dalam satu format gabungan yang konsisten berdasarkan daftar ID campuran (UUID, slug, romaji legacy, atau karakter kanji tunggal).

* **Method**: `GET`
* **Autentikasi**: Publik (Via Supabase Server Client)

### Parameter Kueri:
* `ids`: String daftar ID yang dipisahkan tanda koma (mis. `ids=n5-noun-hon,4a8b...-uuid,日`).

### Kode Status & Respons:
* `200 OK`: Mengembalikan array objek kartu terformat `FormattedCard[]`.
* `400 Bad Request`: Parameter `ids` tidak disertakan.

---

## 4. `/api/health` (Health Check & Environment Status)

Menyediakan status kesehatan operasional aplikasi dan memverifikasi kelengkapan variabel lingkungan penting.

* **Method**: `GET` & `HEAD`
* **Autentikasi**: Publik
* **Header Response**: `Cache-Control: no-store`

### Kode Status & Respons:
* `200 OK`: Seluruh variabel lingkungan penting lengkap (`status: "ok"`).
* `503 Service Unavailable`: Terdapat variabel lingkungan wajib yang belum terkonfigurasi (`status: "degraded"`).

*Catatan Keamanan: Di lingkungan produksi (`NODE_ENV === "production"`), endpoint hanya mengembalikan jumlah total variabel yang hilang (`missingRequiredCount`), bukan nama variabelnya, untuk mencegah kebocoran informasi.*

---

## 5. `/api/webhooks/saweria` (Saweria Donation Webhook)

Menerima notifikasi pembayaran donatur dari Saweria, memverifikasi tanda tangan HMAC SHA256, dan menyisipkan data donatur ke tabel `supporters`.

* **Method**: `POST`
* **Autentikasi**: Verifikasi HMAC SHA256 Signature via header `x-saweria-signature` menggunakan `SAWERIA_WEBHOOK_SECRET`.

### Kode Status & Respons:
* `200 OK`: `{ "success": true, "message": "Donator successfully processed and saved" }`
* `401 Unauthorized`: Tanda tangan HMAC tidak valid atau token rahasia salah.
* `400 Bad Request`: Payload transaksi tidak lengkap.

---

## 6. `/api/webhooks/trakteer` (Trakteer Donation Webhook)

Menerima notifikasi dukungan dari platform Trakteer dan mencatat donatur beserta tingkatan lencana (tier) ke database.

* **Method**: `POST`
* **Autentikasi**: Verifikasi token rahasia via header `x-webhook-token`, `x-trakteer-token`, atau payload `key`.

### Kode Status & Respons:
* `200 OK`: `{ "success": true, "message": "Donator successfully processed and saved" }`
* `401 Unauthorized`: Token rahasia Trakteer tidak cocok.

---

## 7. `/api/admin/ai-assistant` (Admin AI Generator & Analysis)

Rute administrasi untuk melakukan generasi konten modul pelajaran via Gemini AI, konversi furigana massal, dan pemindaian database Supabase.

* **Method**: `POST`
* **Autentikasi**: **Wajib Admin API Secret**. Header `Authorization: Bearer <ADMIN_API_SECRET>` atau `x-admin-api-secret`. Divalidasi dengan `validateAdminApiRequest` (Constant-time comparison).

### Detail Aksi (Aksi ditentukan oleh kolom `action` pada JSON input):
1. **`scan-supabase`**: Memindai substrings teks untuk mencari kanji, kosakata, dan tata bahasa Jepang yang cocok di database.
   - Input: `{ "action": "scan-supabase", "text": "teks jepang" }`
2. **`generate-furigana`**: Melakukan konversi teks bahasa Jepang menjadi hiragana per baris secara massal.
   - Input: `{ "action": "generate-furigana", "text": "teks jepang" }`
3. **`generate-lesson`**: Meminta model Gemini AI (`gemini-1.5-flash`) membuat modul pelajaran terstruktur, menyisipkan daftar kosakata, kanji, dan tata bahasa hasil scan database lokal secara otomatis.
   - Input: `{ "action": "generate-lesson", "topic": "topik", "level": "N5" }`

---

## 8. `/api/admin/supabase-search` (Admin Library Search)

Rute pencarian pustaka Supabase (vocab, kanji, grammar) khusus panel admin dan integrasi Sanity Studio.

* **Method**: `GET`
* **Autentikasi**: **Wajib Admin API Secret** (`Authorization: Bearer <ADMIN_API_SECRET>`).
* **Parameter Kueri**:
  - `q`: String kata kunci pencarian.
  - `type`: `vocab` | `kanji` | `grammar` | `all`.

---

## 9. `/auth/callback` (OAuth Callback Handler)

API Route Handler untuk menangani pengalihan masuk (callback) setelah otentikasi melalui pihak ketiga (OAuth) menggunakan Supabase Auth.

* **Method**: `GET`
* **Autentikasi**: Publik (Menggunakan authorization code)

### Parameter Kueri:
* `code`: Kode otentikasi yang dikembalikan oleh provider identitas.
* `next`: Path tujuan pengalihan berikutnya setelah sesi berhasil dibuat (Default: `/dashboard`).

### Kode Status & Respons:
* `302 Found` (Redirect): Mengalihkan pengguna ke alamat halaman `${origin}${next}` (dashboard) setelah sukses bertukar kode menjadi sesi token.
* `302 Found` (Redirect Fallback): Mengalihkan pengguna kembali ke halaman `/login?error=auth-callback-failed` apabila penukaran sesi gagal.
