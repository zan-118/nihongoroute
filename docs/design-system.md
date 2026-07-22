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
