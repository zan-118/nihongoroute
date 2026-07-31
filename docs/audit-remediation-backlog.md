# NihongoRoute Audit Remediation Backlog

> **Deployment gate:** rilis berikutnya sebaiknya dianggap **NO-GO** sampai seluruh item P0 selesai dan memiliki test otomatis.
>
> Catatan: seluruh 28 tabel sudah mengaktifkan RLS. Risiko utamanya berasal dari policy yang terlalu permisif dan jalur penulisan data yang melewati validasi anti-cheat.

## Top 20 Masalah Paling Kritis

| ID | Prioritas | Status | Masalah | Bukti | Perbaikan minimum |
|---|---|---|---|---|---|
| SEC-01 | **P0 Critical** | Terbuka | Anti-cheat dapat dilewati dengan menulis `profiles.xp` secara langsung | `supabase/migrations/20260620130000_initial_schema.sql:983`, `src/lib/supabase/sync.ts:91` | Cabut direct update untuk `xp`, `level`, `streak`, dan `inventory`; semua perubahan gamifikasi wajib melalui RPC tervalidasi |
| SEC-02 | **P0 Critical** | Terbuka | RPC mempercayai achievement ID dari client; ID buatan yang mengandung tier dapat menghasilkan XP | `supabase/migrations/20260620130000_initial_schema.sql:680` | Hitung achievement dari fakta database/server, bukan `p_inventory` |
| SEC-03 | **P0 Critical** | Terbuka | XP lesson dan SRS dihitung dari jumlah elemen JSON yang dikirim client | `supabase/migrations/20260620130000_initial_schema.sql:662`, `supabase/migrations/20260620130000_initial_schema.sql:671` | Validasi ID, status sebelumnya, dan transisi sah; gunakan event atau ledger idempotent |
| SEC-04 | **P0 Critical** | Terbuka | Client dapat mengganti tanggal untuk mereset cap 150 XP | `supabase/migrations/20260620130000_initial_schema.sql:710` | Gunakan tanggal database dengan timezone yang ditetapkan; jangan menerima tanggal cap dari client |
| SEC-05 | **P0 Critical** | Terbuka | RPC tidak mengunci row profil; request paralel dapat menghasilkan lost update atau cap tidak konsisten | `supabase/migrations/20260620130000_initial_schema.sql:655` | Jalankan kalkulasi dalam transaksi dengan row lock atau atomic ledger/upsert |
| SEC-06 | **P0 High** | Terbuka | Delta XP negatif tidak ditolak seperti klaim dokumentasi; hanya diubah menjadi nol | `supabase/migrations/20260620130000_initial_schema.sql:657`, `docs/security.md:100` | Gunakan `RAISE EXCEPTION` untuk nilai XP regresif atau request tidak valid |
| PAY-01 | **P0 Critical** | **Selesai** | Kedua webhook sebelumnya fail-open jika secret tidak terpasang | `src/app/api/webhooks/saweria/route.ts`, `src/app/api/webhooks/trakteer/route.ts` | Sudah fail-closed dengan respons `503` dan test otomatis |
| PAY-02 | **P0 Critical** | Terbuka | Tidak ada idempotency atau replay protection untuk donasi | `src/app/api/webhooks/saweria/route.ts`, `src/app/api/webhooks/trakteer/route.ts` | Simpan `provider_event_id`; tambahkan unique constraint `(source, provider_event_id)` |
| PAY-03 | **P0 High** | **Selesai** | Saweria sebelumnya mengizinkan fallback secret melalui query parameter atau body | `src/app/api/webhooks/saweria/route.ts` | Fallback dihapus; signature HMAC raw body sekarang wajib |
| PAY-04 | **P0 High** | Parsial | Trakteer masih memakai static header token tanpa raw-body signature | `src/app/api/webhooks/trakteer/route.ts` | Body token sudah ditolak; masih perlu mekanisme signature resmi provider dan pemisahan endpoint ping |
| PAY-05 | **P0 High** | **Selesai** | Payload donasi sebelumnya tidak memakai schema dan nominal tidak dibatasi | `src/app/api/webhooks/saweria/route.ts`, `src/app/api/webhooks/trakteer/route.ts` | Zod, finite amount, batas nominal, panjang string, dan transaction ID sudah diterapkan |
| TEST-01 | **P0 High** | Parsial | Coverage webhook belum mencakup replay dan duplicate event | `__tests__/api/webhooks/saweria.test.ts`, `__tests__/api/webhooks/trakteer.test.ts` | Invalid/missing secret, signature/token, malformed dan overflow sudah dites; replay/idempotency masih terbuka |
| TEST-02 | **P0 High** | Terbuka | `sync_user_progress` tidak pernah dieksekusi terhadap database test | `__tests__/hooks/useSyncProgress.test.tsx:5` | Tambahkan integration test Postgres untuk negatif, cap, fake achievement, dan concurrent calls |
| RLS-01 | **P1 High** | Terbuka | Semua profil dapat dibaca publik, termasuk XP, study history, inventory, dan settings | `supabase/migrations/20260620130000_initial_schema.sql:27`, `supabase/migrations/20260620130000_initial_schema.sql:981` | Buat public projection/view dengan kolom minimal; profile lengkap hanya owner |
| RLS-02 | **P1 High** | Terbuka | Tabel dengan status publish/draft masih memiliki policy `USING (true)` | `supabase/migrations/20260620130000_initial_schema.sql:1005` | Gunakan `is_published = true` atau `status = 'published'`; audit kolom internal seperti `audit_log` |
| RLS-03 | **P1 High** | Terbuka | Data supporter dapat dibaca publik secara penuh | `supabase/migrations/20260620130000_initial_schema.sql:1014` | Sediakan public donor-wall view yang meminimalkan nama/message/amount dan mendukung opt-out |
| DEP-01 | **P0 High** | **Selesai** | Next dan dependency internal sebelumnya memiliki known vulnerability | `package.json`, `package-lock.json` | Next stack `16.2.12`; PostCSS `8.5.23`; Sharp `0.35.3`; production audit bersih |
| API-01 | **P1 High** | Parsial | Cards, furigana, dan TTS belum memakai Zod atau memiliki direct test | `src/app/api` | Webhook selesai; endpoint lain masih membutuhkan schema, batas input, dan contract tests |
| API-02 | **P1 High** | Terbuka | TTS dan furigana publik tidak memiliki rate limiting | `src/app/api/tts/route.ts:60`, `src/app/api/furigana/route.ts:116` | Tambahkan IP/user rate limit, timeout, payload cap, dan observability |
| TEST-03 | **P1 High** | Terbuka | E2E exam dan gamification hanya smoke test, tanpa race atau alur nyata | `e2e/exams/jlpt.spec.ts:6`, `e2e/gamification/dashboard.spec.ts:5` | Test double-submit, multi-tab sync, concurrent XP, refresh/resume, dan offline reconciliation |

