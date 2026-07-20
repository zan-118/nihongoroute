# PLAN.md — NihongoRoute IA & Navigation Refactor

> Dokumen ini adalah rencana kerja untuk AI coding agent (mis. Claude Code) yang bekerja langsung di repo `nihongoroute`. Setiap fase independen dan bisa di-PR terpisah. Kerjakan berurutan sesuai prioritas. Setelah setiap fase, jalankan `npm run typecheck`, `npm run lint`, `npm run test`, dan `npm run test:e2e` sebelum lanjut ke fase berikutnya.

## Konteks Masalah

Audit UX/IA menemukan dua sumber kebingungan navigasi utama pada aplikasi belajar bahasa Jepang ini:

1. **`/dashboard` dan `/learning-hub` tumpang tindih** — keduanya bersaing sebagai "halaman pertama setelah login". `LearningHubClient.tsx` menampilkan `QUICK_LINKS` (Reading, Listening, Tools, Materi) yang sudah tersedia di sidebar utama, sehingga nilai uniknya hanya rekomendasi (Daily Route, Next Action, Weak Point). Di mobile, masalah ini lebih parah: bottom nav hanya punya 5 slot, dan 2 di antaranya (40%) dipakai untuk dua halaman yang isinya tumpang tindih, sementara Materi/Courses dan Peralatan/Tools — dua area belajar inti — tidak dapat slot sama sekali.
2. **Silang antara `/library`, `/tools`, dan `/exams`** — kartu "Ujian & Sertifikasi" di halaman `/library` mengarah ke `/exams` padahal Exams sudah punya nav item sendiri. Tool "Kamus Terpadu" (`/tools/dictionary`) konseptual tumpang tindih dengan section vocab/kanji/grammar di Library. "Weak Point Trainer" ada sebagai tool tersendiri dan sebagai insight panel di Learning Hub tanpa hierarki sumber kebenaran yang jelas.

Temuan teknis pendukung yang juga perlu dibereskan:

3. `src/lib/core/routes.ts` mengklaim jadi "Single Source of Truth" untuk semua route, tapi namespace `ROUTES.TOOLS` tidak ada — 61+ lokasi memakai string literal `"/tools/..."` manual.
4. Global search di Topbar (`src/lib/tools/tools-search.ts`) hanya meng-index `vocab | grammar | kanji`. Course/lesson, reading, listening, exam, dan tools lain tidak bisa ditemukan lewat search — meskipun semua data ini juga sudah ada di tabel Supabase yang sama (`reading`, `listening`, `lessons`, dll), bukan sumber terpisah.
5. Penamaan folder route `src/app/(main)/tools/*` tidak konsisten 1:1 dengan folder komponen `src/components/features/tools/*` (mis. `conjugation` vs `conjugation-trainer`, `particles` vs `particle-trainer`, `jlpt-drill` vs `jlpt-mini-drill`, `shadowing` vs `shadowing-recorder`).
6. `ROUTES.AUTH.REGISTER: "/register"` didefinisikan di `routes.ts` tapi route-nya tidak pernah dibuat di `src/app` — dead reference.
7. Alias TypeScript `@/lib/*` di-resolve lewat array fallback (`tsconfig.json` → `src/lib/*`, `src/lib/audio/*`, `src/lib/japanese/*`, `src/lib/gamification/*`, `src/lib/learning/*`, `src/lib/tools/*`, `src/lib/core/*`). Saat ini tidak ada collision nama file, tapi ini fragile — file baru dengan nama sama di dua subfolder berbeda akan menyebabkan silent shadowing tanpa error build yang jelas.

---

## FASE 1 — Gabung Dashboard + Learning Hub (PRIORITAS TERTINGGI)

**Tujuan**: satu halaman "Beranda" yang menampilkan progres DAN rekomendasi, menghilangkan satu nav item penuh, membebaskan satu slot di bottom nav mobile.

