# Panduan Memulai

> Terakhir diperbarui: 24 Juli 2026

---

## 1. Prasyarat

| Kebutuhan | Versi |
|-----------|-------|
| Node.js | 20.x atau lebih baru (CI menggunakan 22) |
| npm | ≥ 10.x |
| Git | Untuk manajemen repo dan git hooks |
| Supabase CLI | Opsional, untuk migrasi lokal |

---

## 2. Instalasi

### Kloning & Instalasi Dependensi

```bash
git clone <URL_REPOSITORI>
cd nihongoroute
npm install
```

Instalasi mengaktifkan git hooks otomatis via `husky` (script `prepare`).

### Konfigurasi Environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
# Klien (aman di browser)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (DILARANG berprefiks NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_SECRET=your-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
TRAKTEER_WEBHOOK_SECRET=your-trakteer-secret
SAWERIA_WEBHOOK_SECRET=your-saweria-secret
```

---

## 3. Menjalankan Server

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## 4. Validasi Database

```bash
npm run db:migrations:check
```

Memverifikasi konsistensi file skema di `supabase/migrations/20260620130000_initial_schema.sql`.

---

## 5. Pengujian

| Perintah | Deskripsi |
|----------|-----------|
| `npm run typecheck` | Validasi tipe TypeScript |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E tests |

---

## 6. Build Produksi

```bash
npm run build
```

---

## 7. Scripts Tambahan

| Perintah | Deskripsi |
|----------|-----------|
| `npm run exam:import:validate` | Validasi import data ujian JLPT |
| `npm run exam:generate:moji-goi` | Generate soal moji-goi JLPT |
| `npm run exam:generate:bunpou` | Generate soal bunpou JLPT |
| `npm run exam:generate:dokkai` | Generate soal dokkai JLPT |
| `npm run exam:generate:choukai` | Generate soal choukai JLPT |
