
import "server-only";

import { Resend } from "resend";

export interface PasswordResetEmailInput {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: PasswordResetEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.error("Password reset email configuration is missing.");
    return false;
  }

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from,
      to,
      subject: "Reset your Academy Desk password",
      html: `<p>We received a request to reset your Academy Desk password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>`,
      text: `Reset your Academy Desk password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request it, you can ignore this email.`,
    });

    if (result.error) {
      console.error("Password reset email delivery failed.");
      return false;
    }

    return true;
  } catch {
    console.error("Password reset email service encountered an error.");
    return false;
  }
}