## Quick Wins

Pekerjaan berikut relatif kecil tetapi memberi pengurangan risiko besar:

- [x] Upgrade `next`, `eslint-config-next`, `@next/third-parties`, dan `@next/bundle-analyzer` ke `16.2.12`.
- [x] Upgrade `react` dan `react-dom` bersama-sama ke patch `19.2.8`.
- [x] Hapus override React/types yang sudah tidak memiliki peer conflict. Override baru hanya digunakan untuk patch keamanan PostCSS/Sharp milik Next.
- [x] Ubah webhook menjadi fail-closed ketika secret tidak tersedia.
- [x] Hapus fallback Saweria melalui `?secret=` dan `body.secret`.
- [x] Tambahkan Zod untuk kedua payload webhook, termasuk finite number, batas nominal, dan panjang string.
- [x] Simpan transaction ID provider dan tambahkan unique constraint untuk menolak duplikasi.
- [x] Tambahkan test duplicate transaction. Test invalid signature dan missing secret sudah selesai.
- [x] Hapus direct dependency `@eslint/eslintrc`; lint lulus tanpa dependency tersebut.
- [x] Hapus `node-fetch` yang tidak digunakan; typecheck dan build lulus.
- [x] Hapus `@lhci/cli` yang tidak memiliki script/config pemakaian dan membawa dependency dev rentan.
- [x] Tambahkan batas jumlah ids pada /api/cards dan batas panjang text pada /api/furigana.
- [x] Tambahkan minimum coverage threshold awal di Vitest, lalu naikkan bertahap.
- [x] Ganti smoke assertion `body.toBeVisible()` dengan satu alur exam dan satu alur XP yang benar-benar menyimpan state.

## Technical Debt Jangka Panjang

### Gamification dan Progress Ledger

Model sekarang menyinkronkan snapshot client (`xp`, inventory, lesson, dan SRS) ke server. Untuk sistem anti-cheat, arsitektur ini perlu diganti dengan event yang dapat diverifikasi:

- Server menyimpan event seperti `lesson_completed`, `srs_reviewed`, dan `achievement_awarded`.
- Setiap event memiliki idempotency key.
- XP dihitung dari event server-side, bukan total XP yang dikirim client.
- Daily cap menggunakan tanggal database dan timezone eksplisit.
- Reward, pembelian inventory, dan XP berada dalam transaksi yang sama.
- Audit trail memungkinkan investigasi akun dan rollback.

### Konsolidasi Sinkronisasi Data

Saat ini terdapat beberapa jalur yang bersaing:

- `sync_user_progress` melalui mutation.
- Legacy `syncLocalToCloud()` yang menulis tabel langsung.
- TanStack Query menyimpan server state.
- Zustand/IndexedDB menyimpan salinan XP, SRS, lesson, dan dirty flags.
- `BroadcastChannel` melakukan rekonsiliasi lintas tab.

Roadmap perlu menetapkan satu source of truth, aturan conflict resolution, versioning payload, dan mekanisme offline queue yang idempotent.

### Pemisahan Business Logic

Server Actions terlalu besar dan memuat orchestration, parsing, query, transformasi, serta business rules sekaligus:

