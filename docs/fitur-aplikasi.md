# Panduan Fitur Aplikasi NihongoRoute

Dokumen ini merinci seluruh fitur dan kapabilitas pembelajaran yang tersedia bagi pengguna NihongoRoute, menjelaskan fungsionalitas visual serta mekanismenya di latar belakang.

---

## 1. Dasbor Pengguna (User Dashboard)

Dasbor (`/dashboard`) adalah halaman utama setelah pengguna masuk log. Dasbor berfungsi sebagai pusat pemantauan kemajuan belajar harian.

* **Statistik Utama**: Menampilkan akumulasi poin XP, tingkat level pengguna, dan sisa koin belajar.
* **Sistem Hari Beruntun (Streak Counter)**: Menunjukkan jumlah hari berturut-turut pengguna aktif belajar. Jika pengguna memiliki item *Streak Freeze* di inventarisnya, streak akan terlindungi otomatis saat pengguna terlewat belajar satu hari penuh.
* **Heatmap Aktivitas (Commit Calendar Grid)**: Visualisasi grid kalender mirip gaya kontribusi GitHub. Menampilkan tingkat intensitas ulasan/pelajaran yang diselesaikan pengguna per tanggal kalender untuk memotivasi konsistensi belajar.
* **Misi Harian (Daily Quests)**: Daftar 3 misi harian acak (misal: "Selesaikan 10 ulasan SRS", "Selesaikan 1 Bab Pelajaran baru"). Ketika target misi tercapai, tombol klaim aktif dan pengguna mendapatkan hadiah XP bonus setelah divalidasi oleh database.

---

## 2. Kursus Terstruktur (Structured Courses)

Fitur Kursus (`/courses`) menyediakan jalur kurikulum bahasa Jepang yang teratur dari tingkat dasar hingga mahir.

* **Daftar Kategori Kursus**: Kelas diorganisasikan berdasarkan tingkat kemahiran (misal: JLPT N5 Dasar, Kosakata Bisnis, Percakapan Praktis).
* **Pelajaran Interaktif (Lesson Page)**:
  * Merender materi kaya teks (Portable Text dari Sanity CMS) yang terbagi menjadi sub-bab pembelajaran.
  * **Tabel Kosakata & Kanji Terkait**: Menyisipkan daftar kosakata dan kanji dari database Supabase yang terikat dengan materi bab bersangkutan. Pengguna dapat langsung mendengarkan audio pengucapan atau menambahkannya ke dek ulasan SRS mereka.
  * **Blok Percakapan (Dialogue)**: Merender percakapan dua orang lengkap dengan karakter pengisi suara VOICEVOX dinamis, furigana, romaji, dan terjemahan Indonesia.
  * **Catatan Budaya & Penting (Callouts)**: Blok sorotan khusus berisi penjelasan nuansa bahasa atau kebiasaan sosial di Jepang.
* **Kuis Evaluasi Akhir Pelajaran**:
  * Sebelum bab dapat ditandai selesai, pengguna wajib mengerjakan kuis interaktif (pilihan ganda, benar/salah, isian rumpang).
  * Setelah semua jawaban benar diselesaikan, tombol "Tandai Selesai" aktif, mengirim progres ke cloud, dan memberikan hadiah XP pelajaran.

---

## 3. Pustaka Kamus & Media (Library Hub)

Pustaka (`/library`) adalah pusat data leksikal dan materi latihan membaca/mendengarkan mandiri.

### 3.1 Kosakata (`/library/vocab`) & Kanji (`/library/kanji`)
* **Kosakata**: Daftar kosakata lengkap yang dapat difilter berdasarkan tingkat JLPT (N5 - N1) dan kelas kata (Part of Speech / POS, seperti kata kerja, sifat, benda). Dilengkapi tombol putar audio VOICEVOX dan status keanggotaan kartu di ulasan SRS.
* **Kanji**: Daftar karakter kanji dilengkapi dengan onyomi, kunyomi, arti Indonesia, mnemonics bantu hafal, daftar kata turunan, serta animasi stroke order SVG yang mendemonstrasikan urutan penulisan goresan kanji secara visual.

### 3.2 Tata Bahasa (`/library/grammar`)
* Menyajikan koleksi pola tata bahasa Jepang, formula struktur penyusunan kalimat, fungsi makna, penjelasan nuansa, dan contoh-contoh kalimat natural.

### 3.3 Latihan Membaca (Reading / `/library/reading`)
* Artikel bacaan berbahasa Jepang (esay kasual, pengumuman, memo formal).
* **Furigana Toggle**: Tombol global untuk menyembunyikan atau menampilkan teks furigana di atas kanji bacaan sesuai kenyamanan belajar.
* **Popover Kamus Interaktif**: Klik pada kata apa saja di dalam teks artikel untuk membuka popup jendela translasi mini instan (menerjemahkan kata target ke Bahasa Indonesia secara langsung tanpa meninggalkan artikel).

### 3.4 Latihan Menyimak (Listening / `/library/listening`)
* Latihan menyimak audio berformat MP3 yang terintegrasi dengan kuis pemahaman listening.
* **Karaoke Teks Tersinkronisasi**: Teks transkrip Jepang akan tersorot secara bergantian (highlighting) mengikuti stempel waktu audio yang sedang diputar untuk memperkuat pemetaan bunyi dan tulisan.

