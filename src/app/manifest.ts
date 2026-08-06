/**
 * @file manifest.ts
 * @description PWA (Progressive Web App) manifest generator for mobile installation and offline capabilities.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import type { MetadataRoute } from "next";

// ==========================================
// Main Execution
// ==========================================

/**
 * Generates the Web App Manifest for NihongoRoute PWA.
 * Configures application identity, display mode, theme colors, icons, and screenshots.
 * 
 * @returns {MetadataRoute.Manifest} Next.js metadata manifest configuration object.
 */
export default function manifest(): MetadataRoute.Manifest {
 return {
 name: "NihongoRoute",
 short_name: "NihongoRoute",
 description: "Platform Belajar Bahasa Jepang Gratis",
 start_url: "/",
 scope: "/",
 // Runs application in a separate window without browser navigation UI
 display: "standalone",
 background_color: "#0a0c10",
 theme_color: "#0a0c10",
 icons: [
 {
 src: "/logo-branding.png",
 sizes: "512x512",
 type: "image/png",
 purpose: "any",
 },
 {
 src: "/logo-branding.png",
 sizes: "512x512",
 type: "image/png",
 // Allows OS to crop icon shape dynamically for adaptive launcher icons
 purpose: "maskable",
 },
 ],
 screenshots: [
 {
 src: "/opengraph-image.png",
 sizes: "1200x630",
 type: "image/png",
 // Target desktop screens for app store listing
 form_factor: "wide",
 label: "NihongoRoute Dashboard",
 },
 {
 src: "/opengraph-image-mobile.png",
 sizes: "630x1365",
 type: "image/png",
 // Target mobile screens for app store listing
 form_factor: "narrow",
 label: "NihongoRoute Mobile",
 },
 ],
 };
}