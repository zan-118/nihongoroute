/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  // Jika kamu punya konfigurasi lain seperti images remote patterns, taruh di sini
};

// ✨ Bungkus nextConfig dengan withPWA ✨
export default withPWA(nextConfig);