### 1.1 Audit isi yang harus dipertahankan
- [ ] Baca `src/app/(main)/dashboard/DashboardClient.tsx` dan `src/components/features/dashboard/DashboardTabs.tsx` — dokumentasikan 3 tab yang ada (Home, Progress, Settings) dan komponen anak di tiap tab (`HomePanel`, `ProgressPanel`, `DashboardSettings`, `AchievementsGrid`, `LevelUpOverlay`).
- [ ] Baca `src/components/features/ecosystem/LearningHubClient.tsx`, `DailyRoutePanel.tsx`, `NextActionPanel.tsx`, `LearningTimelinePanel.tsx` — dokumentasikan data source masing-masing (props, hooks, actions yang dipanggil), termasuk `buildWeakPointInsights` dari `@/lib/learning-ecosystem`.
- [ ] Pastikan semua data-fetching (Server Actions, Supabase queries) yang dipakai kedua halaman ini teridentifikasi sebelum memindahkan komponen — jangan hapus logic, hanya reposisi UI.

### 1.2 Restrukturisasi tab Dashboard
- [ ] Ubah `DashboardTabs` agar tab **Home** menampilkan, berurutan dari atas:
  1. Ringkasan stats/XP yang sudah ada di Home saat ini
  2. `NextActionPanel` (rekomendasi aksi berikutnya)
  3. `DailyRoutePanel` (rute belajar harian)
  4. Ringkasan singkat weak-point (`buildWeakPointInsights`), dengan CTA ke `/tools/weak-points` — jangan duplikasi logic, cukup tampilkan ringkasan + link.
- [ ] Pindahkan `LearningTimelinePanel` ke dalam tab **Progress** yang sudah ada, di bawah konten progress existing.
- [ ] **Hapus** rendering `QUICK_LINKS` (Reading/Listening/Tools/Materi) dari komponen manapun — ini murni duplikat sidebar/bottom-nav, tidak perlu dipindah ke Dashboard.
- [ ] Tab **Settings** tetap seperti sekarang, tidak berubah.

### 1.3 Hapus route `/learning-hub`
- [ ] Hapus `src/app/(main)/learning-hub/page.tsx`.
- [ ] Tambahkan redirect di `next.config.ts` (`redirects()` async function) dari `/learning-hub` → `/dashboard` (permanent: true) agar bookmark/link lama tidak 404.
- [ ] Hapus import/pemakaian `LearningHubClient.tsx` yang sudah tidak dipakai. Komponen anak (`DailyRoutePanel`, `NextActionPanel`, `LearningTimelinePanel`) TETAP dipertahankan (dipindah lokasinya atau tetap di `src/components/features/ecosystem/` dan diimpor dari Dashboard).
- [ ] Update `getRouteLabel()` di `src/lib/core/routes.ts` — hapus entry `"learning-hub": "Learning Hub"` jika sudah tidak ada route yang memakainya.
- [ ] Hapus `ROUTES.LEARNING_HUB` dari `src/lib/core/routes.ts` dan cari semua pemakaiannya (`grep -rn "LEARNING_HUB" src`) untuk dibersihkan.

### 1.4 Update navigasi
- [ ] `src/components/layout/hooks/useNavbar.ts` — hapus entry `{ href: ROUTES.LEARNING_HUB, label: "Learning Hub", icon: CustomHubIcon }` dari grup `main`.
- [ ] `src/components/layout/hooks/useMobileNav.ts` — hapus entry `{ href: "/learning-hub", icon: CustomHubIcon, label: "Hub" }` dari `navItems`.
- [ ] Isi slot yang terbebaskan di bottom nav mobile dengan `/courses` (Materi). Urutan baru yang disarankan:
  ```
  Beranda (dashboard) | Materi (courses) | Hafalan (review) | Pustaka (library) | Profil/Masuk
  ```
- [ ] Update `CustomHubIcon` — jika sudah tidak dipakai di tempat lain, tandai untuk dihapus di langkah cleanup akhir (cek dulu `grep -rn "CustomHubIcon" src`).

### 1.5 Update SEO metadata
- [ ] Pastikan `generateMetadata`/`metadata` export di `dashboard/page.tsx` tetap `noIndex: true` (halaman personal, tidak perlu diindeks).
- [ ] Hapus metadata generation untuk `/learning-hub` seiring penghapusan route-nya.
- [ ] Update `src/app/sitemap.ts` jika `/learning-hub` pernah eksplisit dicantumkan (kemungkinan tidak, karena sudah `noIndex`, tapi tetap cek).