### 3.5 Lembar Rangkuman Cepat (Cheatsheets / `/library/cheatsheet`)
* Rangkuman visual cepat berbentuk tabel hiragana/katakana, pola konjugasi kata kerja, kata sifat, atau partikel dasar untuk contekan belajar cepat.

---

## 4. Sistem Ulasan Spaced Repetition (SRS Review)

Fitur Ulasan (`/review`) menerapkan algoritma pengulangan terjadwal untuk mentransfer ingatan kosakata/kanji pengguna dari memori jangka pendek ke memori jangka panjang.

* **Dek Ulasan Harian**: Menampilkan jumlah kartu SRS kosakata/kanji yang berstatus jatuh tempo (*Due*) hari ini.
* **Mesin Penilai Mandiri (SM-2 Modified)**:
  * Pengguna melihat kata target, mengingat artinya, lalu mengklik tombol balik kartu.
  * Pengguna menilai kualitas ingatannya sendiri: **Lupa Total**, **Sangat Sulit**, **Ingat Baik**, atau **Sangat Mudah**.
  * Algoritma secara otomatis menghitung kapan kartu tersebut harus diulas kembali (mulai dari besok, 3 hari lagi, hingga maksimal 10 tahun mendatang).
* **Mnemonik Kustom**: Pengguna dapat menulis jembatan keledai kustom mereka sendiri pada kartu kosakata tersebut, yang akan ditampilkan kembali setiap kali kartu tersebut diulas.

---

## 5. Alat Bantu Belajar Mandiri (Learning Tools)

Fitur Alat Bantu (`/tools`) menyediakan berbagai utilitas interaktif untuk memperkuat keterampilan menulis, mendengar, dan menghafal:

* **Dek Kartu Flashcard Kustom (`/tools/flashcards`)**:
  * Pengguna dapat memilih kumpulan kosakata/kanji dari pustaka, menambahkannya ke dek kustom, dan mengulasnya secara cepat dengan membalik kartu bolak-balik tanpa memengaruhi status interval SRS utama.
* **Papan Latihan Kana (`/tools/kana`)**:
  * Bagan interaktif Hiragana dan Katakana lengkap dengan audio pengucapan standard dan kuis latihan baca/tulis kana bagi pemula.
* **Survival Game Game Mode (`/tools/survival`)**:
  * Permainan kuis tebak arti kosakata berpacu dengan waktu.
  * Pengguna dibekali dengan nyawa (health bar). Setiap jawaban salah mengurangi nyawa. Permainan selesai ketika waktu atau nyawa habis. Poin skor tertinggi dicatat di dasbor.
* **Latihan Dikte Suara (Dictation / `/tools/dictation`)**:
  * Pengguna mendengarkan audio kalimat Jepang penuh, kemudian mengetikkan kembali apa yang mereka dengar. Mesin secara ketat mengevaluasi ketepatan penulisan kanji, hiragana, dan partikel masukan.
* **Canvas Menulis Kanji (Handwriting Canvas / `/tools/writing`)**:
  * Canvas gambar interaktif untuk melatih penulisan kanji langsung menggunakan kuas digital (mouse/layar sentuh).
  * Terintegrasi dengan algoritma pendeteksi pola goresan tulisan tangan untuk memvalidasi apakah bentuk goresan kanji pengguna sudah presisi.

---

## 6. Fitur Sosial & Gamifikasi

* **Papan Peringkat Mingguan (Leaderboard / `/social`)**:
  * Peringkat klasemen mingguan yang mempertemukan pengguna NihongoRoute di seluruh Indonesia. Peringkat disusun kompetitif berdasarkan total XP yang didapatkan dalam kurun waktu satu minggu berjalan.
* **Umpan Komunitas (Community Feed)**:
  * Forum diskusi terintegrasi di mana pengguna dapat mempublikasikan pertanyaan tata bahasa, berbagi tips menghafal kanji, berdiskusi mengenai budaya Jepang, serta saling membalas komentar.
* **Sistem Lencana Prestasi (Achievements)**:
  * Lemari lencana virtual yang terbuka otomatis ketika pengguna mencapai target tertentu (misal: "Mencapai 100 hari streak", "Menyelesaikan kelas JLPT N5", "Mengulas 500 kosakata"). Setiap lencana memberikan hadiah koin belajar dan XP besar.

---

## 7. Apresiasi Supporters & Donasi

Fitur Supporters (`/support`) adalah halaman khusus untuk mendukung kelangsungan pengembangan NihongoRoute secara berbayar.
* Terintegrasi langsung secara otomatis via API webhook donasi platform **Saweria** dan **Trakteer**.
* Setiap donasi yang sukses diverifikasi akan memperbarui tingkatan status supporter pengguna di profil mereka:
  * **Bronze Supporter**
  * **Silver Supporter**
  * **Gold Supporter**
* Profil donatur yang aktif akan melampirkan emblem supporter khusus di papan peringkat leaderboard komunitas sebagai tanda apresiasi.
