# Pedoman Sistem Desain Visual Premium NihongoRoute (Stroke & Tombou System)

Dokumen ini mendefinisikan standar visual dan interaksi kelas atas untuk NihongoRoute. Seluruh komponen baru atau modifikasi wajib merujuk pada pedoman ini demi menjaga konsistensi estetika premium.

---

## 1. Token Warna & Tema Brand
Aplikasi menggunakan skema warna berbasis **Teal & Crimson** yang harmonis dan nyaman untuk dibaca dalam jangka panjang.

| Token | Warna Light Mode | Warna Dark Mode (OLED-friendly) |
| --- | --- | --- |
| `Background` | `#FAF9F6` (Washi White / Warm Bone) | `#0D0E10` (Ink Black / Sumi-Urushi) |
| `Card` | `#FFFFFF` | `#121418` (Solid Charcoal) |
| `Primary` | `#008494` (Industrial Teal) | `#008494` (Muted Teal) |
| `Secondary` | `#D63F5C` (Soft Crimson Red) | `#D63F5C` (Soft Crimson Red) |
| `Muted` | `#FAF9F6` | `#171A1F` |

---

## 2. Anti-AI-Slop & Larangan Mutlak
Hindari pola desain generic hasil AI standar. Pola-pola berikut dilarang:
- **❌ Banned Fonts**: Inter, Roboto, Arial. (Gunakan `Plus Jakarta Sans` dipasangkan dengan `Hiragino Kaku Gothic ProN` / `Yu Gothic` untuk konten Jepang).
- **❌ Banned Icons**: Ikon Lucide default dengan stroke tebal (`stroke-width: 2px`). Gunakan stroke tipis (`stroke-width: 1.5` atau `1`).
- **❌ Banned Borders & Shadows**: Border solid gray tebal (`border-gray-200` kasar), drop shadow pekat hitam default, orbs pendaran glow di hover state, glassmorphism transparan yang merusak frame-rate.
- **❌ Banned Motion**: Transisi `linear` atau `ease-in-out` bawaan browser.

---

## 3. Sudut Tombou (Tombou Register Mark)
Kartu utama menggunakan markah L-Shape geometris tipis di bagian luar sudut kanan atas untuk memberikan kedalaman presisi cetak (*Genkou Youshi*).

### Struktur HTML/Tailwind:
```tsx
// Card Wrapper
<div className="relative group">
  {/* Tombou Register Mark (L-Shape top-right) */}
  <div className="absolute -top-[6px] -right-[6px] w-[12px] h-[12px] pointer-events-none">
    {/* Garis Horizontal */}
    <div className="absolute top-0 right-0 w-[12px] h-[1px] bg-primary/40 dark:bg-[#005C66]" />
    {/* Garis Vertikal */}
    <div className="absolute top-0 right-0 w-[1px] h-[12px] bg-primary/40 dark:bg-[#005C66]" />
  </div>
  
  {/* Inner Core Card */}
  <Card className="rounded-2xl border border-border bg-card p-6">
    {/* Konten */}
  </Card>
</div>
```

---

## 4. Tombol "Asymmetric Calligraphic Cut"
Tombol aksi utama (tinggi `≥40px`) menggunakan radius asimetris: tiga sudut melengkung `8px` (`rounded-lg`) dan satu sudut kanan bawah dipotong tajam (`rounded-br-none`). Tombol dengan tinggi `<40px` menggunakan radius seragam `rounded-lg` (8px).

---

## 5. Koreografi Gerakan (Motion Choreography)
- **Cubic-Bezier Easing Utama**: `cubic-bezier(0.32, 0.72, 0, 1)` (efek spring-deceleration premium).
- **Duration**: `500ms` untuk perubahan state mikro, `700ms` untuk kemunculan seksi.
- **Scroll Reveal**: Gunakan transisi eksklusif pada `transform` dan `opacity` (hindari animating `height`, `width`, `top`, `left` karena performa rendering).

---

## 6. Arsitektur Double-Bezel (Doppelrand) & Button-in-Button CTA
Kartu direktori utama (seperti di modul `/library`) wajib menggunakan penutup berlapis (*nested enclosure*):
1. **Outer Shell**: Wrapper dengan padding `p-2` s/d `p-2.5`, outer radius exaggerated (mis. `rounded-[2.25rem]`), hairline border (`ring-1` / `border border-white/10`), dan backdrop blur terisolasi.
2. **Inner Core**: Container bagian dalam dengan radius konsentris hasil kalkulasi (`rounded-[calc(2.25rem-0.625rem)]`), background gradient surface, dan bayangan inset (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`).
3. **Button-in-Button CTA**: Interaksi CTA utama menggunakan tombol pill dengan trailing icon terisolasi dalam circle wrapper tersendiri (`w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0`), yang meluncur kinetik diagonal pada saat hover.

---

## 7. Aturan Pembersihan Kartu (*Purge Card Overuse*) & Tabel Murni (`<table>`)
1. **Pembersihan Kartu Total (*No Card Overuse*)**:
   - DILARANG KERAS membungkus setiap item kecil di dalam list/grid dengan boks kartu individual (`bg-card border rounded-2xl p-6 shadow`).
   - Elemen antarmuka WAJIB disajikan sebagai **Tampilan Terbuka Sejati (*Seamless Open Layout*)** yang mengalir secara alami di atas halaman dengan aksen hairline border (`border-b border-border/30`).
2. **Standar Tabel Data Murni (`<table>`)**:
   - Tampilan berlabel "Tabel" WAJIB menggunakan struktur HTML tabel murni (`<table className="w-full text-left border-collapse">`), BUKAN kartu paragraf vertikal bertumpuk.
   - Header tabel `<thead>` (`NO`, `JEPANG`, `ROMAJI`, `ARTI`) WAJIB terlihat di semua ukuran layar (Mobile & Desktop).
   - Di mobile (`<768px`), tabel dibungkus dengan `overflow-x-auto min-w-[640px]` agar data tetap selaras dalam baris horizontal yang utuh tanpa terpotong atau tertekan.
3. **Standar Responsif Mobile (<768px)**:
   - Spacing: Gunakan padding ringkas `px-4 py-4`.
   - Typo scale: Judul utama diskalakan dari `text-7xl` (desktop) menjadi `text-3xl` / `text-4xl` (mobile).


