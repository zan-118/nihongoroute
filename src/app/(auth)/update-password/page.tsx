/**
 * @file page.tsx
 * @description Password update page route (Update Password). Entry point for UpdatePasswordView.
 */

import type { Metadata } from "next";
import UpdatePasswordView from "@/features/auth/UpdatePasswordView";
import { createPageMetadata } from "@/lib/seo";

/**
 * Metadata for Update Password page.
 * Disables search engine indexing for security.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Perbarui Kata Sandi | NihongoRoute",
 description: "Perbarui kata sandi akun NihongoRoute Anda.",
 path: "/update-password",
 noIndex: true,
 }),
};

/**
 * Page component for password updates.
 * Serves as entry point for client component.
 */
export default function UpdatePasswordPage() {
 // Render client-side password update form
 return <UpdatePasswordView />;
}