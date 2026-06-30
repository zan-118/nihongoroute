# Arsitektur Aplikasi NihongoRoute

Dokumen ini menjelaskan struktur runtime utama, pembagian komponen Next.js, manajemen status global luring, serta penanganan cache pada aplikasi NihongoRoute.

---

## 1. Top-Level Runtime Shape

NihongoRoute adalah aplikasi web modern berbasis Next.js App Router yang memisahkan rendering halaman menjadi dua kategori utama:
1. **Server Components (RSC)**: Merender tata letak (layouts), halaman dasar, mengambil metadata dinamis, serta melakukan pembacaan awal data statis/editorial dari Sanity CMS atau database Supabase dengan latensi nol ke server.
2. **Client Components (RCC)**: Diaktifkan secara eksplisit dengan arahan `"use client"`. Digunakan untuk bagian antarmuka interaktif yang membutuhkan akses DOM, penanganan status lokal (state), interaksi suara (audio), canvas menulis kanji, serta sinkronisasi status luring.

Pemuatan awal shell aplikasi diatur oleh:
* **`src/app/layout.tsx`**: Mendefinisikan shell HTML utama, penyedia tema (theme provider), Sonner toaster untuk notifikasi visual, QueryClientProvider untuk TanStack Query, dan skrip pembersihan CacheStorage lama.
* **`src/app/(main)/layout.tsx`**: Membungkus seluruh halaman terautentikasi dengan penyedia progres (`ProgressProvider`) dan tata letak utama (`NavWrapper`).
* **`src/proxy.ts` & `src/lib/supabase/middleware.ts`**: Mengatur penyegaran cookie sesi autentikasi Supabase di setiap permintaan server.

---

## 2. Peta Perutean (Route Map) & Aliran Halaman

Aplikasi memisahkan rute berdasarkan peran akses pengguna:

### 2.1 Rute Publik & Utilitas
* `/` : Landing page statis yang dikomposisi dari komponen Hero, FeatureGrid, dan TrustBanner.
* `/login` & `/forgot-password` & `/update-password` : Antarmuka manajemen otentikasi.
* `/onboarding` : Alur pengenalan dan konfigurasi target awal belajar pengguna.
* `/privacy` & `/terms` : Halaman kepatuhan hukum statis.

### 2.2 Rute Pembelajaran Terautentikasi (Shell `(main)`)
Dibungkus dalam grup rute `(main)` yang tidak muncul di URL. Memuat navigasi sidebar (`Sidebar`), breadcrumbs (`AppBreadcrumbs`), dan bar atas (`Topbar`).
* `/dashboard` : Dasbor performa pengguna yang memuat statistik harian, misi hari ini, dan visualisasi aktivitas heatmap.
* `/courses` -> `/courses/[categoryId]` -> `/courses/[categoryId]/[slug]` : Pembelajaran interaktif berurutan. Pelajaran memuat panel materi (Portable Text Sanity) dan mengevaluasi pemahaman lewat kuis akhir.
* `/library` : Direktori pustaka kamus leksikal (`/vocab`, `/kanji`, `/grammar`) dan materi membaca/mendengar.
* `/exams` & `/exams/[id]` : Bank simulasi ujian JLPT dan mesin ujian interaktif.
* `/review` : Sesi peninjauan ulasan kartu SRS.
* `/tools/*` : Kumpulan utilitas bantu seperti dictation, canvas menulis kanji, permainan survival, dan dek flashcard kustom.

---

## 3. Manajemen Status Global Luring (Offline-First State)

Aplikasi menggunakan **Zustand** sebagai pengelola status di sisi klien dengan dukungan persistensi luring penuh menggunakan **IndexedDB** melalui perantara **`idb-keyval`**.

```text
[ Zustand Active Memory State ]
              ▲
              │ (Persist Middleware / Serializer)
              ▼
    [ IndexedDB Storage ] <--- Diatur via idb-keyval
```

### 3.1 Zustand Stores Utama (`src/store/`)
1. **`useAuthStore`**:
   * Menyimpan properti sederhana `isAuthenticated` (boolean) untuk mempercepat keputusan rendering UI sisi klien sebelum query autentikasi penuh dari server selesai.
2. **`useUserStore`**:
   * Menyimpan progres profil seperti nama, total XP, level saat ini, streak belajar, inventory barang (termasuk item *Streak Freeze*), misi harian yang telah diselesaikan, riwayat pelunasan pelajaran (`completedLessons`), serta antrean pelajaran kotor (`dirtyLessons`).
3. **`useSRSStore`**:
   * Menyimpan seluruh status kartu Spaced Repetition (SRS) kosakata/kanji pengguna dan memelihara daftar ID kartu kotor (`dirtySrs`) untuk proses sinkronisasi awan.
4. **`useUIStore`**:
   * Mengelola preferensi visual antarmuka (tema gelap/terang), penanganan notifikasi in-app, preferensi ukuran font membaca, dan mode suara.

### 3.2 Penanganan Khusus Serialisasi Tipe `Set`
Penyimpanan lokal Zustand menggunakan persistensi JSON bawaan. Namun, JSON tidak mendukung tipe data ES6 `Set` (seperti `dirtyLessons` dan `dirtySrs`). 
Untuk mengatasi hal ini, store dikonfigurasi dengan serializer kustom pada middleware `persist`:
* **Penyimpanan (`setItem`)**: Menggunakan replacer function untuk mengonversi `Set` menjadi array JSON (`Array.from(set)`).
* **Pemuatan (`getItem`)**: Menggunakan reviver function untuk mengonversi kembali array JSON menjadi objek `Set` baru (`new Set(array)`), menjamin type-safety TypeScript saat runtime aplikasi berjalan.

---

## 4. TanStack Query (React Query) Integration

TanStack Query digunakan untuk mematikan latensi pengambilan status sesi secara berulang dan mengelola siklus cache data profil awan:
* **Query `["session"]`**: Membungkus panggilan `supabase.auth.getSession()` dengan caching efisien dan validasi status lewat langganan `onAuthStateChange`.
* **Query `["user-progress"]`**: Memicu pengambilan data profil, pelajaran, dan kartu SRS dari database awan secara paralel hanya jika status user terautentikasi dan store lokal telah selesai terhidrasi dari IndexedDB.
* **Invalidasi Otomatis**: Jika terdeteksi sinyal pembaruan data sukses dari tab lain melalui `BroadcastChannel`, cache Query `["user-progress"]` langsung dibuang sehingga antarmuka antar-tab sinkron secara real-time.
