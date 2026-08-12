# Panduan Kontribusi Teknis (Technical Contributing Guide)

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 12 Agustus 2026  
> **Ruang Lingkup**: Standar TypeScript, CSS & Token UI, Git Workflow, Siklus Migrasi SQL, & Commit Convention  
> **Rujukan Utama**: [README.md](../README.md) | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | [DATA_MODEL.md](DATA_MODEL.md)

---

## 📋 Daftar Isi

1. [Standar Pengkodean](#1-standar-pengkodean)
   - [TypeScript Rules](#typescript-rules)
   - [CSS & Design Tokens](#css--design-tokens)
2. [Alur Kerja Git (Git Workflow)](#2-alur-kerja-git-git-workflow)
3. [Siklus Hidup Migrasi Database (5 Tahap)](#3-siklus-hidup-migrasi-database-5-tahap)
4. [Konvensi Commit (Conventional Commits)](#4-konvensi-commit-conventional-commits)

---

## 1. Standar Pengkodean

### TypeScript Rules
- **Dilarang keras** menggunakan tipe `any`. Gunakan tipe domain dari `src/types/database.ts` atau `src/types/library.ts`.
- Minimalkan `as unknown as`; hanya diperbolehkan di boundary library (Supabase `Json`, react-pdf, PortableText, window APIs).
- Hook kustom baru wajib menyertakan JSDoc: `@param`, `@returns`, side-effects, dan stores yang diakses.
- Komentar inline wajib untuk menjelaskan bagian logika kompleks.
- **Data fetching**: komponen client tidak boleh query Supabase langsung — wajib melalui Server Actions di `src/actions/*.actions.ts`.
- **Komponen besar**: file komponen > 600 baris sebaiknya dipecah (logika murni → modul `.ts` yang di-test; view → komponen terpisah; barrel agar API publik tidak berubah).

### CSS & Design Tokens
- Warna **WAJIB** melalui token semantik di `src/app/globals.css` (`hsl(var(--primary))`). Dilarang memakai hex/warna mentah.
- Sebelum mengubah UI, konsultasikan [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- Class penolong yang sudah ada:
  - `.surface-card` — Card statis tanpa hover
  - `.interactive-card` — Card interaktif dengan hover
  - `.btn-accent-glow` — Tombol aksen utama

---

## 2. Alur Kerja Git (Git Workflow)

1. Buat branch dari `main`: `feat/nama-fitur` atau `fix/nama-bug`.
2. Tulis kode + unit test di `__tests__/`.
3. Jalankan pengujian wajib sebelum commit (sama dengan quality gates CI):
   ```bash
   npm run lint
   npm run typecheck
   npm run typecheck:tests
   npm run test
   ```

---

## 3. Siklus Hidup Migrasi Database (5 Tahap)

Jika perubahan memerlukan penyesuaian skema database Supabase, ikuti 5 tahap ini secara urut:

1. **Buat File Sementara**: Tulis SQL di `supabase/migrations/<timestamp>_<nama>.sql`.
2. **RLS Wajib**: Setiap tabel baru **WAJIB** mengaktifkan RLS + minimal 1 policy.
3. **Validasi**: Jalankan `npm run db:migrations:check`.
4. **Konfirmasi Produksi**: Terapkan migrasi ke database nyata/staging.
5. **Lebur & Hapus**: Lebur isi SQL ke file skema konsolidasi utama (`initial_schema.sql`), lalu hapus file sementara.

---

## 4. Konvensi Commit (Conventional Commits)

Format:
```text
feat(srs): add custom mnemonics to flashcards
fix(tts): handle connection timeout on edge tts synthesis
docs(readme): update deployment instructions
test(gamification): add unit tests for daily xp cap
```
