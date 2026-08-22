/**
 * @file loading.tsx
 * @description Komponen pemuat (Loading Skeleton) untuk halaman dasbor pengguna NihongoRoute.
 */

// IMPOR

import { Skeleton } from "@/components/ui/skeleton";

// EKSEKUSI UTAMA

/**
 * Komponen kerangka pemuatan (Skeleton) untuk halaman Dasbor.
 * Menampilkan tata letak penampung data visual saat proses memuat data dari database Supabase.
 * 
 * @returns {JSX.Element} Antarmuka kerangka dasbor yang sedang memuat.
 */
export default function DashboardLoading() {
 return (
 // Kontainer utama halaman dengan batas lebar maksimum dan padding responsif
 <div className="w-full min-h-screen bg-transparent relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
 <div className="max-w-7xl mx-auto pt-16 space-y-12">
 {/* Kerangka Pemuatan Header Hero */}
 <div className="flex flex-col lg:flex-row gap-12 items-center">
 {/* Placeholder teks untuk lencana, judul utama, dan subjudul */}
 <div className="flex-1 space-y-4 w-full">
 <Skeleton className="h-6 w-32 rounded-full" />
 <Skeleton className="h-16 w-3/4 md:w-96" />
 <Skeleton className="h-4 w-1/2 md:w-64" />
 </div>
 {/* Placeholder visual untuk ilustrasi atau media di sisi kanan */}
 <Skeleton className="h-[280px] w-full lg:w-[400px] rounded-lg" />
 </div>

 {/* Kerangka Pemuatan Grid Bento */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
 {/* Kolom utama kiri untuk statistik atau grafik utama */}
 <div className="md:col-span-8">
 <Skeleton className="h-[250px] w-full rounded-lg" />
 </div>
 {/* Kolom kanan untuk daftar aktivitas atau widget kecil */}
 <div className="md:col-span-4 space-y-6">
 <Skeleton className="h-[110px] w-full rounded-lg" />
 <Skeleton className="h-[110px] w-full rounded-lg" />
 </div>

 {/* Kerangka Pemuatan Sub-Komponen (Tiga kartu sejajar) */}
 <div className="md:col-span-4">
 <Skeleton className="h-[400px] w-full rounded-lg" />
 </div>
 <div className="md:col-span-4">
 <Skeleton className="h-[400px] w-full rounded-lg" />
 </div>
 <div className="md:col-span-4">
 <Skeleton className="h-[400px] w-full rounded-lg" />
 </div>
 
 {/* Placeholder lebar penuh untuk tabel data atau riwayat panjang */}
 <div className="md:col-span-12">
 <Skeleton className="h-[220px] w-full rounded-lg" />
 </div>
 </div>
 </div>
 </div>
 );
}