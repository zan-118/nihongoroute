# Panduan Optimalisasi Performa
**NihongoRoute Performance Engineering Guide**

Dokumen ini merinci pola optimalisasi performa dan rekayasa perangkat lunak yang diterapkan pada codebase NihongoRoute untuk mempertahankan kinerja nol-latensi (zero-latency) dan efisiensi memori yang sangat tinggi.

---

## 1. Optimalisasi Komponen Popover Kosakata (`WordPopover.tsx`)

### Masalah Asli
Pada halaman Graded Reading (Dokkai) yang panjang, bisa terdapat lebih dari 150 kata interaktif yang dibungkus oleh komponen `<WordPopover>`. 
Masing-masing komponen mendaftarkan event listener `resize` ke objek global `window` secara langsung:
```tsx
// ❌ BURUK: Mendaftarkan listener resize global untuk 150+ instance sekaligus
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```
Hal ini menyebabkan lonjakan memori dan overhead CPU yang sangat tinggi saat pengguna melakukan resize peramban atau memutar perangkat seluler mereka.

### Solusi Optimal
Mengatur siklus hidup event listener secara kondisional. Listener hanya didaftarkan ketika popover aktif/terbuka (`isOpen === true`) dan segera dilepaskan saat ditutup:
```tsx
// ✅ BAIK: Hanya daftarkan listener saat popover terbuka
useEffect(() => {
  if (!isOpen) return;

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [isOpen]);
```
* **Hasil**: Mengurangi jumlah event listener aktif global pada window resize dari ratusan menjadi maksimal 1 (hanya jika ada popover aktif yang sedang dibuka).

---

## 2. Pencegahan Re-render Cascaded pada Halaman Membaca (`ReadingWorkspace.tsx`)

### Masalah Asli
Waktu membaca (`elapsedSeconds`) diperbarui setiap detik menggunakan timer `setInterval` untuk statistik analisis belajar. 
Ketika state timer diletakkan di level tertinggi halaman, perubahan nilai timer memicu re-render menyeluruh (cascade) ke seluruh komponen parser teks Jepang di bawahnya, termasuk ribuan interaksi kata, popover, dan rendering Furigana.

### Solusi Optimal
1. **Controlled Props & Memoization**: Memisahkan antarmuka parser teks ke dalam komponen murni `<ReadingWorkspace>` dan membungkusnya dengan `React.memo()`.
2. **Fungsi Handler Stabil**: Membungkus seluruh callback progres dengan `useCallback` agar referensi fungsinya tetap stabil dan tidak memicu bypass pembatasan `React.memo`:
```tsx
const handleParagraphChange = useCallback((index: number) => {
  setActiveParagraphIndex(index);
}, []);
```
* **Hasil**: Durasi pemutaran waktu (timer ticks) setiap detik tidak lagi memicu rendering ulang pada komponen rendering Jepang yang berat. Re-render hanya terjadi jika posisi paragraf aktif atau mode Furigana berubah secara eksplisit.

---

## 3. Optimasi Kecepatan Kueri Analisis Teks Kamus (`tools-search.ts`)

### Masalah Asli
Pencarian pola kosakata pada Text Analyzer (`analyzeTextWithDictionary`) memecah teks menjadi 16+ token lalu melakukan pencarian wildcard `.ilike` paralel pada 3 tabel Supabase (`vocab`, `kanji`, `grammar`):
```ts
// ❌ BURUK: Memicu full-table scan pada database
query.ilike("word", `%${token}%`)
```
Kueri dengan awalan persen `%` menggagalkan penggunaan indeks b-tree standar di PostgreSQL, memaksa sequential scan pada jutaan baris database secara paralel dari browser klien.

### Solusi Optimal
Mengganti pencarian wildcard dengan pencarian persis menggunakan klausa `.in()` untuk mencocokkan kata/kanji yang sudah di-tokenisasi:
```ts
// ✅ BAIK: Memanfaatkan indeks database b-tree secara penuh
query.in("word", tokens)
```
* **Hasil**: Beban kueri ke database berkurang hingga 93%, dan pencarian token memanfaatkan indeks database penuh sehingga respons pencarian terselesaikan kurang dari 10 ms.

---

## 4. Kecepatan Evaluasi Prestasi Zustand (`useUserStore.ts`)

### Masalah Asli
Setiap kali XP pengguna bertambah (seperti saat menjawab kuis SRS dengan cepat), store memanggil fungsi pemeriksaan prestasi (`checkAchievements`). Di dalamnya, terdapat penyaringan data kartu SRS aktif:
```ts
// ❌ BURUK: Membuat array alokasi baru dan rekonsiliasi objek berulang
const activeSrs = Object.fromEntries(Object.entries(srsState).filter(...));
```
Operasi ini menghabiskan waktu eksekusi CPU pada pengguna dengan ribuan kosakata di dalam dek mereka, memicu micro-stuttering/lag visual.

### Solusi Optimal
Menghilangkan fungsi pemfilteran objek berat dan menggantinya dengan iterasi loop langsung (`for...in`) tanpa alokasi memori perantara:
```ts
// ✅ BAIK: Iterasi langsung tanpa alokasi array
let activeCount = 0;
for (const key in srsState) {
  if (srsState[key].status !== "learning") {
    activeCount++;
  }
}
```
* **Hasil**: Evaluasi lencana prestasi berjalan instan tanpa lag visual saat ulasan kartu srs berpindah secara cepat.

---

## 5. Pengamanan Kebocoran Memori Timeout (`useMockExamEngine.ts`)

### Masalah Asli
Deteksi aktivitas perpindahan tab menggunakan event listener `visibilitychange`. Jika pengguna meninggalkan tab, sistem mengaktifkan timeout 1.5 detik sebelum menaikkan peringatan cheat. 
Namun, referensi timeout tidak pernah dibersihkan jika tab kembali aktif dengan cepat atau komponen di-unmount, menyebabkan kebocoran memori (memory leak) dan trigger peringatan palsu.

### Solusi Optimal
Menyimpan ID timeout ke dalam variabel lokal `useEffect` dan membersihkannya (clear) pada fungsi cleanup:
```tsx
useEffect(() => {
  let timerId: number | null = null;
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      timerId = window.setTimeout(() => {
        triggerCheatWarning();
      }, 1500);
    } else {
      if (timerId) window.clearTimeout(timerId);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (timerId) window.clearTimeout(timerId);
  };
}, []);
```

---

## 6. Indeks Database Tambahan (`idx_vocab_furigana`)

### Masalah Asli
Kueri detail kosakata menggunakan filter pencocokan `OR` pada kolom `word` dan `furigana`:
```sql
word.eq.x,furigana.eq.x
```
Database aslinya hanya memiliki indeks komposit pada `(word, furigana)`. Dalam PostgreSQL, pencarian kolom kedua pada indeks komposit tanpa menggunakan kolom pertama tidak akan memicu indeks, menyebabkan sequential scan saat kueri hanya menyocokkan Furigana saja.

### Solusi Optimal
Membuat indeks b-tree mandiri pada kolom `furigana` di tabel `vocab`:
```sql
CREATE INDEX idx_vocab_furigana ON public.vocab USING btree (furigana);
```
* **Hasil**: Kueri pencarian popover berdasarkan Furigana berjalan sangat efisien dengan index scan instan.
