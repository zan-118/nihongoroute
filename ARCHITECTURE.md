# 🌀 Spesifikasi Arsitektur Sistem NihongoRoute
Dokumen Rujukan Rekayasa Perangkat Lunak | Versi 1.1 (Mei 2026)

---

## 🧭 1. Executive Summary & Visi Teknologi

**NihongoRoute** dikembangkan sebagai ekosistem pembelajaran bahasa Jepang luring-pertama (*offline-first*) berskala enterprise yang tangguh untuk masyarakat Indonesia. Filosofi rekayasa kami berfokus pada penyajian performa zero-latency tanpa hambatan biaya (*zero gatekeeping*) dan terminologi (*language-gap elimination*). 

Dokumen ini merinci arsitektur teknis lengkap, penataan state terdistribusi, protokol sinkronisasi awan, integrasi multi-tab, serta standar keamanan tersemat yang melindungi integritas platform.

```text
               +-------------------------------------------------+
               |                   Visual UI                     |
               |       (Estetika Cyber-Glass, Latency < 16ms)    |
               +-----------------------+-------------------------+
                                       |
                                       v
               +-------------------------------------------------+
               |            Zustand Store (InMemory)             |
               |      (useUserStore, useSRSStore, useUIStore)    |
               +-----------------------+-------------------------+
                                       |
                                       v
               +-------------------------------------------------+
               |             IndexedDB (Local Disk)              |
               |            (idb-keyval Storage Key)             |
               +-----------------------+-------------------------+
                                       | (Debounce & Batching 2s)
                                       v
               +-------------------------------------------------+
               |         useSyncProgress (Sync Orchestrator)     |
               +-----------------------+-------------------------+
                                       |
                                       v
               +-------------------------------------------------+
               |       useCloudMutation (React Query Hook)       |
               +-----------------------+-------------------------+
                                       | (Secure HTTPS POST)
                                       v
               +-------------------------------------------------+
               |      Supabase RPC (sync_user_progress Call)      |
               +-------------------------------------------------+
```

---

## ⚡ 2. Analisis Performa & Matriks Latensi

Untuk mewujudkan kenyamanan belajar berkecepatan tinggi, NihongoRoute mengadopsi taktik **Optimistic-UI** yang sepenuhnya dikendalikan oleh local state. 

Berikut perbandingan analitik performa aliran data lokal vs interaksi awan langsung:

| Tipe Operasi | Lapis Data | Latensi Rata-Rata | Jaminan Ketersediaan | Deskripsi Dampak UI |
| :--- | :--- | :--- | :--- | :--- |
| **Baca/Tulis Instan** | Zustand (In-Memory) | **< 1ms** | 100% (Selalu Tersedia) | Pembaruan instan pada bilah XP, status tombol, dan dialog kuis. |
| **Persistensi Disk** | IndexedDB via `idb-keyval` | **5ms - 15ms** | 99.9% (Browser Storage) | Menjaga progres belajar tetap aman saat peramban ditutup paksa. |
| **Sinkronisasi Awan** | Supabase HTTPS RPC | **150ms - 800ms** | Bergantung pada Sinyal | Berjalan asinkron di latar belakang tanpa memblokir interaksi pengguna. |

---

## 🔄 3. Arsitektur Sinkronisasi 3-Tingkat (3-Tier Sync Protocol)

Protokol sinkronisasi 3-Tingkat dirancang secara matematis untuk menangani perubahan data masif secara efisien dan mencegah *network flooding*.

```text
[Zustand Store]  -- (1. Local Mutation) --> [IndexedDB Storage]
       |
       |  (2. Observasi State Kotor / "Dirty" Marking)
       v
[useSyncProgress]  -- (3. Debounce 2000ms & Batching Payload)
       |
       v
[useCloudMutation]  -- (4. React Query Retries) --> [Supabase RPC Function]
                                                           |
                                                (5. Broadcast SYNC_COMPLETE)
                                                           v
                                                [Semua Tab Ter-invalidate]
```

