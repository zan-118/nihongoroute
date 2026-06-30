# Logika Spaced Repetition System (SRS) & Gamifikasi

Dokumen ini menjelaskan algoritma spaced repetition cerdas, formula naik tingkat (leveling), penanganan hari beruntun (streak), serta sistem misi harian dan lencana prestasi (achievements) pada platform NihongoRoute.

---

## 1. Algoritma Spaced Repetition System (SRS)

Aplikasi NihongoRoute mengimplementasikan modifikasi algoritma **SuperMemo 2 (SM-2)** di `src/lib/srs.ts` untuk melacak ingatan jangka panjang kosakata dan kanji pengguna. 

### 1.1 Skala Evaluasi Kualitas Jawaban (Grade)
* **`0` (Lupa Total)**: Pengguna tidak ingat arti/cara baca kata sama sekali.
* **`1` (Sulit)**: Pengguna butuh waktu lama untuk mengingat, atau salah eja minor.
* **`2` (Bisa)**: Pengguna mengingat kata dengan benar tanpa keraguan berarti.
* **`3` (Mudah)**: Pengguna merespons arti kata secara instan dan fasih.

### 1.2 Logika Penalti / Modern Halving (Grade < 2)
Jika pengguna menjawab salah atau kesulitan (grade 0 atau 1), interval ulasan dipangkas untuk memperkuat kembali ingatan:
* **Grade `0` (Lupa Total)**: 
  * Nilai repetisi (`repetition`) di-reset ke `0`.
  * Interval ulasan baru dipotong setengah (`Math.max(1, Math.floor(interval / 2))`).
  * Ease Factor dikurangi sebesar `0.2` (`Math.max(1.3, easeFactor - 0.2)`).
* **Grade `1` (Sulit)**: 
  * Interval ulasan baru dipotong sebesar 30% (`Math.max(1, Math.ceil(interval * 0.7))`).
  * Ease Factor dikurangi sebesar `0.15` (`Math.max(1.3, easeFactor - 0.15)`).
* **Ease Factor Hell Prevention**: Batas bawah Ease Factor dikunci ketat pada angka **`1.3`** untuk mencegah kartu masuk ke dalam putaran ulasan harian abadi yang melelahkan pengguna.

### 1.3 Proteksi Ulasan Prematur / Due-Date Guard (Grade >= 2)
Due-Date Guard melindungi database dari inflasi interval belajar yang tidak realistis akibat pengguna melakukan ulasan berkali-kali sebelum jatuh tempo.
* Sistem memeriksa apakah kartu sudah waktunya diulas:
  $$\text{isDue} = \text{Date.now()} \ge \text{nextReview} - 6\text{ jam}$$
  *(Toleransi 6 jam ditambahkan agar jadwal belajar fleksibel terhadap rutinitas harian).*

#### Kasus A: Belajar Lebih Awal (`!isDue`)
* Jika kartu diulas sebelum jatuh tempo, **interval tidak akan dinaikkan** untuk menghindari Mastery palsu.
* Pengguna tetap diberi penghargaan berupa bonus kecil pada Ease Factor sebesar **`0.02`** atas kerajinannya.

#### Kasus B: Ulasan Tepat Waktu (`isDue`)
* Nilai pengulangan (`repetition`) ditambahkan `1`.
* Perhitungan interval ulasan berikutnya:
  * Repetition `1` & Interval `1` : Interval baru = `2` hari (jika grade `3`), atau `1` hari (jika grade `2`).
  * Repetition `2` & Interval $\le 2$ : Interval baru = `5` hari (jika grade `3`), atau `3` hari (jika grade `2`).
  * Repetition $> 2$ : Interval baru = `Math.ceil(interval * easeFactor * multiplier)`. (Multiplier bernilai `1.3` untuk jawaban mudah/grade `3`, dan `1.0` untuk grade `2`).
* Penyesuaian Ease Factor: ditambahkan `0.15` untuk grade `3` (maksimal `5.0`), atau ditambahkan `0.05` untuk grade `2` (maksimal `5.0`).
* Interval maksimal ulasan dibatasi pada **`3650` hari** (10 tahun).

---

## 2. Sistem Gamifikasi & Aktivitas Belajar

Modul gamifikasi di `src/lib/gamification.ts` memproses pertambahan poin, pemeliharaan hari aktif belajar, streak freeze, dan deduplikasi pencapaian.

### 2.1 Formula Kenaikan Level (Leveling Math)
Total level pengguna dihitung secara langsung dari akumulasi XP menggunakan fungsi matematika berikut:
$$\text{Level} = \lfloor 0.1 \times \sqrt{\text{XP}} \rfloor + 1$$
* Formula ini diimplementasikan di `src/lib/level.ts` dan dievaluasi setiap kali user mendapatkan tambahan XP di `useUserStore`. Jika level baru $> \text{level lama}$, pemicu notifikasi in-app "Level Up!" diaktifkan.

### 2.2 Perhitungan Hari Beruntun (Streak) & Proteksi Streak Freeze
Streak adalah jumlah hari berturut-turut pengguna melakukan aktivitas pembelajaran.
1. Setiap ulasan SRS berhasil atau penyelesaian pelajaran, sistem membandingkan tanggal hari ini (`today`) dengan tanggal aktivitas terakhir (`lastStudyDate`).
2. Jika `lastStudyDate` sama dengan `today`, streak tidak berubah.
3. Jika `lastStudyDate` sama dengan kemarin (`yesterday`), streak bertambah `1`.
4. **Proteksi Streak Freeze**: Jika pengguna terlewat belajar lebih dari satu hari:
   * Jika inventaris `streakFreeze` $> 0$ dan pengguna memiliki riwayat belajar sebelumnya, item `streakFreeze` dikurangi `1`.
   * Streak belajar dipertahankan dan ditambah `1` seolah-olah pengguna belajar.
   * Sistem mengirim notifikasi peringatan: *"Streak Anda terselamatkan oleh item Streak Freeze."*
   * Jika tidak ada item `streakFreeze`, streak di-reset kembali ke `1`.

### 2.3 Rekonsiliasi Penggabungan Data Gamifikasi
Ketika menyelaraskan status luring dengan server awan, data gamifikasi digabungkan dengan aturan:
* **XP & Streak**: Memilih nilai tertinggi dari kedua belah pihak (`Math.max(local, cloud)`).
* **Claimed Quests**:
  * Jika tanggal misi harian sama: array ID quest digabungkan dan dideduplikasi menggunakan `Set`.
  * Jika tanggal berbeda: memilih data dari tanggal terbaru (metode Last-Write-Wins secara alfabetis).
* **Achievements**:
  * Menggabungkan daftar lencana yang terbuka di lokal dan awan.
  * Jika suatu pencapaian ada di lokal dan awan, pertahankan waktu pembukaan lencana paling awal (`unlockedAt` terkecil) untuk menjaga keabsahan sejarah progres pengguna dan mencegah perulangan efek suara notifikasi lencana terbuka.
