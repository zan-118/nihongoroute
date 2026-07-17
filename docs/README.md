# Indeks Dokumentasi Teknis NihongoRoute

Dokumentasi ini digenerate otomatis dari analisis source code pada 17 Juli 2026.

Selamat datang di direktori dokumentasi teknis **NihongoRoute**. Seluruh dokumen di bawah ini disusun berdasarkan analisis mendalam terhadap basis kode aktif, arsitektur luring, skema database Supabase, dan API backend.

---

## 📚 Daftar Berkas Dokumentasi

1. **[Overview Proyek (overview.md)](file:///c:/nihongoroute/docs/overview.md)**
   - Latar belakang proyek, masalah yang diselesaikan, target audiens pengguna, dan spesifikasi lengkap seluruh tech stack beserta versinya dari `package.json`.

2. **[Arsitektur Sistem (architecture.md)](file:///c:/nihongoroute/docs/architecture.md)**
   - Diagram arsitektur sistem (Mermaid), request lifecycle, dan penjelasan mendalam mengenai alur sinkronisasi progres luring 3 tingkat (*Zustand ↔ Debouncing ↔ RPC sync_user_progress*).

3. **[Panduan Memulai (getting-started.md)](file:///c:/nihongoroute/docs/getting-started.md)**
   - Prasyarat runtime (Node.js 20+), langkah instalasi & setup lokal, validasi berkas migrasi database, serta panduan pengujian (Vitest & Playwright).

4. **[Konfigurasi Sistem (configuration.md)](file:///c:/nihongoroute/docs/configuration.md)**
   - Tabel lengkap seluruh variabel lingkungan (`.env.example`), tipe data, batasan keamanan (`NEXT_PUBLIC_` vs server-only), dan peruntukannya.

5. **[Referensi API & Rute Server (api-reference.md)](file:///c:/nihongoroute/docs/api-reference.md)**
   - Spesifikasi 9 API Route Handlers aktif (`/api/tts`, `/api/furigana`, `/api/health`, `/api/cards`, `/api/webhooks/*`, `/api/admin/*`, `/auth/callback`), metode HTTP, otentikasi, dan skema payload.

6. **[Model Data & Database (data-model.md)](file:///c:/nihongoroute/docs/data-model.md)**
   - Spesifikasi detail seluruh 26 tabel database PostgreSQL, foreign key, trigger integritas level/SRS, diagram ERD Mermaid, dan kalkulasi matematis anti-cheat XP guard.

7. **[Deployment & Operasional (deployment.md)](file:///c:/nihongoroute/docs/deployment.md)**
   - Strategi kompilasi standalone Next.js 16, pipeline CI/CD GitHub Actions, release gates checklist, dan aturan revalidasi path tanpa cache berbasis waktu.

8. **[Keamanan & Kepatuhan (security.md)](file:///c:/nihongoroute/docs/security.md)**
   - Batas keamanan kredensial, proteksi admin API via header Bearer token, verifikasi tanda tangan webhook timing-safe HMAC SHA256, dan checklist RLS.

9. **[Troubleshooting & FAQ (troubleshooting.md)](file:///c:/nihongoroute/docs/troubleshooting.md)**
   - Panduan penanganan kendala umum: inisialisasi kamus Kuroshiro, dynamic Edge TTS connection timeout dengan fallback Web Speech API, dan resolusi konflik offline sync.

10. **[Panduan Kontribusi (contribution.md)](file:///c:/nihongoroute/docs/contribution.md)**
    - Standar penulisan TypeScript ketat, konvensi desain token UI, alur branch Git, Conventional Commits, serta 5 langkah siklus hidup migrasi SQL (*migration folding*).

---

*Catatan: Jika ada pembaruan pada logika bisnis atau skema basis data di masa mendatang, lakukan pembaruan dokumen terkait pada folder ini secara berkala.*
