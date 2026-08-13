# Design System & Token Visual NihongoRoute

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 13 Agustus 2026  
> **Ruang Lingkup**: Design Tokens, Hiru/Yoru Color Palettes, Typography, Anti-Pattern Checklist, & Signature UI  
> **Rujukan Utama**: [README.md](../README.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 📋 Daftar Isi

1. [Aturan Main & Prinsip Desain (Ma, Kanso, Shizen, Shibui)](#1-aturan-main--prinsip-desain-ma-kanso-shizen-shibui)
2. [Palet Warna & Peran Token (Hiru vs Yoru)](#2-palet-warna--peran-token-hiru-vs-yoru)
3. [Tipografi & Skala Font](#3-tipografi--skala-font)
4. [Efek Permukaan & Radii](#4-efek-permukaan--radii)
5. [Anti-Pattern Checklist (Anti AI Slop)](#5-anti-pattern-checklist-anti-ai-slop)
6. [Komponen Signature Brand](#6-komponen-signature-brand)

---

## 1. Aturan Main & Prinsip Desain (Ma, Kanso, Shizen, Shibui)

1. **Satu aksen kuat (Shu/vermillion)**: Dipakai jarang dan berarti — bukan disebar rata di semua elemen.
2. **Tanpa Gradient & Glow**: Tidak ada `linear-gradient` atau `backdrop-blur` sebagai default dekoratif.
3. **Shadow Maksimal 1 Layer**: Hanya untuk modal/popover. Card/surface biasa: 0 shadow, border 1px.
4. **Tipografi Tenang**: Uppercase + bold berat (900) hanya untuk label/kicker kecil (≤12px). Heading dan judul tidak uppercase.
5. **Radius Fungsional**: `var(--radius)` = 14px.
6. **Warna Token**: Wajib `hsl(var(--token))` di komponen.
7. **Nama Class**: Fungsional dan deskriptif. Dilarang pakai "cyber", "neon", "glow".

---

## 2. Palet Warna & Peran Token (Hiru vs Yoru)

### Light Mode — "Hiru" (昼, siang)

| Token                 | Nama Tradisional | Hex / HSL                 | Peran                                     |
| --------------------- | ---------------- | ------------------------- | ----------------------------------------- |
| `--background`        | Washi (和紙)     | `#F7F3EA` (`40 25% 95%`)  | Background utama                          |
| `--foreground`        | Sumi (墨)        | `#0D0D0D` (`0 0% 5%`)     | Teks utama                                |
| `--card`, `--surface` | Gofun (胡粉)     | `#FDFBF6` (`40 30% 98%`)  | Permukaan card hangat                     |
| `--primary`           | Ai-iro (藍色)    | `#22456B` (`215 80% 32%`) | Tombol/struktur utama                     |
| `--accent`            | Shu-iro (朱色)   | `#BF4326` (`11 80% 48%`)  | Aksen tunggal / CTA utama                 |
| `--border`, `--input` | Washi-border     | `35 15% 82%`              | Garis batas hangat (harmonis dengan krem) |
| `--muted-foreground`  | Sumi-soft        | `35 12% 40%`              | Teks sekunder hangat & tenang             |

### Dark Mode — "Yoru" (夜, malam)

| Token                 | Nama Tradisional    | Hex       | Peran                     |
| --------------------- | ------------------- | --------- | ------------------------- |
| `--background`        | Kuro-washi (黒和紙) | `#141413` | Background utama          |
| `--card`, `--surface` | Kuro-sumi (黒墨)    | `#1D1C1B` | Permukaan card            |
| `--primary`           | Ai-iro terang       | `#4C7AA8` | Tombol/struktur utama     |
| `--accent`            | Shu-iro terang      | `#D8583B` | Aksen tunggal / CTA utama |

### Palet Aksen Warna (Generik & Tema-Adaptif)

Palet aksen dipusatkan sebagai token **bernama warna** (bukan nama fitur) sehingga bisa dipakai ulang di fitur mana pun. Setiap aksen bersifat **tema-adaptif** mengikuti pola `--success`/`--success-foreground`: di mode **terang** memakai shade gelap (kontras teks ≥ 4.5:1) dengan `*-foreground` putih untuk teks di atas solid; di mode **gelap** memakai shade terang dengan `*-foreground` gelap (shade 950).

| Token | Nilai Terang | Nilai Gelap | Setara |
| --- | --- | --- | --- |
| `--accent-violet` (+`-foreground`) | `263 70% 50%` / putih | `271 91% 68%` / `261 73% 12%` | purple |
| `--accent-cyan` (+`-foreground`) | `194 70% 27%` / putih | `189 94% 43%` / `197 79% 15%` | cyan |
| `--accent-emerald` (+`-foreground`) | `163 94% 24%` / putih | `160 84% 39%` / `166 91% 9%` | emerald |
| `--accent-rose` (+`-foreground`) | `345 83% 41%` / putih | `350 89% 60%` / `343 88% 12%` | rose |
| `--accent-amber` (+`-foreground`) | `23 83% 31%` / putih | `38 92% 50%` / `21 92% 14%` | amber |
| `--accent-blue` (+`-foreground`) | `224 76% 48%` / putih | `217 91% 60%` / `226 57% 21%` | blue |
| `--surface-well` (dark) | — | `214 54% 3%` (`#03060a`) | Input well gelap |

**Aturan pakai**: teks di atas solid selalu `text-accent-*-foreground` (bukan `text-white`). Badge/tint pakai `bg-accent-*/10 text-accent-*` — otomatis adaptif per mode. Komponen dengan inline-style (mis. `LibraryCategoryCard` & stats halaman library) memakai `hsl(var(--accent-*))` + `/ alpha` agar tetap tema-adaptif tanpa string RGB statis. Status semantik: `success` (badge SELESAI, tombol kumpulkan ujian, badge sinkronisasi) & `warning` (status pending/streak).

### Kontras Wajib (Hasil Audit WCAG, Agustus 2026)

- **Teks aksen**: mode terang memakai shade gelap (kontras ≥ 4.5:1), mode gelap shade terang (kontras ≥ 4.5:1) — naik dari 1.9–3.8:1 sebelumnya.
- **Teks di atas solid aksen/primary**: `text-*-foreground` (bukan `text-white`) — kontras mode gelap naik dari 2.6:1 menjadi ≥ 7:1 (StickerScene, VocabCard, VocabView).
- **Zero CSS invalid tersisa**: seluruh `src/` bebas dari `rgb(var(`, `rgba(var(`, raw `var(--x)` di inline style, class `bg-linear-` rusak, dan `before:`/`after:` kosong. Semua warna inline memakai wrapper `hsl(var(--token) / alpha)` (contoh: glow courses, mark sudut Tombou, shimmer `before:bg-white/30`).
- **Konten read-only / sertifikat**: `OfficialCertificateView` memakai palet tetap (kertas/print) — dikecualikan dari token tema secara sengaja (didokumentasikan).

---

## 3. Tipografi & Skala Font

- **Primary Font**: `Inter` / System Sans.
- **Japanese Font**: `Noto Sans JP` / `BIZ UDPGothic`.
- **Kanji Hero Display**: `Klee One` / `Shippori Mincho`.

---

## 4. Efek Permukaan & Radii

```css
:root {
  --radius: 14px;
  --surface-border: 1px solid var(--border);
}
```

---

## 5. Anti-Pattern Checklist (Anti AI Slop)

- [x] Tidak ada background hero gradient ungu-biru.
- [x] Tidak ada kartu dengan border glowing neon.
- [x] Tidak ada teks judul uppercase 900 weight seragam.
- [x] Tidak ada `backdrop-blur` pada card statis.

---

## 6. Komponen Signature Brand

- **Hanko Badge**: Stempel merah tradisional untuk status kelulusan / verifikasi.
- **Washi Surface**: Permukaan card bertekstur kertas lembut tanpa shadow berat.
