# Indeks Dokumentasi Teknis NihongoRoute

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 12 Agustus 2026  
> **Ruang Lingkup**: Arsitektur, Skema Database, API, Keamanan, UI Design System, dan Operational Runbook

---

## 🗺️ Struktur & Peta Dokumen Teknis

Seluruh dokumentasi teknis mendalam tersimpan di direktori `docs/` dan dikategorikan berdasarkan domain pembahasan:

| No | Dokumen | Deskripsi | Target Pembaca |
|:---:|---|---|---|
| 01 | [OVERVIEW.md](OVERVIEW.md) | Visi produk, latar belakang, target pengguna, dan arsitektur fitur utama. | Semua Kontributor / PM / Dev |
| 02 | [GETTING_STARTED.md](GETTING_STARTED.md) | Panduan langkah demi langkah setup lingkungan pengembang lokal. | Kontributor / Pengembang Baru |
| 03 | [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system design, data flow 3-tier (State - Cache - Cloud), & pilihan stack. | System Architect / Senior Dev |
| 04 | [DATA_MODEL.md](DATA_MODEL.md) | Spesifikasi 28 tabel Supabase, ERD, RLS policies, triggers, RPC, dan storage buckets. | Backend / Database Engineer |
| 05 | [API_REFERENCE.md](API_REFERENCE.md) | Spesifikasi API Route Handlers & Server Actions (method, payload, response shape). | Fullstack Engineer |
| 06 | [CONFIGURATION.md](CONFIGURATION.md) | Matrix Environment Variables (publik vs rahasia server) & status opsional/wajib. | DevOps / Fullstack Engineer |
| 07 | [SECURITY.md](SECURITY.md) | Threat model, kebijakan RLS, proteksi token/secret, verifikasi webhook, & anti-cheat XP. | Security / Backend Engineer |
| 08 | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Token warna, tipografi, radius, anti-pattern checklist, dan signature UI elements. | UI/UX / Frontend Engineer |
| 09 | [DEPLOYMENT.md](DEPLOYMENT.md) | Ops Runbook: Pipeline CI/CD GitHub Actions, revalidation matrix, & release checklist. | DevOps / Release Engineer |
| 10 | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Panduan penanganan masalah umum (Kuroshiro, TTS, offline sync, health check). | Fullstack / QA Engineer |
| 11 | [CONTRIBUTING.md](CONTRIBUTING.md) | Standar TypeScript, konvensi CSS, alur Git, siklus migrasi SQL, dan commit convention. | Seluruh Kontributor |
| 12 | [ADR.md](ADR.md) | Architecture Decision Records (Context → Decision → Consequences). | System Architect / Tech Lead |

---

## 🔗 Dokumentasi Tingkat Root (Root-Level Docs)

- 📌 **[README.md](../README.md)** — Pintu masuk utama proyek.
- 🤝 **[CONTRIBUTING.md](../CONTRIBUTING.md)** — Alur kontribusi open-source & standar PR.
- 📄 **[LICENSE](../LICENSE)** — Lisensi open-source proyek (MIT).
- 📜 **[CHANGELOG.md](../CHANGELOG.md)** — Histori rilis dan perubahan fitur.
- 🗺️ **[ROADMAP.md](../ROADMAP.md)** — Rencana pengembangan fitur jangka panjang.

---

> [!IMPORTANT]
> Setiap pembaruan pada logika bisnis, skema database, atau alur data **WAJIB** memperbarui dokumen `docs/*.md` terkait sebagai bagian dari deliverable tugas tersebut.
