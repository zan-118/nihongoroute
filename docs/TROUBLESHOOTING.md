# Panduan Troubleshooting & FAQ

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
> **Ruang Lingkup**: Penanganan Masalah Kuroshiro, Edge TTS Timeout, Offline Sync Conflict, & Health Check  
> **Rujukan Utama**: [README.md](../README.md) | [GETTING_STARTED.md](GETTING_STARTED.md) | [CONFIGURATION.md](CONFIGURATION.md)

---

## 📋 Daftar Isi

1. [Inisialisasi Kuroshiro / Kuromoji Gagal](#1-inisialisasi-kuroshiro--kuromoji-gagal)
2. [Edge TTS Timeout / Audio Failure](#2-edge-tts-timeout--audio-failure)
3. [Konflik Sinkronisasi Multi-Tab & Offline](#3-konflik-sinkronisasi-multi-tab--offline)
4. [Health Check Status Degraded (503)](#4-health-check-status-degraded-503)

---

## 1. Inisialisasi Kuroshiro / Kuromoji Gagal

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

## 2. Edge TTS Timeout / Audio Failure

### Gejala
Audio pelafalan lambat atau mengembalikan status 500.

### Penyebab
Saat cache miss, server melakukan sintesis dinamis via MsEdgeTTS dengan timeout **10 detik**. Jika server Edge TTS lambat, sintesis gagal.

### Solusi & Fallback Klien
Jika `/api/tts` mengembalikan error, klien otomatis mengaktifkan **Web Speech API** bawaan browser (`window.speechSynthesis`) dengan bahasa `ja-JP`.

---

## 3. Konflik Sinkronisasi Multi-Tab & Offline

### Gejala
Progres lokal (guest) tidak sinkron setelah login atau diakses di tab lain.

### Strategi Resolusi Konflik

| Data | Strategi Resolusi |
|---|---|
| XP & Streak | `Math.max(lokal, cloud)` |
| Streak Freeze | Ambil jumlah terbanyak |
| Study Days | Gabung per tanggal, ambil count tertinggi |
| Data SRS | Bandingkan `updated_at`, pertahankan yang terbaru |

---

## 4. Health Check Status Degraded (503)

### Gejala
`/api/health` mengembalikan status `degraded` (HTTP 503).

### Solusi
Pastikan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `NEXT_PUBLIC_SITE_URL` sudah terdefinisi di `.env.local`.