### 1.6 Testing
- [ ] Update/hapus test yang mereferensikan `/learning-hub` di `__tests__/` dan `e2e/`.
- [ ] Tambah test baru: memastikan konten Home tab menampilkan `NextActionPanel`, `DailyRoutePanel`, dan ringkasan weak-point.
- [ ] Tambah test navigasi: klik ke `/learning-hub` lama harus redirect ke `/dashboard`.
- [ ] Jalankan `npm run test:e2e` penuh (termasuk mobile project di Playwright config) untuk pastikan bottom nav baru tidak merusak flow auth/navigasi existing.

---

## FASE 2 — Bersihkan Silang Library ↔ Tools ↔ Exams

**Tujuan**: setiap konten/fitur punya satu "rumah" yang jelas; cross-link boleh ada tapi eksplisit dijelaskan, bukan duplikat implisit.

### 2.1 Hapus kartu Exams dari Library
- [ ] Buka `src/lib/constants/library.tsx`, hapus entry dengan `href: "/exams"` (label "Ujian & Sertifikasi") dari array kategori yang dirender di `/library`.
- [ ] Update deskripsi/metadata SEO di `src/app/(main)/library/page.tsx` — hapus penyebutan "simulasi ujian JLPT" dari `description` metadata kalau ada, agar konsisten dengan penghapusan kartu ini.
- [ ] Update `learningResourceJsonLd`/`webPageJsonLd` di halaman Library jika structured data-nya mereferensikan exam sebagai bagian dari library.

### 2.2 Perjelas posisi "Kamus Terpadu"
- [ ] Baca `src/components/features/tools/dictionary/DictionaryPageClient.tsx` dan bandingkan fungsinya dengan `src/app/(main)/library/vocab/page.tsx`, `library/kanji/page.tsx`, `library/grammar/page.tsx`.
- [ ] Ambil keputusan berdasarkan temuan:
  - **Jika fungsinya beda** (mis. Kamus Terpadu = pencarian cepat lintas vocab+kanji+grammar dalam satu kotak, sedangkan Library = halaman detail per kategori dengan konten lebih lengkap): tambahkan 1 baris deskripsi eksplisit di kartu "Kamus Terpadu" pada `src/lib/constants/tools.ts`, contoh: `"Cari cepat lintas kosakata, kanji, dan tata bahasa dalam satu kolom — untuk lihat detail lengkap, buka Pustaka."`
  - **Jika fungsinya sama/redundant**: hapus `/tools/dictionary` sepenuhnya, dan pastikan search box di Tools index mengarahkan ke Library dengan query pre-filled.
- [ ] Dokumentasikan keputusan ini di `docs/` (buat file baru `docs/ia-decisions.md` jika belum ada) supaya tidak jadi ambigu lagi di masa depan.

### 2.3 Satukan sumber kebenaran Weak Point
- [ ] Pastikan `buildWeakPointInsights` (dari `@/lib/learning-ecosystem`, dipakai di Dashboard hasil Fase 1) hanya menampilkan **ringkasan** (mis. 3 kelemahan teratas + CTA), bukan interface latihan penuh.
- [ ] Interaksi/latihan penuh weak-point tetap hanya ada di `/tools/weak-points` (`WeakPointTrainerClient.tsx`). Jangan duplikasi UI latihan di dua tempat.

### 2.4 Testing
- [ ] Update test Library (`__tests__/actions/*` yang relevan) untuk memastikan kartu Exams tidak lagi muncul di response `buildLibraryCategories`.
- [ ] Playwright e2e: pastikan navigasi dari Library ke Exams (kalau masih ada jalur eksplisit lain) tetap berfungsi, dan halaman Library tidak menampilkan kartu Exams lagi.

---

## FASE 3 — Perluas Cakupan Global Search

**Tujuan**: search box di Topbar benar-benar jadi pencarian lintas-aplikasi, bukan cuma dictionary search.

### 3.1 Perluas tipe dan query
- [ ] Buka `src/lib/tools/tools-search.ts`. Perluas `ToolSearchCategory` dari:
  ```ts
  export type ToolSearchCategory = "vocab" | "grammar" | "kanji";
  ```
  menjadi menyertakan kategori baru, minimal: `"lesson" | "reading" | "listening" | "tool"`.
