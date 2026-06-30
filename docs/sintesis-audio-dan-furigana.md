# Sintesis Audio & Penanganan Furigana

Dokumen ini menjelaskan alur kerja Text-to-Speech (TTS), penentuan karakter pengisi suara (casting sheet), mekanisme fallback audio, generator Furigana, serta logika perenderan teks Jepang pintar.

---

## 1. Alur Kerja Text-to-Speech (TTS) VOICEVOX

NihongoRoute menggunakan suara buatan **VOICEVOX** yang ekspresif untuk mendukung materi audio pembelajaran.

### 1.1 Strategi Statis (Pre-generated Audio Only)
Untuk menghemat sumber daya komputasi server, aplikasi **tidak diperkenankan** melakukan sintesis suara VOICEVOX secara real-time pada rute API aktif.
* Seluruh file audio MP3 untuk ribuan kosakata kamus dihasilkan secara offline menggunakan skrip `scripts/tts/generate_voicevox.js` dan diunggah ke bucket Storage Supabase `tts-cache`.
* API route `/api/tts` menerima teks Jepang, voice, dan rate. Ia menghitung MD5 hash dari kombinasi parameter tersebut (misal: `md5(こんにちは_indah_medium)`).
* Hasil hash MD5 dicari pada database tabel `tts_cache` untuk memvalidasi ketersediaan file.
* Jika metadata terdaftar, berkas audio MP3 diunduh dari bucket storage `tts-cache` dan dipulangkan sebagai aliran biner (`Uint8Array`) dengan tajuk cache HTTP jangka panjang (`Cache-Control: public, max-age=604800, immutable`).
* Jika metadata atau berkas tidak ditemukan di storage, API route mengembalikan status **`404 Not Found`**. Jika metadata di database menunjuk ke berkas yang ternyata kosong/hilang di storage, record database akan dihapus otomatis agar dapat dihasilkan kembali secara offline.

### 1.2 Peta Tokoh Pengisi Suara & Deteksi Gender Otomatis
Sistem mendefinisikan daftar nama pembicara tetap (`VOICE_CHARACTERS`) di `src/lib/tts.ts` yang dipetakan ke Speaker ID VOICEVOX:

| Nama Pengisi Suara | Gender | Nama VOICEVOX | Speaker ID | Peran / Karakteristik |
| :--- | :--- | :--- | :--- | :--- |
| **indah** (Default Vocab) | Wanita | Shikoku Metan | 2 | Narator Utama / Guru Wanita. Tenang, artikulasi jelas, formal. |
| **lara** | Wanita | Kasukabe Tsumugi | 8 | Remaja / Siswi SMA. Ceria, bernada cerah. |
| **siti** | Wanita | Amehare Hau | 10 | Teman Sekolah / Wanita Muda. Lembut, jernih. |
| **dewi** | Wanita | Meimei Himari | 14 | Gadis Kecil. Manja, energetik. |
| **hayashi** | Wanita | Kyushu Sora | 16 | Ibu Rumah Tangga / Wanita Karir. Bijaksana, berwibawa. |
| **sato** | Wanita | Mochiko-san | 20 | Petugas Toko / Resepsionis. Sopan, ramah. |
| **ayu** | Wanita | WhiteCUL | 23 | Remaja Santai / Teman Wanita. Tenang, modern. |
| **zundamon** | Wanita | Zundamon | 3 | Maskot Cilik. Nada sangat tinggi, kekanak-kanakan. |
| **ritsu** | Wanita | Namine Ritsu | 9 | Wanita Misterius. Karakteristik suara unik dan ekspresif. |
| **budi** | Pria | Aoyama Ryuusei | 13 | Narator Pria / Guru Pria. Bariton, tenang, formal. |
| **dito** | Pria | Kuronou Takehiro | 11 | Remaja / Member SMA. Kasul, ramah. |
| **suzuki** | Pria | Kenzaki Mesu | 21 | Pekerja Kantor / Stasiun. Tegas, profesional. |
| **tanaka** | Pria | Sakamatsuri Shuji | 52 | Ayah / Pria Paruh Baya. Berat, tenang. |
| **yamada** | Pria | Kigasajima Sourin | 53 | Kakek / Orang Tua. Berat, serak. |
| **kimura** | Pria | Shirakami Koutarou | 12 | Pemuda Gaul / Sahabat. Cepat, santai. |

