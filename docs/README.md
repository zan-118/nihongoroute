# Dokumentasi Teknis NihongoRoute

> Terakhir diperbarui: 31 Juli 2026 — Sinkronisasi penuh dengan codebase aktual.

---

## Daftar Dokumen

| No | Dokumen | Deskripsi |
|----|---------|-----------|
| 1 | [Overview Proyek](overview.md) | Latar belakang, masalah yang diselesaikan, target pengguna, dan tech stack lengkap. |
| 2 | [Arsitektur Sistem](architecture.md) | Diagram komponen, alur sinkronisasi progres 3-tier, alur TTS, dan keputusan desain arsitektural. |
| 3 | [Panduan Memulai](getting-started.md) | Prasyarat, instalasi, konfigurasi environment, dan menjalankan server pengembangan. |
| 4 | [Konfigurasi Sistem](configuration.md) | Daftar lengkap environment variables dan file konfigurasi proyek. |
| 5 | [Referensi API](api-reference.md) | Spesifikasi 7 API Route Handlers aktif: method, parameter, payload, dan respons. |
| 6 | [Model Data & Database](data-model.md) | Spesifikasi seluruh 28 tabel PostgreSQL, diagram ERD, triggers, RPC functions, dan storage buckets. |
| 7 | [Deployment & CI/CD](deployment.md) | Pipeline GitHub Actions, release checklist, dan strategi cache/revalidasi. |
| 8 | [Keamanan](security.md) | Kebijakan kredensial, proteksi admin API, verifikasi webhook, RLS, dan anti-cheat XP. |
| 9 | [Troubleshooting](troubleshooting.md) | Panduan penanganan masalah umum: Kuroshiro, Edge TTS, sinkronisasi offline, dan health check. |
| 10 | [Panduan Kontribusi](contribution.md) | Standar TypeScript, konvensi CSS, alur Git, siklus migrasi SQL, dan commit convention. |
| 11 | [Design System](design-system.md) | Token warna, tipografi, radius, efek permukaan, anti-pattern checklist, dan elemen khas. |
| 12 | [Keputusan Arsitektur Informasi](ia-decisions.md) | Catatan keputusan IA: Pustaka vs Kamus, halaman Ujian. |

---

> Jika ada pembaruan pada logika bisnis, skema database, atau alur data — perbarui dokumen terkait sebagai bagian dari deliverable tugas tersebut, bukan tugas terpisah.
