# Panduan Kontribusi

> Terakhir diperbarui: 24 Juli 2026

---

## 1. Standar Kode

### TypeScript

- **Dilarang** menggunakan tipe `any`. Gunakan tipe domain dari `src/types/database.ts` atau `src/types/library.ts`.
- Hook kustom baru wajib menyertakan JSDoc: input, output, efek samping, stores yang diakses.
- Komentar inline wajib untuk logika yang tidak intuitif.

### CSS & Desain

- Warna wajib lewat token semantik di `src/app/globals.css` (`hsl(var(--primary))`, dll). Dilarang hex/warna Tailwind mentah.
- Sebelum membuat atau mengubah UI, baca `design-system.md`.
- Gunakan class yang sudah ada (lihat tabel konsolidasi di `design-system.md` §5):
  - `.surface-card` — kartu statis
  - `.interactive-card` — kartu dengan hover
  - `.btn-accent-glow` — tombol aksen
  - `.shell-ambient` — background blur
  - `.surface-elevated-ambient` — permukaan elevated
- Radius wajib `var(--radius)`. Dilarang angka arbitrary.

---

## 2. Alur Git

1. Buat branch dari `main`:
   - `feat/nama-fitur`
   - `fix/nama-bug`
2. Tulis kode + unit test di `__tests__/`.
3. Validasi sebelum commit:
   ```bash
   npm run lint
   npm run typecheck
   ```

---

## 3. Siklus Migrasi Database

Jika fitur memerlukan perubahan skema database, ikuti 5 langkah:

1. **Buat file sementara**: `<timestamp>_<nama>.sql` di `supabase/migrations/`. Jangan edit `initial_schema.sql`.
2. **RLS wajib**: Tabel baru harus aktifkan RLS + minimal 1 policy.
3. **Validasi**: `npm run db:migrations:check`.
4. **Konfirmasi produksi**: Terapkan migrasi ke database nyata.
5. **Lebur & hapus**: Setelah sukses, lebur isi ke `20260620130000_initial_schema.sql`, hapus file sementara.

**Kondisi akhir**: Hanya 1 file migrasi di repo (`20260620130000_initial_schema.sql`).

> [!WARNING]
> Pastikan tidak ada perintah destruktif (`DROP TABLE`) yang tidak disengaja ikut terlebur.

---

## 4. Commit Convention

Format **Conventional Commits**:

```
feat(srs): add custom mnemonics to flashcards
fix(tts): handle connection timeout on edge tts synthesis
docs(readme): update deployment instructions
test(gamification): add unit tests for daily xp cap
```
