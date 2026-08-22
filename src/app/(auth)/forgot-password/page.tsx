/**
 * @file page.tsx
 * @description Password recovery page route (Forgot Password). Entry point for ForgotPasswordView.
 */

import type { Metadata } from "next";
import ForgotPasswordView from "@/features/auth/ForgotPasswordView";
import { createPageMetadata } from "@/lib/seo";

/**
 * Page metadata. Disable search indexing.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Lupa Kata Sandi | NihongoRoute",
 description: "Kirim tautan pemulihan kata sandi ke email terdaftar Anda.",
 path: "/forgot-password",
 noIndex: true,
 }),
};

/**
 * Forgot password page. Render client form.
 */
export default function ForgotPasswordPage() {
 // Render client component wrapper
 return <ForgotPasswordView />;
}