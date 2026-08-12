# Panduan Kontribusi NihongoRoute

Terima kasih telah tertarik berkontribusi pada NihongoRoute! Dokumen ini berisi panduan dan standar pengkodean untuk menjaga kualitas dan integritas proyek.

---

## 📋 Daftar Isi

1. [Aturan Dasar](#-aturan-dasar)
2. [Alur Git & Branching](#-alur-git--branching)
3. [Konvensi Commit](#-konvensi-commit)
4. [Standar Pengkodean](#-standar-pengkodean)
5. [Siklus Migrasi SQL](#-siklus-migrasi-sql)
6. [Proses Pull Request (PR)](#-proses-pull-request-pr)

---

## 🚨 Aturan Dasar

- **Offline-First**: Pengalaman pengguna harus tetap berfungsi tanpa koneksi internet. State lokal (Zustand + IndexedDB) diutamakan.
- **Bahasa Antarmuka**: Seluruh UI copy dan pesan error user-facing **WAJIB** Bahasa Indonesia. Kode, variabel, dan komentar tetap Bahasa Inggris/standar teknis.
- **Strict TypeScript**: Dilarang menggunakan `any`. Gunakan definisi tipe domain dari `src/types/`.
- **Rujukan Dokumen**: Sebelum mengubah skema/UI/API, selalu konsultasikan dokumen teknis di folder [`docs/`](docs/README.md).

---

## 🌿 Alur Git & Branching

- `main` — Branch produksi stabil.
- `feat/<nama-fitur>` — Fitur baru.
- `fix/<nama-bug>` — Perbaikan bug.
- `refactor/<nama-perubahan>` — Refactoring tanpa mengubah perilaku bisnis.

---

## 📝 Konvensi Commit

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <deskripsi singkat>
```

**Tipe Commit:**
- `feat`: Fitur baru.
- `fix`: Perbaikan bug.
- `docs`: Pembaruan dokumentasi.
- `style`: Perubahan format kode/styling (tanpa mengubah logika).
- `refactor`: Refactoring kode bisnis.
- `test`: Penambahan atau perbaikan unit test / E2E test.
- `chore`: Tugas pemeliharaan, build, atau dependensi.

---

## 🛠️ Standar Pengkodean

- **Linting & Typecheck**: Pastikan `npm run lint`, `npm run typecheck`, dan `npm run typecheck:tests` (typecheck `__tests__/`) lolos tanpa error.
- **Design System**: Selalu gunakan token dan kelas utility yang sudah ditentukan di [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
- **JSDoc**: Tambahkan JSDoc singkat pada custom hook atau helper function kompleks.

---

## 🗄️ Siklus Migrasi SQL

Jika tugas Anda mengubah skema database Supabase:
1. Buat file migrasi sementara di `supabase/migrations/<timestamp>_<nama>.sql`.
2. Validasi dan terapkan pada database lokal/staging.
3. Setelah dikonfirmasi berhasil, lebur (fold) isi SQL ke skema utama dan bersihkan file sementara.
4. Perbarui [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) & file TypeScript `src/types/database.ts`.

---

## 📬 Proses Pull Request (PR)

1. Pastikan seluruh pengujian lokal (`npm run test`, `npm run typecheck`, & `npm run typecheck:tests`) lulus.
2. Gunakan [Template Pull Request](.github/PULL_REQUEST_TEMPLATE.md) saat membuka PR.
3. Sertakan tangkapan layar (screenshot) jika perubahan berdampak pada tampilan UI.

Detail selengkapnya mengenai kontribusi teknis dapat dibaca di **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)**.