- [ ] Tambahkan fungsi query baru untuk (semua dari Supabase, konsisten dengan pola yang sudah ada di `vocab`/`grammar`/`kanji`):
  - Lesson/course title — query tabel `lessons` (lihat pola existing di `src/actions/lessons.actions.ts`), sertakan `categoryId` dan `slug` untuk membangun href via `ROUTES.COURSES.LESSON`.
  - Reading material title — query tabel `reading` (pola existing di `src/actions/reading.actions.ts`).
  - Listening material title — query tabel `listening` (pola existing di `src/actions/listening.actions.ts`).
  - Nama tools statis dari `src/lib/constants/tools.ts` (ini data lokal, tidak perlu query DB — cukup filter array by nama, cepat dan tanpa network call).
- [ ] Update `ToolSearchResult` interface dan `flattenToolSearchResult()` untuk menyertakan kategori baru.
- [ ] Update `src/components/features/tools/search/SearchModal.tsx` untuk render grup hasil baru (ikon berbeda per kategori: lesson pakai `BookOpen`, reading/listening pakai ikon yang relevan, tools pakai `Wrench` dari lucide-react — sudah dipakai di `LearningHubClient.tsx` sebelumnya, bisa reuse).

### 3.2 Pertimbangkan performa
- [ ] Semua kategori (vocab, grammar, kanji, lesson, reading, listening) sama-sama query ke Supabase — gabungkan jadi satu batch paralel (`Promise.all`) bukan sekuensial, supaya search tidak jadi lambat karena bertambah 3 kategori baru.
- [ ] Pertahankan `dictionaryCache` (Map) yang sudah ada sebagai pola, tapi buat cache terpisah per kategori baru agar tidak saling menimpa.

### 3.3 Testing
- [ ] Tambah unit test di `__tests__/` untuk memverifikasi search query baru mengembalikan hasil dari kategori lesson/reading/listening/tool.
- [ ] Manual test: ketik nama tool (mis. "shadowing") di search box, pastikan muncul di hasil dan link ke `/tools/shadowing` benar.

---

## FASE 4 — Sentralisasi Route Tools (`ROUTES.TOOLS`)

**Tujuan**: `routes.ts` benar-benar jadi single source of truth, sesuai klaim di komentarnya sendiri.

### 4.1 Tambah namespace baru
- [ ] Di `src/lib/core/routes.ts`, tambahkan:
  ```ts
  TOOLS: {
    ROOT: "/tools",
    KANA: "/tools/kana",
    TEXT_ANALYZER: "/tools/text-analyzer",
    CONJUGATION: "/tools/conjugation",
    PARTICLES: "/tools/particles",
    KANJI_SIMILARITY: "/tools/kanji-similarity",
    SENTENCE_BUILDER: "/tools/sentence-builder",
    JLPT_DRILL: "/tools/jlpt-drill",
    COUNTER_TRAINER: "/tools/counter-trainer",
    SHADOWING: "/tools/shadowing",
    DICTATION: "/tools/dictation",
    FLASHCARDS: "/tools/flashcards",
    SURVIVAL: "/tools/survival",
    WEAK_POINTS: "/tools/weak-points",
    DICTIONARY: "/tools/dictionary",
    WRITING: "/tools/writing",
  },
  ```
  (Sesuaikan/hapus entri kalau ada perubahan dari Fase 2.2, mis. `DICTIONARY` dihapus kalau tool itu dihapus.)
- [ ] Tambah juga `ROUTES.REVIEW`, `ROUTES.SETTINGS`, `ROUTES.SHARE`, `ROUTES.SOCIAL` yang saat ini juga masih hardcoded string di `useNavbar.ts` (`"/review"`, `"/settings"`, `"/share"`, `"/social"`), untuk konsistensi penuh.

### 4.2 Refactor pemakaian
- [ ] Jalankan `grep -rn "\"/tools/" src --include=*.tsx --include=*.ts` untuk dapat daftar lengkap 61+ lokasi.
- [ ] Ganti satu per satu (atau via codemod/script sederhana) semua string literal `/tools/xxx` menjadi `ROUTES.TOOLS.XXX`.
- [ ] Ganti hardcoded `"/tools"` (link "Kembali ke Peralatan" yang muncul di banyak *Client.tsx tools) menjadi `ROUTES.TOOLS.ROOT`.
- [ ] Ganti hardcoded `"/review"`, `"/settings"`, `"/share"`, `"/social"` di `useNavbar.ts` dan tempat lain menjadi konstanta `ROUTES` yang baru ditambahkan.

