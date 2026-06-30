# Skema Database & Row Level Security (RLS)

Dokumen ini menjelaskan struktur fisik basis data PostgreSQL Supabase NihongoRoute, fungsi pemicu (triggers), arsitektur indeks, hak akses (grants), dan kebijakan Row Level Security (RLS).

---

## 1. Skema Tabel Utama & Relasi

Seluruh basis data didefinisikan dalam berkas migrasi tunggal: `supabase/migrations/20260620130000_initial_schema.sql`.

### 1.1 Tabel Pengguna & Progres Belajar
* **`profiles`**:
  * Menyimpan identitas pengguna (`full_name`, `avatar_url`), total `xp`, tingkat `level`, `streak`, `today_review_count`, `last_study_date`, serta log hari aktif belajar (`study_days` jsonb).
  * Menyimpan inventaris barang (`inventory` jsonb) berisi items, quest yang telah diklaim, dan lencana prestasi yang diraih.
  * Menyimpan preferensi pengguna (`settings` jsonb).
* **`user_srs`**:
  * Menyimpan ulasan kosakata/kanji pengguna. Memiliki kolom `repetition`, `interval`, `ease_factor`, `next_review` (timestamptz), status (`learning`, `reviewing`, `graduated`), dan `custom_mnemonic` (teks).
  * Indeks Unik: `UNIQUE (user_id, word_id)` menjamin tidak ada duplikasi data kartu SRS per kata untuk satu pengguna.
* **`user_lessons`**:
  * Melacak riwayat penyelesaian bab pelajaran. Memiliki kolom `is_completed` (boolean), `completed_at`, dan `updated_at`.
  * Indeks Unik: `UNIQUE (user_id, lesson_id)`.

### 1.2 Tabel Kamus Leksikal (Public Data)
* **`course_categories`**: Kategori kelas bahasa Jepang (misal: N5, N4, Percakapan).
* **`kanji`**: Karakter kanji (`character`), arti (`meaning`), cara baca onyomi/kunyomi, goresan stroke (`stroke_order_svg`), radikal, dan daftar mnemonics.
* **`vocab`**: Kosakata bahasa Jepang (`word`), furigana, arti (`meaning_id`), aksen nada (`pitch_accent`), kelompok kata kerja, dan contoh kalimat (`examples` jsonb).
* **`grammar`**: Judul pola tata bahasa Jepang, formula pembentukan (`formation`), arti, dan contoh kalimat.
* **`expressions`** & **`radicals`** & **`sentences`**: Tabel bantu pendukung konten harian dan latihan dikte menulis.
* **`cheatsheets`**: Data visual tabel rangkuman tata bahasa/kosakata.

### 1.3 Tabel Simulasi Ujian JLPT (Bank Soal)
* **`jlpt_exam_templates`**: Templat ujian berisi durasi (`time_limit_minutes`), batas lulus (`passing_score`), konfigurasi kuota seksi, dan penanda rilis `is_published`.
* **`jlpt_passages`**: Teks bacaan panjang atau transkrip choukai yang melampirkan file audio/gambar.
* **`jlpt_questions`**: Soal ujian yang menunjuk ke passage terkait, memuat teks pertanyaan (`prompt_html`), pilihan jawaban (`choices` jsonb array), indeks jawaban benar (`correct_choice_index`), penjelasan (`explanation_html`), dan referensi kata kamus terkait (`source_type`, `source_id`).
* **`jlpt_exam_template_questions`**: Tabel persimpangan (junction table) yang mengikat pertanyaan ke dalam templat dengan urutan posisi tertentu (`position`, `section_order`).
* **`user_exam_sessions`** & **`user_exam_answers`**: Rekaman sesi ujian aktif pengguna beserta log pilihan jawaban yang dipilih untuk dihitung skornya di akhir sesi.

---

## 2. Fungsi PostgreSQL (Database Functions) & Triggers

