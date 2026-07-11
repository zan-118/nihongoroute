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
Pengujian E2E ini dibangun dengan **100% fungsionalitas luring (offline-first)**, menggunakan *API Mocking* (intersepsi `page.route` via `e2e/helpers/mock.ts`) sehingga skenario tidak memukul (hit) database produksi maupun menyalahgunakan kuota API pihak ketiga (Sanity).
* **`auth.spec.ts`**: Menguji keberadaan form masuk/daftar, validasi proteksi rute halaman khusus sesi (seperti pengalihan `/dashboard`), serta ketersediaan beranda publik.
* **`navigation.spec.ts`**: Menguji layout global, responsivitas tema gelap (Dark Mode/Light Mode switch), dan penanganan halaman 404 pada rute yang salah (Not Found).
* **`learning/srs.spec.ts`**: Menangani interaksi kuis flashcard, membalik (flip) kartu, serta asersi fungsionalitas pengisian nilai 'Ingat/Lupa'.
* **`exams/jlpt.spec.ts`**: Menangani navigasi skenario tes JLPT (pemilihan soal, tombol inisialisasi ujian, batas waktu/timer simulasi).
* **`gamification/dashboard.spec.ts`**: Mengevaluasi _render_ visual tingkat level, progress bar XP, visual misi harian (Daily Quests), dan komponen beruntun (Streak/Freeze).
* **`content/lessons.spec.ts`**: Menguji pembacaan materi/artikel (data di-_mock_ dari CMS) serta tombol "Tandai Selesai" dan perubahannya di profil.
* **`tools/dictionary.spec.ts`**: Menguji kapabilitas penelusuran leksikon (Kanji, kosa kata) dan hasil render pembacaan konversi *Furigana*.
* **`community/feed.spec.ts`**: Memastikan linimasa (timeline) sosial komunitas ter-render dengan komponen interaksi standar (contoh: *Like*, *Comment* placeholder).
