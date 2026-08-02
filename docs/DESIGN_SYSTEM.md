# Design System & Token Visual NihongoRoute

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
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

| Token | Nama Tradisional | Hex | Peran |
|---|---|---|---|
| `--background` | Washi (和紙) | `#F7F3EA` | Background utama |
| `--foreground` | Sumi (墨) | `#1C1C1C` | Teks utama |
| `--card`, `--surface` | Gofun (胡粉) | `#FDFBF6` | Permukaan card |
| `--primary` | Ai-iro (藍色) | `#22456B` | Tombol/struktur utama |
| `--accent` | Shu-iro (朱色) | `#BF4326` | Aksen tunggal / CTA utama |

### Dark Mode — "Yoru" (夜, malam)

| Token | Nama Tradisional | Hex | Peran |
|---|---|---|---|
| `--background` | Kuro-washi (黒和紙) | `#141413` | Background utama |
| `--card`, `--surface` | Kuro-sumi (黒墨) | `#1D1C1B` | Permukaan card |
| `--primary` | Ai-iro terang | `#4C7AA8` | Tombol/struktur utama |
| `--accent` | Shu-iro terang | `#D8583B` | Aksen tunggal / CTA utama |

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
