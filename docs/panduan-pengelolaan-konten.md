# Panduan Pengelolaan Konten & Otomatisasi Skrip
**NihongoRoute Content Operations Guide**

Dokumen ini menjelaskan alur kerja pengelolaan konten editorial melalui Sanity CMS, pengayaan kamus leksikal Supabase via skrip pemrograman, serta langkah operasional pembuatan audio menggunakan generator VOICEVOX offline.

---

## 1. Pengelolaan Konten Editorial (Sanity CMS)

Sanity CMS (`/studio`) melayani penyusunan materi terstruktur yang kaya media dan kuis interaktif.

### 1.1 Struktur Materi Pelajaran (Lessons)
* **Portable Text**: Gunakan editor teks kaya untuk menyusun pembahasan tata bahasa atau bab pelajaran.
* **Kolokasi Kuis (Quizzes)**:
  Setiap bab memiliki array objek kuis kustom di dalam dokumen. Pastikan ID kuis bernilai unik (format: `lesson-[slug]-[no]`).
  - *Multiple Choice*: Menyediakan minimal 3-4 pilihan jawaban dengan satu jawaban benar (`correct_answer`) yang diisi secara tepat.
  - *Hiragana/Translation*: Untuk tipe input manual, sediakan kunci kecocokan string luring.

### 1.2 Transkrip Menyimak (Listening Materials)
Materi choukai membutuhkan penyelarasan stempel waktu audio (timestamp) agar visualisasi teks karaoke berjalan sinkron di pemutar audio klien:
* **Format Timestamp**: Gunakan milidetik (ms) untuk menentukan awal (`start`) dan akhir (`end`) dari setiap baris teks transkrip percakapan.
* **Audio URL**: Selalu unggah berkas MP3 berkualitas sedang (96kbps-128kbps) ke library media Sanity. Kueri GROQ secara otomatis melakukan ekspansi URL biner melalui operator `coalesce`.

---

## 2. Pengayaan Kamus Leksikal (Supabase Seeding)

Jika terdapat data ribuan kosakata, karakter Kanji, atau contoh kalimat baru, pengisian manual via dashboard dilarang karena tidak efisien. Gunakan otomatisasi skrip di direktori `scripts/`.

### 2.1 Skrip Pengisian Massal (Enrichers)
Skrip-skrip berikut membaca data dari berkas XLSX/JSON lokal di folder `data/` lalu melakukan pengisian massal menggunakan query performa tinggi:

| Perintah Eksekusi | Target Tabel | Fungsi / Deskripsi |
| :--- | :--- | :--- |
| `node scripts/enrich-vocab.mjs` | `public.vocab` | Mengunggah daftar kosakata massal. |
| `node scripts/enrich-kanji.mjs` | `public.kanji` | Mengunggah data Kanji lengkap dengan tingkat JLPT, guratan, onyomi, dan kunyomi. |
| `node scripts/enrich-grammar.mjs` | `public.grammar` | Mengunggah modul tata bahasa baru. |
| `node scripts/enrich-sentences.mjs` | `public.sentences` | Mengunggah ribuan kalimat contoh terjemahan Indonesia. |
| `node scripts/enrich-kanji-svg.mjs` | `public.kanji` | Membaca file SVG guratan Kanji dari folder lokal dan melakukan pembaruan kolom `stroke_order_svg`. |

---

## 3. Sintesis Audio Offline (VOICEVOX Generator)

NihongoRoute tidak menggunakan sintesis suara berbayar online demi meminimalkan biaya operasional dan menjaga performa server. Audio diproduksi secara offline menggunakan engine VOICEVOX.

### 3.1 Prasyarat Operasional
Sebelum menjalankan skrip pembuat audio, pastikan perangkat lokal Anda telah memasang dan menjalankan engine VOICEVOX:
1. Unduh dan nyalakan aplikasi **VOICEVOX** di perangkat lokal.
2. Secara default, engine VOICEVOX lokal harus aktif mendengarkan port HTTP `50021`.
3. Verifikasi koneksi lokal dengan membuka alamat `http://localhost:50021/` di peramban.

### 3.2 Perintah Pembuatan Audio
Skrip pembuat audio berada di folder `scripts/tts/` dan akan mengunggah file MP3 yang berhasil di-sintesis langsung ke bucket `tts-cache` Supabase secara otomatis:

* **Sintesis Audio Transkrip Dialog Percakapan**:
  ```bash
  node scripts/tts/generate_dialogue_tts.js --execute --level N5
  ```
  *Skrip ini memindai dokumen listening di level N5, mengirimkan teks dialog Jepang ke VOICEVOX port 50021, lalu menyimpan berkas MP3 ke penyimpanan awan Supabase.*



---

## 4. Validasi Integritas Data (Data Validation)

Sebelum melakukan deployment produksi atau migrasi data berskala besar, jalankan skrip validator untuk memverifikasi keselarasan format dan kelengkapan data kuis:
```bash
node scripts/validate-jlpt-import.mjs
```
*Skrip ini akan memverifikasi kesesuaian format kunci jawaban, keberadaan audio choukai, kelengkapan passage dokkai, dan mengembalikan laporan error jika ada struktur kuis yang cacat.*
