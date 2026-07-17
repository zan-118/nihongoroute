# Troubleshooting & FAQ

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

---

Berikut adalah daftar masalah umum yang mungkin ditemui oleh pengembang maupun pengguna NihongoRoute beserta solusinya berdasarkan analisis penanganan error (*error handling*) di dalam codebase.

## 1. Kegagalan Inisialisasi Kuroshiro (Furigana Service)

### Gejala:
Sistem gagal memuat anotasi furigana hiragana, dan log konsol server menampilkan error:
`Kuroshiro Init Error: Cannot find dictionary path...`

### Penyebab:
Modul `kuroshiro-analyzer-kuromoji` memerlukan berkas kamus biner kuromoji yang terletak di `node_modules/kuromoji/dict`. Apabila folder tersebut tidak ditemukan atau terhapus, konversi akan gagal.

### Solusi:
1. Pastikan folder `node_modules/kuromoji/dict` ada di server.
2. Di dalam file `src/app/api/furigana/route.ts` dan `src/app/api/admin/ai-assistant/route.ts`, inisialisasi analyzer telah dikonfigurasi untuk mencari jalur absolut kamus secara eksplisit menggunakan:
   ```typescript
   const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
   ```
3. Lakukan instalasi ulang pustaka: `npm install` untuk memperbarui kamus.

---

## 2. Dynamic Edge TTS Timeout & Fallback Web Speech API

### Gejala:
Pemuatan audio pelafalan kosakata lambat atau mengembalikan kode status 500.

### Penyebab:
Saat terjadi *cache miss* di database `tts_cache`, server Next.js melakukan dynamic synthesis dengan cara melakukan scraping stream audio ke server Microsoft Edge TTS. Proses ini dibatasi oleh timeout koneksi selama **10 detik**. Jika server Edge TTS lambat merespon, sintesis akan gagal.

### Solusi / Mekanisme Fallback Klien:
* Sistem klien dirancang tidak bergantung penuh pada API server. Jika rute `/api/tts` mengembalikan error atau status 404/500, klien secara otomatis mengaktifkan **Web Speech API** bawaan browser (`window.speechSynthesis`) dengan memicu pelafalan sintesis lokal menggunakan objek `SpeechSynthesisUtterance` dengan penunjuk bahasa `ja-JP`.

---

## 3. Resolusi Konflik Sinkronisasi Offline (Sync Conflict Resolution)

### Gejala:
Data progres lokal pengguna (saat berstatus Guest) tidak sinkron atau terhapus setelah melakukan login ke akun Supabase.

### Penyebab:
Terdapat perbedaan antara progres lokal (XP/Streak) dengan data profil yang sudah ada di awan Supabase.

### Solusi (Merge Logic):
Sistem sinkronisasi di `src/lib/supabase/sync.ts` menyelesaikan konflik secara otomatis dengan aturan:
1. **XP & Streak**: Memilih nilai tertinggi antara lokal dan awan (`Math.max(localXP, cloudXP)`).
2. **Item Inventaris**: Jumlah Streak Freeze dipilih yang terbanyak.
3. **Poin Belajar Harian (`studyDays`)**: Menggabungkan daftar hari belajar dan memilih jumlah review terbanyak untuk setiap tanggal yang sama.
4. **Data Kartu SRS**: Membandingkan stempel waktu `updated_at`. Kartu dengan waktu pembaruan terbaru yang akan dipertahankan dan di-upsert ke database.

---

## 4. Status Degraded pada `/api/health`

### Gejala:
Pemeriksaan kesehatan sistem mengembalikan status `degraded` dengan kode HTTP 503.

### Penyebab:
Terdapat variabel lingkungan wajib (*required environment variables*) yang belum terisi di berkas `.env.local` server Next.js.

### Solusi:
1. Periksa log kueri respons `/api/health`. Di lingkungan pengembangan (development), daftar variabel wajib yang hilang akan ditampilkan pada objek `missingRequired`.
2. Pastikan variabel seperti `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `NEXT_PUBLIC_SITE_URL` sudah dikonfigurasi dengan benar.
