/**
 * @file rate-limit.ts
 * @description In-memory rate limiter sederhana untuk API Routes. 
 * Catatan: Di lingkungan Serverless (Vercel), ini akan berjalan per-instance (isolat), 
 * sehingga tidak menjamin batasan absolut secara global, tetapi cukup efektif 
 * menahan burst (DDoS sederhana) pada satu instance.
 */

interface RateLimitInfo {
 count: number;
 resetTime: number;
}

const store = new Map<string, RateLimitInfo>();

/**
 * Rate Limiter sederhana.
 * @param key Identifier unik (misal: IP address atau token)
 * @param limit Jumlah maksimal request yang diperbolehkan
 * @param windowMs Jendela waktu dalam milidetik (misal: 10000 untuk 10 detik)
 * @returns boolean true jika dilimit (melebihi batas), false jika lolos
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
 const now = Date.now();
 const info = store.get(key);

 if (!info) {
 store.set(key, { count: 1, resetTime: now + windowMs });
 return false; // Lolos
 }

 // Jika waktu reset sudah terlewat, mulai ulang jendela
 if (now > info.resetTime) {
 store.set(key, { count: 1, resetTime: now + windowMs });
 return false; // Lolos
 }

 // Jika belum terlewat, tambah count
 info.count += 1;
 store.set(key, info);

 // Periksa apakah melebihi limit
 if (info.count > limit) {
 return true; // Ditolak (Rate limited)
 }

 return false; // Lolos
}

/**
 * Membersihkan data yang sudah kedaluwarsa secara berkala
 * untuk menghindari memory leak pada server berumur panjang.
 */
function cleanup() {
 const now = Date.now();
 for (const [key, info] of store.entries()) {
 if (now > info.resetTime) {
 store.delete(key);
 }
 }
}

// Bersihkan setiap 1 menit
if (typeof setInterval !== 'undefined') {
 setInterval(cleanup, 60000).unref?.();
}
