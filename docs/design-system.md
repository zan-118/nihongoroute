# Design System — NihongoRoute

Dokumen ini adalah sumber kebenaran untuk semua keputusan visual di project ini. Kalau ada UI baru yang mau dibuat dan tidak tercakup di sini, tambahkan definisinya ke dokumen ini dulu (atau tanya user), jangan improvisasi diam-diam di komponen.

Sumber: `src/app/globals.css`.

## 1. Prinsip Utama

1. Semua warna WAJIB lewat token semantik (`--primary`, `--card`, `--border`, dst via `hsl(var(--x))`), tidak ada hex/warna Tailwind mentah baru di komponen.
2. Satu efek dekoratif dipakai di satu tempat dengan alasan jelas. Dilarang menumpuk lebih dari satu layer glow/glass/gradient di elemen yang bersarang (lihat Anti-Pattern #2).
3. Radius WAJIB mengikuti token `--radius` (0.875rem) kecuali ada alasan eksplisit terdokumentasi di sini untuk pengecualian.
4. Setiap keputusan visual harus bisa dijawab "kenapa", bukan "karena itu default". Estetika "cyber/neon/premium" TIDAK relevan dengan brand ini (belajar Bahasa Jepang mandiri, tenang, terarah) — jangan tambah kelas baru dengan nuansa itu.

## 2. Token Warna (Semantik)

### Light mode (`:root`)

| Token                              | Nilai HSL                   | Peran                                    |
| ---------------------------------- | --------------------------- | ---------------------------------------- |
| `--background`                     | `220 10% 96%`               | Background halaman                       |
| `--foreground`                     | `220 15% 10%`               | Teks utama                               |
| `--card`                           | `0 0% 100%`                 | Permukaan card/popover                   |
| `--primary`                        | `187 100% 36%` (Cyan)       | Aksi utama, identitas brand              |
| `--secondary`                      | `343 100% 41%` (Crimson)    | Aksen pendukung/status                   |
| `--muted`                          | `220 10% 91%`               | Permukaan pasif, background sekunder     |
| `--muted-foreground`               | `220 10% 40%`               | Teks sekunder/meta                       |
| `--accent`                         | `187 100% 94%`              | Highlight lembut (background badge, dsb) |
| `--destructive`                    | `0 84% 60%`                 | Error/hapus                              |
| `--success`                        | `160 84% 36%`               | Konfirmasi/berhasil                      |
| `--warning`                        | `38 92% 50%`                | Peringatan                               |
| `--border`                         | `220 10% 86%`               | Semua border/divider                     |
| `--sidebar`                        | `220 10% 94%`               | Background sidebar khusus                |
| `--surface` / `--surface-elevated` | `0 0% 100%` / `220 10% 98%` | Lapisan permukaan bertingkat             |

### Dark mode (`.dark`)

| Token                                                        | Nilai HSL                             | Peran                                                                 |
| ------------------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------- |
| `--background`                                               | `218 12% 8%` (Charcoal #121417)       | Background halaman                                                    |
| `--foreground`                                               | `45 10% 93%`                          | Teks utama                                                            |
| `--primary`                                                  | `184 100% 50%` (Neon Cyan #00eeff)    | Aksi utama                                                            |
| `--secondary`                                                | `342 100% 50%` (Neon Crimson #ff014f) | Aksen pendukung                                                       |
| `--muted`, `--muted-foreground`, `--accent`, `--border`, dst | —                                     | Sama perannya dengan light mode, nilai disesuaikan untuk kontras dark |

### Brand gradient tokens (`--brand-*-rgb`)

Sistem warna utama menggunakan 2 warna: Cyan & Crimson. Token `--brand-violet-rgb` sebelumnya bernilai sama dengan `--brand-blue-rgb` (Crimson) dan telah dihapus sepenuhnya beserta referensinya untuk mencegah kebingungan visual.
Token brand yang aktif: `--brand-cyan-rgb`, `--brand-cyan-deep-rgb`, `--brand-pink-rgb` — dipakai untuk gradient/glow dekoratif, bukan untuk elemen UI fungsional (tombol, teks, dsb), yang harus tetap pakai token semantik biasa.

## 3. Tipografi

- **Heading** (`h1`–`h6`): `font-family: var(--font-noto-serif-jp)`. Ini keputusan yang bagus dan disengaja — Yu Mincho/Noto Serif JP memberi karakter khas Jepang pada heading. **Pertahankan, jangan diganti sans-serif generik.**
- **Body/UI text**: `var(--font-inter)` (fallback ke Noto JP sans, ui-sans-serif, system-ui).
- **Aksara Jepang berdiri sendiri** (kanji/kana dalam kartu, bukan heading): pakai class `.font-japanese` (`var(--font-noto-jp)`), bukan font-mono seperti disarankan sebelumnya — koreksi dari draf design-system versi awal: konsisten pakai `.font-japanese` untuk teks Jepang, dan reserve `font-mono` hanya untuk romaji/notasi fonetik latin kalau memang perlu dibedakan dari body text biasa.
- **Ukuran font**: hindari `text-[9px]`/`text-[10px]`/`text-[11px]` arbitrary — batas bawah 12px (`text-xs`) untuk label/meta, sesuai catatan sebelumnya di komponen `page.tsx`.

## 4. Radius

- Token tunggal: `--radius: 0.875rem` (setara `rounded-2xl` Tailwind, ±14px).
- **Semua komponen card/surface WAJIB pakai token ini** (Selesai). Seluruh class kartu (`.surface-card`, `.interactive-card`, `.neo-card`), kartu glif (`.japanese-glyph-card`), ikon brand (`.brand-icon`), tombol (`.btn-cyber`), dan ikon aksi (`.action-icon`) telah dialihkan untuk menggunakan `var(--radius)` untuk konsistensi visual. Pengecualian hanya untuk elemen bulat sempurna seperti avatar dan beberapa status pill.

## 5. Efek Permukaan — Konsolidasi (WAJIB dibaca sebelum bikin class baru)

globals.css saat ini punya **terlalu banyak class dekoratif yang tumpang tindih fungsinya**. Sebelum menambah class baru, cek dulu apakah salah satu ini sudah cukup:

| Class                                                                                         | Fungsi sebenarnya                                        | Status                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.surface-card`, `.interactive-card`, `.metric-card`, `.control-surface`, `.data-table-shell` | Card dasar: border + background `--card` + shadow tipis  | **Selesai Konsolidasi.** Hanya `.surface-card` (statis) dan `.interactive-card` (bisa di-hover) yang dipertahankan. Sisanya (`.metric-card`, `.control-surface`, `.data-table-shell`) dihapus. |
| `.status-pill`                                                                                | Pill/badge dengan gradient halus                         | Pertahankan, tapi hilangkan gradient permukaan (lihat #6), cukup 1 background solid + border                                                                                                |
| `.action-icon`, `.brand-icon`, `.brand-icon-soft`, `.state-icon`                              | Wrapper ikon bulat/rounded dengan warna berbeda-beda     | Pertahankan sebagai 2 varian saja: "solid" (brand-icon, untuk CTA/highlight) dan "soft" (brand-icon-soft/state-icon, untuk status pasif) — gabungkan yang fungsinya sama                    |
| `.glass`, `.premium-shell`, `.premium-surface`                                                | Background blur + radial gradient cyan/"violet" berlapis | **Selesai.** `.premium-shell` diubah ke `.shell-ambient`, `.premium-surface` diubah ke `.surface-elevated-ambient`.                                                            |
| `.glow-primary`, `.glow-secondary`, `.btn-cyber`                                              | Box-shadow neon saat hover                               | **Selesai.** `.btn-cyber` diubah ke `.btn-accent-glow`. `.glow-primary` & `.glow-secondary` dihapus (tidak digunakan).                                                       |
| `.neural-grid`                                                                                | Grid garis tipis dekoratif                               | **Selesai.** `.neural-grid` diubah ke `.grid-overlay`.                                                                                                                      |

## 6. Anti-Pattern Checklist (WAJIB dicek sebelum menganggap CSS/UI selesai)

### Kategori lama (komponen/layout)

- [ ] Tidak ada hex/warna Tailwind mentah di luar token semantik.
- [ ] Tidak ada `text-[Npx]` di bawah 12px.
- [ ] Tidak ada gap vertikal antar-section yang lebih besar dari padding section yang didefinisikan.
- [ ] Header/footer tidak punya blok kiri-kanan yang menempel ke ujung dengan tengah kosong.
- [ ] Ikon fitur bukan ikon generik dari icon set — pakai pola kanji-tunggal (lihat design-rules.md).
- [ ] Badge eyebrow tidak dipakai berlebihan/seragam di semua section.

### Kategori baru (khusus globals.css — glass/glow/gradient overload)

- [x] **Tidak ada gradient/glow bertumpuk lebih dari 1 layer** di elemen yang bersarang (Selesai).
- [x] `--brand-violet-rgb` sudah diperbaiki (bukan duplikat dari `--brand-blue-rgb`) atau dihapus jika brand memang cuma 2 warna.
- [x] Radius komponen baru memakai `var(--radius)`, bukan angka arbitrary baru (Selesai).
- [x] Class baru tidak dinamai dengan tema "cyber/neon/premium/glow" (Selesai). Kelas lama telah direname menjadi deskriptif-fungsi (`.btn-accent-glow`, `.grid-overlay`, `.shell-ambient`, `.surface-elevated-ambient`).
- [ ] Sebelum menambah class dekoratif baru untuk "card"/"surface", cek tabel di bagian 5 — apakah salah satu yang sudah ada bisa dipakai ulang, alih-alih menambah class ke-6 yang mirip.
- [ ] Box-shadow tidak menumpuk lebih dari 2 layer (banyak class saat ini punya 3 layer shadow sekaligus: shadow luar + inset highlight + colored glow — sederhanakan).

## 7. Signature Elements (WAJIB dipertahankan)

1. **`.bg-asanoha` dan `.bg-seigaiha`** — pattern SVG tradisional Jepang (asa-no-ha dan seigaiha). Ini elemen paling spesifik dan paling tidak generik di seluruh codebase. Dorong pemakaiannya lebih jauh (mis. sebagai texture halus di section tertentu) daripada radial-gradient blob generik.
2. **`--font-noto-serif-jp` untuk heading** — pilihan tipografi yang disengaja, jangan diganti sans-serif default.
3. **Kartu "Kanji Me" / Signature Interactive Console** di hero (dari `page.tsx`) — kartu kanji besar dengan cara baca dan arti, plus tombol "Lupa/Ingat".
4. **Ikon-kanji-tunggal** (訳/試/省/無) di section benefit — representasi konsep pakai karakter kanji, bukan ikon generik.

## 8. Arah Perbaikan Jangka Pendek (ringkasan prioritas)

1. Perbaiki/hapus bug `--brand-violet-rgb` (Selesai).
2. Konsolidasikan class card duplikat (bagian 5) — target: dari ~8 class jadi 2-3.
3. Kurangi layer gradient/glow bertumpuk di background (`body`, `.app-page`, `.app-main-frame`) jadi satu level saja (Selesai).
4. Ganti semua radius arbitrary ke `var(--radius)` (Selesai).
5. Pertimbangkan apakah nama-nama "cyber/neon/premium" masih relevan, atau ganti ke nama fungsional yang lebih netral (Selesai).