- `lessons.actions.ts`: sekitar 945 baris.
- `tools-integration.actions.ts`: sekitar 881 baris.
- `jlpt-exams.actions.ts`: sekitar 720 baris.
- `community.actions.ts`: sekitar 542 baris.

Pindahkan logic reusable ke service/domain module di `src/lib`; action hanya menangani auth, validasi input, pemanggilan service, dan serialisasi hasil.

### Strategi Testing

- 15 dari 18 Server Action tidak memiliki direct unit test.
- Sekitar 30 file `src/lib` tidak memiliki direct test.
- Tidak ada direct API test untuk enam Route Handler.
- Tidak ada database test untuk RLS maupun RPC.
- Exam dan gamification E2E hanya memeriksa halaman tidak crash.
- CI satu worker tidak memberi tekanan concurrency.
- Belum ada coverage provider atau threshold.

Roadmap testing perlu mencakup unit, Route Handler contract tests, Supabase integration tests, RLS matrix tests, dan Playwright multi-context/multi-tab tests.

### RLS dan Data Exposure

Walaupun semua 28 tabel sudah RLS ON, perlu audit berdasarkan data classification:

- Public content.
- Published-only content.
- Owner-only progress.
- Public-profile projection.
- Donation data dan consent.
- Admin-only operational data.
- Hak `EXECUTE` untuk seluruh `SECURITY DEFINER` function di schema `public`.

### Toolchain dan Dependency Lifecycle

Buat jadwal rutin untuk:

- Patch Next/React setiap security release.
- Menjalankan `npm audit --omit=dev` sebagai deploy gate.
- Upgrade ESLint 9 ke 10 secara terpisah.
- Evaluasi TypeScript 5 ke 7 sebagai migration project.
- Menyesuaikan `@types/node` dengan Node runtime production.
- Menangani dependency pre-1.0 seperti `@supabase/ssr` dengan regression test auth.

## Urutan Perbaikan

### Tahap 1 - Wajib Sebelum Deploy Berikutnya

- [x] Patch Next stack ke `16.2.12`.
- [x] Tutup direct update terhadap `profiles.xp`, `level`, `streak`, dan inventory gamifikasi.
- [x] Nonaktifkan atau hapus jalur legacy `syncLocalToCloud()` yang melakukan direct profile upsert.
- [x] Perbaiki RPC agar memakai tanggal server, menolak delta negatif, dan mengunci row.
- [x] Hentikan pemberian XP berdasarkan array atau achievement ID dari client.
- [x] Jadikan kedua webhook fail-closed.
- [x] Hapus fallback secret Saweria.
- [x] Tambahkan idempotency transaction ID untuk donasi.
- [x] Tambahkan Zod pada payload webhook.
- [x] Tambahkan integration test minimum untuk webhook dan anti-cheat.

### Tahap 2 - Sebelum Fitur Donasi/XP Diaktifkan Penuh

- [x] Implementasikan XP event ledger yang idempotent.
- [x] Tambahkan test concurrent RPC.
- [ ] Tambahkan replay-window/timestamp verification webhook.
- [x] Audit data donasi lama untuk kemungkinan duplikasi.
- [x] Tambahkan logging keamanan tanpa mencatat secret atau payload sensitif.
- [x] Tambahkan alert untuk lonjakan XP dan webhook duplicate/invalid.

### Tahap 3 - Hardening Setelah Blocker Tertutup

- [ ] Sempitkan public profile dan supporter policies.
- [x] Terapkan published-only policy pada seluruh content dengan draft state.
- [ ] Tambahkan rate limit API.
- [ ] Tambahkan API contract tests.
- [ ] Bangun E2E exam/gamification yang menggunakan multi-tab dan concurrent requests.
- [x] Tambahkan `npm audit --omit=dev`, migration check, RLS tests, dan coverage threshold ke CI.

### Tahap 4 - Roadmap Refactor

- [x] Konsolidasikan Zustand, TanStack Query, dan offline sync.
- [x] Pecah Server Actions besar menjadi domain services.
- [x] Abstraksikan utility trainer yang berulang.
- [x] Hapus dead dependencies/exports dan tetapkan aturan naming.
- [x] Rencanakan upgrade major ESLint, TypeScript, Testing Library, dan `node-fetch`.

## Definition of Done untuk Deploy

Deploy baru dianggap aman ketika:

- [x] `npm audit --omit=dev` tidak memiliki high/critical vulnerability.
- [x] User biasa tidak dapat mengubah XP/inventory melalui direct Supabase update.
- [x] Fake achievement, fake lesson, dan fake SRS payload tidak menghasilkan XP.
- [x] Request paralel tidak dapat melampaui daily cap.
- [ ] Webhook tanpa signature atau secret valid selalu ditolak.
- [x] Event donasi yang sama hanya diproses sekali.
- [x] Test unit, typecheck, lint, build, webhook integration, dan database anti-cheat lulus.
- [ ] RLS test membuktikan anon/authenticated tidak dapat membaca atau mengubah data di luar haknya.

