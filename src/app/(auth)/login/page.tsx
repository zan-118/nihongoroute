/**
 * @file page.tsx
 * @description Authentication page route (Login & Sign Up) for NihongoRoute. Entry point for LoginView.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import type { Metadata } from "next";
import LoginView from "@/features/auth/LoginView";
import { createPageMetadata } from "@/lib/seo";

// ==========================================
// Metadata Configuration
// ==========================================
/**
 * Metadata for login page.
 * Disable search indexing. Set SEO title and description.
 */
export const metadata: Metadata = {
 // Generate base SEO metadata.
 ...createPageMetadata({
 title: "Masuk & Daftar | NihongoRoute",
 description: "Masuk ke akun NihongoRoute Anda untuk melanjutkan petualangan belajar bahasa Jepang.",
 path: "/login",
 noIndex: true,
 }),
};

// ==========================================
// Main Execution
// ==========================================
/**
 * Login page entry point.
 * Render client-side login interface.
 */
export default function LoginPage() {
 return <LoginView />;
}