### Penjelasan Detak Alur Kerja:
1.  **Lapis UI & Lokal (Zustand + IndexedDB)**: 
    Setiap kali pengguna menyelesaikan pelajaran atau menjawab kartu SRS, Zustand store memperbarui datanya seketika dan menambahkan ID kata ke dalam `dirtySrs` atau `dirtyLessons` Set. Keadaan ini langsung disimpan di IndexedDB secara asinkron.
2.  **Lapis Orkestrasi (`useSyncProgress.ts`)**: 
    Hook ini memantau perubahan data profil dan status *dirty* secara pasif. Jika terdeteksi perubahan, ia akan memulai timer *debounce* selama **2000ms**. Jika terjadi perubahan baru sebelum timer habis, timer akan di-reset. Hal ini menghemat bandwidth dan memaketkan (*batching*) puluhan pembaruan menjadi satu paket kiriman tunggal.
3.  **Lapis Mutasi Awan (`useCloudMutation.ts` & RPC)**: 
    Setelah timer debounce matang, data dikirim ke TanStack Query yang bertindak sebagai eksekutor mutasi. React Query mengendalikan percobaan ulang otomatis (*3x automatic retries*) dengan jeda *exponential backoff* apabila koneksi terputus.

---

## 🔒 4. Keamanan Multi-Tab & BroadcastChannel API

Ketika pengguna membuka NihongoRoute di beberapa tab peramban secara bersamaan (misalnya tab 1 belajar Kanji, tab 2 membuka kosakata), rentan terjadi balapan data (*data racing*).

```text
+-----------------------+                    +-----------------------+
|        TAB A          |                    |        TAB B          |
| (Eksekusi Cloud Sync) |                    | (Dengar Sinyal Lokal) |
+-----------+-----------+                    +-----------+-----------+
            |                                            ^
   (Mutasi Berhasil)                              (Sinyal Diterima)
            |                                            |
            v                                            |
   [BroadcastChannel] -- (Kirim "SYNC_COMPLETE") --------+
            |
            v
   [Invalidate Query Cache] ------> [Ambil Data Cloud Terbaru & Hydrate]
```

### Alur Kerja Selaras Tanpa Refresh:
1.  Setelah `useCloudMutation` menerima respon sukses dari Supabase RPC, ia akan menginisialisasi saluran penyiaran lokal:
    ```typescript
    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.postMessage("SYNC_COMPLETE");
    ```
2.  Semua tab aktif lainnya yang sedang berjalan mendengarkan saluran `"nihongoroute_sync"`. Begitu pesan `"SYNC_COMPLETE"` diterima, tab tersebut seketika memicu pembersihan memori sementara kueri (*query cache invalidation*):
    ```typescript
    queryClient.invalidateQueries({ queryKey: ["user-progress"] });
    ```
3.  React Query di tab pasif kemudian memperbarui data profil terbaru dari cloud secara transparan dan melakukan hidrasi/merge ke Zustand store lokal. Siklus ini menjamin data tetap selaras di seluruh tab tanpa menimbulkan tabrakan tulis (*dirty conflict*).

---

## 💎 5. Mesin Ujian & Logika Evaluasi JLPT/JFT-Basic

Seksi ujian (`src/components/features/exams/mock-engine/`) dirancang secara saksama untuk mereplikasi kondisi pengujian riil yang ketat dan menyajikan visual analitik yang presisi.

### 5.1 Lembar Jawaban Interaktif (Answer Sheet Grid)
Answer grid menyajikan ikhtisar navigasi visual interaktif 2D:
*   **Hijau (Active/Filled)**: Soal telah dijawab secara valid.
*   **Amber Berkedip (Warning/Unfilled)**: Soal yang terlewatkan dan memerlukan perhatian.
*   **Abu-abu Gembok (Locked)**: Bagian ujian yang belum dapat diakses sebelum bagian sebelumnya selesai diselesaikan.

### 5.2 Batas Keras Audio Pemahaman Menyimak (Chōkai)
Untuk mencegah kecurangan dan menjaga kepatuhan regulasi ujian internasional:
*   Berkas audio pemahaman menyimak (Chōkai) dibatasi keras hanya dapat diputar **1 (satu) kali**.
*   Sistem melacak status pemutaran secara persisten. Ketika audio selesai diputar atau pengguna sengaja berpindah soal di tengah-tengah pemutaran audio, sistem akan menghentikan pemutaran audio latar belakang secara fisik dan mengunci status audio soal tersebut menjadi `'played'` secara permanen di local state, mencegah pemutaran ulang.