### 4.3 Bersihkan dead reference
- [ ] Hapus `ROUTES.AUTH.REGISTER: "/register"` dari `routes.ts` KECUALI ada rencana konkret membuat route ini — cek dulu dengan `grep -rn "AUTH.REGISTER\|/register" src` apakah benar-benar tidak dipakai di mana pun sebelum menghapus.

### 4.4 Testing
- [ ] `npm run typecheck` harus tetap hijau — perubahan ini murni refactor path constants, tidak boleh mengubah behavior apa pun.
- [ ] `npm run test:e2e` — pastikan semua link internal tools masih mengarah ke path yang sama persis seperti sebelumnya.

---

## FASE 5 — Konsistensi Penamaan Folder (opsional, low priority)

**Tujuan**: nama folder route dan folder komponen fitur 1:1, memudahkan navigasi kode untuk developer baru.

- [ ] Rename folder komponen agar cocok dengan folder route (atau sebaliknya — pilih salah satu arah dan konsisten):
  | Route folder | Komponen folder saat ini | Rename jadi |
  |---|---|---|
  | `tools/conjugation` | `features/tools/conjugation-trainer` | `features/tools/conjugation` |
  | `tools/particles` | `features/tools/particle-trainer` | `features/tools/particles` |
  | `tools/jlpt-drill` | `features/tools/jlpt-mini-drill` | `features/tools/jlpt-drill` |
  | `tools/shadowing` | `features/tools/shadowing-recorder` | `features/tools/shadowing` |
- [ ] Update semua import path yang terpengaruh (`grep -rn "features/tools/conjugation-trainer\|features/tools/particle-trainer\|features/tools/jlpt-mini-drill\|features/tools/shadowing-recorder" src`).
- [ ] Jalankan `npm run typecheck` dan `npm run test` setelah rename untuk pastikan tidak ada import putus.

---

## Urutan Eksekusi & Definition of Done

Kerjakan fase secara berurutan. Jangan mulai fase berikutnya sebelum fase sebelumnya lulus semua checklist testing-nya.

| Fase | Prioritas | Estimasi Kompleksitas | Boleh Ditunda? |
|---|---|---|---|
| 1. Gabung Dashboard + Learning Hub | Tertinggi | Sedang (reorganisasi UI, bukan fitur baru) | Tidak |
| 2. Bersihkan silang Library/Tools/Exams | Tinggi | Rendah | Tidak |
| 3. Perluas Global Search | Sedang | Sedang (query baru + UI) | Boleh, setelah Fase 1-2 |
| 4. Sentralisasi ROUTES.TOOLS | Sedang | Rendah tapi berulang (banyak file) | Boleh, bisa paralel dengan Fase 3 |
| 5. Konsistensi nama folder | Rendah | Rendah | Boleh ditunda tanpa batas waktu |

**Setiap fase dianggap selesai (Definition of Done) jika:**
1. `npm run typecheck` lulus tanpa error baru.
2. `npm run lint` lulus tanpa warning baru.
3. `npm run test` (Vitest) lulus, termasuk test baru yang ditambahkan untuk perubahan tersebut.
4. `npm run test:e2e` (Playwright, desktop + mobile project) lulus.
5. Tidak ada broken link internal (semua route lama yang dihapus punya redirect atau sudah dipastikan tidak direferensikan lagi).
6. Perubahan pada nav (`useNavbar.ts`, `useMobileNav.ts`) sudah diverifikasi manual di viewport mobile (bottom nav) dan desktop (sidebar).

## Batasan & Hal yang TIDAK Boleh Diubah

- Jangan ubah skema database Supabase atau Sanity di fase ini — semua perubahan murni di layer presentasi/routing/navigasi.
- Jangan hapus logic sinkronisasi progres (`useSyncProgress`, `sync_user_progress` RPC) — di luar cakupan plan ini.
- Jangan ubah konvensi Zustand selector (`useUserStore((s) => s.xp)`, dilarang destructure) yang sudah didokumentasikan di README — tetap ikuti pola itu di komponen baru/pindahan.
- Pertahankan semua `generateMetadata`/JSON-LD SEO yang sudah ada di halaman yang tidak disentuh plan ini.
