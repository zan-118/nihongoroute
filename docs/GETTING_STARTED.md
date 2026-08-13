# Panduan Memulai (Getting Started)

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 13 Agustus 2026  
> **Ruang Lingkup**: Prasyarat, Setup Lingkungan Lokal, Scripts, & Verification  
> **Rujukan Utama**: [README.md](../README.md) | [CONFIGURATION.md](CONFIGURATION.md) | [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📋 Daftar Isi

1. [Prasyarat Sistem](#1-prasyarat-sistem)
2. [Instalasi & Setup Lokal](#2-instalasi--setup-lokal)
3. [Konfigurasi Environment](#3-konfigurasi-environment)
4. [Menjalankan Server Pengembangan](#4-menjalankan-server-pengembangan)
5. [Verifikasi Database & Testing](#5-verifikasi-database--testing)
6. [Daftar Script npm](#6-daftar-script-npm)

---

## 1. Prasyarat Sistem

| Kebutuhan | Versi Minimal | Keterangan |
|---|---|---|
| Node.js | `≥ 20.x` (CI pakai `22.x`) | Runtime JavaScript/TypeScript |
| npm | `≥ 10.x` | Package manager utama |
| Git | `≥ 2.40.x` | VCS & Git hooks (Husky) |
| Supabase CLI | Optional | Diperlukan jika melakukan migrasi database lokal |

---

## 2. Instalasi & Setup Lokal

Kloning repositori dan install seluruh dependensi:

```bash
git clone https://github.com/zan-118/nihongoroute.git
cd nihongoroute
npm install
```

> [!NOTE]
> Perintah `npm install` akan mengaktifkan Git hooks secara otomatis melalui `husky` (script `prepare`).

---

## 3. Konfigurasi Environment

Salin file contoh environment variable:

```bash
cp .env.example .env.local
```

Sesuaikan variabel di `.env.local`:

```env
# Client-Side Variables (Diakses di Browser)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-Only Variables (DILARANG diberi prefiks NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_SECRET=your-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
TRAKTEER_WEBHOOK_SECRET=your-trakteer-secret
SAWERIA_WEBHOOK_SECRET=your-saweria-secret
```

> [!CAUTION]
> Jangan pernah mengimpor atau menggunakan `SUPABASE_SERVICE_ROLE_KEY` atau `ADMIN_API_SECRET` di Client Component untuk mencegah kebocoran kredensial admin.

---

## 4. Menjalankan Server Pengembangan

Jalankan dev server Next.js:

```bash
npm run dev
```

Aplikasi dapat diakses melalui browser di `http://localhost:3000`.

---

## 5. Verifikasi Database & Testing

### Validasi Migrasi SQL
```bash
npm run db:migrations:check
```

### Pengujian Kode & QA

| Perintah | Deskripsi |
|---|---|
| `npm run typecheck` | Validasi tipe TypeScript pada `src/` secara ketat |
| `npm run typecheck:tests` | Validasi tipe TypeScript pada `__tests__/` (via `tsconfig.tests.json`) |
| `npm run lint` | Pengecekan ESLint rule compliance (0 error) |
| `npm run lint:fix` | Perbaikan otomatis error linter |
| `npm run test` | Eksekusi unit test berbasis Vitest |
| `npm run test:watch` | Vitest mode interaktif watch |
| `npm run test:e2e` | Eksekusi E2E testing berbasis Playwright |

---

## 6. Daftar Script npm

### Build Produksi
```bash
npm run build
```

### CLI Generator & Import Data Ujian
```bash
npm run exam:import:validate     # Validasi file import data ujian JLPT
npm run exam:generate:moji-goi   # Generator soal moji-goi JLPT
npm run exam:generate:bunpou     # Generator soal bunpou JLPT
npm run exam:generate:dokkai     # Generator soal dokkai JLPT
npm run exam:generate:choukai    # Generator soal choukai JLPT
```