### 5.3 Penilaian Sectional Passing Marks (Maiten)
Sistem penilaian kami tidak hanya mengandalkan akumulasi nilai total, melainkan menerapkan kalkulasi kelulusan sektoral (*Maiten Rule*):
$$\text{Status Kelulusan} = (\text{Skor Total} \ge \text{Batas Lulus Global}) \land \left( \forall s \in \text{Seksi}, \frac{\text{Skor}_s}{\text{Total}_s} \ge 32\% \right)$$
Jika akurasi salah satu bagian materi (Kosa Kata, Tata Bahasa, Membaca, atau Menyimak) berada di bawah ambang batas sektoral $32\%$, pengguna dinyatakan **tidak lulus (FAILED)** demi menjaga standar kualitas kelulusan riil.

---

## 🔌 6. Resolusi Dinamis UUID Kategori & GROQ Asset Coalesce Expansion

Integrasi antara Next.js frontend (Supabase) dan editorial content (Sanity CMS) disokong oleh dua teknologi penanganan data dinamis:

1.  **Resolusi Dinamis UUID Kategori**:
    Sanity CMS menyimpan referensi kategori dalam format UUID Supabase atau string slug (misalnya `"n5"`). Saat melakukan routing detail kuis atau ujian, Server Action `getExamByIdOrSlug` secara cerdas memindai payload kategori. Jika terdeteksi format UUID melalui validasi regex, sistem akan melakukan resolusi asinkron ke tabel `course_categories` Supabase untuk mencari slug-nya terlebih dahulu, mencegah rute putus atau error 404 pada routing klien.
2.  **GROQ Asset Coalesce Expansion**:
    Untuk memastikan komponen pemutar audio luring (`AudioPlayer`) dan visualisasi gambar dapat merender aset multimedia secara instan, kueri GROQ universal kami di `src/lib/queries.ts` melakukan perluasan properti CDN secara dinamis:
    ```groovy
    "audioUrl": coalesce(audioUrl.asset->url, audioUrl),
    "imageUrl": coalesce(imageUrl.asset->url, imageUrl)
    ```
    Mekanisme `coalesce` ini menjamin URL string absolut siap pakai selalu terkirim ke klien, baik saat aset di-host di CDN Sanity maupun referensi eksternal.

---

## 🔒 7. Audit Keamanan & Sanitasi Tersemat

NihongoRoute menerapkan sistem pertahanan berlapis di setiap tingkat aplikasi guna meminimalkan risiko eksploitasi:

*   **Penyaring Serangan Injeksi XSS (`src/lib/sanitize.ts`)**: Seluruh rendering HTML dinamis (misalnya ulasan kuis ujian dan konten tabel contekan interaktif) disaring secara ketat lewat fungsi penyanitasi khusus berbasis ekspresi reguler sebelum disajikan ke komponen visual klien guna menyaring tag berbahaya seperti `<script>`, `<iframe>`, dan event handler pemicu js (`onload`, `onerror`).
*   **Escape SQL Wildcard**: Parameter pencarian teks dinamis (seperti pencarian kamus) di-escape secara otomatis dari karakter database khusus (`%` dan `_`) di tingkat Server Actions guna memblokir eksploitasi beban pencarian PostgreSQL.
*   **Next.js Suspense Boundaries**: Semua halaman klien yang mengonsumsi parameter kueri dinamis via hook `useSearchParams` dibungkus dalam pembatas `<Suspense>` untuk mencegah deoptimisasi build Next.js dan memastikan kelancaran pembuatan halaman statik (*Static Site Generation*).
*   **Keamanan Hidrasi & Penanganan State Klien**: Komponen server dilarang menerima event handler klien (seperti `onClick`) secara langsung pada elemen HTML raw. Seluruh komponen interaktif diekstraksi ke komponen klien terpisah dengan direktif `"use client";`. Inisialisasi state otomatis klien di dalam efek samping wajib dibungkus `requestAnimationFrame` guna menghindari ketidakcocokan DOM hasil pre-render.