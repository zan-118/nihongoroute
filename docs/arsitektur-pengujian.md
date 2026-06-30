# Arsitektur Pengujian (Testing)

Dokumen ini menjelaskan infrastruktur pengujian pada proyek NihongoRoute, memetakan cakupan pengujian unit (Vitest) dan pengujian ujung-ke-ujung (Playwright E2E).

---

## 1. Pengujian Unit & Integrasi (Vitest)

Pengujian unit terpusat di bawah direktori `__tests__/`. Konfigurasi diatur pada file `vitest.config.ts` yang berjalan di atas lingkungan tiruan peramban **`jsdom`** dan memuat berkas inisialisasi awal `__tests__/setup.ts`.

### 1.1 Cakupan Pengujian Unit Utama (`__tests__/*`)

#### Pengujian Logika Inti & Utilitas (`__tests__/lib/`):
* **`srs.test.ts`**:
  * Memvalidasi kebenaran algoritma SM-2.
  * Menguji pemicuan Modern Halving (grade < 2) yang memotong interval ulasan dan mengurangi Ease Factor.
  * Menguji kestabilan Ease Factor agar tidak melewati batas minimal `1.3` (anti ease factor hell).
  * Memverifikasi kepatuhan *Due-Date Guard*: ulasan prematur tidak menaikkan interval belajar dan hanya memberikan penambahan Ease Factor mikro `0.02`.
* **`level.test.ts`**:
  * Menguji akurasi fungsi akar kuadrat dalam menghitung konversi total XP ke tingkat level pengguna.

#### Pengujian Zustand Stores (`__tests__/store/`):
* **`useSRSStore.test.ts` & `useUserStore.test.ts`**:
  * Memverifikasi proses penambahan kartu baru (`addToSRS`), pengaktifan penanda kotor (`dirtySrs`), serta pembersihan status kotor setelah sinkronisasi sukses (`clearDirtySrs`).
  * Menguji resolusi konflik penggabungan data (`mergeProgress`): memastikan data dengan stempel waktu `updatedAt` terbaru menang atas data usang, dan penanda hapus `isDeleted` lokal dikirim dengan benar sebagai tombstone payload.

#### Pengujian Mesin Pembelajaran & Hooks Klien (`__tests__/hooks/`):
* **`useQuizEngine.test.tsx` & `useMockExamEngine.test.tsx`**:
  * Mensimulasikan status pergerakan pengerjaan kuis/ujian: menjawab soal, memindahkan indeks aktif, mengaktifkan peringatan cheat, menghentikan penghitung waktu mundur, dan mengevaluasi kalkulasi skor.
* **`useDailyQuests.test.tsx`**:
  * Memvalidasi kriteria misi harian (misal: menjawab 5 ulasan SRS) dan memicu pemberian XP bonus.
* **`useFlashcardMaster.test.tsx`**:
  * Menguji penyusunan dek kartu acak dari kamus leksikal.
* **`useCachedAudio.test.tsx`**:
  * Memastikan alur pemutaran audio memanfaatkan CacheStorage lokal terlebih dahulu untuk mendukung operasional luring sebelum memanggil API jaringan `/api/tts`.

---

## 2. Pengujian Ujung-ke-Ujung / End-to-End (Playwright)

Pengujian E2E terpusat di direktori `e2e/` dan diatur oleh file `playwright.config.ts`. Skenario E2E mengaktifkan server pengembangan lokal Next.js di latar belakang (`http://localhost:3000`) dan menguji visualisasi interaksi fungsional lintas platform peramban (Chromium, Firefox, WebKit, Mobile Chrome, dan Mobile Safari).

### 2.1 Skenario Pengujian E2E Utama (`e2e/*`)
* **`auth.spec.ts`**:
  * Menguji pendaftaran akun baru, validasi kesalahan sandi/email salah, otentikasi masuk log berhasil, penyegaran token sesi di cookie, dan keluar log (logout) aman.
* **`navigation.spec.ts`**:
  * Mensimulasikan klik pengguna ke berbagai rute pustaka, tools, dan ujian.
  * Memastikan sidebar, topbar, dan mobile navigation beradaptasi responsif dan merender halaman tanpa memicu eror pemuatan Next.js.
* **`dashboard.spec.ts`**:
  * Menguji keberadaan komponen visual dasbor: grafik aktivitas belajar heatmap, daftar misi harian, sisa saldo XP, indikator level, dan popover nama profil pengguna.
* **`study.spec.ts`**:
  * Mensimulasikan alur belajar nyata: pengguna masuk log, membuka menu kelas/kursus, memilih pelajaran, membaca materi Portable Text, menjawab kuis evaluasi hingga lulus, melihat notifikasi penambahan XP, masuk dasbor ulasan SRS, menyelesaikan ulasan, dan memverifikasi data lokal tersinkronisasi tanpa kendala jaringan.
