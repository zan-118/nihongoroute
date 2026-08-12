"use server";

/**
 * @file contact.actions.ts
 * @description Server actions for processing contact form submissions, storing in Supabase 'user_feedback', and triggering automated email notifications via Resend API.
 */

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/core/logger";

export interface ContactFormPayload {
  name: string;
  email: string;
  category: string;
  message: string;
}

/**
 * Server Action to submit contact form.
 * Stores feedback in Supabase user_feedback table and triggers automated Resend email notification if configured.
 * 
 * @param payload Contact form fields (name, email, category, message).
 * @returns Object with success boolean and error message string if any.
 */
export async function submitContactFormAction(payload: ContactFormPayload) {
  const { name, email, category, message } = payload;

  if (!name.trim() || !email.trim() || !message.trim()) {
    return { success: false, error: "Semua kolom wajib diisi dengan benar." };
  }

  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const formattedMessage = `[Kontak Publik - Kategori: ${category.toUpperCase()}]\nNama: ${name}\nEmail: ${email}\n\n${message}`;

    // 1. Insert into Supabase user_feedback table
    const { error: dbError } = await supabase
      .from("user_feedback")
      .insert([
        {
          user_id: session?.user?.id || null,
          type: category === "bug" ? "bug" : "suggestion",
          message: formattedMessage,
          route: "/contact",
        },
      ]);

    if (dbError) {
      logger.error("[ContactAction] Database insert error:", dbError);
      return { success: false, error: "Gagal menyimpan pesan ke database." };
    }

    // 2. Trigger automated Email notification via Resend API if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "nihongoroute@gmail.com";

    if (resendApiKey) {
      try {
        const htmlContent = `
          <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f7f3ea; border-radius: 16px; border: 1px solid #e2d9c8;">
            <div style="margin-bottom: 20px; border-bottom: 2px solid #22456b; padding-bottom: 12px;">
              <h2 style="color: #22456b; margin: 0; font-size: 20px;">📬 Pesan Kontak Baru: ${category.toUpperCase()}</h2>
              <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">NihongoRoute Platform Notification</p>
            </div>

            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e0d8c3; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #333; width: 100px;">Nama:</td>
                  <td style="padding: 6px 0; color: #111;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #333;">Email:</td>
                  <td style="padding: 6px 0; color: #22456b; font-weight: bold;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #333;">Kategori:</td>
                  <td style="padding: 6px 0; color: #bf4326; font-weight: bold;">${category.toUpperCase()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e0d8c3; margin-bottom: 24px;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Isi Pesan Pengguna:</h4>
              <p style="margin: 0; color: #222; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="text-align: center; padding-top: 8px;">
              <a href="mailto:${email}?subject=Re:%20[NihongoRoute]%20Pesan%20Kontak%20Anda" style="display: inline-block; background-color: #22456b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 13px;">
                ✉️ Balas Langsung Email Pengirim
              </a>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "NihongoRoute Contact <onboarding@resend.dev>",
            to: [adminEmail],
            reply_to: email,
            subject: `[NihongoRoute] Pesan Kontak Baru: ${category.toUpperCase()} dari ${name}`,
            html: htmlContent,
          }),
        });
      } catch (emailErr) {
        logger.error("[ContactAction] Resend email dispatch failed:", emailErr);
        // Non-blocking error: submission remains saved in Supabase
      }
    }

    return { success: true };
  } catch (error) {
    logger.error("[ContactAction] Unexpected error:", error);
    return { success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }
}
