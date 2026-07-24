# Troubleshooting

> Terakhir diperbarui: 24 Juli 2026

---

## 1. Inisialisasi Kuroshiro Gagal

### Gejala

Log server: `Kuroshiro Init Error: Cannot find dictionary path...`

### Penyebab

Modul `kuroshiro-analyzer-kuromoji` memerlukan kamus biner kuromoji di `node_modules/kuromoji/dict`. Folder tidak ditemukan atau terhapus.

### Solusi

1. Pastikan `node_modules/kuromoji/dict` ada.
2. Path kamus dikonfigurasi eksplisit di `route.ts`:
   ```typescript
   const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
   ```
3. Jalankan `npm install` untuk memperbarui kamus.

---

## 2. Edge TTS Timeout

### Gejala

Audio pelafalan lambat atau mengembalikan status 500.

### Penyebab

Saat cache miss, server melakukan sintesis dinamis via MsEdgeTTS dengan timeout **10 detik**. Jika server Edge TTS lambat, sintesis gagal.

### Fallback Klien

Jika `/api/tts` mengembalikan error (status 500), klien otomatis mengaktifkan **Web Speech API** bawaan browser (`window.speechSynthesis`) dengan bahasa `ja-JP`.

---

## 3. Konflik Sinkronisasi Offline

### Gejala

Progres lokal (guest) tidak sinkron setelah login.

### Resolusi Konflik

Sistem di `src/lib/supabase/sync.ts` menyelesaikan konflik otomatis:

| Data | Strategi |
|------|----------|
| XP & Streak | `Math.max(lokal, cloud)` |
| Streak Freeze | Ambil jumlah terbanyak |
| Study Days | Gabung per tanggal, ambil count tertinggi |
| Data SRS | Bandingkan `updated_at`, pertahankan yang terbaru |

---

## 4. Health Check Degraded

### Gejala

`/api/health` mengembalikan status `degraded` (HTTP 503).

### Penyebab

Variabel environment wajib belum terisi di `.env.local`.

### Solusi

1. Di development, respons `/api/health` menampilkan daftar variabel yang hilang (`missingRequired`).
2. Pastikan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `NEXT_PUBLIC_SITE_URL` sudah dikonfigurasi.
