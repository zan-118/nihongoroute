## Gaya Desain Ketat

- **DILARANG**: Menggunakan warna Tailwind statis (contoh: `bg-white`, `text-gray-900`), transparansi yang ditulis kaku (contoh: `border-white/5`), dan nilai rgba absolut[cite: 1].
- **DIWAJIBKAN**: 100% menggunakan Variabel CSS Semantik (`bg-background`, `text-foreground`, `primary`, `secondary`, `success`, `warning`, `destructive`, `muted`, `card`)[cite: 1].
- **PENDARAN & BAYANGAN**: Gunakan variabel RGB CSS untuk transparansi (contoh: `rgba(var(--primary-rgb), 0.4)` atau `shadow-[0_0_20px_rgba(var(--destructive-rgb),0.3)]`)[cite: 1].
- **CYBER-GLASS**: Gunakan kelas bawaan `.glass` untuk elemen overlay. Gunakan `border-border` untuk batas visual, JANGAN PERNAH menggunakan `border-white/5`[cite: 1].
- **TIPOGRAFI & AKSESIBILITAS**: Furigana (`<rt>`) WAJIB menggunakan skala relatif `0.55em` melalui komponen `SmartJapanese`[cite: 1]. Tombol yang hanya berisi ikon WAJIB memiliki `aria-label`[cite: 1].

---

## Anti AI-Slop Design[cite: 1]

- **IDENTITAS WARNA WAJIB**: Gunakan hanya palet brand yang sudah didefinisikan (`primary` = Cyan, `secondary` = Crimson/Violet, plus `accent`, `success`, `warning`, `destructive`)[cite: 1]. DILARANG menambahkan warna Tailwind default seperti `indigo-500`, `purple-600`, `pink-500`, `blue-400` untuk gradient, badge, atau ikon — ini adalah ciri khas visual generik AI-generated SaaS dan TIDAK sesuai brand cyan-crimson NihongoRoute[cite: 1].
- **GRADIENT WAJIB PAKAI TOKEN BRAND**: Setiap gradient (hero text, tombol, border glow) WAJIB dibangun dari `--brand-cyan-rgb`, `--brand-violet-rgb`, atau class siap pakai `.btn-cyber`, `.glow-primary`, `.glow-secondary`[cite: 1]. DILARANG membuat gradient baru dari kombinasi warna sembarangan (contoh: `from-indigo-500 to-pink-500`)[cite: 1].
- **TIPOGRAFI DUA-LAPIS WAJIB DIPERTAHANKAN**: Heading (`h1`-`h6`) WAJIB tetap memakai `font-noto-serif-jp` (sudah default global) — DILARANG override manual ke `font-sans` atau menambahkan `font-bold` polos tanpa alasan yang menghapus karakter "serif Jepang" yang jadi identitas visual[cite: 1]. Body text tetap `font-sans`/`font-japanese` sesuai konteks bahasa[cite: 1].
- **GUNAKAN UTILITY YANG SUDAH ADA, JANGAN REINVENT**: Untuk permukaan kartu/panel premium WAJIB pakai `.glass`, `.premium-surface`, atau `.premium-shell` yang sudah dibuat — DILARANG menulis kombinasi ad hoc baru seperti `bg-white/10 backdrop-blur-md shadow-lg border` yang meniru pola generik tanpa memakai token/class yang sudah tersedia[cite: 1].
- **RADIUS KONSISTEN**: WAJIB menghormati `--radius` (0.875rem) via `rounded-lg`/`rounded-md`/`rounded-sm` bawaan Tailwind config[cite: 1]. DILARANG melempar nilai radius acak (`rounded-[20px]`, `rounded-3xl` tanpa alasan) yang tidak konsisten dengan sistem radius yang sudah ditetapkan[cite: 1].
- **HINDARI KLISE AI (Grid & Kartu)**: DILARANG membuat grid 3 kartu "ikon-lingkaran-gradient + judul + deskripsi" sebagai default tanpa konteks konten yang benar-benar butuh itu[cite: 1].
- **HINDARI KLISE AI (Ikon & Emoji)**: DILARANG menggunakan emoji sebagai pengganti ikon fungsional di UI produksi (gunakan `lucide-react` sesuai stack, emoji hanya untuk teks kasual/notifikasi ringan jika memang gaya konten mengizinkan)[cite: 1].
- **HINDARI KLISE AI (Hero Section)**: DILARANG membuat hero section dengan judul gradient-text besar + subteks abu-abu + CTA tombol gradient sebagai default template tanpa mempertimbangkan apakah section tersebut cocok dengan motif budaya (`bg-asanoha`, `bg-seigaiha`) yang sudah disediakan untuk nuansa Jepang[cite: 1].
- **HINDARI KLISE AI (Animasi)**: DILARANG menambahkan micro-animation berlebihan (bounce/confetti/pulse di banyak elemen sekaligus) di luar animasi yang sudah terdefinisi (`animate-premium-bounce`, transisi `duration-300`) tanpa permintaan eksplisit[cite: 1].
- **HORMATI MOBILE PERFORMANCE GUARD**: `globals.css` sudah menonaktifkan `backdrop-blur` dan `background-image` gradient di breakpoint `max-width: 768px` demi performa[cite: 1]. DILARANG menambahkan inline style atau class baru yang memaksa blur/gradient tetap aktif di mobile lewat `!important` atau selector yang meng-override guard ini[cite: 1].
- **KONSISTENSI MODE GELAP/TERANG**: Setiap komponen baru yang menggunakan warna kustom (bukan token semantik) WAJIB menyediakan varian `.dark` yang setara, mengikuti pola yang sudah ada di `globals.css` (misal `.dark .glass`, `.dark .premium-surface`) — bukan mengandalkan browser auto-invert atau opacity generik[cite: 1].

---

## Contoh Kode Panduan

### 1. Gaya Desain CSS & Tailwind

```jsx
// ❌ BURUK (JANGAN LAKUKAN INI)
<div className="bg-white text-gray-900 border-white/5 shadow-md">
  <button className="bg-blue-500 hover:bg-blue-600">Simpan</button>
</div>

// ✅ BAIK (WAJIB SEPERTI INI)
<div className="bg-background text-foreground border-border shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] glass">
  <button className="bg-primary hover:bg-secondary">Simpan</button>
</div>

// ❌ BURUK (POLA GENERIK AI-GENERATED, JANGAN LAKUKAN INI)
<div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-lg p-6">
  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
    🎉 Selamat!
  </h2>
</div>

// ✅ BAIK (MEMAKAI TOKEN & UTILITY BRAND YANG SUDAH ADA)
<div className="premium-surface rounded-lg p-6">
  <h2 className="text-2xl">
    Selamat!
  </h2>
</div>
// Catatan: <h2> otomatis mewarisi font-noto-serif-jp dari base style,
// tidak perlu override font manual.
```
