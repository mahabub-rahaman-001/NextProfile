import nodemailer from "nodemailer"

/**
 * A host on its own is not a working mailer. `.env.example` ships a host and
 * blank credentials, so "is SMTP_HOST set" would call a half-configured setup
 * ready and try to send through it.
 */
function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  )
}

// Built on demand rather than at import time: a placeholder host created at
// module load looks like a working mailer and fails only when someone tries to
// reset their password.
// Works with any SMTP provider: Gmail, Resend, SendGrid, Amazon SES, Mailgun.
function createTransporter() {
  const host = process.env.SMTP_HOST
  if (!host) throw new Error("SMTP_HOST is not configured; no password reset email was sent")

  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS elsewhere
    auth:
      process.env.SMTP_USER || process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER ?? "", pass: process.env.SMTP_PASS ?? "" }
        : undefined,
    // A user is waiting on this request. Without explicit limits an unreachable
    // mail server holds the connection open for minutes and the reset form just
    // hangs — so fail fast and let the caller log it.
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  })
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const from = process.env.EMAIL_FROM || "NextProfile <noreply@nextprofile.app>"

  // Outside production, an unconfigured mailer prints the link instead of
  // failing, so the whole flow works on one machine with nothing set up.
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log("📨 [DEV] Password reset email meant for:", email)
      console.log("🔗 [DEV] Reset link:", resetLink)
      return
    }
    throw new Error(
      "SMTP is not fully configured (need SMTP_HOST, SMTP_USER and SMTP_PASS); no password reset email was sent",
    )
  }

  await createTransporter().sendMail({
    from,
    to: email,
    subject: "Reset your NextProfile password",
    text: `You requested a password reset. Please click the link below to set a new password:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your NextProfile account.</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0e5c4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 13px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetLink}">${resetLink}</a>
        </p>
        <p style="font-size: 13px; color: #666; margin-top: 30px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