Pekerjaan manipulasi status dan keamanan dijalankan otomatis melalui triggers database:

1. **`handle_updated_at()` & `set_updated_at()`**: Triggers standard untuk memperbarui kolom `updated_at` dengan stempel waktu `now()` setiap kali baris data mengalami modifikasi (`UPDATE`).
2. **`validate_profile_integrity()`**:
   * Pemicu sebelum update pada tabel `profiles`.
   * Memastikan bahwa tingkat level (`level`) yang disimpan selalu dihitung ulang dari nilai total `xp` saat ini menggunakan rumus leveling resmi agar sinkron dan valid.
3. **`protect_srs_logic()`**:
   * Pemicu sebelum tambah/edit pada tabel `user_srs`.
   * Melakukan validasi struktur data kartu SRS: memastikan Ease Factor tidak kurang dari `1.3`, interval tidak bernilai negatif, dan format tanggal `next_review` valid.
4. **`handle_new_user()`**:
   * Pemicu otomatis setelah pengguna baru sukses mendaftar akun di tabel `auth.users`.
   * Fungsi ini secara otomatis membuat baris profil kosong baru di tabel `public.profiles` dengan XP `0`, level `1`, dan inventaris awal, mengamankan data pengguna sejak detik pertama masuk.
5. **`update_community_post_comments_count()`**:
   * Pemicu setelah penambahan atau penghapusan komentar di tabel `community_comments`.
   * Memperbarui hitungan kolom `comments_count` pada tabel `community_posts` secara otomatis untuk meredam latency waterfall kueri.

---

## 3. Kebijakan Row Level Security (RLS)

NihongoRoute mengaktifkan RLS pada seluruh tabel di dalam database untuk mencegah kebocoran data pengguna:

* **Kebijakan Kamus Publik (Read-Only)**:
  Tabel kamus (`vocab`, `kanji`, `grammar`, `expressions`, `sentences`), kategori kursus (`course_categories`), dan templat ujian (`jlpt_exam_templates`) diatur dengan kebijakan akses bebas baca bagi semua orang, termasuk tamu anonim:
  ```sql
  CREATE POLICY "Allow public read access" ON public.vocab FOR SELECT USING (true);
  ```
* **Kebijakan Progres Pengguna (User-Scoped Access)**:
  Tabel progres pribadi (`profiles`, `user_srs`, `user_lessons`, `user_exam_sessions`, `user_exam_answers`) menggunakan filter UID terautentikasi:
  ```sql
  CREATE POLICY "Users can manage own data" 
  ON public.user_srs 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
  ```
* **Kebijakan Khusus Feedback**:
  Tabel `user_feedback` mengizinkan seluruh pengguna mengirim data laporan (`INSERT` diizinkan untuk umum/anon), tetapi kueri baca (`SELECT`) diblokir total bagi siapa saja kecuali akun administrator lewat filter `USING (false)`.

---

## 4. Konfigurasi Storage Buckets

Supabase Storage mengelola aset biner dinamis melalui dua bucket utama:
1. **`tts-cache`**:
   * Menyimpan berkas biner audio MP3 kosakata buatan VOICEVOX dengan format penamaan `<md5_hash>.mp3`.
   * Bersifat publik, memiliki batas ukuran file **10 MB**, dan membatasi ekstensi hanya untuk `audio/mpeg` atau `audio/mp3`.
2. **`exam-assets`**:
   * Menyimpan aset pendukung simulasi ujian JLPT (seperti potongan gambar ilustrasi soal membaca atau file audio menyimak choukai).
   * Bersifat publik, memiliki batas ukuran file **50 MB**, dan mengizinkan format mime-type audio dan gambar (`audio/mpeg`, `audio/mp3`, `audio/ogg`, `image/png`, `image/jpeg`, `image/webp`).
   * Kebijakan RLS membatasi modifikasi bucket hanya untuk service-role, sedangkan akses baca terbuka untuk publik.
