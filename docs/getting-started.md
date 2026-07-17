# Panduan Memulai (Getting Started)

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

## 1. Prasyarat Sistem

Sebelum menjalankan proyek NihongoRoute secara lokal, pastikan perangkat pengembang Anda telah memenuhi spesifikasi berikut:

* **Node.js**: Versi `20.x` atau lebih baru (direkomendasikan Node.js 20 LTS atau 22).
* **NPM**: Package manager bawaan Node.js (`npm >= 10.x`).
* **Supabase CLI** (Opsional untuk migrasi lokal): `supabase >= 1.x`.
* **Git**: Untuk manajemen repositori dan git hooks.

---

## 2. Langkah Instalasi & Setup Lokal

Ikuti urutan langkah-langkah di bawah ini untuk menginstal dan mengonfigurasi proyek dari awal:

### Langkah 1: Kloning Repositori & Masuk Direktori
```bash
git clone <URL_REPOSITORI_ANDA>
cd nihongoroute
```

### Langkah 2: Instalasi Seluruh Dependensi
Instal seluruh library dependensi yang tertera pada `package.json`:
```bash
npm install
```
*Catatan: Instalasi ini akan mengaktifkan Git Hooks secara otomatis melalui `husky` pada fase `prepare`.*

### Langkah 3: Konfigurasi Environment Variables
Salin template konfigurasi `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi nilainya dengan kredensial proyek lokal atau staging Anda:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
ADMIN_API_SECRET=your-long-random-secret

GEMINI_API_KEY=your-gemini-api-key
TRAKTEER_WEBHOOK_SECRET=your-trakteer-secret
SAWERIA_WEBHOOK_SECRET=your-saweria-secret
```

---

## 3. Menjalankan Server Pengembangan

Jalankan Next.js development server:
```bash
npm run dev
```

Buka browser dan navigasikan ke: `http://localhost:3000`.

---

## 4. Validasi Migrasi Database

Untuk memastikan skema database PostgreSQL Anda valid dan tidak memiliki berkas migrasi sementara yang tercecer:

```bash
npm run db:migrations:check
```

Perintah ini akan mengeksekusi skrip `scripts/check-migrations.mjs` untuk memverifikasi kesesuaian berkas konsolidasi skema di `supabase/migrations/20260620130000_initial_schema.sql`.

---

## 5. Pengujian & Quality Assurance

NihongoRoute dilengkapi suite pengujian otomatis untuk memverifikasi logika bisnis dan fungsionalitas UI:

### A. Typecheck (TypeScript)
Memeriksa validitas tipe data tanpa menghasilkan berkas build:
```bash
npm run typecheck
```

### B. Linter (ESLint)
Memeriksa standar kode dan keamanan:
```bash
npm run lint
```
Atau gunakan auto-fix jika memungkinkan:
```bash
npm run lint:fix
```

### C. Unit Testing (Vitest)
Menjalankan seluruh pengujian unit logika bisnis (SRS, leveling XP, parsing ujian):
```bash
npm run test
```
Untuk mode watch interaktif selama pengembangan:
```bash
npm run test:watch
```

### D. End-to-End Testing (Playwright)
Menjalankan simulasi peramban penuh untuk menguji alur pengguna:
```bash
npm run test:e2e
```

---

## 6. Build Produksi

Untuk memverifikasi kesiapan bundle produksi sebelum deployment:
```bash
npm run build
```
Hasil build akan dikompilasi ke dalam mode `standalone` sesuai konfigurasi pada `next.config.ts`.
