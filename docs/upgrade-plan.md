# Roadmap Upgrade Major (Tahap Lanjutan)

Dokumen ini merangkum rencana pembaruan pustaka utama (major dependencies) yang akan dilakukan setelah semua refactoring arsitektur selesai. Hal ini penting agar NihongoRoute tetap menggunakan teknologi mutakhir, berkinerja tinggi, dan aman.

## 1. Upgrade ESLint ke Flat Config (v9)
Mulai versi 9, ESLint menggunakan *Flat Config* secara default (`eslint.config.js`). 
- **Langkah-langkah**:
  1. Hapus `.eslintrc.js` atau `.eslintrc.json`.
  2. Buat `eslint.config.js`.
  3. Gunakan `@eslint/js` dan `typescript-eslint` versi terbaru yang mendukung *Flat Config*.
  4. Migrasikan *plugins* Next.js ke struktur *Flat Config* (mungkin memerlukan *compat utility* jika `@next/eslint-plugin-next` belum mendukung penuh).

## 2. Upgrade TypeScript ke versi 5.x
- **Langkah-langkah**:
  1. Jalankan `npm install typescript@latest --save-dev`.
  2. Tinjau kembali `tsconfig.json`, khususnya pada opsi `moduleResolution: "bundler"` yang direkomendasikan untuk Next.js.
  3. Jalankan `npm run typecheck` secara menyeluruh dan perbaiki *breaking changes* (jika ada).

## 3. Evaluasi Testing Library dan Vitest
- **Langkah-langkah**:
  1. Upgrade `vitest` dan `@testing-library/react`.
  2. Pastikan integrasi dengan *Next.js App Router* dan *React Server Components* (RSC) sudah tertangani dengan baik dalam skenario pengujian.
  3. Pertimbangkan penggunaan *Playwright* untuk E2E menggantikan *mock* komponen yang rumit.

## 4. Node Fetch vs Native Fetch
- **Langkah-langkah**:
  1. Karena *environment* sudah menggunakan Node.js 22, dukungan `fetch` API secara *native* sudah matang.
  2. Cari dan hapus semua penggunaan pustaka eksternal seperti `node-fetch` atau `axios` jika ada, lalu ganti dengan *native* `fetch`.
  3. Sesuaikan konfigurasi *caching* (`cache: 'no-store'`) untuk pola pengambilan data di Server Actions.
