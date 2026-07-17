# Deployment & Operasional

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

## 1. Kompilasi & Build Standalone

NihongoRoute dikonfigurasi menggunakan fitur **Next.js Standalone Output** (`output: "standalone"` pada `next.config.ts`).

> [!NOTE]
> **TODO: perlu verifikasi** — Kode sumber mengonfigurasi build `standalone` yang kompatibel dengan Docker/Node VPS, dan menyertakan dependensi `@vercel/analytics` serta `@vercel/speed-insights`. Namun, berkas konfigurasi spesifik seperti `Dockerfile` atau file konfigurasi cloud hosting belum disertakan di repositori.

---

## 2. CI/CD Pipeline (GitHub Actions)

Otomatisasi pengujian dan quality gate telah dikonfigurasi melalui GitHub Actions workflow pada berkas `.github/workflows/quality.yml`.

### Tahapan Pipeline "Quality Gate":
1. **Job `app` (App Quality)**:
   - Menjalankan `npm run typecheck` (TypeScript validation).
   - Menjalankan `npm run lint` (ESLint Next.js validation).
   - Menjalankan `npm run test:unit` (Vitest unit test suite).
   - Menjalankan `npm run build` (Next.js production compilation).
2. **Job `database` (Database Guard)**:
   - Menjalankan `npm run db:migrations:check` untuk memvalidasi konsistensi berkas skema.
   - Mengonfigurasi Supabase CLI untuk pengujian database.

---

## 3. Release Gate Checklist (Lokal & Staging)

Sebelum mempromosikan kode ke produksi, jalankan checklist lokal:

```bash
# 1. Verifikasi Validitas Tipe Data TypeScript
npm run typecheck

# 2. Verifikasi Standar Kualitas & Keamanan Kode
npm run lint

# 3. Jalankan Seluruh Unit Test Fungsional Bisnis
npm run test:unit

# 4. Verifikasi Konsolidasi Migrasi Database
npm run db:migrations:check

# 5. Uji Coba Build Kompilasi Produksi
npm run build
```

---

## 4. Revalidasi Jalur & Cache Strategy

NihongoRoute tidak menerapkan strategi revalidasi berbasis waktu (*time-based revalidation*) seperti `export const revalidate = 3600;` karena bertentangan dengan kebijakan sinkronisasi data progres instan.

### Aturan Revalidasi Konten:
1. **Revalidasi Manual**: Lakukan pembaruan cache rute klien secara instan setelah mutasi data di database menggunakan helper Next.js `revalidatePath` atau `revalidateTag` langsung pada Server Actions.
2. **Dynamic Query Cache**: Pengambilan konten dinamis atau konten yang dipengaruhi CMS (seperti Sanity) wajib menggunakan opsi fetch `{ cache: "no-store" }` atau memanfaatkan API Route Handlers non-cached untuk memastikan data teraktual disajikan saat pengguna beralih status ke online.
3. **TTS Caching**: Data suara statis hasil generate dynamic synthesized Edge TTS di-cache selamanya di storage bucket `tts-cache` Supabase. Rute `/api/tts` mengembalikan header caching permanen (`Cache-Control: public, max-age=604800, immutable`) apabila audio ditemukan di database cache.