Fungsi `detectVoice` bertanggung jawab menentukan suara mana yang akan memutar audio dialog:
1. Gelar kehormatan Jepang (`-san`, `-kun`, `-chan`, `様`, etc.) dihapus dari nama pembicara.
2. Nama pembicara dicari langsung pada peta `SPEAKER_MAP` atau daftar tokoh tetap.
3. Jika tidak ada kecocokan nama langsung, gender dideteksi secara heuristik menggunakan suffix (akhiran `chan` = wanita, `kun` = pria) atau kata kunci penentu (seperti `男`, `彼` = pria; `女`, `彼女` = wanita).
4. Jika gender terdeteksi, nama pembicara di-hash secara deterministik ke dalam indeks sisa bagi (`index % voices.length`) untuk memilih salah satu suara dari kelompok gender tersebut secara konsisten.
5. Jika gender tidak dapat diidentifikasi, rotasi acak deterministik dari seluruh suara pria & wanita dijalankan.

### 1.3 Caching Sisi Klien & Fallback Web Speech API
* **Client Caching**: Panggilan audio di sisi klien menggunakan helper `fetchTTSAudio` di `src/hooks/useCachedAudio.ts` yang mengakses CacheStorage lokal bernama `nihongoroute_tts_cache`. Audio yang berhasil diambil disimpan lokal (maksimal **200 file**) agar bisa diputar kembali secara luring tanpa lalu lintas data jaringan.
* **Web Speech API Fallback**: Jika pemanggilan API lokal mengembalikan status 404 (audio belum dihasilkan offline) atau koneksi jaringan mati total, klien secara otomatis mengaktifkan `speakWithWebSpeech`.
  * Fungsi ini memanggil modul peramban bawaan `window.speechSynthesis`.
  * Ia memfilter daftar suara sistem yang berbahasa Jepang (`ja-JP`).
  * Memilih suara bawaan sistem yang paling mendekati gender pengisi suara target (wanita/pria) dan memutarnya sebagai cadangan visual-audio instan.

---

## 2. Generator Furigana & SmartJapanese Rendering

Furigana adalah teks bantu pelafalan yang ditempatkan di atas karakter kanji Jepang.

### 2.1 Penganalisis Kuroshiro (API `/api/furigana`)
* Handler API memuat penganalisa kosakata Jepang Kuroshiro berbasis kamus biner Kuromoji dari `node_modules/kuromoji/dict`.
* Analizer diinisialisasi sekali dan di-cache dalam lingkup global file modul rute untuk mencegah overhead pemuatan file kamus yang lambat pada setiap panggilan POST.

### 2.2 Algoritma Pembelahan Kanji-Hiragana (`splitFurigana`)
Komponen visual `<SmartJapanese>` membagi kata Jepang menjadi potongan blok yang hanya meletakkan furigana di atas kanji secara presisi, membiarkan hiragana/katakana biasa tidak bertumpuk:
* Kata Jepang dibedah karakter demi karakter. Jika bukan kanji, ia digabung ke segmen polos.
* Jika kanji dideteksi, ia mencari posisi karakter non-kanji pertama setelah blok kanji tersebut sebagai **Jangkar (Anchor)**.
* **Batas Jarak Jangkauan (Max Search Buffer)**: Algoritma membatasi pencarian jangkar di dalam string pelafalan maksimal **10 karakter atau panjang kanji $\times 5$**. Penjaga ini mencegah overhead komputasi perulangan berlebih (*CPU execution freeze*) jika string masukan sangat panjang atau terdapat spasi tak teratur.
* Skor kecocokan jangkar dihitung berdasarkan karakter setelah jangkar, ditambah penalti jarak pencarian untuk menghindari pemilihan jangkar yang salah pada kalimat yang sangat panjang.
* Setelah segmen kanji dan pelafalan terisolasi, potongan dibungkus ke objek array. Hasil pembelahan di-cache di dalam map global dengan kapasitas maksimal **1000 entri** untuk menjaga kebersihan memori.
* Hasil akhirnya dirender menggunakan elemen HTML5 `<ruby>`, di mana teks bantu `<rt>` diformat dengan ukuran relatif **`0.55em`** dan cetak tebal (`font-bold`) sesuai standarisasi estetika aplikasi.
